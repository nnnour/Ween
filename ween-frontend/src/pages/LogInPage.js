import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient'; // Import the singleton client

function Login() {
  const navigate = useNavigate();

  // Check active session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/success');
      }
    };
    checkSession();
  }, [navigate]);

  // Listen to authentication state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        navigate('/success');
      } else if (event === 'SIGNED_OUT') {
        navigate('/');
      }
    });

    // Cleanup listener on unmount to prevent memory leaks
    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-700 text-center mb-6">
          Welcome to Ween AI
        </h1>
        <Auth 
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google']}
          view="sign_in" // Set the default view explicitly
        />
      </div>
    </div>
  );
}

export default Login;
