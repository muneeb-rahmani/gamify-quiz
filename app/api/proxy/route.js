// app/api/proxy/route.js
export async function GET() {
    try {
      const externalApiUrl = 'https://api.jsonserve.com/Uw5CrX';
      const response = await fetch(externalApiUrl);
  
      if (!response.ok) {
        throw new Error(`External API error: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Proxy API error:', error.message);
      return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }