import { useState, useEffect } from "react";

export function useLocation() {
  const [pos, setPos] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    const id = navigator.geolocation.watchPosition(
      (p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
      (e) => setError(e.message),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);
  return { pos, error };
}
