'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    service: 'Service 1',
    description: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit lead');
      }
      
      setSuccess(true);
      setFormData({
        name: '',
        phone: '',
        city: '',
        service: 'Service 1',
        description: ''
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-2xl mx-auto mt-8"
    >
      <div className="bg-white border-4 border-black brutal-shadow-lg rounded-2xl p-8 sm:p-12 relative overflow-hidden">
        <div className="text-center mb-10 relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block bg-black text-white px-4 py-1 rounded-full text-sm font-bold mb-6 tracking-wide"
          >
            ● AI-Powered Request Routing
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl sm:text-6xl font-black text-black tracking-tight mb-4 leading-tight"
          >
            Your leads <br />
            <span className="relative inline-block">
              <span className="relative z-10">your impact</span>
              <span className="absolute bottom-1 left-0 w-full h-4 bg-brand-green -z-10 transform -rotate-1"></span>
            </span> Let's route it
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-700 font-medium"
          >
            Submit your enquiry and we will instantly connect you with the most optimal provider based on real-time quotas.
          </motion.p>
        </div>

        {success && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 p-4 bg-brand-green border-2 border-black brutal-shadow rounded-xl flex items-start">
            <CheckCircle2 className="w-6 h-6 text-black mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-black text-black">Request submitted successfully!</h3>
              <p className="mt-1 text-sm text-black/80 font-semibold">Your lead has been routed directly to the best providers.</p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 p-4 bg-red-400 border-2 border-black brutal-shadow rounded-xl flex items-start">
            <AlertCircle className="w-6 h-6 text-black mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-black text-black">Submission Error</h3>
              <p className="mt-1 text-sm text-black/90 font-semibold">{error}</p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-black uppercase tracking-wider">Full Name</label>
              <div className="mt-2">
                <input required type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="block w-full rounded-lg border-2 border-black py-3 px-4 text-black shadow-none focus:outline-none focus:ring-0 focus:brutal-shadow bg-white sm:text-sm transition-all font-medium placeholder:text-gray-400" placeholder="John Doe" />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-bold text-black uppercase tracking-wider">Phone Number</label>
              <div className="mt-2">
                <input required type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="block w-full rounded-lg border-2 border-black py-3 px-4 text-black shadow-none focus:outline-none focus:ring-0 focus:brutal-shadow bg-white sm:text-sm transition-all font-medium placeholder:text-gray-400" placeholder="9999999999" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
            <div>
              <label htmlFor="city" className="block text-sm font-bold text-black uppercase tracking-wider">City</label>
              <div className="mt-2">
                <input required type="text" name="city" id="city" value={formData.city} onChange={handleChange} className="block w-full rounded-lg border-2 border-black py-3 px-4 text-black shadow-none focus:outline-none focus:ring-0 focus:brutal-shadow bg-white sm:text-sm transition-all font-medium placeholder:text-gray-400" placeholder="New York" />
              </div>
            </div>

            <div>
              <label htmlFor="service" className="block text-sm font-bold text-black uppercase tracking-wider">Service Type</label>
              <div className="mt-2">
                <select required name="service" id="service" value={formData.service} onChange={handleChange} className="block w-full rounded-lg border-2 border-black py-3 px-4 text-black shadow-none focus:outline-none focus:ring-0 focus:brutal-shadow bg-white sm:text-sm transition-all font-medium cursor-pointer">
                  <option value="Service 1">Service 1</option>
                  <option value="Service 2">Service 2</option>
                  <option value="Service 3">Service 3</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-bold text-black uppercase tracking-wider">Description (Optional)</label>
            <div className="mt-2">
              <textarea name="description" id="description" rows={3} value={formData.description} onChange={handleChange} className="block w-full rounded-lg border-2 border-black py-3 px-4 text-black shadow-none focus:outline-none focus:ring-0 focus:brutal-shadow bg-white sm:text-sm transition-all font-medium placeholder:text-gray-400" placeholder="Tell us more about what you need..."></textarea>
            </div>
          </div>

          <div className="pt-6">
            <motion.button 
              whileHover={{ x: -2, y: -2 }}
              whileTap={{ x: 2, y: 2 }}
              type="submit" 
              disabled={loading} 
              className="w-full flex justify-center items-center py-4 px-4 rounded-xl border-2 border-black brutal-shadow text-lg font-black text-black bg-brand-green hover:bg-[#c3e623] focus:outline-none disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Start Your Journey →'}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
