import { NextResponse } from 'next/server';

// Sliding-window in-memory rate limiter
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // Max 30 requests per minute per IP
const ipRequests = new Map<string, RateLimitRecord>();

function isRateLimited(ip: string): { limited: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = ipRequests.get(ip);

  // Periodic cleanup of expired entries
  if (ipRequests.size > 1000) {
    for (const [key, val] of ipRequests.entries()) {
      if (val.resetAt < now) ipRequests.delete(key);
    }
  }

  if (!record || record.resetAt < now) {
    ipRequests.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { limited: false };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { limited: true, retryAfter };
  }

  record.count += 1;
  return { limited: false };
}

// Input sanitizer & validator
function sanitizeCity(input: string): string | null {
  const trimmed = input.trim();
  if (trimmed.length < 1 || trimmed.length > 80) return null;
  // Allow Unicode letters, numbers, spaces, commas, periods, hyphens, apostrophes
  const cityRegex = /^[\p{L}\p{N}\s,.\-']+$/u;
  return cityRegex.test(trimmed) ? trimmed : null;
}

function validateCoordinates(latStr: string | null, lonStr: string | null): { lat: number; lon: number } | null {
  if (!latStr || !lonStr) return null;
  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat, lon };
}

export async function GET(request: Request) {
  // Rate limiting check
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = (forwardedFor ? forwardedFor.split(',')[0].trim() : null) || request.headers.get('x-real-ip') || 'anonymous';
  const { limited, retryAfter } = isRateLimited(ip);

  if (limited) {
    return NextResponse.json(
      { error: `Too many requests. Please wait ${retryAfter} seconds before trying again.` },
      { 
        status: 429,
        headers: {
          'Retry-After': String(retryAfter || 60),
        },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const rawCity = searchParams.get('city');
  const rawLat = searchParams.get('lat');
  const rawLon = searchParams.get('lon');

  let locationQuery = 'London';

  if (rawCity) {
    const validatedCity = sanitizeCity(rawCity);
    if (!validatedCity) {
      return NextResponse.json(
        { error: 'Invalid city name provided. Please enter a valid city name (letters, spaces, hyphens).' },
        { status: 400 }
      );
    }
    locationQuery = validatedCity;
  } else if (rawLat && rawLon) {
    const coords = validateCoordinates(rawLat, rawLon);
    if (!coords) {
      return NextResponse.json(
        { error: 'Invalid coordinates. Latitude must be between -90 and 90, and longitude between -180 and 180.' },
        { status: 400 }
      );
    }
    locationQuery = `${coords.lat},${coords.lon}`;
  }

  const API_KEY = process.env.TOMORROW_API_KEY;

  if (!API_KEY) {
    console.error('[Tomorrow.io API Error]: TOMORROW_API_KEY environment variable is not configured.');
    return NextResponse.json(
      { error: 'Weather service is currently misconfigured. Please check server settings.' },
      { status: 500 }
    );
  }

  try {
    const fields = [
      'temperature',
      'temperatureApparent',
      'humidity',
      'windSpeed',
      'pressureSurfaceLevel',
      'uvIndex',
      'epaIndex',
      'visibility',
      'weatherCode',
      'weatherCodeMax',
    ].join(',');

    const url = `https://api.tomorrow.io/v4/weather/forecast?location=${encodeURIComponent(locationQuery)}&apikey=${API_KEY}&units=metric&fields=${fields}`;

    const res = await fetch(url, { next: { revalidate: 600 } }); // Cache for 10 mins
    const data = await res.json();

    if (!res.ok) {
      console.error('[Tomorrow.io API Error Response]:', { status: res.status, message: data.message });
      if (res.status === 404) {
        return NextResponse.json({ error: `Location "${locationQuery}" could not be found.` }, { status: 404 });
      }
      if (res.status === 429) {
        return NextResponse.json({ error: 'Upstream weather provider rate limit exceeded. Please wait a moment.' }, { status: 429 });
      }
      return NextResponse.json({ error: 'Failed to retrieve weather data for this location.' }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Weather API Internal Exception]:', error);
    return NextResponse.json({ error: 'An unexpected internal error occurred while fetching weather data.' }, { status: 500 });
  }
}
