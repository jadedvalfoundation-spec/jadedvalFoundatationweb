import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation";
import Requisition from "@/models/Requisition";
import { requireRole, ok } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const { error } = await requireRole(["super_admin", "admin", "finance"]);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") ?? "monthly"; // daily | weekly | monthly
  const programId = searchParams.get("program");
  const projectId = searchParams.get("project");

  await connectDB();

  const matchFilter: Record<string, unknown> = { status: "completed" };
  if (programId) matchFilter.program = programId;
  if (projectId) matchFilter.project = projectId;

  // Date format per period
  const dateFormat =
    period === "daily"
      ? "%Y-%m-%d"
      : period === "weekly"
        ? "%Y-W%V"
        : "%Y-%m";

  // Donations over time
  const donationsOverTime = await Donation.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
        total: { $sum: "$amountUSD" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 30 },
  ]);

  // Total raised
  const totals = await Donation.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: null,
        totalRaised: { $sum: "$amountUSD" },
        totalDonations: { $sum: 1 },
      },
    },
  ]);

  // By program
  const byProgram = await Donation.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: "$program", total: { $sum: "$amountUSD" }, count: { $sum: 1 } } },
    {
      $lookup: {
        from: "programs",
        localField: "_id",
        foreignField: "_id",
        as: "program",
      },
    },
    { $unwind: { path: "$program", preserveNullAndEmptyArrays: true } },
    { $project: { programName: "$program.name", total: 1, count: 1 } },
    { $sort: { total: -1 } },
  ]);

  // By project
  const byProject = await Donation.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: "$project", total: { $sum: "$amountUSD" }, count: { $sum: 1 } } },
    {
      $lookup: {
        from: "projects",
        localField: "_id",
        foreignField: "_id",
        as: "project",
      },
    },
    { $unwind: { path: "$project", preserveNullAndEmptyArrays: true } },
    { $project: { projectName: "$project.name", total: 1, count: 1 } },
    { $sort: { total: -1 } },
    { $limit: 10 },
  ]);

  // Approved requisitions (expenses)
  const expenses = await Requisition.aggregate([
    { $match: { status: "approved" } },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: "$updatedAt" } },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 30 },
  ]);

  const totalExpenses = await Requisition.aggregate([
    { $match: { status: "approved" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  // Top 100 donors
  const topDonors = await Donation.aggregate([
    { $match: { status: "completed" } },
    {
      $group: {
        _id: "$donorEmail",
        donorName: { $first: "$donorName" },
        donorEmail: { $first: "$donorEmail" },
        totalDonated: { $sum: "$amountUSD" },
        donationCount: { $sum: 1 },
        lastDonation: { $max: "$createdAt" },
      },
    },
    { $sort: { totalDonated: -1 } },
    { $limit: 100 },
  ]);

  return ok({
    totalRaised: totals[0]?.totalRaised ?? 0,
    totalDonations: totals[0]?.totalDonations ?? 0,
    totalExpenses: totalExpenses[0]?.total ?? 0,
    netBalance: (totals[0]?.totalRaised ?? 0) - (totalExpenses[0]?.total ?? 0),
    donationsOverTime,
    expenses,
    byProgram,
    byProject,
    topDonors,
  });
}
