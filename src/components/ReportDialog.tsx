import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, MapPin, Cpu, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categoryLabels, type IssueCategory } from "@/lib/types";
import { uploadIssueImage, detectIssueAI, createIssue } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const ReportDialog = ({ open, onClose, onCreated }: ReportDialogProps) => {
  const { user } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{ category: IssueCategory; priority: string; description: string; confidence: number } | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IssueCategory | "">("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setAiResult(null);

    // Convert to base64 for AI
    setAnalyzing(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const result = await detectIssueAI(base64);
      setAiResult(result);
      if (result.category) setCategory(result.category);
      if (result.description && !title) setTitle(result.description);
    } catch (err) {
      console.error("AI detection failed:", err);
      toast.error("AI detection failed, please classify manually");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) { toast.error("Please sign in first"); return; }
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!category) { toast.error("Category is required"); return; }
    setSubmitting(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        imageUrl = await uploadIssueImage(user.id, imageFile);
      }
      await createIssue({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null as any,
        category: category as IssueCategory,
        location_text: location.trim() || null as any,
        image_url: imageUrl,
        ai_detected: !!aiResult,
        ai_detection_result: aiResult ? JSON.stringify(aiResult) : undefined,
        priority: aiResult?.priority || "medium",
      });
      toast.success("Issue reported successfully!");
      resetAndClose();
      onCreated();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setImagePreview(null);
    setImageFile(null);
    setAiResult(null);
    setAnalyzing(false);
    setTitle("");
    setDescription("");
    setCategory("");
    setLocation("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
          onClick={resetAndClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-heading text-foreground">Report an Issue</h2>
              <button onClick={resetAndClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block font-heading">Photo Evidence</label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                {!imagePreview ? (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full rounded-xl border-2 border-dashed border-border bg-muted/50 p-8 text-center transition-colors hover:border-accent hover:bg-accent/5"
                  >
                    <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload or take a photo</p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">AI will auto-detect the issue type</p>
                  </button>
                ) : (
                  <div className="relative rounded-xl overflow-hidden">
                    <img src={imagePreview} alt="Upload preview" className="w-full h-48 object-cover" />
                    {analyzing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-foreground/60">
                        <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-2">
                          <Cpu className="h-4 w-4 text-accent animate-spin" />
                          <span className="text-sm font-mono text-foreground">AI analyzing...</span>
                        </div>
                      </div>
                    )}
                    {aiResult && (
                      <div className="absolute bottom-0 inset-x-0 bg-accent/90 px-3 py-2">
                        <p className="text-xs font-mono text-accent-foreground flex items-center gap-1.5">
                          <Cpu className="h-3 w-3" />
                          {aiResult.description} ({aiResult.confidence}% confidence)
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block font-heading">Issue Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Large pothole on Main Street" />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block font-heading">Category</label>
                <Select value={category} onValueChange={(v) => setCategory(v as IssueCategory)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {(Object.entries(categoryLabels) as [IssueCategory, string][]).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block font-heading">Description</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue..." rows={3} />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block font-heading">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Enter address" className="pl-9" />
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitting || !title.trim() || !category}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-heading font-semibold mt-2"
              >
                <Upload className="h-4 w-4 mr-2" />
                {submitting ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReportDialog;
