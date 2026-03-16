import { MapPin, Bell, Plus, LogOut, User, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  onReportClick: () => void;
}

const Header = ({ onReportClick }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <MapPin className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-heading tracking-tight text-foreground">CityEye</h1>
            <p className="text-xs text-muted-foreground font-mono">Smart Issue Reporter</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/analytics")} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors" title="Analytics">
            <BarChart3 className="h-4 w-4" />
          </button>
          {user ? (
            <>
              <span className="hidden sm:inline text-sm text-muted-foreground font-mono">{user.email}</span>
              <Button onClick={onReportClick} size="sm" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 font-heading font-semibold">
                <Plus className="h-4 w-4" />
                Report
              </Button>
              <button onClick={() => signOut()} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Button onClick={() => navigate("/auth")} size="sm" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 font-heading font-semibold">
              <User className="h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
