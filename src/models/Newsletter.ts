import mongoose, { Document, Model, Schema } from "mongoose";

export interface INewsletter extends Document {
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NewsletterSchema = new Schema<INewsletter>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

NewsletterSchema.index({ email: 1 });

const Newsletter: Model<INewsletter> =
  mongoose.models.Newsletter ??
  mongoose.model<INewsletter>("Newsletter", NewsletterSchema);

export default Newsletter;
