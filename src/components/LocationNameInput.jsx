export default function LocationNameInput({ value, onChange, loading, error }) {
  return (
    <div>
      <label>
        Location name
        <input
          type="text"
          value={value}
          placeholder={loading ? "Finding address…" : "Enter location name"}
          onChange={(e) => onChange(e.target.value)}
          style={{ display: "block", width: "100%" }}
        />
      </label>
      {error && <small>{error}. You can type the location manually.</small>}
    </div>
  );
}
import { useLocationDetails } from "./hooks/useLocationDetails";
import LocationNameInput from "./components/LocationNameInput";

const { latitude, longitude, locationName, setLocationName, loading, geoError } =
  useLocationDetails();

<LocationNameInput
  value={locationName}
  onChange={setLocationName}
  loading={loading}
  error={geoError}
/>

// complaint submit par:
// { latitude, longitude, locationName, ... }