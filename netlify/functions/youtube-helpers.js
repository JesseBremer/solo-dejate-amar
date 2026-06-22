// Shared YouTube Data API v3 helpers for the playlist-sync functions.
// Relies on global fetch (Node 18+) and these env vars:
//   YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN, YOUTUBE_PLAYLIST_ID

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const API = 'https://www.googleapis.com/youtube/v3';

// Exchange the long-lived refresh token for a short-lived access token (Google OAuth).
async function getAccessToken() {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.YOUTUBE_CLIENT_ID,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET,
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) throw new Error(`Google token ${res.status}: ${await res.text()}`);
  return (await res.json()).access_token;
}

// Pull an 11-char video id out of a watch / youtu.be / music.youtube link, if present.
function videoIdFromUrl(url) {
  if (!url) return null;
  let m = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];
  m = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

// Resolve a song row to a YouTube video id.
// Prefers a real watch link; otherwise searches "title artist", biased to the Music
// category (id 10) with a plain-search fallback if that filter is rejected.
async function resolveVideoId(token, song) {
  const direct = videoIdFromUrl(song.youtube_url);
  if (direct) return direct;

  const q = encodeURIComponent(`${song.title} ${song.artist}`);
  for (const extra of ['&videoCategoryId=10', '']) {
    const res = await fetch(`${API}/search?part=snippet&type=video&maxResults=1&q=${q}${extra}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      if (extra) continue; // category filter rejected — retry without it
      return null;
    }
    const item = (await res.json()).items?.[0];
    if (item?.id?.videoId) return item.id.videoId;
  }
  return null;
}

// Collect every video id already in the playlist (paginated) to avoid duplicates.
async function getPlaylistVideoIds(token, playlistId) {
  const ids = new Set();
  let pageToken = '';

  do {
    const url = `${API}/playlistItems?part=contentDetails&maxResults=50&playlistId=${playlistId}` +
      (pageToken ? `&pageToken=${pageToken}` : '');
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) break;
    const json = await res.json();
    for (const it of json.items ?? []) {
      if (it.contentDetails?.videoId) ids.add(it.contentDetails.videoId);
    }
    pageToken = json.nextPageToken || '';
  } while (pageToken);

  return ids;
}

// Add video ids to the playlist. YouTube inserts one item per request.
async function addVideos(token, playlistId, videoIds) {
  for (const videoId of videoIds) {
    const res = await fetch(`${API}/playlistItems?part=snippet`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        snippet: { playlistId, resourceId: { kind: 'youtube#video', videoId } },
      }),
    });
    if (!res.ok) throw new Error(`YouTube add ${res.status}: ${await res.text()}`);
  }
}

function isConfigured() {
  return Boolean(
    process.env.YOUTUBE_CLIENT_ID &&
    process.env.YOUTUBE_CLIENT_SECRET &&
    process.env.YOUTUBE_REFRESH_TOKEN &&
    process.env.YOUTUBE_PLAYLIST_ID
  );
}

module.exports = { getAccessToken, resolveVideoId, getPlaylistVideoIds, addVideos, isConfigured };
