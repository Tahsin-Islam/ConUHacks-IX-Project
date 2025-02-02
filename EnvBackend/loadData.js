const mongoose = require('mongoose');
const csv = require('csv-parser');
const fs = require('fs');
const Stop = require('./models/Stop');
const Crime = require('./models/Crime');
const StopTime = require('./models/StopTime');

require('dotenv').config();
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 🚏 Import Bus & Metro Stops (Bulk Insert)
async function importStops() {
  console.log('📥 Importing stops...');
  const stops = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream('stops.csv')
      .pipe(csv())
      .on('data', (row) => {
        stops.push({
          stop_id: row.stop_id,
          stop_code: parseInt(row.stop_code),
          stop_name: row.stop_name,
          stop_url: row.stop_url || null,
          location_type: parseInt(row.location_type),
          parent_station: row.parent_station || null,
          wheelchair_boarding: parseInt(row.wheelchair_boarding),
          location: {
            type: 'Point',
            coordinates: [parseFloat(row.stop_lon), parseFloat(row.stop_lat)],
          },
        });
      })
      .on('end', async () => {
        await Stop.insertMany(stops);
        console.log('✅ Stops imported!');
        resolve();
      })
      .on('error', (err) => reject(err));
  });
}

// 🚔 Import Crimes Data (Bulk Insert)
async function importCrimes() {
  console.log('📥 Importing crimes...');
  const crimes = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream('actes-criminels.csv')
      .pipe(csv())
      .on('data', (row) => {
        if (row.LONGITUDE && row.LATITUDE) {
          crimes.push({
            category: row.CATEGORIE,
            date: new Date(row.DATE),
            quart: row.QUART,
            pdq: parseInt(row.PDQ) || null,
            location: {
              type: 'Point',
              coordinates: [
                parseFloat(row.LONGITUDE),
                parseFloat(row.LATITUDE),
              ],
            },
          });
        }
      })
      .on('end', async () => {
        await Crime.insertMany(crimes);
        console.log('✅ Crimes imported!');
        resolve();
      })
      .on('error', (err) => reject(err));
  });
}

// 🚍 Process Stop Times into Hourly Frequencies
async function importStopTimes() {
  console.log('📥 Importing stop times...');
  const stopTimeData = {};

  return new Promise((resolve, reject) => {
    fs.createReadStream('stop_times.csv')
      .pipe(csv())
      .on('data', (row) => {
        if (!stopTimeData[row.stop_id]) {
          stopTimeData[row.stop_id] = { morning: 0, day: 0, evening: 0 };
        }

        const hour = parseInt(row.arrival_time.split(':')[0]);
        if (hour >= 0 && hour < 8) stopTimeData[row.stop_id].morning++;
        if (hour >= 8 && hour < 16) stopTimeData[row.stop_id].day++;
        if (hour >= 16 && hour < 24) stopTimeData[row.stop_id].evening++;
      })
      .on('end', async () => {
        const bulkOps = [];

        for (const [stop_id, frequencies] of Object.entries(stopTimeData)) {
          const stop = await Stop.findOne({ stop_id });
          if (stop) {
            bulkOps.push({
              insertOne: {
                document: {
                  stop: stop._id,
                  morning_freq: frequencies.morning,
                  day_freq: frequencies.day,
                  evening_freq: frequencies.evening,
                },
              },
            });
          }
        }

        if (bulkOps.length > 0) {
          await StopTime.bulkWrite(bulkOps);
        }

        console.log('✅ Stop times imported!');
        resolve();
      })
      .on('error', (err) => reject(err));
  });
}

// Run Import Functions in Sequence & Close Connection
async function runImport() {
  try {
    await importStops();
    await importCrimes();
    await importStopTimes();
  } catch (error) {
    console.error('❌ Error importing data:', error);
  } finally {
    mongoose.connection.close();
    console.log('✅ MongoDB connection closed.');
  }
}

runImport();
