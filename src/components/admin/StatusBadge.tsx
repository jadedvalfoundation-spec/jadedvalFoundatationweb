import { cn } from "@/lib/utils";

type Variant =
  | "upcoming"
  | "ongoing"
  | "completed"
  | "pending"
  | "approved"
  | "rejected"
  | "active"
  | "inactive"
  | "new"
  | "read"
  | "responded"
  | "closed"
  | "published"
  | "draft"
  | string;

const STYLES: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-800",
  ongoing: "bg-brand-lighter text-brand-darker",
  completed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-600",
  new: "bg-blue-100 text-blue-800",
  read: "bg-gray-100 text-gray-600",
  responded: "bg-brand-lighter text-brand-darker",
  closed: "bg-gray-200 text-gray-500",
  published: "bg-green-100 text-green-800",
  draft: "bg-gray-100 text-gray-600",
  super_admin: "bg-purple-100 text-purple-800",
  admin: "bg-brand-lighter text-brand-darker",
  finance: "bg-yellow-100 text-yellow-800",
  support: "bg-blue-100 text-blue-800",
  user: "bg-gray-100 text-gray-600",
};

export default function StatusBadge({
  value,
  className,
}: {
  value: Variant;
  className?: string;
}) {
  const style = STYLES[value] ?? "bg-gray-100 text-gray-600";
  const label = value.replace(/_/g, " ");
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        style,
        className
      )}
    >
      {label}
    </span>
  );
}
