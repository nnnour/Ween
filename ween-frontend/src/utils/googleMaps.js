// Import axios for making HTTP requests
import axios from "axios";

// Retrieve the Google Maps API key from environment variables (currently not used in these functions)
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// Export an asynchronous function to get the user's current location using the browser's geolocation API
export const getUserLocation = async () => {
  // Check if the geolocation feature is available in the browser
  if (!navigator.geolocation) {
    // Throw an error if geolocation is not supported
    throw new Error("Geolocation is not supported by your browser.");
  }

  // Return a promise that resolves with the user's current coordinates
  return new Promise((resolve, reject) => {
    // Request the current position
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // Destructure latitude and longitude from the position object
        const { latitude, longitude } = position.coords;
        // Resolve the promise with an object containing latitude and longitude
        resolve({ lat: latitude, lng: longitude });
      },
      (error) => {
        // Log an error message if geolocation retrieval fails
        console.error("Error with geolocation:", error.message);
        // Reject the promise with the error
        reject(error);
      }
    );
  });
};

// Export an asynchronous function to fetch nearby restaurants based on the user's location
export const getNearbyRestaurants = async (location) => {
  try {
    // Destructure latitude and longitude from the location object
    const { lat, lng } = location;
    // Send a GET request to the local API endpoint with latitude and longitude as query parameters
    const response = await axios.get(`http://localhost:4000/api/nearbysearch`, {
      params: { lat, lng },
    });
    // Return the results (assumed to be an array of restaurants) from the response data
    return response.data.results;
  } catch (error) {
    // Log any error encountered during the API call
    console.error("Error fetching nearby restaurants:", error.message);
    // Re-throw the error to be handled by the calling function
    throw error;
  }
};
