import mongoose, { Document, Model } from 'mongoose';

export interface IAllocationState extends Document {
  service: string;
  lastAssignedIndex: number;
}

const AllocationStateSchema = new mongoose.Schema({
  service: { type: String, required: true, unique: true },
  lastAssignedIndex: { type: Number, required: true, default: -1 }
});

export const AllocationState: Model<IAllocationState> = mongoose.models.AllocationState || mongoose.model<IAllocationState>('AllocationState', AllocationStateSchema);
