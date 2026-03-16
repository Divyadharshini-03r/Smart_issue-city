import { motion } from "framer-motion";
import { Cpu, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-city.jpg";

interface HeroBannerProps {
  onReportClick: () => void;
}

const HeroBanner = ({ onReportClick }: HeroBannerProps) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border">
      <img
        src={heroImage}
        alt="Smart city aerial view"
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40" />
      <div className="relative px-6 py-10 sm:px-10 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 mb-4">
            <Cpu className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-mono text-primary-foreground/80">AI-Powered Detection</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-primary-foreground mb-3 leading-tight">
            Report city issues.<br />AI handles the rest.
          </h2>
          <p className="text-primary-foreground/70 mb-6 max-w-md">
            Upload a photo of road damage, garbage overflow, or any civic issue. Our AI instantly detects, categorizes, and prioritizes it for resolution.
          </p>
          <Button
            onClick={onReportClick}
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-heading font-semibold gap-2"
          >
            Report an Issue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroBanner;
