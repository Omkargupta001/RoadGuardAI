
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const reportIcon = (type) =>
  L.divIcon({
    html: `<div style="font-size:26px">${type === "accident" ? "🚨" : "🕳️"}</div>`,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

export default function RoadMap({ pos, reports = [] }) {
  if (!pos) return <p>Getting location…</p>;
  return (
    <MapContainer center={[pos.lat, pos.lng]} zoom={16} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
      <Marker position={[pos.lat, pos.lng]} icon={defaultIcon}>
        <Popup>You are here</Popup>
      </Marker>
      {reports.map((r) => (
        <Marker key={r.id} position={[r.lat, r.lng]} icon={reportIcon(r.type)}>
          <Popup>
            {r.type === "accident" ? "Accident" : "Pothole"}
            <br />
            {r.time}
            {r.severity != null && (
              <>
                <br />
                Severity:{" "}
                {typeof r.severity === "object"
                  ? JSON.stringify(r.severity)
                  : String(r.severity)}
              </>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}