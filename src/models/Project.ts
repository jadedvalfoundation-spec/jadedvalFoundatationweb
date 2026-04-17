import mongoose, { Document, Model, Schema } from "mongoose";
import { slugify } from "@/lib/utils";

export type ProjectStatus = "upcoming" | "ongoing" | "completed";

export interface IProject extends Document {
  program: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  duration: string;
  startDate?: Date;
  endDate?: Date;
  targetAmount: number;
  image?: string;
  imagePublicId?: string;
  description: string;
  status: ProjectStatus;
  manualAmountRaised?: number;
  // Completed-only fields
  totalAmountUsed?: number;
  achievement?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    program: {
      type: Schema.Types.ObjectId,
      ref: "Program",
      required: [true, "Program is required"],
    },
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: [150, "Name cannot exceed 150 characters"],
    },
    slug: { type: String, unique: true },
    duration: {
      type: String,
      required: [true, "Duration is required"],
    },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    targetAmount: {
      type: Number,
      required: [true, "Target amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    image: { type: String, default: null },
    imagePublicId: { type: String, default: null },
    description: {
      type: String,
      required: [true, "Project description is required"],
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed"],
      default: "upcoming",
    },
    manualAmountRaised: { type: Number, default: null },
    totalAmountUsed: { type: Number, default: null },
    achievement: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

ProjectSchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = slugify(this.name) + "-" + Date.now();
  }
});

ProjectSchema.index({ program: 1 });
ProjectSchema.index({ status: 1 });

const Project: Model<IProject> =
  mongoose.models.Project ?? mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
