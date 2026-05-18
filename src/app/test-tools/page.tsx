'use client';

import { useState } from 'react';
import { RefreshCw, Zap, ShieldAlert, Database } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TestTools() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const seedProviders = async () => {
    setLoading('seed');
    try {
      const res = await fetch('/api/test/seed', { method: 'POST' });
      const data = await res.json();
      addLog(`Seed Providers: ${data.message || data.error}`);
    } catch (err: any) {
      addLog(`Seed Error: ${err.message}`);
    }
    setLoading(null);
  };

  const resetQuota = async () => {
    setLoading('reset');
    const eventId = `evt_reset_${Date.now()}`;
    try {
      const res = await fetch('/api/webhook/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId })
      });
      const data = await res.json();
      addLog(`Quota Reset: ${data.message || data.error}`);
    } catch (err: any) {
      addLog(`Reset Error: ${err.message}`);
    }
    setLoading(null);
  };

  const testIdempotency = async () => {
    setLoading('idempotency');
    const eventId = `evt_idemp_${Date.now()}`;
    addLog(`Testing Idempotency with eventId: ${eventId}`);
    
    try {
      // Fire 3 identical webhook requests simultaneously
      const promises = Array(3).fill(0).map(() => 
        fetch('/api/webhook/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId })
        }).then(r => r.json())
      );

      const results = await Promise.all(promises);
      results.forEach((res, i) => {
        addLog(`Webhook Request ${i+1}: ${res.message || res.error}`);
      });
    } catch (err: any) {
      addLog(`Idempotency Error: ${err.message}`);
    }
    setLoading(null);
  };

  const generateConcurrencyLeads = async () => {
    setLoading('concurrency');
    addLog('Generating 10 concurrent leads...');
    
    try {
      const promises = Array(10).fill(0).map((_, i) => {
        const phone = `555${Date.now().toString().slice(-4)}${i.toString().padStart(3, '0')}`;
        const service = `Service ${(i % 3) + 1}`;
        
        return fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `Test User ${i}`,
            phone,
            city: 'Test City',
            service,
            description: 'Concurrency Test'
          })
        }).then(r => r.json());
      });

      const results = await Promise.allSettled(promises);
      
      let success = 0;
      let failed = 0;
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.success) {
          success++;
        } else {
          failed++;
        }
      });
      
      addLog(`Concurrency Test Complete: ${success} successes, ${failed} failures/duplicates`);
    } catch (err: any) {
      addLog(`Concurrency Error: ${err.message}`);
    }
    setLoading(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-10"
    >
      <div className="text-center sm:text-left mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight">System Tools</h1>
        <p className="text-gray-700 mt-3 font-medium text-lg">Simulate webhooks, test idempotency, and trigger concurrent requests.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div whileHover={{ x: -2, y: -2 }} className="bg-white border-4 border-black brutal-shadow rounded-2xl p-6 flex flex-col items-start relative group">
          <div className="w-12 h-12 bg-blue-200 border-2 border-black rounded-xl flex items-center justify-center mb-4 brutal-shadow">
            <Database className="w-6 h-6 text-black" />
          </div>
          <h3 className="text-xl font-black text-black mb-2">Seed Database</h3>
          <p className="text-sm text-gray-700 font-medium mb-6 flex-grow">Initialize the database with 8 providers (if not already seeded).</p>
          <button onClick={seedProviders} disabled={loading !== null} className="w-full bg-blue-300 text-black border-2 border-black hover:brutal-shadow font-black py-3 px-4 rounded-xl transition-all disabled:opacity-50">
            {loading === 'seed' ? 'Seeding...' : 'Seed Providers'}
          </button>
        </motion.div>

        <motion.div whileHover={{ x: -2, y: -2 }} className="bg-white border-4 border-black brutal-shadow rounded-2xl p-6 flex flex-col items-start relative group">
          <div className="w-12 h-12 bg-green-300 border-2 border-black rounded-xl flex items-center justify-center mb-4 brutal-shadow">
            <RefreshCw className="w-6 h-6 text-black" />
          </div>
          <h3 className="text-xl font-black text-black mb-2">Reset Quotas</h3>
          <p className="text-sm text-gray-700 font-medium mb-6 flex-grow">Simulate a payment gateway webhook to reset provider quotas to 10.</p>
          <button onClick={resetQuota} disabled={loading !== null} className="w-full bg-green-400 text-black border-2 border-black hover:brutal-shadow font-black py-3 px-4 rounded-xl transition-all disabled:opacity-50">
            {loading === 'reset' ? 'Resetting...' : 'Trigger Webhook'}
          </button>
        </motion.div>

        <motion.div whileHover={{ x: -2, y: -2 }} className="bg-white border-4 border-black brutal-shadow rounded-2xl p-6 flex flex-col items-start relative group">
          <div className="w-12 h-12 bg-purple-300 border-2 border-black rounded-xl flex items-center justify-center mb-4 brutal-shadow">
            <ShieldAlert className="w-6 h-6 text-black" />
          </div>
          <h3 className="text-xl font-black text-black mb-2">Test Idempotency</h3>
          <p className="text-sm text-gray-700 font-medium mb-6 flex-grow">Send 3 identical webhooks simultaneously to test idempotency safety.</p>
          <button onClick={testIdempotency} disabled={loading !== null} className="w-full bg-purple-400 text-black border-2 border-black hover:brutal-shadow font-black py-3 px-4 rounded-xl transition-all disabled:opacity-50">
            {loading === 'idempotency' ? 'Testing...' : 'Test Multiple Webhooks'}
          </button>
        </motion.div>

        <motion.div whileHover={{ x: -2, y: -2 }} className="bg-white border-4 border-black brutal-shadow rounded-2xl p-6 flex flex-col items-start relative group">
          <div className="w-12 h-12 bg-orange-300 border-2 border-black rounded-xl flex items-center justify-center mb-4 brutal-shadow">
            <Zap className="w-6 h-6 text-black" />
          </div>
          <h3 className="text-xl font-black text-black mb-2">Concurrency Test</h3>
          <p className="text-sm text-gray-700 font-medium mb-6 flex-grow">Instantly generate 10 leads to test race conditions in distribution logic.</p>
          <button onClick={generateConcurrencyLeads} disabled={loading !== null} className="w-full bg-orange-400 text-black border-2 border-black hover:brutal-shadow font-black py-3 px-4 rounded-xl transition-all disabled:opacity-50">
            {loading === 'concurrency' ? 'Generating...' : 'Generate 10 Leads'}
          </button>
        </motion.div>
      </div>

      <div className="bg-black border-4 border-black brutal-shadow-lg rounded-2xl overflow-hidden mt-10">
        <div className="bg-brand-green px-4 py-3 border-b-4 border-black flex justify-between items-center">
          <h3 className="text-sm font-black text-black uppercase tracking-widest">Execution Logs</h3>
          <button onClick={() => setLogs([])} className="text-xs font-black text-black bg-white px-2 py-1 rounded border-2 border-black hover:bg-gray-200 transition-colors brutal-shadow">CLEAR</button>
        </div>
        <div className="p-4 h-64 overflow-y-auto font-mono text-xs md:text-sm text-green-400 space-y-2 bg-black">
          {logs.length === 0 ? (
            <p className="text-gray-500 italic">No logs yet. Run a tool above.</p>
          ) : (
            logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
