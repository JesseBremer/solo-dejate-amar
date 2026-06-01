# Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from Settings > API

## 2. Update Environment Variables

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  supabaseUrl: 'https://YOUR_PROJECT_ID.supabase.co',
  supabaseAnonKey: 'YOUR_ANON_KEY'
};
```

## 3. Run Database Schema

1. Go to SQL Editor in Supabase dashboard
2. Copy and paste contents of `schema.sql`
3. Run the query

## 4. Seed Initial Data

1. Go to SQL Editor in Supabase dashboard
2. Copy and paste contents of `seed.sql`
3. Run the query

## 5. Create Storage Bucket

1. Go to Storage in Supabase dashboard
2. Create a new bucket named `gallery`
3. Set it to **Public** (enable public access)
4. Under Policies, add a policy for:
   - SELECT: Allow all (for public read)
   - INSERT: Allow all (for uploads)
   - DELETE: Allow all (for deletions)

### Storage Policies SQL

If you prefer to set up policies via SQL:

```sql
-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

-- Allow public uploads
CREATE POLICY "Public upload access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'gallery');

-- Allow public deletes
CREATE POLICY "Public delete access"
ON storage.objects FOR DELETE
USING (bucket_id = 'gallery');
```

## 6. Verify Setup

1. Run `npm start`
2. Navigate to the site and unlock with passcode `0505`
3. Verify pages load data from Supabase
4. Go to `/admin` to test CRUD operations

## Database Tables

| Table | Description |
|-------|-------------|
| `config` | Site settings (passcode, dates, spicy score, welcome message) |
| `songs` | Music collection with Spotify/YouTube links |
| `jar_messages` | Random love notes for the digital jar |
| `map_locations` | Map markers with coordinates |
| `gallery_images` | Gallery image metadata (files stored in Storage) |
