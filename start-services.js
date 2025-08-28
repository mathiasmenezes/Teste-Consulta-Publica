const { spawn } = require('child_process');
const path = require('path');
const net = require('net');

// Function to check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close();
      resolve(false);
    });
    server.on('error', () => {
      resolve(true);
    });
  });
}

// Function to kill processes on a port
async function killProcessOnPort(port) {
  return new Promise((resolve) => {
    const { exec } = require('child_process');
    exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
      if (stdout) {
        const lines = stdout.split('\n');
        for (const line of lines) {
          if (line.includes('LISTENING')) {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (pid && !isNaN(pid)) {
              exec(`taskkill /PID ${pid} /F`, () => {
                console.log(`✅ Killed process ${pid} on port ${port}`);
              });
            }
          }
        }
      }
      resolve();
    });
  });
}

// Function to start backend server
async function startBackend() {
  console.log('🚀 Starting backend server...');
  
  // Check if port 5000 is in use
  if (await isPortInUse(5000)) {
    console.log('⚠️  Port 5000 is in use. Attempting to kill existing process...');
    await killProcessOnPort(5000);
    // Wait a bit for the port to be released
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  const backendProcess = spawn('node', ['server.js'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    shell: true
  });

  backendProcess.on('error', (error) => {
    console.error('❌ Failed to start backend server:', error);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend server exited with code ${code}`);
  });

  return backendProcess;
}

// Function to start frontend server
async function startFrontend() {
  console.log('🚀 Starting frontend server...');
  
  // Check if port 3000 is in use
  if (await isPortInUse(3000)) {
    console.log('⚠️  Port 3000 is in use. Attempting to kill existing process...');
    await killProcessOnPort(3000);
    // Wait a bit for the port to be released
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  const frontendProcess = spawn('npm', ['start'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  frontendProcess.on('error', (error) => {
    console.error('❌ Failed to start frontend server:', error);
  });

  frontendProcess.on('close', (code) => {
    console.log(`Frontend server exited with code ${code}`);
  });

  return frontendProcess;
}

// Main function
async function startServices() {
  console.log('🎯 Starting Cidadão+ Consulta Pública services...\n');
  
  try {
    // Start backend first
    const backendProcess = await startBackend();
    
    // Wait a bit for backend to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Start frontend
    const frontendProcess = await startFrontend();
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down services...');
      backendProcess.kill();
      frontendProcess.kill();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down services...');
      backendProcess.kill();
      frontendProcess.kill();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Error starting services:', error);
    process.exit(1);
  }
}

// Start the services
startServices();
