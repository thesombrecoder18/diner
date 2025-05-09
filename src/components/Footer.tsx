import React from 'react';
import { Crown } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-elegant-950 border-t border-gold-500/20 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Crown size={20} className="text-gold-500 mr-2" />
            <span className="text-gold-500 font-playfair font-bold text-xl">DGI DINER</span>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-elegant-400 text-sm">
              Département de Génie Informatique &copy; {currentYear}
            </p>
            <p className="text-elegant-500 text-xs mt-1">
              Élection du Roi et de la Reine
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;