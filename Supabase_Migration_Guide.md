# 🔄 Firebase to Supabase Migration Guide

## ✅ Migration Status: COMPLETED

Your ProjectVeo application has been successfully migrated from Firebase Storage to Supabase Storage!

---

## 📋 What Was Changed

### Backend Changes (`/backend`)

1. **Dependencies Updated** (`requirements.txt`)
   - ❌ Removed: `firebase_admin==7.1.0`
   - ✅ Added: `supabase==2.14.0`

2. **Environment Variables** (`.env`)
   - ✅ Added Supabase credentials:
     ```env
     SUPABASE_URL="https://rjdpecoujgcoiejwrprp.supabase.co"
     SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     SUPABASE_BUCKET="project-files"
     ```
   - 📝 Firebase credentials kept as comments for reference

3. **Server Code** (`server.py`)
   - Replaced Firebase Admin SDK imports with Supabase client
   - Updated initialization logic to use Supabase
   - Modified `/api/upload` endpoint to use Supabase Storage
   - Modified `/api/srs` endpoint to use Supabase Storage
   - All file uploads now go to Supabase bucket: `project-files`

### Frontend Changes (`/frontend`)

1. **Dependencies Updated** (`package.json`)
   - ❌ Removed: `firebase: ^12.9.0`

2. **Files Removed**
   - ❌ Deleted: `src/lib/firebase.js` (no longer needed)

---

## 🚀 Setup Instructions

### Step 1: Configure Supabase Storage

1. **Open Supabase SQL Editor**
   - Go to your Supabase dashboard: https://app.supabase.com
   - Navigate to: **SQL Editor** → **New Query**

2. **Run the Setup SQL**
   - Open the file: `supabase-setup.sql` (in the root directory)
   - Copy the entire content
   - Paste it into the SQL Editor
   - Click **Run** to execute

3. **Verify Bucket Creation**
   - Go to: **Storage** section in Supabase dashboard
   - You should see a bucket named: `project-files`
   - The bucket should be marked as **Public**

### Step 2: Verify Backend Configuration

The backend `.env` file has already been updated with your Supabase credentials:

```env
SUPABASE_URL="https://rjdpecoujgcoiejwrprp.supabase.co"
SUPABASE_KEY="your-service-role-key"
SUPABASE_BUCKET="project-files"
```

✅ **No action needed** - credentials are already configured!

### Step 3: Test the Migration

**Backend Test (Upload Endpoint):**
```bash
# Make sure backend is running, then test with curl
curl -X POST "http://localhost:8001/api/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/test-file.jpg" \
  -F "project_id=test-project-123" \
  -F "category=general"
```

**Expected Response:**
```json
{
  "id": "uuid-here",
  "project_id": "test-project-123",
  "filename": "test-file.jpg",
  "file_url": "https://rjdpecoujgcoiejwrprp.supabase.co/storage/v1/object/public/project-files/...",
  "file_type": "image/jpeg",
  "category": "general",
  "uploaded_by": "Your Name",
  "created_at": "2025-02-15T..."
}
```

---

## 🔍 Key Differences: Firebase vs Supabase

| Feature | Firebase | Supabase |
|---------|----------|----------|
| **Client Library** | `firebase_admin` | `supabase` |
| **Upload Method** | `blob.upload_from_string()` | `storage.from_().upload()` |
| **Public URL** | `blob.public_url` | `storage.from_().get_public_url()` |
| **File Path** | `project_id/uuid_filename` | `project_id/uuid.ext` |
| **Authentication** | Service Account JSON | API Key (service_role) |

---

## 📁 File Structure in Supabase

Files are organized in the `project-files` bucket with this structure:

```
project-files/
├── {project_id}/
│   ├── {uuid}.jpg          (general files)
│   ├── {uuid}.pdf          (general files)
│   └── srs/
│       ├── {uuid}.pdf      (SRS documents)
│       └── {uuid}.docx     (SRS documents)
```

---

## 🐛 Troubleshooting

### Issue: "Supabase not configured" error

**Solution:**
- Verify `.env` file has correct credentials
- Restart the backend server
- Check backend logs for initialization errors

### Issue: Upload returns 400 Bad Request

**Solution:**
- Ensure bucket `project-files` exists in Supabase
- Run the `supabase-setup.sql` script
- Verify bucket policies are configured correctly

### Issue: Files upload but cannot be accessed

**Solution:**
- Bucket must be set as **Public**
- Check storage policies in Supabase dashboard
- Verify the "Public Access" policy is enabled

### Issue: "Row level security" error

**Solution:**
- The SQL setup script includes RLS policies
- If you see this error, run the `supabase-setup.sql` script again

---

## 🔐 Security Notes

1. **Service Role Key**: The key in `.env` is a service role key with full access. Keep it secure!
2. **Public Bucket**: Files are publicly accessible via URL (same as Firebase)
3. **Authentication**: Upload endpoints require JWT authentication (existing logic)

---

## 🔄 Rollback (If Needed)

If you need to rollback to Firebase:

1. Uncomment Firebase credentials in `.env`
2. Restore original `server.py` from git history
3. Run: `pip install firebase_admin`
4. Run: `cd frontend && yarn add firebase`
5. Restore `frontend/src/lib/firebase.js`

---

## 📞 Support

- **Supabase Docs**: https://supabase.com/docs/guides/storage
- **Supabase Storage API**: https://supabase.com/docs/reference/python/storage
- **Python Client**: https://github.com/supabase/supabase-py

---

## ✨ Benefits of Supabase

✅ **Open Source**: Full control over your data  
✅ **Better Pricing**: More generous free tier  
✅ **Unified Platform**: Database + Storage + Auth in one place  
✅ **PostgreSQL**: Full SQL database capabilities  
✅ **Real-time**: Built-in real-time subscriptions  

---

**Migration completed successfully! 🎉**

Your application is now using Supabase Storage for all file uploads.
