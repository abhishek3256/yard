#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Multi-Tenant SaaS Notes Application...\n');

// Create .env.local if it doesn't exist
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  const envContent = `# JWT Secret for token signing
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Database path (automatically set for Vercel)
DATABASE_URL=/tmp/database.sqlite
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
} else {
  console.log('✅ .env.local already exists');
}

console.log('\n📋 Setup complete! Next steps:');
console.log('1. Run: npm install');
console.log('2. Run: npm run dev');
console.log('3. Open: http://localhost:3000');
console.log('\n🔐 Test accounts:');
console.log('• admin@acme.test (password: password)');
console.log('• user@acme.test (password: password)');
console.log('• admin@globex.test (password: password)');
console.log('• user@globex.test (password: password)');
console.log('\n📚 See README.md for full documentation');
