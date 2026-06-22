// One-time setup helper: visit /.netlify/functions/youtube-auth in a browser to start
// the Google OAuth flow. Requires YOUTUBE_CLIENT_ID, and the redirect URI to be registered
// in your Google Cloud OAuth client. Override the redirect with YOUTUBE_REDIRECT_URI for
// local loopback testing (e.g. http://127.0.0.1:9999/.netlify/functions/youtube-callback).

const SCOPE = 'https://www.googleapis.com/auth/youtube';

exports.handler = async (event) => {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  if (!clientId) {
    return { statusCode: 503, body: 'YOUTUBE_CLIENT_ID is not set.' };
  }

  const redirectUri =
    process.env.YOUTUBE_REDIRECT_URI ||
    `https://${event.headers.host}/.netlify/functions/youtube-callback`;

  const url =
    'https://accounts.google.com/o/oauth2/v2/auth?' +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: SCOPE,
      access_type: 'offline',
      prompt: 'consent', // force a refresh_token every time
    });

  return { statusCode: 302, headers: { Location: url }, body: '' };
};
