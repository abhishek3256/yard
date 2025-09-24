#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Multi-Tenant SaaS Notes Application - Deployment Helper\n');

// Check if git is initialized
if (!fs.existsSync('.git')) {
  console.log('📦 Initializing Git repository...');
  try {
    execSync('git init', { stdio: 'inherit' });
    console.log('✅ Git repository initialized');
  } catch (error) {
    console.error('❌ Failed to initialize git:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Git repository already exists');
}

// Check if files are staged
try {
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  if (status.trim()) {
    console.log('📝 Staging files...');
    execSync('git add .', { stdio: 'inherit' });
    console.log('✅ Files staged');
  } else {
    console.log('✅ No changes to stage');
  }
} catch (error) {
  console.error('❌ Git error:', error.message);
  process.exit(1);
}

// Check if there are commits
try {
  execSync('git log --oneline -1', { stdio: 'pipe' });
  console.log('✅ Repository has commits');
} catch (error) {
  console.log('📝 Creating initial commit...');
  try {
    execSync('git commit -m "Initial commit: Multi-tenant SaaS Notes Application"', { stdio: 'inherit' });
    console.log('✅ Initial commit created');
  } catch (error) {
    console.error('❌ Failed to create commit:', error.message);
    process.exit(1);
  }
}

console.log('\n🎯 Next Steps:');
console.log('1. Create a GitHub repository:');
console.log('   - Go to https://github.com/new');
console.log('   - Name: multi-tenant-notes-saas');
console.log('   - Make it PUBLIC');
console.log('   - Don\'t initialize with README');
console.log('   - Click "Create repository"');
console.log('');
console.log('2. Connect to GitHub:');
console.log('   git remote add origin https://github.com/YOUR_USERNAME/multi-tenant-notes-saas.git');
console.log('   git branch -M main');
console.log('   git push -u origin main');
console.log('');
console.log('3. Deploy to Vercel:');
console.log('   - Go to https://vercel.com');
console.log('   - Import your GitHub repository');
console.log('   - Add environment variable: JWT_SECRET=your-super-secret-jwt-key-change-in-production');
console.log('   - Deploy!');
console.log('');
console.log('📚 See DEPLOYMENT.md for detailed instructions');
