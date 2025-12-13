-- This file is used for testcontainers to apply the full schema
-- It should be kept in sync with all migrations

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE TABLE IF NOT EXISTS file_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  folder_id UUID REFERENCES file_folders(id) ON DELETE CASCADE,
  uploadthing_key TEXT NOT NULL UNIQUE,
  uploadthing_url TEXT NOT NULL,
  name TEXT NOT NULL,
  size TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by_user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_files_user_id ON files (user_id);
CREATE INDEX IF NOT EXISTS idx_files_folder_id ON files (folder_id);
CREATE INDEX IF NOT EXISTS idx_files_uploadthing_key ON files (uploadthing_key);
CREATE INDEX IF NOT EXISTS idx_file_folders_user_id ON file_folders (user_id);

