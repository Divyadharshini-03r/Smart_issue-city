import { motion } from "framer-motion";
import { FileWarning, CheckCircle, Cpu } from "lucide-react";

interface StatsBarProps {
  totalReported: number;
  resolvedThisMonth: number;
  aiDetected: number;
}

const StatsBar = ({ totalReported, resolvedThisMonth, aiDetected }: StatsBarProps) => {
  const items = [
    { label: "Total Reported", value: totalReported.toString(), icon: FileWarning, color: "text-warning" },
    { label: "Resolved (30d)", value: resolvedThisMonth.toString(), icon: CheckCircle, color: "text-success" },
    { label: "AI Detected", value: aiDetected.toString(), icon: Cpu, color: "text-accent" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <item.icon className={`h-4 w-4 ${item.color}`} />
            <span className="text-xs text-muted-foreground font-mono">{item.label}</span>
          </div>
          <p className="text-2xl font-bold font-heading text-foreground">{item.value}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsBar;
