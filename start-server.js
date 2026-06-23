// Simple script to start both the Astro frontend and the Express backend
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import ip from 'ip';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = join(__dirname, 'src', 'server', 'server.js');

// Start the backend server
console.log('Starting backend server...');
const backend = spawn('node', [serverPath], { stdio: 'inherit' });

// Start the Astro dev server
console.log('Starting Astro frontend...');
const frontend = spawn('npm', ['run', 'dev'], { stdio: 'inherit' , shell: true});

// Log local network access info
const localIP = ip.address();
console.log('\n=============================================');
console.log('FTC Local Scoring System is running!');
console.log('=============================================');
console.log(`Access the system from any device on your network:`);
console.log(`- Main Scoreboard: http://${localIP}:4321/`);
console.log(`- Score Controller: http://${localIP}:4321/control`);
console.log(`\nDefault admin credentials:`);
console.log('- Username: admin');
console.log('- Password: admin');
console.log('=============================================\n');

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});