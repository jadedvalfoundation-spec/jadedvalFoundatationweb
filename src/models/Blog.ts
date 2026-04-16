import mongoose, { Document, Model, Schema } from "mongoose";
import { slugify } from "@/lib/utils";

export interface IBlogMedia {
  url: string;
  publicId: string;
  type: "image" | "video";
}

export interface IBlog extends Document {
  title: string;
  slug: string;
  description: string;
  details: string;
  media: IBlogMedia[];
  isPublished: boolean;
  publishedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: { type: String, unique: true },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    details: {
      type: String,
      required: [true, "Blog details are required"],
    },
    media: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        type: { type: String, enum: ["image", "video"], required: true },
      },
    ],
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

BlogSchema.pre("save", function () {
  if (this.isModified("title")) {
    this.slug = slugify(this.title) + "-" + Date.now();
  }
  if (this.isModified("isPublished") && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

BlogSchema.index({ slug: 1 });
BlogSchema.index({ isPublished: 1 });
BlogSchema.index({ createdAt: -1 });

const Blog: Model<IBlog> =
  mongoose.models.Blog ?? mongoose.model<IBlog>("Blog", BlogSchema);

export default Blog;
