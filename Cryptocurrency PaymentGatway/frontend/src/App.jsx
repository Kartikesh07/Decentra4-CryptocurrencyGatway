import React, { useState } from 'react';
import './App.css';
import { web3Service } from './services/web3Connector';
import Dashboard from './components/Dashboard';
import LiquidityPool from './components/LiquidityPool';

function App() {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  const connectWallet = async () => {
    try {
      await web3Service.connect();
      setConnected(true);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Sepolia Payment Gateway</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!connected ? (
          <div className="text-center">
            <button
              onClick={connectWallet}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6 flex-wrap">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 m-2 rounded ${
                  activeTab === 'dashboard' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                ETH Dashboard
              </button>
              <button
                onClick={() => setActiveTab('liquidity')}
                className={`px-4 py-2 m-2 rounded ${
                  activeTab === 'liquidity' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                Liquidity Pool
              </button>
            </div>
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'liquidity' && <LiquidityPool />}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
