# Cloudinary Integration Setup

This guide explains how to set up Cloudinary for image uploads in your CRM.

## What is Cloudinary?

Cloudinary is a cloud-based image and video management platform that handles:
- Secure image uploads
- Automatic optimization
- Fast delivery
- Easy management and organization

## Setup Steps

### 1. Create a Cloudinary Account

1. Go to [Cloudinary.com](https://cloudinary.com)
2. Click **Sign Up (Free)**
3. Create your account (you can use Google, GitHub, or email)
4. Free plan includes:
   - 25 GB storage
   - 25 GB monthly upload/transformation
   - Unlimited API calls
   - No coding required

### 2. Get Your API Credentials

Once logged in to your Cloudinary dashboard:

1. Go to **Dashboard** (top-right menu)
2. You'll see your credentials:
   - **Cloud Name** - Your unique identifier (e.g., `dxxxx9hfm`)
   - **API Key** - Your public API key
   - **API Secret** - Keep this secret! (Don't share)

### 3. Add Environment Variables

Add these to `.env.local` in your CRM project:

```bash
# Cloudinary - Get these from your Cloudinary Dashboard
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Important:**
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` can be public (starts with NEXT_PUBLIC_)
- Keep API_KEY and API_SECRET secret - only on your server
- Never commit `.env.local` to git

### 4. Test the Integration

1. Start your CRM: `npm run dev`
2. Go to **Blog Posts** or **Case Studies**
3. Click **New Blog Post** or **New Case Study**
4. Try uploading an image - you should see a preview
5. After upload, you'll see the Cloudinary URL

### 5. Manage Images in Cloudinary

Visit your **Media Library** in Cloudinary Dashboard to:
- Browse all uploaded images
- Organize into folders
- View transformation history
- Monitor usage

## Image Organization

Images are automatically organized into folders:

```
luminous/
├── blog/          # Blog post thumbnails
├── authors/       # Author profile images
├── case-studies/  # Project thumbnails
└── uploads/       # General uploads
```

## Features Included

✅ **Automatic Optimization**
- Images are automatically compressed
- Served in optimal formats (WebP, AVIF)
- Responsive image delivery

✅ **Size Validation**
- Max 5MB per file
- Automatic format detection
- Client-side validation

✅ **Error Handling**
- Friendly error messages
- Failed upload recovery
- Retry on failure

## Security Notes

1. **API Secret** - Never expose this in client code
   - Only used on server (in `app/api/upload/route.ts`)
   - Never in browser code

2. **Authentication** - Upload endpoint requires CRM login
   - Only authenticated users can upload
   - Check in `/api/upload` route

3. **Folder Structure** - Helps organize and limit damage
   - Each content type has its own folder
   - Easier to manage and delete if needed

## Troubleshooting

### "Upload failed" Error
- Check that `.env.local` has correct credentials
- Make sure you're logged into CRM
- Try a smaller image file
- Check browser console for detailed error

### Images Not Showing
- Verify Cloudinary account is active
- Check your free plan hasn't expired
- Confirm storage/bandwidth limits not exceeded
- Verify URL is correct in database

### Performance Issues
- Images are cached automatically
- First upload optimizes, subsequent loads are fast
- Cloudinary CDN handles delivery globally

## Free Plan Limits

- **Storage:** 25 GB
- **Bandwidth:** 25 GB/month
- **API Calls:** Unlimited
- **Transformations:** Unlimited

Once exceeded, automatic downgrading or upgrade needed.

## Next Steps

1. Sign up for Cloudinary
2. Add environment variables
3. Restart CRM dev server
4. Start uploading images!

## Support

- [Cloudinary Docs](https://cloudinary.com/documentation)
- [API Reference](https://cloudinary.com/documentation/image_upload_api_reference)
- [Community Forum](https://support.cloudinary.com)
