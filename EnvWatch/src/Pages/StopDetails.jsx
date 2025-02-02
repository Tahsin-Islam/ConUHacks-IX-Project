import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import './CSS/StopDetails.css';

export const StopDetails = () => {
  const { stopId } = useParams(); // Extract stopId from the URL
  const [stopDetails, setStopDetails] = useState(null); // State for stop data

  useEffect(() => {
    // Fetch stop details from the API
    fetch(`http://localhost:3001/api/crimes/near-stop/${stopId}`)
      .then((response) => response.json())
      .then((data) => {
        setStopDetails(data);
      })
      .catch((error) => console.error('Error fetching stop details:', error));
  }, [stopId]);

  if (!stopDetails) {
    return <div>Loading...</div>; // Show a loading indicator while fetching data
  }

  const { stop, google_maps_info, crime_summary } = stopDetails;

  // Prepare data for the pie chart
  const pieData = {
    labels: Object.keys(crime_summary),
    datasets: [
      {
        data: Object.values(crime_summary),
        backgroundColor: [
          '#FFB3C1',
          '#A2C2E0',
          '#FFEC85', 
          '#A2E0D0',
          '#C8A2FF', 
        ],
        hoverBackgroundColor: [
          '#FFB3C1', 
          '#A2C2E0', 
          '#FFEC85',
          '#A2E0D0', 
          '#C8A2FF', 
        ],
      },
    ],
  };

  return (
    <div className='stop-details'>
      <div className='stop-and-crime-container'>
        <div className='stop-info-container'>
          <h1>{stop.stop_name}</h1>
          <p>
            <strong>Stop Code:</strong> {stop.stop_code}
          </p>
          <p>
            <strong>Address:</strong> {google_maps_info.address || 'Unknown'}
          </p>
          <p>
            <strong>Rating:</strong> {google_maps_info.rating} (
            {google_maps_info.user_ratings_total} reviews)
          </p>
          <img
            src={google_maps_info.image_url}
            alt={stop.stop_name}
            style={{ width: '100%', maxWidth: '600px', borderRadius: '8px' }}
          />
        </div>
        <div className='stop-info-container'>
          <h3>Crimes Near This Stop</h3>
          <ul>
            {Object.entries(crime_summary).map(([category, count]) => (
              <li key={category}>
                <strong>{category}:</strong> {count}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className='pie-chart'>
        <h2>Crime Summary</h2>
        <Pie data={pieData} /> {/* Render crime summary pie chart */}
      </div>
    </div>
  );
};
