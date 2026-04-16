import mongoose, { Document, Model, Schema } from "mongoose";

export interface IFAQ {
  question: string;
  answer: string;
}

export interface IWebsiteInfo extends Document {
  contactPhone: string;
  contactEmail: string;
  officeAddress: string;
  aboutUs: string;
  mission: string;
  vision: string;
  impactMade: number;
  countriesReached: number;
  communitiesImpacted: number;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  faqs: IFAQ[];
  updatedBy?: mongoose.Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
}

const FAQSchema = new Schema<IFAQ>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const WebsiteInfoSchema = new Schema<IWebsiteInfo>(
  {
    contactPhone: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    officeAddress: { type: String, default: "" },
    aboutUs: { type: String, default: "" },
    mission: { type: String, default: "" },
    vision: { type: String, default: "" },
    impactMade: { type: Number, default: 0 },
    countriesReached: { type: Number, default: 0 },
    communitiesImpacted: { type: Number, default: 0 },
    facebook: { type: String, default: null },
    twitter: { type: String, default: null },
    instagram: { type: String, default: null },
    youtube: { type: String, default: null },
    faqs: { type: [FAQSchema], default: [] },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

const WebsiteInfo: Model<IWebsiteInfo> =
  mongoose.models.WebsiteInfo ??
  mongoose.model<IWebsiteInfo>("WebsiteInfo", WebsiteInfoSchema);

export default WebsiteInfo;
