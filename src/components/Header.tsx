import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Crown, BarChart3, Vote, Home, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <header className="bg-elegant-950/80 backdrop-blur-sm border-b border-gold-500/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 text-gold-500 mb-4 md:mb-0">
          <Crown size={28} className="text-gold-500" />
          <h1 className="text-2xl md:text-3xl font-playfair font-bold">DGI DINER</h1>
        </Link>
        
        <nav className="flex items-center space-x-1 md:space-x-4">
          <Link 
            to="/" 
            className={`btn flex items-center space-x-1 ${
              isActive('/') 
                ? 'text-gold-500 border-b-2 border-gold-500' 
                : 'text-white hover:text-gold-400'
            }`}
          >
            <Home size={18} />
            <span className="hidden md:inline">Accueil</span>
          </Link>
          
          <Link 
            to="/vote" 
            className={`btn flex items-center space-x-1 ${
              isActive('/vote') 
                ? 'text-gold-500 border-b-2 border-gold-500' 
                : 'text-white hover:text-gold-400'
            }`}
          >
            <Vote size={18} />
            <span className="hidden md:inline">Voter</span>
          </Link>
          
          <Link 
            to="/results" 
            className={`btn flex items-center space-x-1 ${
              isActive('/results') 
                ? 'text-gold-500 border-b-2 border-gold-500' 
                : 'text-white hover:text-gold-400'
            }`}
          >
            <BarChart3 size={18} />
            <span className="hidden md:inline">Résultats</span>
          </Link>
          
          {!isAuthenticated && (
            <Link 
              to="/login" 
              className={`btn flex items-center space-x-1 ${
                isActive('/login') 
                  ? 'text-gold-500 border-b-2 border-gold-500' 
                  : 'text-white hover:text-gold-400'
              }`}
            >
              <LogIn size={18} />
              <span className="hidden md:inline">Admin</span>
            </Link>
          )}
          
          {isAuthenticated && (
            <Link 
              to="/admin/dashboard" 
              className={`btn btn-gold flex items-center space-x-1 ${
                location.pathname.includes('/admin') ? 'bg-gold-600' : ''
              }`}
            >
              <Crown size={18} />
              <span className="hidden md:inline">Dashboard</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;