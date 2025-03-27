import React, { useState, useEffect } from 'react';
import { web3Service } from '../services/web3Connector';

const API_URL = 'http://localhost:5000/api';

const AdminFiatControl = () => {
  const [isOwner, setIsOwner] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [rate, setRate] = useState('');
  const [decimals, setDecimals] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentRates, setCurrentRates] = useState({});

  useEffect(() => {
    checkOwnership();
    fetchCurrentRate();
  }, [currency]);

  const checkOwnership = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/fiat/check-owner/${web3Service.account}`);
      const data = await response.json();
      setIsOwner(data.isOwner);
    } catch (err) {
      setError('Failed to check ownership');
    }
  };

  const fetchCurrentRate = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/fiat/rates/${currency}`);
      const rateInfo = await response.json();
      setCurrentRates(prev => ({ ...prev, [currency]: rateInfo }));
    } catch (err) {
      console.error('Failed to fetch rate:', err);
    }
  };

  const handleSetFiatRate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // First, update on blockchain
      const tx = await web3Service.contract.methods.setFiatRate(currency, rate, decimals).send({
        from: web3Service.account
      });

      // Then, update in backend
      const response = await fetch(`${API_URL}/admin/fiat/set-rate/${web3Service.account}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currency,
          rate,
          decimals
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Fiat rate updated successfully!');
        fetchCurrentRate();
        setRate('');
        setDecimals('');
      } else {
        throw new Error(data.error || 'Failed to update rate');
      }
    } catch (err) {
      setError('Failed to set fiat rate: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetFiatStatus = async (isActive) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // First, update on blockchain
      const tx = await web3Service.contract.methods.setFiatRateStatus(currency, isActive).send({
        from: web3Service.account
      });

      // Then, update in backend
      const response = await fetch(`${API_URL}/admin/fiat/set-status/${web3Service.account}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currency,
          isActive
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(`Currency ${isActive ? 'activated' : 'deactivated'} successfully!`);
        fetchCurrentRate();
      } else {
        throw new Error(data.error || 'Failed to update status');
      }
    } catch (err) {
      setError('Failed to update status: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOwner) {
    return (
      <div className="backdrop-blur-lg bg-gray-900/60 rounded-2xl p-8 border border-red-500/30 text-center">
        <p className="text-red-400 text-xl">Access denied. Only contract owner can access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 relative bg-gray-900">
      {/* Background effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>

      <div className="relative">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Admin Fiat Control Panel
          </h2>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 bg-red-900/30 border-2 border-red-500/30 text-red-200 px-6 py-4 rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-900/30 border-2 border-green-500/30 text-green-200 px-6 py-4 rounded-xl">
            {success}
          </div>
        )}

        {/* Currency Selection Card */}
        <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-8 border-2 border-gray-700/50 shadow-lg mb-8">
          <h3 className="text-xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Currency Selection
          </h3>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border-2 border-gray-700/50 text-gray-200 mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>

          {currentRates[currency] && (
            <div className="bg-gray-900/50 rounded-xl p-6 border-2 border-gray-700/50">
              <h4 className="text-lg font-medium mb-4 text-purple-300">Current Settings</h4>
              <div className="grid grid-cols-1 gap-3">
                <p className="flex justify-between text-gray-300">
                  <span>Rate:</span>
                  <span className="font-mono text-purple-200">{currentRates[currency].rate} Wei</span>
                </p>
                <p className="flex justify-between text-gray-300">
                  <span>Decimals:</span>
                  <span className="font-mono text-purple-200">{currentRates[currency].decimals}</span>
                </p>
                <p className="flex justify-between text-gray-300">
                  <span>Status:</span>
                  <span className={currentRates[currency].isActive ? 'text-green-400' : 'text-red-400'}>
                    {currentRates[currency].isActive ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Set Rate Form */}
        <form onSubmit={handleSetFiatRate} className="bg-gray-800/50 backdrop-blur rounded-2xl p-8 border-2 border-gray-700/50 shadow-lg mb-8">
          <h3 className="text-xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Set Fiat Rate
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Rate (in Wei)</label>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="Enter rate in Wei"
                className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border-2 border-gray-700/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Decimals</label>
              <input
                type="number"
                value={decimals}
                onChange={(e) => setDecimals(e.target.value)}
                placeholder="Enter decimals (max 18)"
                className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border-2 border-gray-700/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                min="0"
                max="18"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Set Rate'}
            </button>
          </div>
        </form>

        {/* Status Control */}
        <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-8 border-2 border-gray-700/50 shadow-lg">
          <h3 className="text-xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Currency Status Control
          </h3>
          <div className="flex gap-4">
            <button
              onClick={() => handleSetFiatStatus(true)}
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Activate'}
            </button>
            <button
              onClick={() => handleSetFiatStatus(false)}
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Deactivate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFiatControl;