import connectToDatabase from './db';
import { Provider } from './models/Provider';
import { AllocationState } from './models/AllocationState';
import { Lead } from './models/Lead';

const mandatoryRules = {
  'Service 1': [1],
  'Service 2': [5],
  'Service 3': [1, 4]
};

const fairPools = {
  'Service 1': [2, 3, 4],
  'Service 2': [6, 7, 8],
  'Service 3': [2, 3, 5, 6, 7, 8]
};

export async function processNewLead(leadData: { name: string; phone: string; city: string; service: string; description: string }) {
  await connectToDatabase();
  await seedProviders(); // Auto-seed if empty

  // 1. Create Lead in DB first. This handles the unique constraint (phone + service) atomically.
  // If duplicate, it throws a MongoError (code 11000) which we will catch in the API route.
  const lead = new Lead({
    ...leadData,
    assignedProviders: []
  });
  
  await lead.save();

  // 2. Assign Providers atomically
  const assignedProviders: number[] = [];
  const mandatory = mandatoryRules[leadData.service as keyof typeof mandatoryRules] || [];
  
  // Assign Mandatory Providers
  for (const providerId of mandatory) {
    const updated = await Provider.findOneAndUpdate(
      { providerId, $expr: { $lt: ["$leadsReceived", "$quota"] } },
      { $inc: { leadsReceived: 1 } },
      { returnDocument: 'after' }
    );
    if (updated) {
      assignedProviders.push(providerId);
    }
  }

  // Assign Fair Pool Providers
  let slotsRemaining = 3 - assignedProviders.length;
  if (slotsRemaining > 0) {
    const pool = fairPools[leadData.service as keyof typeof fairPools] || [];
    if (pool.length > 0) {
      // Loop up to pool.length times to find available providers
      for (let attempt = 0; attempt < pool.length; attempt++) {
        if (slotsRemaining <= 0) break;

        const state = await AllocationState.findOneAndUpdate(
          { service: leadData.service },
          { $inc: { lastAssignedIndex: 1 } },
          { returnDocument: 'after', upsert: true }
        );
        
        const index = state.lastAssignedIndex % pool.length;
        const candidateProviderId = pool[index];

        if (assignedProviders.includes(candidateProviderId)) {
          continue;
        }

        const updated = await Provider.findOneAndUpdate(
          { providerId: candidateProviderId, $expr: { $lt: ["$leadsReceived", "$quota"] } },
          { $inc: { leadsReceived: 1 } },
          { returnDocument: 'after' }
        );

        if (updated) {
          assignedProviders.push(candidateProviderId);
          slotsRemaining--;
        }
      }
    }
  }

  // 3. Update the Lead with the assigned providers
  lead.assignedProviders = assignedProviders;
  await lead.save();

  return lead;
}

// Helper to seed providers on startup/test-tools
export async function seedProviders() {
  await connectToDatabase();
  const count = await Provider.countDocuments();
  if (count === 0) {
    const providers = Array.from({ length: 8 }, (_, i) => ({
      providerId: i + 1,
      name: `Provider ${i + 1}`,
      quota: 10,
      leadsReceived: 0
    }));
    await Provider.insertMany(providers);
  }
}
