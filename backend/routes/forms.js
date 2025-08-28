const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all forms (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const forms = await prisma.form.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            responses: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Add response count to each form
    const formsWithResponseCount = forms.map(form => ({
      ...form,
      responseCount: form._count.responses
    }));

    res.json({
      success: true,
      forms: formsWithResponseCount
    });
  } catch (error) {
    console.error('Get forms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch forms'
    });
  }
});

// Get active forms (for users)
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const forms = await prisma.form.findMany({
      where: {
        isActive: true
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            responses: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Add response count to each form
    const formsWithResponseCount = forms.map(form => ({
      ...form,
      responseCount: form._count.responses
    }));

    res.json({
      success: true,
      forms: formsWithResponseCount
    });
  } catch (error) {
    console.error('Get active forms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active forms'
    });
  }
});

// Get form by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const form = await prisma.form.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            responses: true
          }
        }
      }
    });

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    // Check if user has already responded to this form
    const hasResponded = await prisma.formResponse.findUnique({
      where: {
        formId_userId: {
          formId: id,
          userId: req.user.id
        }
      }
    });

    const formWithData = {
      ...form,
      responseCount: form._count.responses,
      hasResponded: !!hasResponded
    };

    res.json({
      success: true,
      form: formWithData
    });
  } catch (error) {
    console.error('Get form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch form'
    });
  }
});

// Create new form (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, fields } = req.body;

    if (!title || !fields) {
      return res.status(400).json({
        success: false,
        message: 'Title and fields are required'
      });
    }

    const form = await prisma.form.create({
      data: {
        title,
        description,
        fields,
        createdBy: req.user.id
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Form created successfully',
      form
    });
  } catch (error) {
    console.error('Create form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create form'
    });
  }
});

// Update form (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, fields, isActive } = req.body;

    // Check if form exists
    const existingForm = await prisma.form.findUnique({
      where: { id }
    });

    if (!existingForm) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    const updatedForm = await prisma.form.update({
      where: { id },
      data: {
        title,
        description,
        fields,
        isActive
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Form updated successfully',
      form: updatedForm
    });
  } catch (error) {
    console.error('Update form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update form'
    });
  }
});

// Delete form (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if form exists
    const existingForm = await prisma.form.findUnique({
      where: { id }
    });

    if (!existingForm) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    // Delete form (responses will be deleted automatically due to cascade)
    await prisma.form.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Form deleted successfully'
    });
  } catch (error) {
    console.error('Delete form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete form'
    });
  }
});

// Submit form response
router.post('/:id/responses', authenticateToken, async (req, res) => {
  try {
    const { id: formId } = req.params;
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'Response data is required'
      });
    }

    // Check if form exists and is active
    const form = await prisma.form.findUnique({
      where: { id: formId }
    });

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    if (!form.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Form is not active'
      });
    }

    // Check if user has already responded
    const existingResponse = await prisma.formResponse.findUnique({
      where: {
        formId_userId: {
          formId,
          userId: req.user.id
        }
      }
    });

    if (existingResponse) {
      return res.status(400).json({
        success: false,
        message: 'You have already responded to this form'
      });
    }

    // Create response
    const response = await prisma.formResponse.create({
      data: {
        formId,
        userId: req.user.id,
        data
      },
      include: {
        form: {
          select: {
            title: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Response submitted successfully',
      response
    });
  } catch (error) {
    console.error('Submit response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit response'
    });
  }
});

// Get form responses (admin only)
router.get('/:id/responses', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id: formId } = req.params;

    // Check if form exists
    const form = await prisma.form.findUnique({
      where: { id: formId }
    });

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    const responses = await prisma.formResponse.findMany({
      where: { formId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    // Format responses for frontend
    const formattedResponses = responses.map(response => ({
      id: response.id,
      formId: response.formId,
      userId: response.userId,
      data: response.data,
      submittedAt: response.submittedAt,
      user_name: response.user.name,
      user_email: response.user.email
    }));

    res.json({
      success: true,
      form,
      responses: formattedResponses
    });
  } catch (error) {
    console.error('Get form responses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch form responses'
    });
  }
});

