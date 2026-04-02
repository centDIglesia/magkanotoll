import { getPlazaCoords, getDrivingRouteGeometry } from "@/utils/tollData";
import { TollSegment } from "@/utils/tollApi";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

export default function RouteMap({ segments }: { segments: TollSegment[] }) {
  const [loading, setLoading] = useState(true);
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);

  const coords: { lat: number; lng: number; label: string }[] = [];
  segments.forEach((seg, i) => {
    const entry = getPlazaCoords(seg.entryPlaza);
    if (entry && i === 0) coords.push({ ...entry, label: seg.entryPlaza });
    const exit = getPlazaCoords(seg.exitPlaza);
    if (exit) coords.push({ ...exit, label: seg.exitPlaza });
  });

  useEffect(() => {
    async function fetchGeometry() {
      const allPoints: [number, number][] = [];
      for (const seg of segments) {
        const pts = await getDrivingRouteGeometry(
          seg.entryPlaza,
          seg.exitPlaza,
        );
        allPoints.push(...pts);
      }
      setRoutePoints(allPoints);
    }
    fetchGeometry();
  }, [segments]);

  if (coords.length < 2) return null;

  const polylinePoints = (
    routePoints.length > 0
      ? routePoints
      : coords.map((c) => [c.lat, c.lng] as [number, number])
  )
    .map((p) => `[${p[0]},${p[1]}]`)
    .join(",");

  const coordsJson = JSON.stringify(coords);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #map { width: 100%; height: 100%; background: #1a1a1a; }
        #map { opacity: 0; transition: opacity 0.4s ease; }
        #map.ready { opacity: 1; }

        /* ✅ Bigger, more readable zoom buttons */
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 12px rgba(0,0,0,0.5) !important;
          border-radius: 12px !important;
          overflow: hidden;
        }
        .leaflet-control-zoom-in,
        .leaflet-control-zoom-out {
          width: 40px !important;
          height: 40px !important;
          line-height: 40px !important;
          font-size: 20px !important;
          font-weight: 700 !important;
          background: #2a2a2a !important;
          color: #ffffff !important;
          border: none !important;
          border-bottom: 1px solid #3a3a3a !important;
        }
        .leaflet-control-zoom-out {
          border-bottom: none !important;
        }
        .leaflet-control-zoom-in:hover,
        .leaflet-control-zoom-out:hover {
          background: #3a3a3a !important;
          color: #ffc400 !important;
        }

        /* ✅ Marker label style */
        .plaza-label {
         
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          font-family: system-ui, -apple-system, sans-serif;       
          white-space: nowrap;
          
        
          line-height: 1.4;
          letter-spacing: 0.01em;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .plaza-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
          display: inline-block;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const coords = ${coordsJson};
        const points = [${polylinePoints}];

        const map = L.map('map', {
          zoomControl: true,         // ✅ re-enabled
          attributionControl: false,
          dragging: true,            // ✅ re-enabled so users can pan
          touchZoom: true,           // ✅ pinch-to-zoom
          doubleClickZoom: false,
          scrollWheelZoom: false,
          boxZoom: false,
          keyboard: false,
        });

        // Move zoom to bottom-right so it's thumb-friendly
        map.zoomControl.setPosition('bottomright');

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
        }).addTo(map);

        map.fitBounds(L.polyline(points).getBounds(), { padding: [40, 40] });

        const polyline = L.polyline([], {
          color: '#ffc400',
          weight: 5,
          opacity: 0.95,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(map);

        let idx = 0;
        function animateLine() {
          if (idx < points.length) {
            polyline.addLatLng(points[idx++]);
            setTimeout(animateLine, 8);
          } else {
            addMarkers();
          }
        }

        function addMarkers() {
          coords.forEach(function(c, i) {
            const isFirst = i === 0;
            const isLast = i === coords.length - 1;
            const dotColor = isFirst ? '#22c55e' : isLast ? '#ef4444' : '#ffc400';

            const icon = L.divIcon({
              className: '',
              html:
                '<div class="plaza-label">' +
                  '<span class="plaza-dot" style="background:' + dotColor + ';"></span>' +
                  c.label +
                '</div>',
              // Anchor so the dot aligns with the coordinate
              iconAnchor: [10, 14],
            });

            L.marker([c.lat, c.lng], { icon }).addTo(map);
          });
        }

        document.getElementById('map').classList.add('ready');
        setTimeout(animateLine, 300);
      </script>
    </body>
    </html>
  `;

  return (
    // ✅ Taller container
    <View style={styles.container}>
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator color="#ffc400" />
        </View>
      )}
      <WebView
        source={{ html }}
        style={styles.map}
        onLoadEnd={() => setLoading(false)}
        scrollEnabled={false}
        javaScriptEnabled
        nestedScrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 340, // ✅ was 240, now taller
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  map: { flex: 1 },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
});
