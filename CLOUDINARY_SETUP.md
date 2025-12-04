# Cloudinary Setup Guide

FlowKit uses Cloudinary to store and optimize workflow images. Follow these steps to set up Cloudinary for your project.

## Why Cloudinary?

- ✅ **No local storage**: Images stored in cloud, not in `/public` folder
- ✅ **Automatic optimization**: Images are automatically compressed and optimized
- ✅ **CDN delivery**: Fast image delivery worldwide
- ✅ **Free tier**: 25GB storage and 25GB bandwidth/month free
- ✅ **Responsive images**: Automatic image transformations for different screen sizes

## Setup Instructions

### 1. Create a Cloudinary Account

1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up for a free account
3. Verify your email

### 2. Get Your Credentials

1. After logging in, go to the **Dashboard**
2. You'll see your account details:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 3. Add Credentials to `.env`

Add these three variables to your `.env` file:

```env
# Cloudinary (for workflow images)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name-here"
CLOUDINARY_API_KEY="your-api-key-here"
CLOUDINARY_API_SECRET="your-api-secret-here"
```

**Example:**
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="flowkit"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="abcdefghijklmnopqrstuvwxyz123456"
```

### 4. Restart Your Development Server

```bash
npm run dev
```

## Usage in Admin Panel

### Uploading Workflow Images

1. Go to **Admin Panel** → **Workflows** → **Create/Edit Workflow**
2. You'll see the new Cloudinary image upload component
3. Click "Choose Image" or drag and drop an image
4. Image will be automatically uploaded to Cloudinary
5. The Cloudinary URL will be saved in the database

### Image Requirements

- **Format**: JPEG, PNG, WebP, or GIF
- **Max Size**: 5MB
- **Recommended**: 1200x630px (OG image size)

## Integration Details

### Files Created

1. **`/src/lib/cloudinary.ts`** - Cloudinary configuration and helper functions
2. **`/src/app/api/upload/route.ts`** - API endpoint for image uploads
3. **`/src/components/admin/CloudinaryImageUpload.tsx`** - Reusable upload component

### How to Use the Component

In your workflow forms, replace the old image input with:

```tsx
import { CloudinaryImageUpload } from "@/components/admin/CloudinaryImageUpload";

// In your form
<CloudinaryImageUpload
  value={imageUrl}
  onChange={(url, publicId) => {
    setImageUrl(url);
    // Save publicId if needed for deletion
  }}
  folder="flowkit-workflows"
  label="Workflow Image"
/>
```

### Image Optimization

Images are automatically optimized:
- **Width**: 1200px
- **Height**: 630px
- **Quality**: Auto (Cloudinary's smart compression)
- **Format**: Auto (WebP for modern browsers)

### Deleting Images

To delete an image from Cloudinary:

```tsx
import { deleteFromCloudinary } from '@/lib/cloudinary';

await deleteFromCloudinary(publicId);
```

## Free Tier Limits

Cloudinary's free tier includes:
- **Storage**: 25GB
- **Bandwidth**: 25GB/month
- **Transformations**: 25 credits/month
- **API calls**: No limit

This is more than enough for most workflow libraries!

## Troubleshooting

### "Upload failed" Error

- Check that all three environment variables are set correctly
- Restart your development server after adding env variables
- Verify your Cloudinary account is active

### Images Not Loading

- Check that `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is correct
- Verify the image URL in the database is a valid Cloudinary URL

### File Size Errors

- Maximum file size is 5MB
- Compress large images before uploading
- Use tools like TinyPNG or ImageOptim

## Production Deployment

When deploying to production (Vercel, Netlify, etc.):

1. Add the three Cloudinary environment variables to your hosting platform
2. Make sure `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set (public variable)
3. Keep `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` secret

---

For more information, visit [Cloudinary Documentation](https://cloudinary.com/documentation)
