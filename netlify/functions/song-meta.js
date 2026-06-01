exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (process.env.FUNCTION_SECRET && event.headers['x-function-secret'] !== process.env.FUNCTION_SECRET) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }


  let url;
  try {
    ({ url } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid body' }) };
  }

  if (!url) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing url' }) };

  let oembedUrl;
  let platform;

  if (url.includes('open.spotify.com')) {
    oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`;
    platform = 'spotify';
  } else if (url.includes('music.youtube.com') || url.includes('youtube.com') || url.includes('youtu.be')) {
    const normalized = url.replace('music.youtube.com', 'www.youtube.com');
    oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(normalized)}&format=json`;
    platform = url.includes('music.youtube.com') ? 'youtube-music' : 'youtube';
  } else {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unsupported URL' }) };
  }

  try {
    const res = await fetch(oembedUrl);
    if (!res.ok) throw new Error(`oEmbed returned ${res.status}`);
    const data = await res.json();

    let title = data.title || '';
    let artist = '';

    if (platform === 'spotify') {
      // Spotify oEmbed: title is track name only
      title = title;
      artist = '';
    } else {
      // YouTube: author_name is usually the artist/channel name
      artist = (data.author_name || '')
        .replace(/VEVO$/i, '')
        .replace(/Official$/i, '')
        .replace(/ - Topic$/i, '')
        .trim();
      // Clean common suffixes from title
      title = title
        .replace(/\s*[\(\[].*?official.*?[\)\]]/gi, '')
        .replace(/\s*[\(\[].*?video.*?[\)\]]/gi, '')
        .replace(/\s*[\(\[].*?audio.*?[\)\]]/gi, '')
        .replace(/\s*[\(\[].*?lyrics.*?[\)\]]/gi, '')
        .replace(/\s*-\s*(official\s*)?(music\s*)?video$/i, '')
        .trim();
      // If title contains " - ", split it (common YouTube format "Title - Artist")
      if (!artist && title.includes(' - ')) {
        const parts = title.split(' - ');
        title = parts[0].trim();
        artist = parts.slice(1).join(' - ').trim();
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ title, artist, platform, thumbnail: data.thumbnail_url }),
    };
  } catch (e) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: e.message }) };
  }
};
