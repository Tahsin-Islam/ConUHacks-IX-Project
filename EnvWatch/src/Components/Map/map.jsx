import React from 'react';
import { MapContainer, TileLayer, Polygon, Popup } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Adjusted bounds to make it slightly bigger
const montrealBounds = new LatLngBounds([45.35, -73.85], [45.75, -73.25]);

const boroughs = [
  {
    name: 'Ville-Marie',
    coordinates: [
      [45.505, -73.56],
      [45.51, -73.56],
      [45.51, -73.55],
      [45.505, -73.55],
    ],
  },
  {
    name: 'Outremont',
    coordinates: [
      [45.52, -73.63],
      [45.53, -73.63],
      [45.53, -73.62],
      [45.52, -73.62],
    ],
  },

];

const Map = () => {
  return (
    <MapContainer
      center={[45.5, -73.55]}
      zoom={12}
      scrollWheelZoom={false}
      bounds={montrealBounds}
      maxBounds={montrealBounds} 
      maxBoundsViscosity={1.0} 
      style={{ height: '100vh' }}
    >
      <TileLayer
        url="https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.{ext}"
        attribution='Map tiles by <a href="https://stadiamaps.com">Stadia Maps</a>, under <a href="https://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>'
        ext="png" 
      />
      {boroughs.map((borough, index) => (
        <Polygon key={index} positions={borough.coordinates} color="blue" weight={2} opacity={0.7}>
          <Popup>{borough.name}</Popup>
        </Polygon>
      ))}
    </MapContainer>
  );
};

export default Map;
