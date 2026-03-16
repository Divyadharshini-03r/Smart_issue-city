import { Badge } from "@/components/ui/badge";

const filters = ["All", "Road Damage", "Garbage", "Streetlight", "Water Leak", "Graffiti"];

interface FilterBarProps {
  active: string;
  onChange: (filter: string) => void;
}

const FilterBar = ({ active, onChange }: FilterBarProps) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
            active === f
              ? "bg-accent text-accent-foreground shadow-sm"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
};

export default FilterBar;
