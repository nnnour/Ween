// Import the Supabase Auth UI component for authentication
import { Auth } from '@supabase/auth-ui-react';
// Import the default theme for the Supabase Auth UI
import { ThemeSupa } from '@supabase/auth-ui-shared';
// Import React hooks for managing component state and side effects
import { useEffect, useState } from 'react';
// Import useNavigate for programmatic navigation between routes
import { useNavigate } from 'react-router-dom';
// Import the singleton Supabase client instance for authentication and data fetching
import supabase from '../supabaseClient'; // Import the singleton client

// Login component handles user authentication and UI for sign in
function Login() {
  // Initialize navigation hook for route changes
  const navigate = useNavigate();
  // State to control header animation visibility (purely visual, does not affect functionality)
  const [headerVisible, setHeaderVisible] = useState(false);

  // useEffect to check for an active session when the component mounts
  useEffect(() => {
    // Async function to check if the user is already authenticated
    const checkSession = async () => {
      // Retrieve the current session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      // If a session exists, navigate to the success page
      if (session) {
        navigate('/success');
      }
    };
    // Execute the session check
    checkSession();
    
    // Trigger header animation after a brief delay for visual effect
    setTimeout(() => {
      setHeaderVisible(true);
    }, 300);
    
    // Dynamically add custom CSS styles for animations and patterns
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }
      
      @keyframes wiggle {
        0% { transform: rotate(0deg); }
        25% { transform: rotate(5deg); }
        50% { transform: rotate(0deg); }
        75% { transform: rotate(-5deg); }
        100% { transform: rotate(0deg); }
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      .emoji-float {
        animation: float 3s ease-in-out infinite;
        display: inline-block;
      }
      
      .food-wiggle:hover {
        animation: wiggle 0.5s ease-in-out;
      }
      
      .food-pulse {
        animation: pulse 2s ease-in-out infinite;
      }
      
      .food-pattern {
        background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      }
      
      .doodle-pattern {
        background-image: url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.05'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      }
    `;
    // Append the style element to the document head
    document.head.appendChild(style);
    
    // Cleanup: Remove the added style element when the component unmounts
    return () => {
      document.head.removeChild(style);
    };
  }, [navigate]);

  // useEffect to listen for authentication state changes via Supabase
  useEffect(() => {
    // Subscribe to authentication state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      // Navigate to appropriate route based on the authentication event
      if (event === 'SIGNED_IN') {
        navigate('/success');
      } else if (event === 'SIGNED_OUT') {
        navigate('/');
      }
    });

    // Cleanup the listener on unmount to prevent memory leaks
    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate]);

  // Render the Login UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 food-pattern p-4">
      {/* Decorative food emojis with floating animation */}
      <div className="fixed h-full w-full overflow-hidden pointer-events-none" aria-hidden="true">
        <span className="emoji-float absolute text-4xl top-[10%] left-[5%]" style={{animationDelay: '0.5s'}}>🍕</span>
        <span className="emoji-float absolute text-4xl top-[15%] right-[7%]" style={{animationDelay: '1.5s'}}>🍔</span>
        <span className="emoji-float absolute text-4xl top-[35%] left-[8%]" style={{animationDelay: '2s'}}>🍜</span>
        <span className="emoji-float absolute text-4xl top-[60%] right-[10%]" style={{animationDelay: '1s'}}>🌮</span>
        <span className="emoji-float absolute text-4xl bottom-[15%] left-[12%]" style={{animationDelay: '0s'}}>🥑</span>
        <span className="emoji-float absolute text-4xl bottom-[5%] right-[5%]" style={{animationDelay: '2.5s'}}>🍣</span>
      </div>

      {/* App Header similar to SuccessPage.js with header animation */}
      <header className={`fixed top-0 w-full bg-orange-500 shadow-md z-50 py-3 ${headerVisible ? 'opacity-100 transition-opacity duration-500' : 'opacity-0'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex justify-center items-center">
          <div className="flex items-center space-x-2">
            <div className="text-white text-2xl font-bold flex items-center">
              {/* Icon with wiggle animation */}
              <span className="food-wiggle inline-block mr-2">🍽️</span>
              <span className="font-extrabold text-white">Ween</span>
              <span className="ml-2 bg-white text-orange-500 text-xs px-2 py-1 rounded-full font-bold food-pulse">AI FOOD GUIDE</span>
            </div>
          </div>
        </div>
      </header>

      {/* Container for the authentication form */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border-4 border-dashed border-orange-200 p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="flex justify-center mb-4">
          {/* Decorative icon with wiggle animation */}
          <span className="text-5xl food-wiggle">🥘</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-orange-600 text-center mb-6">
          Welcome to Ween AI
        </h1>
        
        {/* Supabase Auth component for handling user sign in
            with specified appearance and provider settings */}
        <Auth 
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#f97316',
                  brandAccent: '#ea580c',
                }
              }
            }
          }}
          providers={['google']}
          view="sign_in" // Set the default view explicitly
        />
        
      </div>
    </div>
  );
}

// Export the Login component as the default export
export default Login;
