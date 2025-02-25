import axios from "axios";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

export const getUserLocation = async () => {
  if (!navigator.geolocation) {
    throw new Error("Geolocation is not supported by your browser.");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        resolve({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error("Error with geolocation:", error.message);
        reject(error);
      }
    );
  });
};

export const getNearbyRestaurants = async (location) => {
  try {
    const { lat, lng } = location;
    const response = await axios.get(`http://localhost:4000/api/nearbysearch`, {
      params: { lat, lng },
    });
    return response.data.results;
  } catch (error) {
    console.error("Error fetching nearby restaurants:", error.message);
    throw error;
  }
};