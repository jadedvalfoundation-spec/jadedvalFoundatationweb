import mongoose, { Document, Model, Schema } from "mongoose";

export interface IFAQ {
  question: string;
  answer: string;
}

export interface IPillar {
  icon: string;
  title: string;
  description: string;
}

export interface IJourneyItem {
  date: string;
  title: string;
  description: string;
}

export interface IImpactAnalytic {
  sector: string;
  metric: string;
  value: string;
  goal: string;
  goalYear: string;
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
  allocatedCapitalUSD: number;
  impactAnalytics: IImpactAnalytic[];
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  faqs: IFAQ[];
  pillars: IPillar[];
  journey: IJourneyItem[];
  heroImage: string;
  storyImage: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankSortCode: string;
  bankSwiftCode: string;
  bankTransferNote: string;
  updatedBy?: mongoose.Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
}

const ImpactAnalyticSchema = new Schema<IImpactAnalytic>(
  {
    sector: { type: String, required: true },
    metric: { type: String, required: true },
    value: { type: String, required: true },
    goal: { type: String, required: true },
    goalYear: { type: String, default: "" },
  },
  { _id: false }
);

const FAQSchema = new Schema<IFAQ>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const PillarSchema = new Schema<IPillar>(
  {
    icon: { type: String, default: "" },
    title: { type: String, required: true },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const JourneyItemSchema = new Schema<IJourneyItem>(
  {
    date: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
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
    allocatedCapitalUSD: { type: Number, default: 0 },
    impactAnalytics: { type: [ImpactAnalyticSchema], default: [] },
    facebook: { type: String, default: null },
    twitter: { type: String, default: null },
    instagram: { type: String, default: null },
    youtube: { type: String, default: null },
    faqs: { type: [FAQSchema], default: [] },
    pillars: { type: [PillarSchema], default: [] },
    journey: { type: [JourneyItemSchema], default: [] },
    heroImage: { type: String, default: "" },
    storyImage: { type: String, default: "" },
    bankName: { type: String, default: "" },
    bankAccountName: { type: String, default: "" },
    bankAccountNumber: { type: String, default: "" },
    bankSortCode: { type: String, default: "" },
    bankSwiftCode: { type: String, default: "" },
    bankTransferNote: { type: String, default: "" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

const WebsiteInfo: Model<IWebsiteInfo> =
  mongoose.models.WebsiteInfo ??
  mongoose.model<IWebsiteInfo>("WebsiteInfo", WebsiteInfoSchema);

export default WebsiteInfo;
