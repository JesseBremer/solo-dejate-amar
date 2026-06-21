const webPush = require('web-push');
const { createClient } = require('@supabase/supabase-js');

const NAME = (id) => (id === 'jesse' ? 'Jesse' : 'Abigail');

// The letter just opened — tell the recipient (the partner it was written for).
const MESSAGE = {
  en: (r) => ({ title: 'A sealed letter just opened 💌', body: `${NAME(r.author)} wrote you: ${r.title}` }),
  es: (r) => ({ title: 'Una carta sellada se abrió 💌', body: `${NAME(r.author)} te escribió: ${r.title}` }),
};

exports.handler = async () => {
  webPush.setVapidDetails(
    'mailto:jessesrbremer@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );

  const supabase = createClient(
    'https://dgxxntdgtkiwztlptsdv.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  // Letters whose unlock time has passed but that we haven't announced yet.
  const { data: letters, error } = await supabase
    .from('vault_messages')
    .select('id, author, title, unlock_at, unlock_notified')
    .lte('unlock_at', new Date().toISOString())
    .eq('unlock_notified', false);

  if (error) {
    console.error('vault-unlock-notify query error:', error.message);
    return { statusCode: 200, body: JSON.stringify({ error: error.message }) };
  }
  if (!letters?.length) {
    return { statusCode: 200, body: JSON.stringify({ unlocked: 0 }) };
  }

  let sent = 0;

  for (const letter of letters) {
    const recipient = letter.author === 'jesse' ? 'abigail' : 'jesse';

    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('endpoint, subscription, lang');

    const stale = [];
    if (subs?.length) {
      await Promise.allSettled(
        subs.map(async ({ endpoint, subscription, lang }) => {
          const langKey = lang === 'es' ? 'es' : 'en';
          const { title, body } = MESSAGE[langKey](letter);
          const payload = JSON.stringify({
            notification: {
              title, body,
              icon: '/icons/icon-192x192.png',
              badge: '/icons/icon-72x72.png',
              data: { onActionClick: { default: { operation: 'focusLastFocusedOrOpen', url: '/vault' } } },
            },
          });
          try {
            await webPush.sendNotification(JSON.parse(subscription), payload);
            sent++;
          } catch (err) {
            if (err.statusCode === 410 || err.statusCode === 404) stale.push(endpoint);
          }
        }),
      );
    }

    if (stale.length) {
      await supabase.from('push_subscriptions').delete().in('endpoint', stale);
    }

    // Mark as announced so it never re-notifies.
    await supabase.from('vault_messages').update({ unlock_notified: true }).eq('id', letter.id);
  }

  console.log(`vault-unlock-notify: ${letters.length} unlocked, ${sent} pushes sent`);
  return { statusCode: 200, body: JSON.stringify({ unlocked: letters.length, sent }) };
};
