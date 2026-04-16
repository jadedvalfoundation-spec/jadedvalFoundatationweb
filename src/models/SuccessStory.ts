import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISuccessStory extends Document {
  personName: string;
  occupation: string;
  location?: string;
  image: string;
  imagePublicId: string;
  story: string;
  isPublished: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SuccessStorySchema = new Schema<ISuccessStory>(
  {
    personName: { type: String, required: true, trim: true },
    occupation: { type: String, required: true, trim: true },
    location: { type: String, default: "" },
    image: { type: String, default: "" },
    imagePublicId: { type: String, default: "" },
    story: { type: String, required: true },
    isPublished: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

SuccessStorySchema.index({ isPublished: 1 });
SuccessStorySchema.index({ createdAt: -1 });

const SuccessStory: Model<ISuccessStory> =
  mongoose.models.SuccessStory ??
  mongoose.model<ISuccessStory>("SuccessStory", SuccessStorySchema);

export default SuccessStory;
