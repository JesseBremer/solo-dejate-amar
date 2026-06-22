// One-time setup helper: Google redirects here with ?code=... after you authorize.
// Exchanges the code for tokens and shows the refresh token to copy into your
// YOUTUBE_REFRESH_TOKEN env var. Safe to delete these two helpers afterwards.

exports.handler = async (event) => {
  const code = event.queryStringParameters?.code;
  const htmlHeaders = { 'Content-Type': 'text/html' };

  if (!code) {
    return { statusCode: 400, headers: htmlHeaders, body: '<p>Missing ?code in callback.</p>' };
  }

  const redirectUri =
    process.env.YOUTUBE_REDIRECT_URI ||
    `https://${event.headers.host}/.netlify/functions/youtube-callback`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.YOUTUBE_CLIENT_ID,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const json = await res.json();
  if (!res.ok || !json.refresh_token) {
    return {
      statusCode: 500,
      headers: htmlHeaders,
      body: `<p>Token exchange failed (no refresh_token — revoke prior access and retry):</p><pre>${JSON.stringify(json, null, 2)}</pre>`,
    };
  }

  return {
    statusCode: 200,
    headers: htmlHeaders,
    body: `
      <div style="font-family: sans-serif; max-width: 640px; margin: 40px auto; line-height: 1.6;">
        <h2>✅ YouTube connected</h2>
        <p>Copy this value into your Netlify env var <code>YOUTUBE_REFRESH_TOKEN</code>:</p>
        <textarea readonly style="width:100%; height:90px; font-family:monospace; padding:10px;">${json.refresh_token}</textarea>
        <p style="color:#888;">Then redeploy. You can delete the <code>youtube-auth</code> and <code>youtube-callback</code> functions afterwards.</p>
      </div>
    `,
  };
};
