// One-time / on-demand backfill: add every existing song to the YouTube playlist.
// Triggered from the admin Songs page (POST with header x-function-secret = FUNCTION_SECRET).
// Supports a dry run (?dryRun=1 or {"dryRun":true}) that reports matches without writing.

const { createClient } = require('@supabase/supabase-js');
const { getAccessToken, resolveVideoId, getPlaylistVideoIds, addVideos, isConfigured } = require('./youtube-helpers');

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
  if (process.env.FUNCTION_SECRET && event.headers['x-function-secret'] !== process.env.FUNCTION_SECRET) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }
  if (!isConfigured()) {
    return { statusCode: 503, headers, body: JSON.stringify({ error: 'YouTube not configured' }) };
  }

  // Dry run: report matches without writing to the playlist.
  let dryRun = event.queryStringParameters?.dryRun === '1' || event.queryStringParameters?.dryRun === 'true';
  try {
    if (event.body && JSON.parse(event.body).dryRun) dryRun = true;
  } catch { /* no/invalid body is fine */ }

  // Anon key is sufficient: the songs table has a public SELECT policy, and we only read.
  const supabase = createClient(
    'https://dgxxntdgtkiwztlptsdv.supabase.co',
    process.env.SUPABASE_ANON_KEY,
  );

  const { data: songs, error } = await supabase
    .from('songs')
    .select('title, artist, youtube_url')
    .order('sort_order', { ascending: true });

  if (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }

  try {
    const token = await getAccessToken();
    const playlistId = process.env.YOUTUBE_PLAYLIST_ID;
    const existing = await getPlaylistVideoIds(token, playlistId);

    const toAdd = [];
    const seen = new Set();
    const unmatched = [];

    for (const song of songs ?? []) {
      const videoId = await resolveVideoId(token, song);
      if (!videoId) { unmatched.push(`${song.title} — ${song.artist}`); continue; }
      if (existing.has(videoId) || seen.has(videoId)) continue;
      seen.add(videoId);
      toAdd.push(videoId);
    }

    if (toAdd.length && !dryRun) await addVideos(token, playlistId, toAdd);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        dryRun,
        total: songs?.length ?? 0,
        added: dryRun ? 0 : toAdd.length,
        wouldAdd: toAdd.length,
        unmatched,
      }),
    };
  } catch (err) {
    console.error('youtube-sync error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: String(err.message || err) }) };
  }
};
