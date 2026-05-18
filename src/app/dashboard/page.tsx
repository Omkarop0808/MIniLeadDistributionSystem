'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Provider {
  providerId: number;
  name: string;
  quota: number;
  leadsReceived: number;
  remainingQuota: number;
  assignedLeads: Array<{
    _id: string;
    name: string;
    phone: string;
    service: string;
    createdAt: string;
  }>;
}

export default function Dashboard() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProviders = async () => {
    try {
      const res = await fetch('/api/providers');
      const data = await res.json();
      if (data.providers) {
        setProviders(data.providers);
      }
    } catch (error) {
      console.error('Failed to fetch providers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
    const interval = setInterval(fetchProviders, 3000); // Poll every 3 seconds for real-time updates
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10"
    >
      <div className="text-center sm:text-left mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block bg-brand-green border-2 border-black brutal-shadow px-4 py-1 rounded-full text-sm font-bold mb-4 tracking-wide"
        >
          ● Live Dashboard
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight">Provider Dashboard</h1>
        <p className="text-gray-700 mt-3 font-medium text-lg">Real-time overview of lead allocations and quotas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {providers.map((provider, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={provider.providerId} 
            className="group relative"
          >
            <div className="bg-white border-4 border-black brutal-shadow rounded-2xl overflow-hidden h-full flex flex-col">
              <div className="p-6 flex-grow">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-black">{provider.name}</h3>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-brand-green border-2 border-black">
                    ID: {provider.providerId}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 border-2 border-black rounded-xl p-3 text-center brutal-shadow">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Received</p>
                    <p className="text-3xl font-black text-black">{provider.leadsReceived}</p>
                  </div>
                  <div className="bg-gray-50 border-2 border-black rounded-xl p-3 text-center brutal-shadow">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Remaining</p>
                    <p className="text-3xl font-black text-brand-green drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">{provider.remainingQuota}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-black uppercase tracking-widest mb-3 bg-gray-100 inline-block px-2 py-1 rounded border border-black">Assigned Leads ({provider.assignedLeads.length})</h4>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {provider.assignedLeads.length === 0 ? (
                      <p className="text-sm text-gray-500 font-medium italic py-4">No leads assigned yet.</p>
                    ) : (
                      provider.assignedLeads.map(lead => (
                        <div key={lead._id} className="bg-white rounded-lg p-3 border-2 border-black brutal-shadow">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-sm font-bold text-black">{lead.name}</p>
                            <span className="text-[9px] font-black text-black bg-brand-green border border-black px-1.5 py-0.5 rounded uppercase">{lead.service}</span>
                          </div>
                          <p className="text-xs text-gray-600 font-medium">{lead.phone}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
