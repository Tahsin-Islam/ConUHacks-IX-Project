import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import 'leaflet.heat';
import { useNavigate } from 'react-router-dom';
import './customClusterStyles.css';

const montrealBounds = L.latLngBounds([45.35, -73.85], [45.75, -73.25]);

const HeatmapLayer = ({ data }) => {
  const map = useMap();
  const heatLayerRef = useRef(null);
  const [currentZoom, setCurrentZoom] = useState(map.getZoom());

  useEffect(() => {
    if (!map || !data.length) return;

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    const maxWeight = Math.max(...data.map((stop) => stop.weight), 1); // Prevent division by zero

    // Normalize weights
    const heatmapData = data.map((stop) => [
      stop.lat,
      stop.lon,
      stop.weight / maxWeight,
    ]);

    const baseZoom = 12; // Reference zoom level

    // Adjust weights dynamically with a floor to prevent only blue points
    const zoomAdjustedWeight = heatmapData.map(([lat, lon, weight]) => [
      lat,
      lon,
      Math.max(weight * Math.pow(0.95, baseZoom - currentZoom), 0.2), // Prevents weights from being too low
    ]);

    const radiusByZoom = {
      8: 20,
      10: 30,
      12: 40,
      14: 50,
      16: 60,
      18: 70,
    };

    const blurByZoom = {
      8: 10,
      10: 15,
      12: 20,
      14: 25,
      16: 30,
      18: 35,
    };

    const radiusInPixels = radiusByZoom[currentZoom] || 40;
    const blurValue = blurByZoom[currentZoom] || 20;

    const heatLayer = L.heatLayer(zoomAdjustedWeight, {
      radius: radiusInPixels,
      blur: blurValue,
      minOpacity: 0.5, // Ensure visibility even with low weights
      maxZoom: 18,
      gradient: {
        0.1: 'blue',
        0.3: 'cyan',
        0.5: 'lime',
        0.7: 'yellow',
        1.0: 'red',
      },
    });

    heatLayer.addTo(map);
    heatLayerRef.current = heatLayer;

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, data, currentZoom]);

  // Detect Zoom Changes
  useEffect(() => {
    const onZoomEnd = () => {
      setCurrentZoom(map.getZoom());
    };
    map.on('zoomend', onZoomEnd);
    return () => {
      map.off('zoomend', onZoomEnd);
    };
  }, [map]);

  return null;
};

const ClusteredMarkers = ({ data }) => {
  const map = useMap();
  const markersRef = useRef(null);
  const navigate = useNavigate();

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
      const marker = L.marker([stop.lat, stop.lon], {
        title: stop.stop_id,
      }).bindPopup(`
        <strong>${stop.stop_id}</strong><br>
        Crimes: ${stop.weight}<br>
        <button class="view-details-btn" data-stop-id="${stop.stop_id}">View Details</button>
      `);

      markerCluster.addLayer(marker);
    });

    map.addLayer(markerCluster);
    markersRef.current = markerCluster;

    // Handle click on the "Details" button
    markerCluster.on('popupopen', (event) => {
      const button =
        event.popup._contentNode.querySelector('.view-details-btn');
      if (button) {
        button.addEventListener('click', () => {
          const stopId = button.getAttribute('data-stop-id');
          navigate(`/stop/${stopId}`); // Navigate to the details page
        });
      }
    });

    return () => {
      if (markersRef.current) {
        map.removeLayer(markersRef.current);
      }
    };
  }, [map, data, navigate]);

  return null;
};



const HomeMap = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/heatmap')
      .then((response) => response.json())
      .then((stops) => {
        setData(stops);
      })
      .catch((error) => console.error('Error fetching heatmap data', error));
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
        url='https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png'
        attribution='Map tiles by <a href="https://stadiamaps.com">Stadia Maps</a>'
      />
      {/* ✅ Add Heatmap Layer */}
      <HeatmapLayer data={data} />
      {/* ✅ Keep Clustered Markers for Clickable Locations */}
      <ClusteredMarkers data={data} />
    </MapContainer>
  );
};

export default HomeMap;
