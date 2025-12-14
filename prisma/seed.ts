/**
 * FlowKit Database Seed Script
 * 
 * This script populates the database with initial data for new installations:
 * - Super Admin user
 * - Sample categories
 * - Sample tags
 * - Sample workflows
 * - System settings
 * 
 * Run with: npx prisma db seed
 */

import { PrismaClient, Difficulty, Role, SubmissionStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Sample workflow JSON template
const createSampleWorkflowJson = (name: string) => ({
    name,
    nodes: [
        {
            parameters: {},
            name: "Start",
            type: "n8n-nodes-base.start",
            typeVersion: 1,
            position: [250, 300]
        }
    ],
    connections: {}
});

async function main() {
    console.log('🌱 Starting database seed...\n');

    // ============================================
    // 1. CREATE SUPER ADMIN USER
    // ============================================
    console.log('👤 Creating Super Admin user...');

    const hashedPassword = await bcrypt.hash('Admin@123!', 10);

    const superAdmin = await prisma.user.upsert({
        where: { email: 'admin@flowkit.in' },
        update: {},
        create: {
            email: 'admin@flowkit.in',
            name: 'FlowKit Admin',
            password: hashedPassword,
            role: Role.SUPER_ADMIN,
            emailVerified: new Date(),
        },
    });

    console.log('✅ Super Admin created:', superAdmin.email);
    console.log('   Email: admin@flowkit.in');
    console.log('   Password: Admin@123!\n');

    // ============================================
    // 2. CREATE CATEGORIES
    // ============================================
    console.log('📂 Creating categories...');

    const categories = [
        {
            slug: 'email-automation',
            name: 'Email Automation',
            icon: '📧',
            description: 'Automate your email workflows and communications',
            color: '#667eea',
            order: 1,
        },
        {
            slug: 'ai-machine-learning',
            name: 'AI & Machine Learning',
            icon: '🤖',
            description: 'Leverage AI and ML in your automation workflows',
            color: '#f093fb',
            order: 2,
        },
        {
            slug: 'crm-sales',
            name: 'CRM & Sales',
            icon: '💼',
            description: 'Streamline your sales and customer relationship management',
            color: '#4facfe',
            order: 3,
        },
        {
            slug: 'marketing',
            name: 'Marketing',
            icon: '📱',
            description: 'Automate your marketing campaigns and social media',
            color: '#43e97b',
            order: 4,
        },
        {
            slug: 'data-processing',
            name: 'Data Processing',
            icon: '📊',
            description: 'Process, transform, and analyze your data',
            color: '#fa709a',
            order: 5,
        },
        {
            slug: 'social-media',
            name: 'Social Media',
            icon: '🌐',
            description: 'Automate social media posting and engagement',
            color: '#30cfd0',
            order: 6,
        },
        {
            slug: 'developer-tools',
            name: 'Developer Tools',
            icon: '⚙️',
            description: 'Workflows for developers and DevOps teams',
            color: '#a8edea',
            order: 7,
        },
        {
            slug: 'productivity',
            name: 'Productivity',
            icon: '⚡',
            description: 'Boost your productivity with automation',
            color: '#ffd89b',
            order: 8,
        },
    ];

    const createdCategories = [];
    for (const category of categories) {
        const created = await prisma.category.upsert({
            where: { slug: category.slug },
            update: category,
            create: category,
        });
        createdCategories.push(created);
    }

    console.log(`✅ Created ${createdCategories.length} categories\n`);

    // ============================================
    // 3. CREATE TAGS
    // ============================================
    console.log('🏷️  Creating tags...');

    const tagNames = [
        'automation',
        'api',
        'webhook',
        'notification',
        'database',
        'integration',
        'scheduling',
        'data-sync',
        'email',
        'slack',
        'google-sheets',
        'airtable',
        'discord',
        'twitter',
        'linkedin',
    ];

    const createdTags = [];
    for (const tagName of tagNames) {
        const tag = await prisma.tag.upsert({
            where: { slug: tagName },
            update: {},
            create: {
                name: tagName.charAt(0).toUpperCase() + tagName.slice(1).replace('-', ' '),
                slug: tagName,
            },
        });
        createdTags.push(tag);
    }

    console.log(`✅ Created ${createdTags.length} tags\n`);

    // ============================================
    // 4. CREATE SAMPLE WORKFLOWS
    // ============================================
    console.log('🔄 Creating sample workflows...');

    const sampleWorkflows = [
        {
            slug: 'welcome-email-automation',
            name: 'Welcome Email Automation',
            description: 'Automatically send welcome emails to new users when they sign up. This workflow integrates with your database and email service to provide a seamless onboarding experience.',
            icon: '📧',
            difficulty: Difficulty.BEGINNER,
            featured: true,
            indiaBadge: true,
            nodeCount: 3,
            useCases: [
                'Send welcome emails to new sign-ups',
                'Automate user onboarding process',
                'Integrate with CRM systems',
            ],
            setupSteps: [
                'Connect your email service provider (Gmail, SendGrid, etc.)',
                'Configure the trigger to listen for new user sign-ups',
                'Customize the email template with your branding',
                'Test the workflow with a sample user',
            ],
            credentialsRequired: ['Email Account (Gmail/SMTP)', 'Database Connection'],
            nodes: ['Webhook', 'Email Send', 'Database'],
            categorySlug: 'email-automation',
            tagSlugs: ['automation', 'email', 'webhook'],
            author: 'FlowKit Team',
            authorUrl: 'https://flowkit.in',
        },
        {
            slug: 'slack-notification-system',
            name: 'Slack Notification System',
            description: 'Get instant Slack notifications for important events in your applications. Monitor errors, user activities, sales, and more—all in real-time.',
            icon: '💬',
            difficulty: Difficulty.BEGINNER,
            featured: true,
            indiaBadge: false,
            nodeCount: 4,
            useCases: [
                'Monitor application errors in real-time',
                'Get notified about new sales or sign-ups',
                'Receive alerts for critical system events',
            ],
            setupSteps: [
                'Create a Slack App and get your webhook URL',
                'Configure the trigger for your event source',
                'Customize the notification message format',
                'Set up channel routing based on event type',
            ],
            credentialsRequired: ['Slack Webhook URL'],
            nodes: ['Webhook', 'Slack', 'Function', 'Switch'],
            categorySlug: 'productivity',
            tagSlugs: ['automation', 'notification', 'slack'],
            author: 'FlowKit Team',
            authorUrl: 'https://flowkit.in',
        },
        {
            slug: 'data-sync-google-sheets',
            name: 'Database to Google Sheets Sync',
            description: 'Automatically sync data from your database to Google Sheets. Perfect for creating live dashboards, reports, and sharing data with non-technical team members.',
            icon: '📊',
            difficulty: Difficulty.INTERMEDIATE,
            featured: true,
            indiaBadge: true,
            nodeCount: 5,
            useCases: [
                'Create live dashboards in Google Sheets',
                'Sync customer data for sales teams',
                'Generate automated reports',
                'Share database insights with stakeholders',
            ],
            setupSteps: [
                'Set up Google Sheets API credentials',
                'Connect to your database',
                'Map database fields to sheet columns',
                'Configure sync schedule (hourly, daily, etc.)',
                'Test the sync with sample data',
            ],
            credentialsRequired: ['Google Sheets API', 'Database Connection'],
            nodes: ['Schedule Trigger', 'Database Query', 'Function', 'Google Sheets', 'Error Handler'],
            categorySlug: 'data-processing',
            tagSlugs: ['data-sync', 'google-sheets', 'database', 'scheduling'],
            author: 'FlowKit Team',
            authorUrl: 'https://flowkit.in',
        },
        {
            slug: 'ai-content-generator',
            name: 'AI Content Generator',
            description: 'Generate high-quality content using AI. Create blog posts, social media content, email templates, and more with the power of GPT and other AI models.',
            icon: '🤖',
            difficulty: Difficulty.INTERMEDIATE,
            featured: false,
            indiaBadge: true,
            nodeCount: 6,
            useCases: [
                'Generate blog post ideas and outlines',
                'Create social media content at scale',
                'Write email marketing campaigns',
                'Automate content creation workflows',
            ],
            setupSteps: [
                'Get your OpenAI or Google Gemini API key',
                'Configure the content generation prompt',
                'Set up output formatting and storage',
                'Test with various content types',
                'Integrate with your CMS or publishing platform',
            ],
            credentialsRequired: ['OpenAI API Key or Google Gemini API Key', 'Optional: CMS API'],
            nodes: ['HTTP Request', 'AI Node', 'Function', 'Data Transformation', 'Storage', 'Webhook'],
            categorySlug: 'ai-machine-learning',
            tagSlugs: ['automation', 'api', 'integration'],
            author: 'FlowKit Team',
            authorUrl: 'https://flowkit.in',
        },
        {
            slug: 'social-media-scheduler',
            name: 'Multi-Platform Social Media Scheduler',
            description: 'Schedule and publish posts across multiple social media platforms simultaneously. Manage Twitter, LinkedIn, Facebook, and more from a single workflow.',
            icon: '📱',
            difficulty: Difficulty.ADVANCED,
            featured: false,
            indiaBadge: false,
            nodeCount: 8,
            useCases: [
                'Schedule posts across multiple platforms',
                'Maintain consistent social media presence',
                'Automate content distribution',
                'Track engagement metrics',
            ],
            setupSteps: [
                'Connect your social media accounts (Twitter, LinkedIn, Facebook)',
                'Set up your content calendar in Google Sheets or Airtable',
                'Configure posting schedule and time zones',
                'Customize content for each platform',
                'Test posting to ensure proper formatting',
            ],
            credentialsRequired: ['Twitter API', 'LinkedIn API', 'Facebook API', 'Google Sheets or Airtable'],
            nodes: ['Schedule Trigger', 'Google Sheets', 'Switch', 'Twitter', 'LinkedIn', 'Facebook', 'Function', 'Error Handler'],
            categorySlug: 'social-media',
            tagSlugs: ['automation', 'scheduling', 'twitter', 'linkedin', 'integration'],
            author: 'FlowKit Team',
            authorUrl: 'https://flowkit.in',
        },
    ];

    const createdWorkflows = [];
    for (const workflow of sampleWorkflows) {
        const { categorySlug, tagSlugs, ...workflowData } = workflow;

        const created = await prisma.workflow.upsert({
            where: { slug: workflow.slug },
            update: {},
            create: {
                ...workflowData,
                workflowJson: createSampleWorkflowJson(workflow.name),
                useCases: workflow.useCases,
                setupSteps: workflow.setupSteps,
                credentialsRequired: workflow.credentialsRequired,
                nodes: workflow.nodes,
                published: true,
                publishedAt: new Date(),
                categories: {
                    create: {
                        category: {
                            connect: {
                                slug: categorySlug,
                            },
                        },
                    },
                },
                tags: {
                    create: tagSlugs.map((tagSlug) => ({
                        tag: {
                            connect: {
                                slug: tagSlug,
                            },
                        },
                    })),
                },
            },
        });
        createdWorkflows.push(created);
    }

    console.log(`✅ Created ${createdWorkflows.length} sample workflows\n`);

    // ============================================
    // 5. CREATE SYSTEM SETTINGS
    // ============================================
    console.log('⚙️  Creating system settings...');

    const systemSettings = [
        {
            key: 'email_provider',
            value: 'resend',
            description: 'Current email service provider (resend or nodemailer)',
        },
        {
            key: 'site_name',
            value: 'FlowKit',
            description: 'Site name displayed in emails and meta tags',
        },
        {
            key: 'admin_email',
            value: 'admin@flowkit.in',
            description: 'Admin contact email for system notifications',
        },
    ];

    for (const setting of systemSettings) {
        await prisma.systemSetting.upsert({
            where: { key: setting.key },
            update: { value: setting.value, description: setting.description },
            create: setting,
        });
    }

    console.log(`✅ Created ${systemSettings.length} system settings\n`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('═══════════════════════════════════════════');
    console.log('✨ Database seeding completed successfully!');
    console.log('═══════════════════════════════════════════\n');

    console.log('📊 Summary:');
    console.log(`   • 1 Super Admin user`);
    console.log(`   • ${createdCategories.length} categories`);
    console.log(`   • ${createdTags.length} tags`);
    console.log(`   • ${createdWorkflows.length} sample workflows`);
    console.log(`   • ${systemSettings.length} system settings\n`);

    console.log('🔐 Admin Login Credentials:');
    console.log('   Email: admin@flowkit.in');
    console.log('   Password: Admin@123!');
    console.log('   ⚠️  IMPORTANT: Change this password after first login!\n');

    console.log('🚀 Next Steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Visit: http://localhost:3000');
    console.log('   3. Login to admin panel at: http://localhost:3000/admin');
    console.log('   4. Change the default admin password\n');
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:');
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
