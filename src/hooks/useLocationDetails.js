import { useState, useEffect, useRef } from "react";
import { useLocation } from "./useLocation";
import { reverseGeocode } from "../services/geocode";

function distanceM(a, b) {
  const R = 6371000;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function useLocationDetails() {
  const { pos, error } = useLocation();
  const [address, setAddress] = useState(null);
  const [locationName, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const lastPos = useRef(null);
  const edited = useRef(false);
  const reqId = useRef(0);

  useEffect(() => {
    if (!pos) return;
    // Sirf tab dobara address lo jab user ~50m se zyada hila ho
    if (lastPos.current && distanceM(lastPos.current, pos) < 50) return;
    lastPos.current = { lat: pos.lat, lng: pos.lng };

    const id = ++reqId.current;
    setLoading(true);
    reverseGeocode(pos.lat, pos.lng)
      .then((a) => {
        if (id !== reqId.current) return;
        setAddress(a);
        setGeoError(null);
        if (!edited.current) setName(a.full);
      })
      .catch(() => {
        if (id === reqId.current) setGeoError("Address not available");
      })
      .finally(() => {
        if (id === reqId.current) setLoading(false);
      });
  }, [pos]);

  const setLocationName = (value) => {
    edited.current = true;
    setName(value);
  };

  return {
    latitude: pos?.lat ?? null,
    longitude: pos?.lng ?? null,
    accuracy: pos?.accuracy ?? null,
    address,
    locationName,
    setLocationName,
    loading,
    geoError,
    error,
  };
}