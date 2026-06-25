import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function LocationPicker({ onLocationSelect, initialLocation }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const searchTimeout = useRef(null);

  const [location, setLocation] = useState(initialLocation || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [hoveredResultIndex, setHoveredResultIndex] = useState(-1);

  // India bounding box
  const indiaBounds = {
    north: 35.5,
    south: 8.0,
    east: 97.5,
    west: 68.0,
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map (centered on Delhi)
    const defaultLat = 28.7041;
    const defaultLng = 77.1025;

    if (!map.current) {
      map.current = L.map(mapContainer.current).setView(
        [defaultLat, defaultLng],
        13,
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map.current);

      // Add click handler to map
      map.current.on("click", (e) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        addMarker(lat, lng);
        setLocation({ latitude: lat, longitude: lng });
        onLocationSelect({ latitude: lat, longitude: lng });
      });
    }

    // If initial location provided, add marker
    if (
      initialLocation &&
      initialLocation.latitude &&
      initialLocation.longitude
    ) {
      addMarker(initialLocation.latitude, initialLocation.longitude);
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  const addMarker = (lat, lng) => {
    if (marker.current) {
      map.current.removeLayer(marker.current);
    }

    marker.current = L.marker([lat, lng])
      .addTo(map.current)
      .bindPopup(`Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      .openPopup();

    map.current.setView([lat, lng], 15);
  };

  const searchLocation = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=10&bounded=1&viewbox=${indiaBounds.west},${indiaBounds.north},${indiaBounds.east},${indiaBounds.south}`,
      );

      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Debounce search
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (query.trim()) {
      searchTimeout.current = setTimeout(() => {
        searchLocation(query);
      }, 500);
    } else {
      setSearchResults([]);
    }
  };

  const selectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    addMarker(lat, lng);
    setLocation({
      latitude: lat,
      longitude: lng,
      address: result.display_name,
      placeName: result.name,
    });
    onLocationSelect({
      latitude: lat,
      longitude: lng,
      address: result.display_name,
      placeName: result.name,
    });

    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        addMarker(lat, lng);
        setLocation({ latitude: lat, longitude: lng });
        onLocationSelect({ latitude: lat, longitude: lng });
      });
    } else {
      alert("Geolocation is not supported");
    }
  };

  return (
    <div style={styles.container}>
      {/* Search Section */}
      <div style={styles.searchSection}>
        <input
          type="text"
          placeholder="🔍 Search location in India (city, area, landmark)..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={styles.searchInput}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
        />

        {isSearching && <p style={styles.loadingText}>Searching...</p>}

        {showResults && searchResults.length > 0 && (
          <div style={styles.searchResultsDropdown}>
            {searchResults.map((result, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.searchResult,
                  backgroundColor:
                    hoveredResultIndex === idx ? "#f0f0f0" : "white",
                }}
                onClick={() => selectSearchResult(result)}
                onMouseEnter={() => setHoveredResultIndex(idx)}
                onMouseLeave={() => setHoveredResultIndex(-1)}
              >
                <p style={styles.resultName}>{result.name}</p>
                <p style={styles.resultAddress}>
                  {result.display_name.substring(0, 60)}...
                </p>
              </div>
            ))}
          </div>
        )}

        {showResults &&
          searchResults.length === 0 &&
          searchQuery &&
          !isSearching && (
            <div style={styles.noResults}>No locations found</div>
          )}
      </div>

      {/* Map Section */}
      <div style={styles.mapContainer} ref={mapContainer}></div>

      {/* Action Buttons */}
      <div style={styles.buttonContainer}>
        <button onClick={getCurrentLocation} style={styles.button}>
          📍 Use Current Location
        </button>
      </div>

      {/* Selected Location Info */}
      {location && (
        <div style={styles.info}>
          {location.placeName && (
            <p>
              <strong>Place:</strong> {location.placeName}
            </p>
          )}
          {location.address && (
            <p>
              <strong>Address:</strong> {location.address.substring(0, 60)}...
            </p>
          )}
          <p>
            <strong>Coordinates:</strong> {location.latitude?.toFixed(4)},{" "}
            {location.longitude?.toFixed(4)}
          </p>
        </div>
      )}

      <p style={styles.instruction}>
        Click on map or search above to select a location
      </p>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    position: "relative",
  },
  searchSection: {
    position: "relative",
    marginBottom: "10px",
  },
  searchInput: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    border: "2px solid #ddd",
    borderRadius: "5px",
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.2s",
  },
  searchResultsDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "white",
    border: "2px solid #007bff",
    borderTop: "none",
    borderBottomLeftRadius: "5px",
    borderBottomRightRadius: "5px",
    maxHeight: "300px",
    overflowY: "auto",
    zIndex: 1000,
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  searchResult: {
    padding: "10px 12px",
    borderBottom: "1px solid #eee",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  resultName: {
    margin: "0 0 4px 0",
    fontWeight: "bold",
    fontSize: "14px",
    color: "#333",
  },
  resultAddress: {
    margin: 0,
    fontSize: "12px",
    color: "#666",
  },
  noResults: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    padding: "10px 12px",
    backgroundColor: "white",
    border: "2px solid #ddd",
    borderTop: "none",
    borderBottomLeftRadius: "5px",
    borderBottomRightRadius: "5px",
    color: "#999",
    fontSize: "14px",
    textAlign: "center",
  },
  loadingText: {
    position: "absolute",
    top: "50%",
    right: "10px",
    transform: "translateY(-50%)",
    color: "#666",
    fontSize: "12px",
    margin: 0,
  },
  mapContainer: {
    height: "400px",
    width: "100%",
    borderRadius: "8px",
    border: "2px solid #ddd",
    marginBottom: "10px",
  },
  buttonContainer: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px",
  },
  button: {
    flex: 1,
    padding: "10px 15px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "background-color 0.2s",
  },
  info: {
    padding: "12px",
    backgroundColor: "#f0f8ff",
    borderRadius: "5px",
    marginBottom: "10px",
    fontSize: "12px",
    border: "1px solid #007bff",
  },
  instruction: {
    fontSize: "12px",
    color: "#666",
    marginTop: "5px",
  },
};

export default LocationPicker;
