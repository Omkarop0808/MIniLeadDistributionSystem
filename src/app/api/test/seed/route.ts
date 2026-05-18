import { NextResponse } from 'next/server';
import { seedProviders } from '@/lib/leadDistribution';

export async function POST() {
  try {
    await seedProviders();
    return NextResponse.json({ success: true, message: 'Providers seeded' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
