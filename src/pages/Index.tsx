import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import StatsBar from "@/components/StatsBar";
import FilterBar from "@/components/FilterBar";
import IssueCard from "@/components/IssueCard";
import IssueMap from "@/components/IssueMap";
import ReportDialog from "@/components/ReportDialog";
import { fetchIssues, fetchIssueStats } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { CityIssue } from "@/lib/types";
import { toast } from "sonner";
import { Map, List } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reportOpen, setReportOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [issues, setIssues] = useState<CityIssue[]>([]);
  const [stats, setStats] = useState({ totalReported: 0, resolvedThisMonth: 0, aiDetected: 0 });
  const [view, setView] = useState<"list" | "map">("list");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [issueData, statsData] = await Promise.all([
        fetchIssues(filter),
        fetchIssueStats(),
      ]);
      setIssues(issueData);
      setStats(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleReportClick = () => {
    if (!user) {
      toast.info("Please sign in to report an issue");
      navigate("/auth");
      return;
    }
    setReportOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onReportClick={handleReportClick} />

      <main className="container py-6 space-y-6">
        <HeroBanner onReportClick={handleReportClick} />
        <StatsBar {...stats} />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-heading text-foreground">Recent Issues</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-mono">{issues.length} issues</span>
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setView("list")}
                  className={`p-1.5 transition-colors ${view === "list" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView("map")}
                  className={`p-1.5 transition-colors ${view === "map" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}
                >
                  <Map className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <FilterBar active={filter} onChange={setFilter} />

          {view === "map" ? (
            <IssueMap issues={issues} />
          ) : loading ? (
            <div className="text-center py-12 text-muted-foreground font-mono">Loading issues...</div>
          ) : issues.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-heading">No issues reported yet</p>
              <p className="text-sm mt-1">Be the first to report a city issue!</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {issues.map((issue, i) => (
                <IssueCard key={issue.id} issue={issue} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>

      <ReportDialog open={reportOpen} onClose={() => setReportOpen(false)} onCreated={loadData} />
    </div>
  );
};

export default Index;
