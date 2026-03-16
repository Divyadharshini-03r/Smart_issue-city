import { motion } from "framer-motion";
import { ThumbsUp, MapPin, Cpu, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CityIssue, categoryLabels, categoryIcons } from "@/lib/types";

interface IssueCardProps {
  issue: CityIssue;
  index: number;
}

const statusVariant = (status: string) => {
  switch (status) {
    case "reported": return "bg-warning/15 text-warning border-warning/30";
    case "in_progress": return "bg-info/15 text-info border-info/30";
    case "resolved": return "bg-success/15 text-success border-success/30";
    default: return "";
  }
};

const priorityDot = (priority: string) => {
  switch (priority) {
    case "critical": return "bg-destructive";
    case "high": return "bg-warning";
    case "medium": return "bg-accent";
    case "low": return "bg-muted-foreground";
    default: return "bg-muted-foreground";
  }
};

const IssueCard = ({ issue, index }: IssueCardProps) => {
  const timeAgo = getTimeAgo(issue.created_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      className="group rounded-xl border border-border bg-card p-4 transition-all hover:shadow-lg hover:border-accent/40 cursor-pointer"
    >
      {issue.image_url && (
        <img src={issue.image_url} alt={issue.title} className="w-full h-32 object-cover rounded-lg mb-3" loading="lazy" />
      )}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{categoryIcons[issue.category]}</span>
          <Badge variant="outline" className="text-xs font-mono">
            {categoryLabels[issue.category]}
          </Badge>
          {issue.ai_detected && (
            <Badge variant="outline" className="gap-1 text-xs font-mono border-accent/40 text-accent">
              <Cpu className="h-3 w-3" /> AI
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${priorityDot(issue.priority)}`} />
          <span className="text-xs text-muted-foreground font-mono capitalize">{issue.priority}</span>
        </div>
      </div>

      <h3 className="font-heading font-semibold text-foreground mb-1.5 group-hover:text-accent transition-colors">
        {issue.title}
      </h3>
      {issue.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{issue.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {issue.location_text && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {issue.location_text}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> {timeAgo}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ThumbsUp className="h-3 w-3" /> {issue.upvotes || 0}
          </span>
          <Badge className={`text-xs border ${statusVariant(issue.status)} capitalize`} variant="outline">
            {issue.status.replace("_", " ")}
          </Badge>
        </div>
      </div>
    </motion.div>
  );
};

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default IssueCard;
