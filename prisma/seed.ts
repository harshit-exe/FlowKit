import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  console.log('👤 Creating admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@flowkit.in' },
    update: {},
    create: {
      email: 'admin@flowkit.in',
      name: 'Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });
  console.log(`✅ Admin user created: ${adminUser.email}`);

  // Create categories
  console.log('📂 Creating categories...');
  const categories = [
    {
      name: 'Email Automation',
      slug: 'email',
      icon: '📧',
      description: 'Automate email workflows and email marketing campaigns',
      color: '#667eea',
      order: 1
    },
    {
      name: 'AI & ML',
      slug: 'ai',
      icon: '🤖',
      description: 'AI-powered automations and machine learning workflows',
      color: '#8b5cf6',
      order: 2
    },
    {
      name: 'CRM & Sales',
      slug: 'crm',
      icon: '💼',
      description: 'Sales automation and CRM integration workflows',
      color: '#3b82f6',
      order: 3
    },
    {
      name: 'WhatsApp',
      slug: 'whatsapp',
      icon: '💬',
      description: 'WhatsApp Business automations and notifications',
      color: '#25D366',
      order: 4
    },
    {
      name: 'Database',
      slug: 'database',
      icon: '💾',
      description: 'Database operations, migrations, and synchronization',
      color: '#f59e0b',
      order: 5
    },
    {
      name: 'Finance',
      slug: 'finance',
      icon: '💰',
      description: 'Financial automations, invoicing, and payment processing',
      color: '#10b981',
      order: 6
    },
    {
      name: 'Marketing',
      slug: 'marketing',
      icon: '📢',
      description: 'Marketing automation and campaign management',
      color: '#ec4899',
      order: 7
    },
    {
      name: 'Analytics',
      slug: 'analytics',
      icon: '📊',
      description: 'Analytics, reporting, and data visualization workflows',
      color: '#6366f1',
      order: 8
    },
  ];

  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    console.log(`✅ Category created: ${created.name}`);
  }

  console.log('✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
