import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          App-Kine - Gestion de Cabinet de Kinésithérapie
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Patients
            </h2>
            <p className="text-gray-600">
              Gérez vos patients et leurs informations médicales.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Planning
            </h2>
            <p className="text-gray-600">
              Planifiez et organisez vos rendez-vous.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Documentation
            </h2>
            <p className="text-gray-600">
              Documentez vos séances et traitements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
