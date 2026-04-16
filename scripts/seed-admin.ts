/**
 * Run: npx tsx scripts/seed-admin.ts
 * Seeds the initial admin user into MongoDB.
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI!;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@jadedvalfoundation.org";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Admin@123456";
const ADMIN_NAME = "Foundation Admin";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ["user", "super_admin", "admin", "finance", "support"], default: "user" },
    isActive: { type: Boolean, default: true },
    image: String,
  },
  { timestamps: true }
);

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.");

  const User = mongoose.models.User ?? mongoose.model("User", UserSchema);

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: hashedPassword,
    role: "super_admin",
    isActive: true,
  });

  console.log(`Admin user created: ${ADMIN_EMAIL}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
