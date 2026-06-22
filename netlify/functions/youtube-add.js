// Supabase database webhook (songs INSERT) -> add the new song to the YouTube playlist.
// Configure a webhook: table `songs`, event INSERT, POST to this function,
// header x-webhook-secret = FUNCTION_SECRET.

const { getAccessToken, resolveVideoId, getPlaylistVideoIds, addVideos, isConfigured } = require('./youtube-helpers');

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
  if (process.env.FUNCTION_SECRET && event.headers['x-webhook-secret'] !== process.env.FUNCTION_SECRET) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid body' }) };
  }

  const { type, table, record } = payload;
  if (type !== 'INSERT' || table !== 'songs' || !record) {
    return { statusCode: 200, headers, body: JSON.stringify({ skipped: true }) };
  }
  if (!isConfigured()) {
    return { statusCode: 200, headers, body: JSON.stringify({ skipped: 'youtube not configured' }) };
  }

  try {
    const token = await getAccessToken();
    const playlistId = process.env.YOUTUBE_PLAYLIST_ID;

    const videoId = await resolveVideoId(token, record);
    if (!videoId) {
      return { statusCode: 200, headers, body: JSON.stringify({ added: 0, reason: 'no match', song: `${record.title} — ${record.artist}` }) };
    }

    const existing = await getPlaylistVideoIds(token, playlistId);
    if (existing.has(videoId)) {
      return { statusCode: 200, headers, body: JSON.stringify({ added: 0, reason: 'already in playlist' }) };
    }

    await addVideos(token, playlistId, [videoId]);
    return { statusCode: 200, headers, body: JSON.stringify({ added: 1, videoId }) };
  } catch (err) {
    console.error('youtube-add error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: String(err.message || err) }) };
  }
};
