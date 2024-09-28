import React from 'react';

function RestaurantCard({ restaurant }) {
  return (
    <div className="restaurant-card">
      <h3>{restaurant.name}</h3>
      <p>{restaurant.cuisine}</p>
      <p>{restaurant.location}</p>
    </div>
  );
}

export default RestaurantCard;
