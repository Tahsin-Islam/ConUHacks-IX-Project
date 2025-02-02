// App.jsx
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import './customClusterStyles.css';

const montrealBounds = L.latLngBounds([45.35, -73.85], [45.75, -73.25]);

const ClusteredMarkers = ({ data }) => {
  const map = useMap();
  const markersRef = useRef(null);

  useEffect(() => {
    if (!map || !data.length) return;

    if (markersRef.current) {
      map.removeLayer(markersRef.current);
    }

    const markerCluster = L.markerClusterGroup({
      disableClusteringAtZoom: 18,
      iconCreateFunction: (cluster) => {
        const markers = cluster.getAllChildMarkers();
        const count = markers.length;
        return L.divIcon({
          html: `<div class="cluster-icon">${count}</div>`,
          className: 'leaflet-div-icon custom-cluster-icon',
          iconSize: [30, 30],
        });
      },
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: false,
    });

    data.forEach((stop) => {
      const marker = L.marker([stop.stop_lat, stop.stop_lon]).bindPopup(stop.stop_name);
      markerCluster.addLayer(marker);
    });

    map.addLayer(markerCluster);
    markersRef.current = markerCluster;

    return () => {
      if (markersRef.current) {
        map.removeLayer(markersRef.current);
      }
    };
  }, [map, data]);

  return null; // This component does not render JSX directly.
};

const Map = () => {
  const [data, setData] = useState([]);

  // Fetch your stops.json data (make sure it's in your public folder)
  useEffect(() => {
    fetch('/stops.json')
      .then((response) => response.json())
      .then((stops) => {
        setData(Array.isArray(stops) ? stops : []);
      })
      .catch((error) => console.error('Error loading data', error));
  }, []);

  return (
    <MapContainer
      center={[45.5, -73.55]}
      zoom={12}
      scrollWheelZoom={true}
      maxBounds={montrealBounds}
      maxBoundsViscosity={1.0}
      style={{ height: '100vh' }}
    >
      <TileLayer
        url="https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png"
        attribution='Map tiles by <a href="https://stadiamaps.com">Stadia Maps</a>'
      />
      <ClusteredMarkers data={data} />
    </MapContainer>
  );
};

export default Map;
