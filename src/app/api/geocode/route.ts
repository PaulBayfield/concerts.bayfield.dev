import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q?.trim()) {
    return NextResponse.json({ features: [] });
  }

  const photonUrl = process.env.PHOTON_URL;
  if (!photonUrl) {
    return NextResponse.json({ error: 'Geocoding not configured' }, { status: 503 });
  }

  const url = `${photonUrl}/api?q=${encodeURIComponent(q)}&limit=5`;
  const res = await fetch(url, { next: { revalidate: 60 } });

  if (!res.ok) {
    return NextResponse.json({ features: [] }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
