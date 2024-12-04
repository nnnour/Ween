import axios from "axios";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// Get the user's geolocation
export const getUserLocation = async () => {
  if (!navigator.geolocation) {
    throw new Error("Geolocation is not supported by your browser.");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        console.log("User latitude and longitude:", { latitude, longitude }); // Debug log

        try {
          const response = await axios.post(
            `https://www.googleapis.com/geolocation/v1/geolocate?key=${GOOGLE_MAPS_API_KEY}`
          );
          console.log("Geolocation API Response:", response.data); // Debug log
          resolve(response.data.location || { lat: latitude, lng: longitude });
        } catch (error) {
          console.error("Error fetching location from API:", error.message);
          resolve({ lat: latitude, lng: longitude });
        }
      },
      (error) => {
        console.error("Error with geolocation:", error.message);
        reject(error);
      }
    );
  });
};

// Get nearby restaurants using the proxy server
export const getNearbyRestaurants = async (location) => {
  try {
    const { lat, lng } = location;
    console.log("Fetching restaurants for location:", { lat, lng }); // Debug log

    const response = await axios.get(`http://localhost:4000/api/nearbysearch`, {
      params: { lat, lng },
    });

    console.log("Proxy API Response:", response.data); // Debug log
    return response.data.results;
  } catch (error) {
    console.error("Error fetching nearby restaurants:", error.message);
    throw error;
  }
};