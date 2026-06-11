const webPush = require('web-push');
const { createClient } = require('@supabase/supabase-js');

const MESSAGES = {
  jesse: {
    en: (place) => ({ title: 'Jesse shared their location 📍', body: place || 'Tap to see where he is' }),
    es: (place) => ({ title: 'Jesse compartió su ubicación 📍', body: place || 'Toca para ver dónde está' }),
  },
  abigail: {
    en: (place) => ({ title: 'Abigail shared her location 📍', body: place || 'Tap to see where she is' }),
    es: (place) => ({ title: 'Abigail compartió su ubicación 📍', body: place || 'Toca para ver dónde está' }),
  },
};

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
  if (process.env.FUNCTION_SECRET && event.headers['x-function-secret'] !== process.env.FUNCTION_SECRET) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  let from, place;
  try {
    ({ from, place } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid body' }) };
  }
  if (from !== 'jesse' && from !== 'abigail') {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid sender' }) };
  }

  const partner = from === 'jesse' ? 'abigail' : 'jesse';

  webPush.setVapidDetails(
    'mailto:jessesrbremer@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );

  const supabase = createClient(
    'https://dgxxntdgtkiwztlptsdv.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  // Send only to the partner's devices (recipient only).
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('endpoint, subscription, lang, user_id')
    .eq('user_id', partner);

  if (!subscriptions?.length) {
    return { statusCode: 200, headers, body: JSON.stringify({ sent: 0 }) };
  }

  const staleEndpoints = [];
  let sent = 0;

  await Promise.allSettled(
    subscriptions.map(async ({ endpoint, subscription, lang }) => {
      const langKey = lang === 'es' ? 'es' : 'en';
      const { title, body } = MESSAGES[from][langKey](place);
      const pushPayload = JSON.stringify({
        notification: {
          title, body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          data: { onActionClick: { default: { operation: 'focusLastFocusedOrOpen', url: '/map' } } },
        },
      });
      try {
        await webPush.sendNotification(JSON.parse(subscription), pushPayload);
        sent++;
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) staleEndpoints.push(endpoint);
      }
    })
  );

  if (staleEndpoints.length) {
    await supabase.from('push_subscriptions').delete().in('endpoint', staleEndpoints);
  }

  return { statusCode: 200, headers, body: JSON.stringify({ sent }) };
};
