require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 4000;

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

app.use(cors());
app.use(express.json());

app.get('/api/nearbysearch', async (req, res) => {
  const { lat, lng } = req.query;

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
      {
        params: {
          location: `${lat},${lng}`,
          radius: 1500,
          type: 'restaurant',
          key: GOOGLE_MAPS_API_KEY,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error in proxy server:', error.message);
    res.status(500).json({ error: 'Failed to fetch nearby restaurants' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});