import { NextResponse } from 'next/server';
import { processNewLead } from '@/lib/leadDistribution';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, city, service, description } = body;

    if (!name || !phone || !city || !service) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const lead = await processNewLead({ name, phone, city, service, description });

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'A lead with this phone number already exists for this service.' }, { status: 409 });
    }
    console.error('Error creating lead:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
