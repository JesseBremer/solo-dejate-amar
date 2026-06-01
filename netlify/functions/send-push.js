const webPush = require('web-push');
const { createClient } = require('@supabase/supabase-js');

const MESSAGES = {
  en: {
    journal:        (r) => ({ title: `${r.author === 'jesse' ? 'Jesse' : 'Abigail'} wrote in the journal`, body: r.title || r.content?.slice(0, 100) || '' }),
    songs:          (r) => ({ title: `${r.shared_by === 'jesse' ? 'Jesse' : 'Abigail'} shared a song 🎵`, body: `${r.title} — ${r.artist}` }),
    gallery:        ()  => ({ title: 'A new memory was added 📸', body: 'Tap to see it' }),
    dream_goals:    (r) => r.completed
                            ? { title: 'A dream was achieved! ✨', body: r.title }
                            : { title: 'A new dream was added ✨', body: r.title },
  },
  es: {
    journal:        (r) => ({ title: `${r.author === 'jesse' ? 'Jesse' : 'Abigail'} escribió en el diario`, body: r.title || r.content?.slice(0, 100) || '' }),
    songs:          (r) => ({ title: `${r.shared_by === 'jesse' ? 'Jesse' : 'Abigail'} compartió una canción 🎵`, body: `${r.title} — ${r.artist}` }),
    gallery:        ()  => ({ title: 'Se agregó un nuevo recuerdo 📸', body: 'Toca para verlo' }),
    dream_goals:    (r) => r.completed
                            ? { title: '¡Un sueño fue logrado! ✨', body: r.title }
                            : { title: 'Se agregó un nuevo sueño ✨', body: r.title },
  },
};

const TABLE_MAP = {
  journal_entries: 'journal',
  songs:           'songs',
  gallery:         'gallery',
  dream_goals:     'dream_goals',
};

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

  const { table, record, type } = payload;
  if (type !== 'INSERT' && !(type === 'UPDATE' && table === 'dream_goals' && record?.completed)) {
    return { statusCode: 200, headers, body: JSON.stringify({ skipped: true }) };
  }

  const messageKey = TABLE_MAP[table];
  if (!messageKey) {
    return { statusCode: 200, headers, body: JSON.stringify({ skipped: true }) };
  }

  webPush.setVapidDetails(
    'mailto:jessesrbremer@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );

  const supabase = createClient(
    'https://dgxxntdgtkiwztlptsdv.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint, subscription, lang');

  console.log('subscriptions found:', subscriptions?.length ?? 0, error ? `error: ${error.message}` : '');

  if (error || !subscriptions?.length) {
    return { statusCode: 200, headers, body: JSON.stringify({ sent: 0, subscribers: 0 }) };
  }

  const staleEndpoints = [];
  let sent = 0;

  await Promise.allSettled(
    subscriptions.map(async ({ endpoint, subscription, lang }) => {
      const langKey = lang === 'es' ? 'es' : 'en';
      const { title, body } = MESSAGES[langKey][messageKey](record);

      const pushPayload = JSON.stringify({
        notification: {
          title,
          body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          data: {
            onActionClick: {
              default: { operation: 'focusLastFocusedOrOpen', url: '/' },
            },
          },
        },
      });

      try {
        await webPush.sendNotification(JSON.parse(subscription), pushPayload);
        sent++;
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          staleEndpoints.push(endpoint);
        }
      }
    })
  );

  if (staleEndpoints.length) {
    await supabase
      .from('push_subscriptions')
      .delete()
      .in('endpoint', staleEndpoints);
  }

  console.log(`sent: ${sent}, stale removed: ${staleEndpoints.length}`);
  return { statusCode: 200, headers, body: JSON.stringify({ sent, subscribers: subscriptions.length }) };
};
