const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Administrador',
      password: await bcrypt.hash('admin123', 10),
      role: 'ADMIN'
    }
  });

  // Create regular user
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Usuário Demo',
      password: await bcrypt.hash('user123', 10),
      role: 'USER'
    }
  });

  // Create demo forms
  const demoForm1 = await prisma.form.upsert({
    where: { id: 'demo-form-1' },
    update: {},
    create: {
      id: 'demo-form-1',
      title: 'Pesquisa de Satisfação do Cliente',
      description: 'Ajude-nos a melhorar nossos serviços fornecendo seu valioso feedback.',
      fields: [
        {
          id: 'field-1',
          type: 'text',
          label: 'Nome Completo',
          required: true,
          placeholder: 'Digite seu nome completo'
        },
        {
          id: 'field-2',
          type: 'email',
          label: 'Endereço de Email',
          required: true,
          placeholder: 'Digite seu endereço de email'
        },
        {
          id: 'field-3',
          type: 'select',
          label: 'Como você nos conheceu?',
          required: true,
          options: ['Redes Sociais', 'Indicação de Amigo', 'Publicidade', 'Motor de Busca', 'Outro']
        },
        {
          id: 'field-4',
          type: 'radio',
          label: 'Como você avalia nosso serviço?',
          required: true,
          options: ['Excelente', 'Bom', 'Regular', 'Ruim', 'Muito Ruim']
        },
        {
          id: 'field-5',
          type: 'textarea',
          label: 'Comentários Adicionais',
          required: false,
          placeholder: 'Compartilhe qualquer pensamento ou sugestão adicional...',
          rows: 4
        }
      ],
      createdBy: admin.id,
      isActive: true
    }
  });

  const demoForm2 = await prisma.form.upsert({
    where: { id: 'demo-form-2' },
    update: {},
    create: {
      id: 'demo-form-2',
      title: 'Avaliação de Produto',
      description: 'Conte-nos sobre sua experiência com nossos produtos.',
      fields: [
        {
          id: 'field-1',
          type: 'text',
          label: 'Nome do Produto',
          required: true,
          placeholder: 'Qual produto você está avaliando?'
        },
        {
          id: 'field-2',
          type: 'number',
          label: 'Nota (1-10)',
          required: true,
          placeholder: 'Digite uma nota de 1 a 10'
        },
        {
          id: 'field-3',
          type: 'checkbox',
          label: 'O que você mais gostou?',
          required: false,
          options: ['Qualidade', 'Preço', 'Design', 'Funcionalidade', 'Atendimento']
        },
        {
          id: 'field-4',
          type: 'date',
          label: 'Data da Compra',
          required: true
        },
        {
          id: 'field-5',
          type: 'textarea',
          label: 'Sua Experiência',
          required: true,
          placeholder: 'Descreva sua experiência com o produto...',
          rows: 3
        }
      ],
      createdBy: admin.id,
      isActive: true
    }
  });

  const demoForm3 = await prisma.form.upsert({
    where: { id: 'demo-form-3' },
    update: {},
    create: {
      id: 'demo-form-3',
      title: 'Sugestões de Melhoria',
      description: 'Tem ideias para melhorar nossos serviços? Adoraríamos ouvir!',
      fields: [
        {
          id: 'field-1',
          type: 'text',
          label: 'Área de Interesse',
          required: true,
          placeholder: 'Qual área você gostaria de melhorar?'
        },
        {
          id: 'field-2',
          type: 'radio',
          label: 'Prioridade da Sugestão',
          required: true,
          options: ['Alta', 'Média', 'Baixa']
        },
        {
          id: 'field-3',
          type: 'textarea',
          label: 'Descrição da Sugestão',
          required: true,
          placeholder: 'Descreva sua sugestão em detalhes...',
          rows: 5
        },
        {
          id: 'field-4',
          type: 'email',
          label: 'Email para Contato (opcional)',
          required: false,
          placeholder: 'Se quiser que entremos em contato'
        }
      ],
      createdBy: admin.id,
      isActive: true
    }
  });

  console.log('✅ Seed do banco de dados concluído!');
  console.log(`👤 Usuários criados: ${admin.name} (admin), ${user.name} (user)`);
  console.log(`📝 Formulários criados: ${demoForm1.title}, ${demoForm2.title}, ${demoForm3.title}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
