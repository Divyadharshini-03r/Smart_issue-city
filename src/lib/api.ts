import { supabase } from "@/integrations/supabase/client";
import type { CityIssue, IssueCategory } from "@/lib/types";

export async function fetchIssues(category?: string): Promise<CityIssue[]> {
  let query = supabase.from("issues").select("*").order("created_at", { ascending: false });
  if (category && category !== "All") {
    const catMap: Record<string, string> = {
      "Road Damage": "road_damage",
      "Garbage": "garbage",
      "Streetlight": "streetlight",
      "Water Leak": "water_leak",
      "Graffiti": "graffiti",
    };
    if (catMap[category]) query = query.eq("category", catMap[category]);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as CityIssue[];
}

export async function createIssue(issue: {
  user_id: string;
  title: string;
  description: string;
  category: IssueCategory;
  location_text: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  ai_detected?: boolean;
  ai_detection_result?: string;
  priority?: string;
}) {
  const { data, error } = await supabase.from("issues").insert(issue).select().single();
  if (error) throw error;
  return data as CityIssue;
}

export async function uploadIssueImage(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("issue-images").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("issue-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function detectIssueAI(imageBase64: string) {
  const { data, error } = await supabase.functions.invoke("detect-issue", {
    body: { imageBase64 },
  });
  if (error) throw error;
  return data as { category: IssueCategory; priority: string; description: string; confidence: number };
}

export async function fetchIssueStats() {
  const { count: total } = await supabase.from("issues").select("*", { count: "exact", head: true });
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const { count: resolved } = await supabase
    .from("issues")
    .select("*", { count: "exact", head: true })
    .eq("status", "resolved")
    .gte("updated_at", thirtyDaysAgo);
  const { count: aiCount } = await supabase
    .from("issues")
    .select("*", { count: "exact", head: true })
    .eq("ai_detected", true);

  return {
    totalReported: total || 0,
    resolvedThisMonth: resolved || 0,
    aiDetected: aiCount || 0,
  };
}
