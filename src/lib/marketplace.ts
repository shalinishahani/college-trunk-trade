export const CATEGORIES = [
  "Books",
  "Electronics",
  "Laptops",
  "Mobile Phones",
  "Calculators",
  "Lab Equipment",
  "Furniture",
  "Hostel Essentials",
  "Bicycles",
  "Accessories",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "used", label: "Used" },
] as const;

export type ConditionValue = (typeof CONDITIONS)[number]["value"];

export const conditionLabel = (value: string) =>
  CONDITIONS.find((c) => c.value === value)?.label ?? value;

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  const units: [number, string][] = [
    [60, "second"],
    [3600, "minute"],
    [86400, "hour"],
    [604800, "day"],
    [2592000, "week"],
    [31536000, "month"],
  ];
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  void units;
  return new Date(iso).toLocaleDateString();
}

export function initials(name?: string | null) {
  if (!name) return "CM";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]!.toUpperCase())
    .join("");
}
