import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Provider } from '@/lib/models/Provider';
import { WebhookEvent } from '@/lib/models/WebhookEvent';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventId, providerId } = body;

    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId for idempotency' }, { status: 400 });
    }

    await connectToDatabase();

    // Idempotency check: Atomically insert the event
    try {
      await WebhookEvent.create({ eventId });
    } catch (error: any) {
      if (error.code === 11000) {
        // Event already processed
        return NextResponse.json({ success: true, message: 'Event already processed (idempotency caught)' }, { status: 200 });
      }
      throw error;
    }

    // Process the reset
    if (providerId) {
      await Provider.findOneAndUpdate({ providerId }, { leadsReceived: 0 });
    } else {
      // If no providerId specified, reset all (for testing purposes)
      await Provider.updateMany({}, { leadsReceived: 0 });
    }

    return NextResponse.json({ success: true, message: 'Quota reset successfully' }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
