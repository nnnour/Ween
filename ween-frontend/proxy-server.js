// Load environment variables from a .env file into process.env
require('dotenv').config();

// Import the Express framework for building the server
const express = require('express');
// Import Axios for making HTTP requests to external APIs
const axios = require('axios');
// Import CORS middleware to enable cross-origin resource sharing
const cors = require('cors');

// Create an instance of an Express application
const app = express();
// Define the port on which the server will listen
const PORT = 4000;

// Retrieve the Google Maps API key from environment variables
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// Apply the CORS middleware to allow cross-origin requests
app.use(cors());
// Use Express middleware to parse incoming JSON request bodies
app.use(express.json());

// Define a GET endpoint at /api/nearbysearch to fetch nearby restaurant data
app.get('/api/nearbysearch', async (req, res) => {
  // Extract latitude and longitude from the query parameters
  const { lat, lng } = req.query;

  try {
    // Make a GET request to the Google Maps Places API to search for nearby restaurants
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
      {
        params: {
          // Set the location parameter as a comma-separated string of latitude and longitude
          location: `${lat},${lng}`,
          // Define the search radius in meters
          radius: 1500,
          // Limit results to restaurants
          type: 'restaurant',
          // Include the API key for authentication
          key: GOOGLE_MAPS_API_KEY,
        },
      }
    );
    // Respond with the data received from the Google Maps API
    res.json(response.data);
  } catch (error) {
    // Log the error message if the API request fails
    console.error('Error in proxy server:', error.message);
    // Respond with a 500 status code and an error message in JSON format
    res.status(500).json({ error: 'Failed to fetch nearby restaurants' });
  }
});

// Start the server and listen on the specified port, logging a confirmation message
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
