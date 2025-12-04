/**
 * Migration script to upload existing workflow images to Cloudinary
 * Run with: npx tsx scripts/migrate-images-to-cloudinary.ts
 */

import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function migrateImagesToCloudinary() {
  console.log('🚀 Starting image migration to Cloudinary...\n');

  try {
    // Fetch all workflows
    const workflows = await prisma.workflow.findMany({
      select: {
        id: true,
        name: true,
        thumbnail: true,
      },
    });

    console.log(`📊 Found ${workflows.length} workflows to check\n`);

    let uploadedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const workflow of workflows) {
      console.log(`\n📝 Processing: ${workflow.name}`);
      console.log(`   Current thumbnail: ${workflow.thumbnail || 'None'}`);

      // Skip if no thumbnail
      if (!workflow.thumbnail) {
        console.log('   ⏭️  Skipped: No thumbnail');
        skippedCount++;
        continue;
      }

      // Skip if already a Cloudinary URL
      if (
        workflow.thumbnail.includes('cloudinary.com') ||
        workflow.thumbnail.startsWith('http://') ||
        workflow.thumbnail.startsWith('https://')
      ) {
        console.log('   ⏭️  Skipped: Already a cloud URL');
        skippedCount++;
        continue;
      }

      // Check if it's a local path
      if (workflow.thumbnail.startsWith('/thumbnails/') || workflow.thumbnail.startsWith('thumbnails/')) {
        const fileName = workflow.thumbnail.replace(/^\/?(thumbnails\/)/, '');
        const localPath = path.join(process.cwd(), 'public', 'thumbnails', fileName);

        console.log(`   📁 Checking local file: ${localPath}`);

        // Check if file exists
        if (!fs.existsSync(localPath)) {
          console.log('   ⚠️  Warning: Local file not found');
          errorCount++;
          continue;
        }

        try {
          // Upload to Cloudinary
          console.log('   ☁️  Uploading to Cloudinary...');
          const result = await cloudinary.uploader.upload(localPath, {
            folder: 'flowkit-workflows',
            resource_type: 'image',
            transformation: [
              { width: 1200, height: 630, crop: 'limit' },
              { quality: 'auto' },
              { fetch_format: 'auto' },
            ],
          });

          // Update database
          await prisma.workflow.update({
            where: { id: workflow.id },
            data: {
              thumbnail: result.secure_url,
            },
          });

          console.log(`   ✅ Success! New URL: ${result.secure_url}`);
          uploadedCount++;
        } catch (error) {
          console.error('   ❌ Error uploading:', error);
          errorCount++;
        }
      } else {
        console.log('   ⏭️  Skipped: Unknown path format');
        skippedCount++;
      }
    }

    console.log('\n\n📊 Migration Summary:');
    console.log(`   ✅ Uploaded: ${uploadedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📝 Total: ${workflows.length}`);

    console.log('\n✨ Migration complete!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateImagesToCloudinary();
