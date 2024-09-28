import React from 'react';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';

function HomePage() {
  const handleSearch = (query) => {
    console.log('Searching for:', query);
  };

  return (
    <div>
      <Navbar />
      <SearchBar onSearch={handleSearch} />
    </div>
  );
}

export default HomePage;
