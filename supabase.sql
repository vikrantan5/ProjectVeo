-- ============================================
-- Supabase Storage Setup for ProjectVeo
-- ============================================
-- Run this SQL in your Supabase SQL Editor to set up storage bucket and policies

-- Step 1: Create the storage bucket (if not already created via UI)
-- Note: You can also create this via Supabase Dashboard > Storage > New Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', true)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Enable public access to files (so uploaded files can be accessed via URLs)
CREATE POLICY "Public Access for Uploaded Files"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-files');

-- Step 3: Allow authenticated users to upload files
CREATE POLICY "Allow Authenticated Uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-files');

-- Step 4: Allow authenticated users to update their files
CREATE POLICY "Allow Authenticated Updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'project-files');

-- Step 5: Allow authenticated users to delete files
CREATE POLICY "Allow Authenticated Deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'project-files');

-- ============================================
-- Alternative: If you want to allow anonymous uploads (less secure)
-- ============================================
-- Uncomment the following if you want to allow uploads without authentication

-- CREATE POLICY "Allow Anonymous Uploads"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'project-files');

-- ============================================
-- Verification Queries
-- ============================================
-- Run these to verify your setup:

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'project-files';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- ============================================
-- INSTRUCTIONS:
-- ============================================
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Create a new query
-- 4. Copy and paste this entire file
-- 5. Click "Run" to execute
-- 6. Verify the bucket appears in Storage section
-- ============================================
