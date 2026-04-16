import mongoose, { Document, Model, Schema } from "mongoose";
import { slugify } from "@/lib/utils";

export interface IProgram extends Document {
  name: string;
  slug: string;
  description: string;
  logo?: string;
  logoPublicId?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProgramSchema = new Schema<IProgram>(
  {
    name: {
      type: String,
      required: [true, "Program name is required"],
      trim: true,
      unique: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Program description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    logo: { type: String, default: null },
    logoPublicId: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

ProgramSchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = slugify(this.name);
  }
});

ProgramSchema.index({ slug: 1 });

const Program: Model<IProgram> =
  mongoose.models.Program ?? mongoose.model<IProgram>("Program", ProgramSchema);

export default Program;
