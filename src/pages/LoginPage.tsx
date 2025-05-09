import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { login, error: authError, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Get the return path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/admin/dashboard';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!username || !password) {
      setError('Veuillez entrer un nom d\'utilisateur et un mot de passe');
      return;
    }
    
    try {
      await login(username, password);
      // Navigate to the return path after successful login
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de connexion');
    }
  };

  // Merge the authError and local error message
  const errorMessage = authError || error;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-elegant-900 p-8 rounded-lg shadow-xl">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-playfair font-bold">
            Admin Login
          </h2>
          <p className="mt-2 text-elegant-400">
            Connectez-vous pour accéder au panneau d'administration
          </p>
        </div>
        
        {errorMessage && (
          <div className="bg-red-900/30 border border-red-800 text-white p-3 rounded-md flex items-center">
            <AlertCircle size={20} className="mr-2 flex-shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-elegant-300 mb-1">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-elegant-500" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input pl-10 w-full"
                  placeholder="admin"
                  aria-label="Nom d'utilisateur"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-elegant-300 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-elegant-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10 w-full"
                  placeholder="••••••••"
                  aria-label="Mot de passe"
                />
              </div>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              className={`w-full btn btn-gold py-3 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={loading}
              aria-disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-elegant-950 border-solid rounded-full animate-spin mr-2"></div>
                  <span>Connexion...</span>
                </div>
              ) : (
                <span>Se connecter</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
