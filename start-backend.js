const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting backend server...');

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
