import mongoose, { Document, Model, Schema } from "mongoose";
import { IMPACT_SECTORS, type ImpactSector } from "@/lib/impact-constants";

export { IMPACT_SECTORS } from "@/lib/impact-constants";
export type { ImpactSector } from "@/lib/impact-constants";

export interface IImpactMedia {
  url: string;
  publicId: string;
  type: "image" | "video";
}

export interface IImpact extends Document {
  title: string;
  description: string;
  details: string;
  sector: ImpactSector;
  media: IImpactMedia[];
  isPublished: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ImpactMediaSchema = new Schema<IImpactMedia>(
  { url: { type: String, required: true }, publicId: { type: String, required: true }, type: { type: String, enum: ["image", "video"], required: true } },
  { _id: false }
);

const ImpactSchema = new Schema<IImpact>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 600 },
    details: { type: String, required: true },
    sector: { type: String, enum: IMPACT_SECTORS, required: true },
    media: [ImpactMediaSchema],
    isPublished: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

ImpactSchema.index({ isPublished: 1 });
ImpactSchema.index({ sector: 1 });
ImpactSchema.index({ createdAt: -1 });

const Impact: Model<IImpact> =
  mongoose.models.Impact ?? mongoose.model<IImpact>("Impact", ImpactSchema);

export default Impact;
