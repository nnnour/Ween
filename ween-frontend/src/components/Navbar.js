import React, { useState } from 'react';

function Navbar() {
  // State to manage the dropdown visibility on mobile view
  const [isOpen, setIsOpen] = useState(false);

  // Toggle the dropdown open/close for small screens
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-[#EBAEE6] shadow-lg p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo or Title */}
        <a href="#" className="text-2xl font-bold text-white">
          Ween AI
        </a>

        {/* Menu Items - visible in large screens */}
        <div className="hidden md:flex space-x-4">
          <a href="#" className="bg-[#FFDE4D] text-white py-2 px-4 rounded-lg">
            Home
          </a>
          <a href="#" className="bg-[#FFDE4D] text-white py-2 px-4 rounded-lg">
            Features
          </a>
          <a href="#" className="bg-[#FFDE4D] text-white py-2 px-4 rounded-lg">
            Support
          </a>
        </div>

        {/* Dropdown Menu for small screens */}
        <div className="md:hidden relative">
          <button 
            onClick={toggleDropdown} 
            className="bg-[#FF857A] text-white py-2 px-4 rounded-lg"
          >
            Menu
          </button>
          {/* Dropdown menu - shown or hidden based on state */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg">
              <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-[#FFDE4D]">Home</a>
              <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-[#FFDE4D]">Features</a>
              <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-[#FFDE4D]">Support</a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
