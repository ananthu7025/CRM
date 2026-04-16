# Cloudinary Image Upload - Quick Start

## ✨ What's New

Your CRM now has **drag-and-drop image uploads** for:
- 📝 Blog post thumbnails
- 👤 Author profile images
- 💼 Case study project thumbnails

## 🚀 Get Started in 5 Minutes

### Step 1: Create Free Cloudinary Account
Go to [cloudinary.com/signup](https://cloudinary.com/signup) and sign up for free.

### Step 2: Get Your Credentials
1. Login to Cloudinary Dashboard
2. Copy your **Cloud Name** from the top-left
3. Go to **Settings → API Keys** and copy:
   - API Key
   - API Secret

### Step 3: Add to .env.local
Edit `.env.local` and replace:
```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxxxx9hfm
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=your_secret_here
```

### Step 4: Restart CRM
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 5: Start Uploading! 🎉
- Go to **Blog Posts** or **Case Studies**
- Click **New Blog Post** or **New Case Study**
- Click on image upload areas to upload photos
- Images automatically optimize and upload to Cloudinary

## 📂 How It Works

```
Your CRM              Cloudinary Cloud
    │                      │
    ├─→ Upload Image  ──→  │
    │                   Store & Optimize
    │                      │
    ←─ Get CDN URL   ←──  │
    │                      │
Database Store URL
```

## 🎯 Features

✅ **Instant Upload** - Click to upload, image ready instantly
✅ **Auto Optimize** - Cloudinary compresses for web automatically
✅ **Secure** - Only authenticated users can upload
✅ **Organized** - Images sorted by type (blog, authors, case-studies)
✅ **Reliable** - Images stored in Cloudinary's global CDN

## 🔒 Security

- API Secret never exposed to browser
- Only authenticated CRM users can upload
- Images stored securely in Cloudinary

## 📊 Free Plan Includes

- ✅ 25 GB storage
- ✅ 25 GB bandwidth/month
- ✅ Unlimited API calls
- ✅ Unlimited transformations

## 🛠️ Implementation Details

### Files Modified
- `components/BlogForm.tsx` - Added image uploader for thumbnails
- `components/CaseStudyForm.tsx` - Added image uploader for thumbnails

### Files Created
- `components/ImageUpload.tsx` - Reusable upload component
- `app/api/upload/route.ts` - Backend upload handler
- `CLOUDINARY_SETUP.md` - Detailed setup guide

### API Endpoint
```
POST /api/upload
Authorization: Required (JWT session)
Content: FormData with file and folder
Response: { secure_url, public_id, ... }
```

## ❓ FAQ

**Q: Can users upload without logging in?**
A: No, only authenticated CRM admins can upload.

**Q: Where are images stored?**
A: In Cloudinary's secure cloud storage, served via CDN.

**Q: Can I delete old images?**
A: Yes, go to Cloudinary Media Library to manage.

**Q: Will images slow down the website?**
A: No, Cloudinary CDN makes images load faster.

**Q: What file types are supported?**
A: Images (JPG, PNG, GIF, WebP, etc.) up to 5MB.

## 🆘 Troubleshooting

### "Upload failed" or "Unauthorized"
- Make sure you're logged into CRM
- Refresh the page
- Check browser console for error details

### Images not appearing
- Verify Cloudinary credentials in .env.local
- Restart CRM server
- Check Cloudinary dashboard for upload history

### "Cloudinary is not configured"
- Make sure all 3 env variables are set
- Check for typos in cloud name
- Don't use placeholder values

## 📚 Learn More

- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Full Setup Guide](./CLOUDINARY_SETUP.md)
- [API Reference](https://cloudinary.com/documentation/image_upload_api_reference)

## 💡 Pro Tips

1. **Organize Images** - Use Cloudinary Media Library to browse all uploads
2. **Batch Upload** - Upload via Cloudinary Dashboard for bulk uploads
3. **Transformations** - Cloudinary can resize, crop, filter images on-the-fly
4. **CDN Optimization** - Images automatically served in best format for each device

---

**Status:** ✅ Ready to use
**Setup Time:** ~5 minutes
**Cost:** Free (with paid plans available)
