const webPush = require('web-push');
const { createClient } = require('@supabase/supabase-js');

const NAME = (id) => id === 'jesse' ? 'Jesse' : 'Abigail';

const MESSAGES = {
  en: {
    journal:         (r) => ({ title: `${NAME(r.author)} wrote in the journal`, body: r.title || r.content?.slice(0, 100) || '' }),
    songs:           (r) => ({ title: `${NAME(r.shared_by)} shared a song 🎵`, body: `${r.title} — ${r.artist}` }),
    gallery:         ()  => ({ title: 'A new memory was added 📸', body: 'Tap to see it' }),
    dream_goals:     (r) => r.completed
                             ? { title: 'A dream was achieved! ✨', body: r.title }
                             : { title: 'A new dream was added ✨', body: r.title },
    vault_messages:  (r) => ({ title: `${NAME(r.author)} sealed a letter 🔐`, body: 'A message sealed just for you' }),
    timeline_events: (r) => ({ title: `${NAME(r.author)} added a milestone 📜`, body: r.title }),
    jar_messages:    (r) => r.written_by ? { title: `${NAME(r.written_by)} left you a note 💌`, body: 'Open the jar to read it' } : null,
    ideas:           (r) => ({ title: `${NAME(r.author)} has an idea 💡`, body: r.title }),
    ideas_accepted:  (r) => ({ title: `${NAME(r.author === 'jesse' ? 'abigail' : 'jesse')} said yes! ✓`, body: r.title }),
    ideas_suggested: (r) => ({ title: `${NAME(r.author === 'jesse' ? 'abigail' : 'jesse')} has a suggestion 💬`, body: r.suggestion || r.title }),
    quotes:          (r) => ({ title: r.said_by ? `${NAME(r.said_by)} said something quotable 💬` : 'A new quote was added 💬', body: r.text?.slice(0, 100) || '' }),
    photo_albums:    (r) => ({ title: 'A new album was added 📸', body: r.title }),
  },
  es: {
    journal:         (r) => ({ title: `${NAME(r.author)} escribió en el diario`, body: r.title || r.content?.slice(0, 100) || '' }),
    songs:           (r) => ({ title: `${NAME(r.shared_by)} compartió una canción 🎵`, body: `${r.title} — ${r.artist}` }),
    gallery:         ()  => ({ title: 'Se agregó un nuevo recuerdo 📸', body: 'Toca para verlo' }),
    dream_goals:     (r) => r.completed
                             ? { title: '¡Un sueño fue logrado! ✨', body: r.title }
                             : { title: 'Se agregó un nuevo sueño ✨', body: r.title },
    vault_messages:  (r) => ({ title: `${NAME(r.author)} selló una carta 🔐`, body: 'Un mensaje sellado solo para ti' }),
    timeline_events: (r) => ({ title: `${NAME(r.author)} agregó un momento 📜`, body: r.title }),
    jar_messages:    (r) => r.written_by ? { title: `${NAME(r.written_by)} te dejó una nota 💌`, body: 'Abre el frasco para leerla' } : null,
    ideas:           (r) => ({ title: `${NAME(r.author)} tiene una idea 💡`, body: r.title }),
    ideas_accepted:  (r) => ({ title: `${NAME(r.author === 'jesse' ? 'abigail' : 'jesse')} dijo que sí! ✓`, body: r.title }),
    ideas_suggested: (r) => ({ title: `${NAME(r.author === 'jesse' ? 'abigail' : 'jesse')} tiene una sugerencia 💬`, body: r.suggestion || r.title }),
    quotes:          (r) => ({ title: r.said_by ? `${NAME(r.said_by)} dijo algo memorable 💬` : 'Se agregó una nueva cita 💬', body: r.text?.slice(0, 100) || '' }),
    photo_albums:    (r) => ({ title: 'Se agregó un nuevo álbum 📸', body: r.title }),
  },
};

const TABLE_MAP = {
  journal_entries:  'journal',
  songs:            'songs',
  gallery:          'gallery',
  dream_goals:      'dream_goals',
  vault_messages:   'vault_messages',
  timeline_events:  'timeline_events',
  jar_messages:     'jar_messages',
  ideas:            'ideas',
  quotes:           'quotes',
  photo_albums:     'photo_albums',
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

  const { table, record, old_record, type } = payload;

  const isDreamCompleted  = type === 'UPDATE' && table === 'dream_goals' && record?.completed;
  const isIdeaAccepted    = type === 'UPDATE' && table === 'ideas' && record?.status === 'accepted' && old_record?.status !== 'accepted';
  const isIdeaSuggested   = type === 'UPDATE' && table === 'ideas' && record?.suggestion && !old_record?.suggestion;

  if (type !== 'INSERT' && !isDreamCompleted && !isIdeaAccepted && !isIdeaSuggested) {
    return { statusCode: 200, headers, body: JSON.stringify({ skipped: true }) };
  }

  // For idea updates, override the message key and target only the idea's author
  let messageKey = TABLE_MAP[table];
  let targetUserId = null;

  if (isIdeaAccepted) {
    messageKey = 'ideas_accepted';
    targetUserId = record.author;
  } else if (isIdeaSuggested) {
    messageKey = 'ideas_suggested';
    targetUserId = record.author;
  }

  if (!messageKey) {
    return { statusCode: 200, headers, body: JSON.stringify({ skipped: true }) };
  }

  // Some message builders return null to opt out (e.g. admin jar messages with no written_by)
  const testMsg = MESSAGES['en'][messageKey]?.(record);
  if (testMsg === null) {
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
