import mongoose, { Document, Model } from 'mongoose';

export interface IProvider extends Document {
  providerId: number;
  name: string;
  quota: number;
  leadsReceived: number;
}

const ProviderSchema = new mongoose.Schema({
  providerId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  quota: { type: Number, required: true, default: 10 },
  leadsReceived: { type: Number, required: true, default: 0 },
});

export const Provider: Model<IProvider> = mongoose.models.Provider || mongoose.model<IProvider>('Provider', ProviderSchema);
