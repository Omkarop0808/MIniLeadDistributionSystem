import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Provider } from '@/lib/models/Provider';
import { Lead } from '@/lib/models/Lead';
import { seedProviders } from '@/lib/leadDistribution';

export async function GET() {
  try {
    await connectToDatabase();
    await seedProviders(); // Auto-seed if empty
    
    // Fetch all providers, sorted by ID
    const providers = await Provider.find({}).sort({ providerId: 1 }).lean();
    
    // For each provider, fetch their leads (we can fetch all leads and map them)
    // Or we can just aggregate. Since it's a small app, let's fetch all leads.
    const allLeads = await Lead.find({}).sort({ createdAt: -1 }).lean();
    
    const dashboardData = providers.map(p => {
      const assignedLeads = allLeads.filter(l => l.assignedProviders.includes(p.providerId));
      return {
        ...p,
        remainingQuota: p.quota - p.leadsReceived,
        assignedLeads
      };
    });

    return NextResponse.json({ providers: dashboardData });
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
