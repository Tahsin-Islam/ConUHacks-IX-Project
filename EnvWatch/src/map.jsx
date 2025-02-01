import { MapContainer, TileLayer, Polygon, Popup } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import './Map.css';

const montrealBounds = new LatLngBounds([45.4, -73.7], [45.65, -73.45]);

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
  // Add more boroughs as necessary
];

const Map = () => {
  console.log("App component rendered");
  return (
    <MapContainer center={[45.5, -73.55]} zoom={12} scrollWheelZoom={false} bounds={montrealBounds} style={{ height: '100vh' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {boroughs.map((borough, index) => (
        <Polygon key={index} positions={borough.coordinates} color="blue" weight={2} opacity={0.7}>
          <Popup>{borough.name}</Popup>
        </Polygon>
      ))}
    </MapContainer>
  );
};


export default Map;