import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const city = searchParams.get('city');

  const API_KEY = process.env.TOMORROW_API_KEY;

  if (!API_KEY) {
    return NextResponse.json({ error: 'Tomorrow.io API key not configured' }, { status: 500 });
  }

  try {
    const location = city || (lat && lon ? `${lat},${lon}` : "London");
    
    // Tomorrow.io v4 Forecast API
    // Returns current, hourly, and daily data
    const url = `https://api.tomorrow.io/v4/weather/forecast?location=${encodeURIComponent(location)}&apikey=${API_KEY}&units=metric`;
    
    const res = await fetch(url, { next: { revalidate: 600 } }); // Cache for 10 mins
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to fetch weather" }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
  }
}
