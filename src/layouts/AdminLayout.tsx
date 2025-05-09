import React from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { Crown, Settings, Users, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  
  return (
    <div className="flex min-h-screen bg-elegant-950">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 bg-elegant-900 border-r border-elegant-800">
        <div className="p-4 border-b border-elegant-800 flex items-center justify-center md:justify-start">
          <Crown size={24} className="text-gold-500" />
          <h1 className="text-gold-500 font-playfair font-bold text-xl hidden md:block ml-2">
            Admin Panel
          </h1>
        </div>
        
        <nav className="py-6">
          <ul className="space-y-2">
            <li>
              <Link
                to="/admin/dashboard"
                className={`flex items-center px-4 py-3 ${
                  isActive('/admin/dashboard')
                    ? 'bg-burgundy-950 text-white'
                    : 'text-elegant-300 hover:bg-elegant-800'
                }`}
              >
                <LayoutDashboard size={20} className="min-w-[20px]" />
                <span className="hidden md:block ml-3">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/candidates"
                className={`flex items-center px-4 py-3 ${
                  isActive('/admin/candidates')
                    ? 'bg-burgundy-950 text-white'
                    : 'text-elegant-300 hover:bg-elegant-800'
                }`}
              >
                <Users size={20} className="min-w-[20px]" />
                <span className="hidden md:block ml-3">Candidats</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/settings"
                className={`flex items-center px-4 py-3 ${
                  isActive('/admin/settings')
                    ? 'bg-burgundy-950 text-white'
                    : 'text-elegant-300 hover:bg-elegant-800'
                }`}
              >
                <Settings size={20} className="min-w-[20px]" />
                <span className="hidden md:block ml-3">Paramètres</span>
              </Link>
            </li>
          </ul>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-elegant-800">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-elegant-300 hover:text-white hover:bg-burgundy-950 rounded"
            >
              <LogOut size={20} className="min-w-[20px]" />
              <span className="hidden md:block ml-3">Déconnexion</span>
            </button>
          </div>
        </nav>
      </aside>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-elegant-900 border-b border-elegant-800 py-4 px-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-playfair">
              {isActive('/admin/dashboard') && 'Dashboard'}
              {isActive('/admin/candidates') && 'Gestion des Candidats'}
              {isActive('/admin/settings') && 'Paramètres de Vote'}
            </h2>
            
            <div className="text-elegant-300">
              <span>Connecté en tant que </span>
              <span className="text-gold-500 font-medium">{user?.username}</span>
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;