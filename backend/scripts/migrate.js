#!/usr/bin/env node
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Read and execute migration SQL
const fs = require('fs');
const path = require('path');

async function applyMigrations() {
  try {
    console.log('🔧 Applying database migrations...');
    
    const migrationPath = path.join(__dirname, '../prisma/migrations/20260319083658_init/migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    // Split by semicolon and execute each statement
    const statements = migrationSQL.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await prisma.$executeRawUnsafe(statement.trim());
      }
    }
    
    console.log('✅ Database tables created successfully!');
    
    // Verify tables exist
    const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`;
    console.log('📊 Tables:', tables.map(t => t.name).join(', '));
    
    process.exit(0);
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('✅ Tables already exist!');
      process.exit(0);
    }
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigrations();