// Get user's responses
router.get('/user/responses', authenticateToken, async (req, res) => {
  try {
    const responses = await prisma.formResponse.findMany({
      where: { userId: req.user.id },
      include: {
        form: {
          select: {
            id: true,
            title: true,
            description: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    // Format responses for frontend
    const formattedResponses = responses.map(response => ({
      id: response.id,
      formId: response.formId,
      userId: response.userId,
      data: response.data,
      submittedAt: response.submittedAt,
      form_title: response.form.title
    }));

    res.json({
      success: true,
      responses: formattedResponses
    });
  } catch (error) {
    console.error('Get user responses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user responses'
    });
  }
});

// Get form response count
router.get('/:formId/responses/count', authenticateToken, async (req, res) => {
  try {
    const { formId } = req.params;

    const count = await prisma.formResponse.count({
      where: {
        formId
      }
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get response count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get response count'
    });
  }
});

// Check if user has responded to a form
router.get('/:formId/responses/check', authenticateToken, async (req, res) => {
  try {
    const { formId } = req.params;
    const userId = req.user.id;

    const existingResponse = await prisma.formResponse.findFirst({
      where: {
        formId,
        userId
      }
    });

    res.json({
      success: true,
      hasResponded: !!existingResponse
    });
  } catch (error) {
    console.error('Check user response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check user response'
    });
  }
});

// Export form responses (admin only)
router.get('/:formId/responses/export', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { formId } = req.params;
    const { format = 'csv' } = req.query;

    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        responses: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    if (format === 'csv') {
      // Generate CSV data
      let csvData = 'User Name,User Email,Submitted At';
      
      // Add form fields as headers
      if (form.fields && Array.isArray(form.fields)) {
        form.fields.forEach(field => {
          csvData += `,${field.label || field.name}`;
        });
      }
      csvData += '\n';

      // Add response data
      form.responses.forEach(response => {
        csvData += `"${response.user.name}","${response.user.email}","${response.submittedAt}"`;
        
        if (response.data && Array.isArray(response.data)) {
          response.data.forEach(field => {
            csvData += `,"${field.value || ''}"`;
          });
        }
        csvData += '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="form-responses-${formId}.csv"`);
      res.send(csvData);
    } else {
      res.json({
        success: true,
        data: form.responses
      });
    }
  } catch (error) {
    console.error('Export responses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export responses'
    });
  }
});

// Get statistics (admin only)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [totalUsers, totalForms, totalResponses, activeForms] = await Promise.all([
      prisma.user.count(),
      prisma.form.count(),
      prisma.formResponse.count(),
      prisma.form.count({
        where: { isActive: true }
      })
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalForms,
        totalResponses,
        activeForms
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

// Get form analytics (admin only)
router.get('/:id/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get form with responses
    const form = await prisma.form.findUnique({
      where: { id },
      include: {
        responses: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            submittedAt: 'desc'
          }
        },
        _count: {
          select: {
            responses: true
          }
        }
      }
    });

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    const responses = form.responses;
    const fields = form.fields || [];
    const totalResponses = responses.length;

    // Calculate field analytics
    const fieldAnalytics = fields.map(field => {
      const fieldResponses = responses.map(response => {
        const fieldData = response.data[field.id] || response.data[field.label];
        return fieldData;
      }).filter(Boolean);

      const completionRate = totalResponses > 0 ? (fieldResponses.length / totalResponses) * 100 : 0;
      
      let fieldStats = {
        fieldId: field.id,
        fieldLabel: field.label,
        fieldType: field.type,
        completionRate: Math.round(completionRate * 100) / 100,
        totalResponses: fieldResponses.length,
        averageValue: null,
        topValues: []
      };

      // Calculate field-specific analytics
      if (field.type === 'number') {
        const numbers = fieldResponses.map(r => parseFloat(r)).filter(n => !isNaN(n));
        fieldStats.averageValue = numbers.length > 0 ? (numbers.reduce((a, b) => a + b, 0) / numbers.length).toFixed(2) : null;
      } else if (['select', 'radio', 'checkbox'].includes(field.type)) {
        const valueCounts = {};
        fieldResponses.forEach(value => {
          if (Array.isArray(value)) {
            value.forEach(v => valueCounts[v] = (valueCounts[v] || 0) + 1);
          } else {
            valueCounts[value] = (valueCounts[value] || 0) + 1;
          }
        });
        fieldStats.topValues = Object.entries(valueCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([value, count]) => ({ value, count, percentage: Math.round((count / fieldResponses.length) * 100) }));
      }

      return fieldStats;
    });

    // Calculate response trends (last 7 days)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentResponses = responses.filter(response => 
      new Date(response.submittedAt) >= sevenDaysAgo
    );

    const responseTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayResponses = recentResponses.filter(response => {
        const responseDate = new Date(response.submittedAt);
        return responseDate.toDateString() === date.toDateString();
      });
      responseTrends.push({
        date: date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
        count: dayResponses.length
      });
    }

    // Calculate completion time (if available)
    const completionTimes = responses
      .filter(response => response.submittedAt && response.createdAt)
      .map(response => {
        const submitted = new Date(response.submittedAt);
        const created = new Date(response.createdAt);
        return (submitted - created) / 1000 / 60; // in minutes
      });

    const averageCompletionTime = completionTimes.length > 0 
      ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length)
      : 0;

    const analytics = {
      formId: form.id,
      formTitle: form.title,
      totalResponses,
      completionRate: totalResponses > 0 ? 100 : 0, // Assuming all responses are complete
      averageCompletionTime,
      fieldAnalytics,
      responseTrends,
      recentResponses: responses.slice(0, 10).map(response => ({
        id: response.id,
        userId: response.userId,
        userName: response.user.name,
        userEmail: response.user.email,
        submittedAt: response.submittedAt,
        data: response.data
      }))
    };

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Get form analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch form analytics'
    });
  }
});

// Export form analytics (admin only)
router.get('/:id/analytics/export', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get form with responses
    const form = await prisma.form.findUnique({
      where: { id },
      include: {
        responses: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            submittedAt: 'desc'
          }
        }
      }
    });

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    // Generate CSV content
    const headers = ['Response ID', 'User ID', 'User Name', 'User Email', 'Submitted At', ...form.fields.map(f => f.label)];
    const rows = form.responses.map(response => [
      response.id,
      response.userId,
      response.user.name,
      response.user.email,
      new Date(response.submittedAt).toLocaleString('pt-BR'),
      ...form.fields.map(field => {
        const value = response.data[field.id] || response.data[field.label];
        return Array.isArray(value) ? value.join(', ') : (value || '');
      })
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="form-analytics-${id}.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Export form analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export form analytics'
    });
  }
});

module.exports = router;
