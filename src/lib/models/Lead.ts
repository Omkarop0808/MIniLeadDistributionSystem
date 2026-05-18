import mongoose, { Document, Model } from 'mongoose';

export interface ILead extends Document {
  name: string;
  phone: string;
  city: string;
  service: string;
  description: string;
  assignedProviders: number[]; // Store providerIds
  createdAt: Date;
}

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  service: { type: String, required: true },
  description: { type: String },
  assignedProviders: [{ type: Number }], // storing providerId (1-8)
}, { timestamps: true });

// Prevent same phone creating another lead for the SAME service
LeadSchema.index({ phone: 1, service: 1 }, { unique: true });

export const Lead: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);
