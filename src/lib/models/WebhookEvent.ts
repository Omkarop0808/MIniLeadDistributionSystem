import mongoose, { Document, Model } from 'mongoose';

export interface IWebhookEvent extends Document {
  eventId: string;
  processedAt: Date;
}

const WebhookEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  processedAt: { type: Date, default: Date.now }
});

export const WebhookEvent: Model<IWebhookEvent> = mongoose.models.WebhookEvent || mongoose.model<IWebhookEvent>('WebhookEvent', WebhookEventSchema);
