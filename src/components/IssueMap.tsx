import { Component, type ReactNode } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { categoryIcons, type CityIssue } from "@/lib/types";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface IssueMapProps {
  issues: CityIssue[];
}

class MapErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-border bg-muted/50 flex items-center justify-center" style={{ height: 400 }}>
          <p className="text-muted-foreground font-mono text-sm">Map failed to load. Try refreshing.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const IssueMapInner = ({ issues }: IssueMapProps) => {
  const issuesWithCoords = issues.filter((i) => i.latitude && i.longitude);

  const center: [number, number] = issuesWithCoords.length > 0
    ? [issuesWithCoords[0].latitude!, issuesWithCoords[0].longitude!]
    : [40.7128, -74.006];

  return (
    <div className="rounded-xl border border-border overflow-hidden" style={{ height: 400 }}>
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {issuesWithCoords.map((issue) => (
          <Marker key={issue.id} position={[issue.latitude!, issue.longitude!]}>
            <Popup>
              <div className="font-body text-sm">
                <p className="font-bold">{categoryIcons[issue.category]} {issue.title}</p>
                <p className="text-xs mt-1">{issue.location_text}</p>
                <p className="text-xs capitalize mt-1">Status: {issue.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

const IssueMap = ({ issues }: IssueMapProps) => (
  <MapErrorBoundary>
    <IssueMapInner issues={issues} />
  </MapErrorBoundary>
);

export default IssueMap;
