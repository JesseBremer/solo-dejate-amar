-- Solo Dejate Amar Database Schema
-- Run this first to create the tables

-- Site configuration (single row)
CREATE TABLE config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passcode TEXT NOT NULL DEFAULT '0505',
  start_date DATE NOT NULL,
  target_date DATE NOT NULL,
  spicy_score INTEGER NOT NULL CHECK (spicy_score >= 0 AND spicy_score <= 10),
  welcome_message TEXT NOT NULL,
  youtube_playlist_url TEXT,
  spotify_playlist_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Songs collection
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  shared_by TEXT NOT NULL CHECK (shared_by IN ('jesse', 'abigail')),
  spotify_url TEXT NOT NULL,
  youtube_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Jar messages
CREATE TABLE jar_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Map locations
CREATE TABLE map_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  lat DECIMAL(10, 7) NOT NULL,
  lng DECIMAL(10, 7) NOT NULL,
  visit_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Gallery images (metadata only, files in Supabase Storage)
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) with public access for this private app
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE jar_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Create policies for public read/write access (private app, no auth needed)
CREATE POLICY "Public read access" ON config FOR SELECT USING (true);
CREATE POLICY "Public write access" ON config FOR ALL USING (true);

CREATE POLICY "Public read access" ON songs FOR SELECT USING (true);
CREATE POLICY "Public write access" ON songs FOR ALL USING (true);

CREATE POLICY "Public read access" ON jar_messages FOR SELECT USING (true);
CREATE POLICY "Public write access" ON jar_messages FOR ALL USING (true);

CREATE POLICY "Public read access" ON map_locations FOR SELECT USING (true);
CREATE POLICY "Public write access" ON map_locations FOR ALL USING (true);

CREATE POLICY "Public read access" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "Public write access" ON gallery_images FOR ALL USING (true);

-- Photo albums: links out to Google Photos shared albums (no media stored here)
CREATE TABLE photo_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  cover_path TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE photo_albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON photo_albums FOR SELECT USING (true);
CREATE POLICY "Public write access" ON photo_albums FOR ALL USING (true);
