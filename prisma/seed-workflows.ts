import { PrismaClient, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

async function seedWorkflows() {
  console.log('🌱 Seeding workflows...');

  // Get categories
  const emailCategory = await prisma.category.findUnique({ where: { slug: 'email' } });
  const aiCategory = await prisma.category.findUnique({ where: { slug: 'ai' } });
  const crmCategory = await prisma.category.findUnique({ where: { slug: 'crm' } });
  const whatsappCategory = await prisma.category.findUnique({ where: { slug: 'whatsapp' } });
  const databaseCategory = await prisma.category.findUnique({ where: { slug: 'database' } });

  if (!emailCategory || !aiCategory || !crmCategory || !whatsappCategory || !databaseCategory) {
    console.error('❌ Categories not found. Run seed.ts first.');
    return;
  }

  const workflows = [
    {
      name: 'Automated Email Newsletter',
      slug: 'automated-email-newsletter',
      description: 'Automatically send weekly newsletter emails to subscribers from Google Sheets. Includes personalization, tracking, and scheduling.',
      icon: 'mail',
      thumbnail: '/thumbnails/email-newsletter.jpg',
      difficulty: Difficulty.BEGINNER,
      featured: true,
      indiaBadge: true,
      nodeCount: 5,
      categoryIds: [emailCategory.id],
      tagNames: ['email', 'automation', 'newsletter', 'marketing'],
      credentialsRequired: ['Gmail OAuth2', 'Google Sheets API'],
      nodes: ['Schedule Trigger', 'Google Sheets', 'Gmail', 'Set', 'Filter'],
      useCases: [
        'Send weekly newsletters to your subscriber list automatically',
        'Personalize emails with subscriber data from Google Sheets',
        'Track open rates and engagement metrics',
        'Schedule newsletters for optimal delivery times',
      ],
      setupSteps: [
        'Connect your Gmail account with OAuth2 authentication',
        'Link your Google Sheets with subscriber data',
        'Configure the Schedule Trigger for weekly execution',
        'Customize email template with personalization tokens',
        'Test with a small group before full deployment',
      ],
      workflowJson: {
        name: 'Automated Email Newsletter',
        nodes: [
          {
            parameters: { rule: { interval: [{ field: 'weeks', hoursInterval: 1 }] } },
            id: 'schedule-1',
            name: 'Schedule Trigger',
            type: 'n8n-nodes-base.scheduleTrigger',
            typeVersion: 1,
            position: [250, 300],
          },
          {
            parameters: { operation: 'read', sheetId: 'subscribers' },
            id: 'sheets-1',
            name: 'Google Sheets',
            type: 'n8n-nodes-base.googleSheets',
            typeVersion: 2,
            position: [450, 300],
          },
          {
            parameters: { sendTo: '={{ $json.email }}', subject: 'Weekly Newsletter' },
            id: 'gmail-1',
            name: 'Gmail',
            type: 'n8n-nodes-base.gmail',
            typeVersion: 1,
            position: [650, 300],
          },
        ],
        connections: { 'Schedule Trigger': { main: [[{ node: 'Google Sheets', type: 'main', index: 0 }]] } },
      },
      published: true,
    },
    {
      name: 'WhatsApp Business Notifications',
      slug: 'whatsapp-business-notifications',
      description: 'Send automated WhatsApp notifications for order updates, appointment reminders, and customer alerts using Twilio WhatsApp API.',
      icon: 'message-circle',
      thumbnail: '/thumbnails/whatsapp-notifications.jpg',
      difficulty: Difficulty.INTERMEDIATE,
      featured: true,
      indiaBadge: true,
      nodeCount: 7,
      categoryIds: [whatsappCategory.id, crmCategory.id],
      tagNames: ['whatsapp', 'notifications', 'crm', 'customer-service'],
      credentialsRequired: ['Twilio API', 'Webhook'],
      nodes: ['Webhook', 'Twilio', 'HTTP Request', 'Set', 'IF', 'Function'],
      useCases: [
        'Send order confirmation and tracking updates to customers',
        'Automated appointment reminders 24 hours before scheduled time',
        'Customer support notifications and status updates',
        'Marketing campaigns with personalized WhatsApp messages',
      ],
      setupSteps: [
        'Set up Twilio account and get WhatsApp Business API access',
        'Configure webhook endpoint in n8n',
        'Create message templates in Twilio console',
        'Set up customer database integration',
        'Test with sample phone numbers before production',
      ],
      workflowJson: {
        name: 'WhatsApp Business Notifications',
        nodes: [
          {
            parameters: { httpMethod: 'POST', path: 'whatsapp-webhook' },
            id: 'webhook-1',
            name: 'Webhook',
            type: 'n8n-nodes-base.webhook',
            typeVersion: 1,
            position: [250, 300],
          },
          {
            parameters: { resource: 'message', operation: 'send' },
            id: 'twilio-1',
            name: 'Twilio',
            type: 'n8n-nodes-base.twilio',
            typeVersion: 1,
            position: [650, 300],
          },
        ],
        connections: { Webhook: { main: [[{ node: 'Twilio', type: 'main', index: 0 }]] } },
      },
      published: true,
    },
    {
      name: 'AI Content Generator with ChatGPT',
      slug: 'ai-content-generator-chatgpt',
      description: 'Generate blog posts, social media content, and product descriptions using OpenAI GPT-4. Includes content review and publishing workflow.',
      icon: 'sparkles',
      thumbnail: '/thumbnails/ai-content-generator.jpg',
      difficulty: Difficulty.INTERMEDIATE,
      featured: true,
      indiaBadge: false,
      nodeCount: 8,
      categoryIds: [aiCategory.id],
      tagNames: ['ai', 'content', 'chatgpt', 'automation', 'marketing'],
      credentialsRequired: ['OpenAI API Key', 'Google Docs API', 'Slack Webhook'],
      nodes: ['Schedule Trigger', 'OpenAI', 'Google Docs', 'Slack', 'HTTP Request', 'Function'],
      useCases: [
        'Generate SEO-optimized blog posts from topic keywords',
        'Create social media content variations for multiple platforms',
        'Write product descriptions for e-commerce catalogs',
        'Generate email marketing copy with A/B testing variations',
      ],
      setupSteps: [
        'Obtain OpenAI API key from platform.openai.com',
        'Configure content templates and prompts',
        'Set up Google Docs for content storage',
        'Configure Slack for approval notifications',
        'Test with sample topics and review output quality',
      ],
      workflowJson: {
        name: 'AI Content Generator',
        nodes: [
          {
            parameters: { model: 'gpt-4', prompt: 'Generate blog post about: {{ $json.topic }}' },
            id: 'openai-1',
            name: 'OpenAI',
            type: 'n8n-nodes-base.openAi',
            typeVersion: 1,
            position: [450, 300],
          },
        ],
        connections: {},
      },
      published: true,
    },
    {
      name: 'Lead Management & CRM Sync',
      slug: 'lead-management-crm-sync',
      description: 'Capture leads from multiple sources (website forms, social media, emails) and automatically sync to your CRM with enrichment and scoring.',
      icon: 'users',
      thumbnail: '/thumbnails/lead-management.jpg',
      difficulty: Difficulty.ADVANCED,
      featured: false,
      indiaBadge: true,
      nodeCount: 12,
      categoryIds: [crmCategory.id],
      tagNames: ['crm', 'sales', 'leads', 'automation', 'hubspot'],
      credentialsRequired: ['HubSpot API', 'Clearbit API', 'Webhook', 'Slack Webhook'],
      nodes: ['Webhook', 'HTTP Request', 'HubSpot', 'Clearbit', 'Function', 'IF', 'Set', 'Slack'],
      useCases: [
        'Automatically add new leads from website forms to HubSpot',
        'Enrich lead data with company information using Clearbit',
        'Score leads based on engagement and company data',
        'Notify sales team on Slack for high-priority leads',
      ],
      setupSteps: [
        'Connect HubSpot account and get API key',
        'Set up Clearbit account for data enrichment',
        'Configure webhook endpoints for each lead source',
        'Define lead scoring criteria and rules',
        'Set up Slack notifications for sales team',
        'Test with sample leads from each source',
      ],
      workflowJson: {
        name: 'Lead Management & CRM Sync',
        nodes: [
          {
            parameters: { httpMethod: 'POST', path: 'lead-capture' },
            id: 'webhook-1',
            name: 'Lead Webhook',
            type: 'n8n-nodes-base.webhook',
            typeVersion: 1,
            position: [250, 300],
          },
          {
            parameters: { resource: 'contact', operation: 'create' },
            id: 'hubspot-1',
            name: 'HubSpot',
            type: 'n8n-nodes-base.hubspot',
            typeVersion: 1,
            position: [650, 300],
          },
        ],
        connections: { 'Lead Webhook': { main: [[{ node: 'HubSpot', type: 'main', index: 0 }]] } },
      },
      published: true,
    },
    {
      name: 'Database Backup & Sync',
      slug: 'database-backup-sync',
      description: 'Automated daily backup of MySQL/PostgreSQL databases to cloud storage with encryption and versioning. Includes restore workflow.',
      icon: 'database',
      thumbnail: '/thumbnails/database-backup.jpg',
      difficulty: Difficulty.ADVANCED,
      featured: false,
      indiaBadge: true,
      nodeCount: 10,
      categoryIds: [databaseCategory.id],
      tagNames: ['database', 'backup', 'mysql', 'postgresql', 'automation'],
      credentialsRequired: ['MySQL', 'PostgreSQL', 'AWS S3', 'Slack Webhook'],
      nodes: ['Schedule Trigger', 'MySQL', 'PostgreSQL', 'Execute Command', 'AWS S3', 'Slack', 'Function'],
      useCases: [
        'Daily automated backups of production databases',
        'Sync database to test/staging environments',
        'Version control for database schemas and data',
        'Disaster recovery with automated restore capability',
      ],
      setupSteps: [
        'Configure database credentials (MySQL or PostgreSQL)',
        'Set up AWS S3 bucket for backup storage',
        'Configure encryption settings for sensitive data',
        'Set schedule for automated backups (daily recommended)',
        'Test backup and restore procedures',
        'Set up Slack alerts for backup status',
      ],
      workflowJson: {
        name: 'Database Backup & Sync',
        nodes: [
          {
            parameters: { rule: { interval: [{ field: 'days', hoursInterval: 1 }] } },
            id: 'schedule-1',
            name: 'Daily Schedule',
            type: 'n8n-nodes-base.scheduleTrigger',
            typeVersion: 1,
            position: [250, 300],
          },
          {
            parameters: { operation: 'executeQuery', query: 'SHOW TABLES' },
            id: 'mysql-1',
            name: 'MySQL',
            type: 'n8n-nodes-base.mysql',
            typeVersion: 1,
            position: [450, 300],
          },
        ],
        connections: { 'Daily Schedule': { main: [[{ node: 'MySQL', type: 'main', index: 0 }]] } },
      },
      published: true,
    },
    {
      name: 'Social Media Auto-Poster',
      slug: 'social-media-auto-poster',
      description: 'Publish content simultaneously to Twitter, LinkedIn, Facebook, and Instagram from a single source. Includes scheduling and analytics.',
      icon: 'share-2',
      thumbnail: '/thumbnails/social-media-poster.jpg',
      difficulty: Difficulty.INTERMEDIATE,
      featured: true,
      indiaBadge: false,
      nodeCount: 9,
      categoryIds: [crmCategory.id],
      tagNames: ['social-media', 'marketing', 'content', 'automation'],
      credentialsRequired: ['Twitter API', 'LinkedIn API', 'Facebook API', 'Google Sheets'],
      nodes: ['Schedule Trigger', 'Google Sheets', 'Twitter', 'LinkedIn', 'Facebook', 'Function', 'Set'],
      useCases: [
        'Post to multiple social platforms from a content calendar',
        'Schedule posts for optimal engagement times',
        'Cross-post blog articles to social media automatically',
        'Track engagement metrics across all platforms',
      ],
      setupSteps: [
        'Set up API access for Twitter, LinkedIn, and Facebook',
        'Create Google Sheet with content calendar',
        'Configure posting schedule for each platform',
        'Customize content formatting for each platform',
        'Test with draft posts before going live',
      ],
      workflowJson: {
        name: 'Social Media Auto-Poster',
        nodes: [
          {
            parameters: { rule: { interval: [{ field: 'hours', hoursInterval: 4 }] } },
            id: 'schedule-1',
            name: 'Schedule Trigger',
            type: 'n8n-nodes-base.scheduleTrigger',
            typeVersion: 1,
            position: [250, 300],
          },
          {
            parameters: { operation: 'read', sheetId: 'content-calendar' },
            id: 'sheets-1',
            name: 'Content Calendar',
            type: 'n8n-nodes-base.googleSheets',
            typeVersion: 2,
            position: [450, 300],
          },
        ],
        connections: { 'Schedule Trigger': { main: [[{ node: 'Content Calendar', type: 'main', index: 0 }]] } },
      },
      published: true,
    },
  ];

  // Create workflows with tags
  for (const workflow of workflows) {
    const { categoryIds, tagNames, ...workflowData } = workflow;

    // Create tags
    const tagConnections = await Promise.all(
      tagNames.map(async (tagName) => {
        const tag = await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: {
            name: tagName,
            slug: tagName.toLowerCase().replace(/\s+/g, '-'),
          },
        });
        return { tag: { connect: { id: tag.id } } };
      })
    );

    // Create workflow
    await prisma.workflow.create({
      data: {
        ...workflowData,
        publishedAt: new Date(),
        categories: {
          create: categoryIds.map((categoryId) => ({
            category: { connect: { id: categoryId } },
          })),
        },
        tags: {
          create: tagConnections,
        },
      },
    });

    console.log(`✅ Created workflow: ${workflow.name}`);
  }

  console.log('✨ Workflows seeded successfully!');
}

seedWorkflows()
  .catch((e) => {
    console.error('❌ Workflow seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
