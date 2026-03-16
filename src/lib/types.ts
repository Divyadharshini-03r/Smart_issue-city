export type IssueCategory = "road_damage" | "garbage" | "streetlight" | "water_leak" | "graffiti" | "other";
export type IssueStatus = "reported" | "in_progress" | "resolved";
export type IssuePriority = "low" | "medium" | "high" | "critical";

export interface CityIssue {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: IssueCategory;
  status: IssueStatus;
  priority: IssuePriority;
  location_text: string | null;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  ai_detected: boolean | null;
  ai_detection_result: string | null;
  upvotes: number | null;
  created_at: string;
  updated_at: string;
}

export const categoryLabels: Record<IssueCategory, string> = {
  road_damage: "Road Damage",
  garbage: "Garbage",
  streetlight: "Streetlight",
  water_leak: "Water Leak",
  graffiti: "Graffiti",
  other: "Other",
};

export const categoryIcons: Record<IssueCategory, string> = {
  road_damage: "🛣️",
  garbage: "🗑️",
  streetlight: "💡",
  water_leak: "💧",
  graffiti: "🎨",
  other: "📋",
};
