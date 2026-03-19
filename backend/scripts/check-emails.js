#!/usr/bin/env node
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkEmails() {
  try {
    console.log('📧 Fetching registered emails...\n');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
      },
    });
    
    if (users.length === 0) {
      console.log('❌ No registered users found');
    } else {
      console.log(`✅ Found ${users.length} registered user(s):\n`);
      console.table(users);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmails();
