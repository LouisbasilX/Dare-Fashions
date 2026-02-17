// actions/links.ts
'use server'

export async function shortenUrl(longUrl: string): Promise<string> {
  try {
    const response = await fetch('https://api.trls.link/pave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: longUrl }),
    });

    if (!response.ok) {
      console.error('URL shortener API error:', await response.text());
      // If shortening fails, return the original URL as a fallback
      return longUrl;
    }

    const data = await response.json();
    // The API returns a trail_id, and the short URL is https://api.trls.link/t/{trail_id}
    return `https://api.trls.link/t/${data.trail_id}`;
  } catch (error) {
    console.error('Failed to shorten URL:', error);
    // Fallback to the original URL
    return longUrl;
  }
}