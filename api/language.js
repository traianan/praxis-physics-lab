const supportedCountry = /^[A-Z]{2}$/;

export default function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).end();
  }

  const country = String(request.headers['x-vercel-ip-country'] || '').trim().toUpperCase();
  const language = supportedCountry.test(country)
    ? (country === 'RO' || country === 'MD' ? 'ro' : 'en')
    : null;

  response.setHeader('Cache-Control', 'private, no-store, max-age=0');
  response.setHeader('Vary', 'x-vercel-ip-country');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  return response.status(200).json({ language });
}
