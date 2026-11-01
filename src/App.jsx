import { useLocation } from "./hooks/useLocation";
import RoadMap from "./components/RoadMap";

export default function App() {
  const { pos, error } = useLocation();

  if (error) return <p>Location error: {error}</p>;
  return <RoadMap pos={pos} />;
}
