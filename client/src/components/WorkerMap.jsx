import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function WorkerMap({ workerLocation, destinationLocation, destinationName }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const routingControl = useRef(null);
  const markers = useRef([]);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map only once
    if (!map.current) {
      const defaultLat = workerLocation?.latitude || 28.7041;
      const defaultLng = workerLocation?.longitude || 77.1025;

      map.current = L.map(mapContainer.current).setView(
        [defaultLat, defaultLng],
        13,
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map.current);

      isInitialized.current = true;
    }

    // Clear previous markers
    markers.current.forEach((marker) => map.current.removeLayer(marker));
    markers.current = [];

    // Clear previous routing control
    if (routingControl.current) {
      map.current.removeControl(routingControl.current);
      routingControl.current = null;
    }

    // Add worker marker if we have location
    if (workerLocation?.latitude && workerLocation?.longitude) {
      const workerMarker = L.marker(
        [workerLocation.latitude, workerLocation.longitude],
        {
          title: "Your Location",
        },
      )
        .addTo(map.current)
        .bindPopup(
          `📍 Your Location<br>${workerLocation.latitude.toFixed(4)}, ${workerLocation.longitude.toFixed(4)}`,
        );
      markers.current.push(workerMarker);
    }

    // Add destination marker and route
    if (destinationLocation?.latitude && destinationLocation?.longitude) {
      const destMarker = L.marker(
        [destinationLocation.latitude, destinationLocation.longitude],
        {
          title: "Destination",
        },
      )
        .addTo(map.current)
        .bindPopup(`📍 Destination<br>${destinationName || "Destination"}`);
      markers.current.push(destMarker);

      // Add routing control if we have both locations
      if (workerLocation?.latitude && workerLocation?.longitude) {
        try {
          routingControl.current = L.Routing.control({
            waypoints: [
              L.latLng(workerLocation.latitude, workerLocation.longitude),
              L.latLng(
                destinationLocation.latitude,
                destinationLocation.longitude,
              ),
            ],
            routeWhileDragging: false,
            router: L.Routing.osrmv1({
              serviceUrl: "https://router.project-osrm.org/route/v1",
            }),
            showAlternatives: false,
            lineOptions: {
              styles: [{ color: "blue", opacity: 0.7, weight: 5 }],
            },
            createMarker: () => null, // Don't create default markers
          }).addTo(map.current);

          // Fit map to route bounds
          routingControl.current.on("routesfound", (e) => {
            const routes = e.routes;
            if (routes.length > 0) {
              const bounds = routes[0].bounds;
              map.current.fitBounds(bounds, { padding: [50, 50] });
            }
          });
        } catch (err) {
          console.log("Routing error:", err);
        }
      }
    }

    return () => {
      // Cleanup
    };
  }, [workerLocation, destinationLocation, destinationName]);

  return (
    <div style={styles.container}>
      <div style={styles.mapContainer} ref={mapContainer}></div>
      <div style={styles.info}>
        <h4>Route Information</h4>
        {destinationName && (
          <p>
            <strong>Destination:</strong> {destinationName}
          </p>
        )}
        {workerLocation && (
          <p>
            <strong>Your Location:</strong>{" "}
            {workerLocation.latitude?.toFixed(4)},{" "}
            {workerLocation.longitude?.toFixed(4)}
          </p>
        )}
        {destinationLocation && (
          <p>
            <strong>Destination Coordinates:</strong>{" "}
            {destinationLocation.latitude?.toFixed(4)},{" "}
            {destinationLocation.longitude?.toFixed(4)}
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    borderRadius: "8px",
    overflow: "hidden",
  },
  mapContainer: {
    height: "500px",
    width: "100%",
    borderRadius: "8px",
    border: "2px solid #ddd",
  },
  info: {
    padding: "15px",
    backgroundColor: "#f9f9f9",
    borderRadius: "5px",
    marginTop: "10px",
    fontSize: "14px",
  },
};

export default WorkerMap;
