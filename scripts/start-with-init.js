#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

async function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      cwd: path.resolve(__dirname, '..')
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  try {
    console.log('🚀 Starting Pad...\n');

    // Step 1: Generate Prisma Client
    console.log('1️⃣ Generating Prisma Client...');
    await runCommand('npx', ['prisma', 'generate']);
    console.log('✅ Prisma Client generated\n');

    // Step 2: Push database schema (creates tables if they don't exist)
    console.log('2️⃣ Ensuring database schema is up to date...');
    await runCommand('npx', ['prisma', 'db', 'push']);
    console.log('✅ Database schema ready\n');

    // Step 3: Initialize database with required data
    console.log('3️⃣ Initializing database...');
    await runCommand('npx', ['tsx', 'src/lib/db-init.ts']);
    console.log('✅ Database initialized\n');

    // Step 4: Start the application
    console.log('4️⃣ Starting Next.js server...');
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      await runCommand('npm', ['run', 'start']);
    } else {
      await runCommand('npm', ['run', 'dev']);
    }
  } catch (error) {
    console.error('❌ Startup failed:', error.message);
    process.exit(1);
  }
}

main();