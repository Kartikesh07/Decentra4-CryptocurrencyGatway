import React, { useState, useEffect } from 'react';
import { web3Service } from '../services/web3Connector';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const [balance, setBalance] = useState('0');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBalance();
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch(`${API_URL}/health`);
      const data = await response.json();
      if (data.status !== 'ok') {
        setError('Backend service is not available');
      }
    } catch (err) {
      setError('Cannot connect to backend service');
    }
  };

  const verifyTransaction = async (txHash) => {
    try {
      const response = await fetch(`${API_URL}/transactions/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ transactionHash: txHash })
      });
      const data = await response.json();
      return data.verified;
    } catch (err) {
      console.error('Transaction verification failed:', err);
      return false;
    }
  };

  const fetchBalance = async () => {
    try {
      const bal = await web3Service.getBalance();
      setBalance(bal);
    } catch (err) {
      setError('Failed to fetch balance');
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const tx = await web3Service.deposit(depositAmount);
      const verified = await verifyTransaction(tx.hash);
      if (verified) {
        setSuccess('Deposit successful and verified!');
      } else {
        setSuccess('Deposit completed but verification pending');
      }
      setDepositAmount('');
      fetchBalance();
    } catch (err) {
      setError('Deposit failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const tx = await web3Service.withdraw(withdrawAmount);
      const verified = await verifyTransaction(tx.hash);
      if (verified) {
        setSuccess('Withdrawal successful and verified!');
      } else {
        setSuccess('Withdrawal completed but verification pending');
      }
      setWithdrawAmount('');
      fetchBalance();
    } catch (err) {
      setError('Withdrawal failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const tx = await web3Service.transfer(recipientAddress, transferAmount);
      const verified = await verifyTransaction(tx.hash);
      if (verified) {
        setSuccess('Transfer successful and verified!');
      } else {
        setSuccess('Transfer completed but verification pending');
      }
      setTransferAmount('');
      setRecipientAddress('');
      fetchBalance();
    } catch (err) {
      setError('Transfer failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 relative">
      {/* Background gradient effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Main Content */}
      <div className="relative">
        {/* Balance Card */}
        <div className="mb-12 text-center">
          <div className="backdrop-blur-lg bg-gray-900/60 rounded-2xl p-8 border border-gray-700/30 shadow-xl">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
              Your Dashboard
            </h2>
            <div className="text-2xl font-medium text-gray-100">
              <span className="text-gray-400">Balance:</span>
              <span className="ml-2 font-mono">{balance} ETH</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 backdrop-blur-lg bg-red-900/30 border border-red-500/30 text-red-200 px-6 py-4 rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 backdrop-blur-lg bg-green-900/30 border border-green-500/30 text-green-200 px-6 py-4 rounded-xl">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          {/* Deposit Section */}
          <div className="backdrop-blur-lg bg-gray-900/60 rounded-2xl p-8 border border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="text-xl font-semibold mb-6 text-gray-100">
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                Deposit ETH
              </span>
            </h3>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Amount in ETH"
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/30 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  step="0.01"
                  min="0"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing
                    </span>
                  ) : 'Deposit'}
                </button>
              </div>
            </form>
          </div>

          {/* Withdraw Section */}
          <div className="backdrop-blur-lg bg-gray-900/60 rounded-2xl p-8 border border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="text-xl font-semibold mb-6 text-gray-100">
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                Withdraw ETH
              </span>
            </h3>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Amount in ETH"
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/30 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  step="0.01"
                  min="0"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing
                    </span>
                  ) : 'Withdraw'}
                </button>
              </div>
            </form>
          </div>

          {/* Transfer Section */}
          <div className="backdrop-blur-lg bg-gray-900/60 rounded-2xl p-8 border border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="text-xl font-semibold mb-6 text-gray-100">
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                Transfer ETH
              </span>
            </h3>
            <form onSubmit={handleTransfer} className="space-y-4">
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="Recipient Address"
                className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/30 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-mono text-sm"
                required
              />
              <div className="flex gap-4">
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="Amount in ETH"
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/30 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  step="0.01"
                  min="0"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing
                    </span>
                  ) : 'Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;