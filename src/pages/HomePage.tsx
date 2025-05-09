import React from 'react';
import { Link } from 'react-router-dom';
import { Vote, Crown, BarChart3 } from 'lucide-react';
import { useVoting } from '../contexts/VotingContext';

const HomePage: React.FC = () => {
  const { votingActive } = useVoting();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/787961/pexels-photo-787961.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] bg-cover bg-center" />
        <div className="absolute inset-0 dgi-gradient" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-playfair font-bold text-white mb-4 tracking-tight">
            DGI DINER
          </h1>
          <p className="text-xl md:text-2xl text-gold-500 mb-6 font-playfair italic">
            Élection du Roi et de la Reine de la soirée
          </p>
          <p className="text-lg text-elegant-200 mb-8 max-w-2xl mx-auto">
            Votez pour élire le Roi et la Reine de cette soirée exceptionnelle du Département de Génie Informatique.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/vote"
              className="btn btn-gold flex items-center justify-center gap-2 py-3 px-6 text-lg"
            >
              <Vote size={20} />
              <span>{votingActive ? 'Voter Maintenant' : 'Voir les Candidats'}</span>
            </Link>
            <Link 
              to="/results"
              className="btn btn-outline flex items-center justify-center gap-2 py-3 px-6 text-lg"
            >
              <BarChart3 size={20} />
              <span>Voir les Résultats</span>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-playfair font-bold text-center mb-12 text-gold-500">
            Comment ça fonctionne
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-elegant-900 rounded-lg p-6 text-center transition-transform hover:transform hover:scale-105">
              <div className="bg-burgundy-950 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown size={32} className="text-gold-500" />
              </div>
              <h3 className="text-xl font-playfair font-bold mb-3">Choisissez vos favoris</h3>
              <p className="text-elegant-300">
                Parcourez les candidats et sélectionnez votre Roi et votre Reine préférés pour la soirée
              </p>
            </div>
            
            <div className="bg-elegant-900 rounded-lg p-6 text-center transition-transform hover:transform hover:scale-105">
              <div className="bg-burgundy-950 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Vote size={32} className="text-gold-500" />
              </div>
              <h3 className="text-xl font-playfair font-bold mb-3">Votez une seule fois</h3>
              <p className="text-elegant-300">
                Un seul vote par personne est autorisé. Votre vote est sécurisé et confidentiel
              </p>
            </div>
            
            <div className="bg-elegant-900 rounded-lg p-6 text-center transition-transform hover:transform hover:scale-105">
              <div className="bg-burgundy-950 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 size={32} className="text-gold-500" />
              </div>
              <h3 className="text-xl font-playfair font-bold mb-3">Suivez les résultats</h3>
              <p className="text-elegant-300">
                Visualisez les résultats en temps réel et découvrez qui sera couronné à la fin de la soirée
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 bg-elegant-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-playfair font-bold mb-6">
            Prêt à élire <span className="text-burgundy-950">le Roi</span> et <span className="text-gold-500">la Reine</span> ?
          </h2>
          <p className="text-lg text-elegant-300 mb-8">
            Ne manquez pas cette occasion unique de participer à cet événement marquant du Département de Génie Informatique.
          </p>
          
          <Link 
            to="/vote"
            className={`btn ${votingActive ? 'btn-gold' : 'btn-outline'} py-3 px-8 text-lg`}
          >
            {votingActive ? 'Voter Maintenant' : 'Voir les Candidats'}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;