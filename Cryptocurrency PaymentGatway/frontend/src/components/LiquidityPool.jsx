import React, { useState, useEffect } from 'react';
import { web3Service } from '../services/web3Connector';
import { ethers } from 'ethers';

const API_URL = 'http://localhost:5000/api';

const LiquidityPool = () => {
  const [currency, setCurrency] = useState('USD');
  const [ethAmount, setEthAmount] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [liquidityAmount, setLiquidityAmount] = useState('');
  const [poolInfo, setPoolInfo] = useState(null);
  const [userLiquidity, setUserLiquidity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPoolInfo();
    fetchUserLiquidity();
  }, [currency]);

  const fetchPoolInfo = async () => {
    try {
      const response = await fetch(`${API_URL}/liquidity/info/${currency}`);
      const info = await response.json();
      setPoolInfo(info);
    } catch (err) {
      console.error('Failed to fetch pool info:', err);
      setError('Failed to fetch pool information');
    }
  };

  const fetchUserLiquidity = async () => {
    try {
      const response = await fetch(`${API_URL}/liquidity/user-liquidity/${currency}/${web3Service.account}`);
      const liquidity = await response.json();
      setUserLiquidity(liquidity);
    } catch (err) {
      console.error('Failed to fetch user liquidity:', err);
      setError('Failed to fetch user liquidity');
    }
  };

  const verifyTransaction = async (txHash, type, data) => {
    try {
      const response = await fetch(`${API_URL}/liquidity/verify/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          transactionHash: txHash,
          currency,
          ...data
        })
      });
      const result = await response.json();
      return result.verified;
    } catch (err) {
      console.error('Transaction verification failed:', err);
      return false;
    }
  };

  const handleAddLiquidity = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const ethAmountWei = web3Service.web3.utils.toWei(ethAmount, 'ether');
      const tx = await web3Service.contract.methods.addLiquidity(currency, tokenAmount).send({
        from: web3Service.account,
        value: ethAmountWei
      });
      
      const verified = await verifyTransaction(tx.hash, 'add', {
        ethAmount: ethAmountWei,
        tokenAmount
      });

      setSuccess(verified ? 'Liquidity added and verified!' : 'Liquidity added but verification pending');
      fetchPoolInfo();
      fetchUserLiquidity();
      setEthAmount('');
      setTokenAmount('');
    } catch (err) {
      setError('Failed to add liquidity: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLiquidity = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const tx = await web3Service.contract.methods.removeLiquidity(currency, liquidityAmount).send({
        from: web3Service.account
      });

      const verified = await verifyTransaction(tx.hash, 'remove', {
        liquidityAmount
      });

      setSuccess(verified ? 'Liquidity removed and verified!' : 'Liquidity removed but verification pending');
      fetchPoolInfo();
      fetchUserLiquidity();
      setLiquidityAmount('');
    } catch (err) {
      setError('Failed to remove liquidity: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapETHForTokens = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const ethAmountWei = web3Service.web3.utils.toWei(ethAmount, 'ether');
      const tx = await web3Service.contract.methods.swapExactETHForTokens(currency).send({
        from: web3Service.account,
        value: ethAmountWei
      });

      const verified = await verifyTransaction(tx.hash, 'swap', {
        fromToken: 'ETH',
        amount: ethAmountWei
      });

      setSuccess(verified ? 'Swap completed and verified!' : 'Swap completed but verification pending');
      fetchPoolInfo();
      setEthAmount('');
    } catch (err) {
      setError('Failed to swap: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapTokensForETH = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const tx = await web3Service.contract.methods.swapExactTokensForETH(currency, tokenAmount).send({
        from: web3Service.account
      });

      const verified = await verifyTransaction(tx.hash, 'swap', {
        fromToken: 'TOKEN',
        amount: tokenAmount
      });

      setSuccess(verified ? 'Swap completed and verified!' : 'Swap completed but verification pending');
      fetchPoolInfo();
      setTokenAmount('');
    } catch (err) {
      setError('Failed to swap: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative bg-gray-900">
      {/* Background effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>

      <div className="relative">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Liquidity Pool
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

        {/* Currency Selection */}
        <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-8 border-2 border-gray-700/50 shadow-lg mb-6">
          <h3 className="text-xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Select Currency
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
        </div>

        {/* Pool Information */}
        {poolInfo && (
          <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-8 border-2 border-gray-700/50 shadow-lg mb-6">
            <h3 className="text-xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Pool Information
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-gray-300">
                <span className="text-gray-400">ETH Reserve:</span>
                <span className="block font-mono text-purple-200 mt-1">
                  {ethers.formatEther(poolInfo.ethReserve)} ETH
                </span>
              </div>
              <div className="text-gray-300">
                <span className="text-gray-400">Token Reserve:</span>
                <span className="block font-mono text-purple-200 mt-1">{poolInfo.tokenReserve}</span>
              </div>
              <div className="text-gray-300">
                <span className="text-gray-400">Total Liquidity:</span>
                <span className="block font-mono text-purple-200 mt-1">{poolInfo.totalLiquidity}</span>
              </div>
              <div className="text-gray-300">
                <span className="text-gray-400">Status:</span>
                <span className={`block mt-1 ${poolInfo.isActive ? 'text-green-400' : 'text-red-400'}`}>
                  {poolInfo.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* User Liquidity Information */}
        {userLiquidity && (
          <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-8 border-2 border-gray-700/50 shadow-lg mb-6">
            <h3 className="text-xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Your Liquidity
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-gray-300">
                <span className="text-gray-400">Amount:</span>
                <span className="block font-mono text-purple-200 mt-1">{userLiquidity.amount}</span>
              </div>
              <div className="text-gray-300">
                <span className="text-gray-400">ETH Share:</span>
                <span className="block font-mono text-purple-200 mt-1">
                  {ethers.formatEther(userLiquidity.ethShare)} ETH
                </span>
              </div>
              <div className="text-gray-300">
                <span className="text-gray-400">Token Share:</span>
                <span className="block font-mono text-purple-200 mt-1">{userLiquidity.tokenShare}</span>
              </div>
            </div>
          </div>
        )}

        {/* Add Liquidity Form */}
        <form onSubmit={handleAddLiquidity} className="bg-gray-800/50 backdrop-blur rounded-2xl p-8 border-2 border-gray-700/50 shadow-lg mb-6">
          <h3 className="text-xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Add Liquidity
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">ETH Amount</label>
              <input
                type="number"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                placeholder="Enter ETH amount"
                className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border-2 border-gray-700/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                step="0.000000000000000001"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Token Amount</label>
              <input
                type="number"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                placeholder="Enter token amount"
                className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border-2 border-gray-700/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                min="0"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Add Liquidity'}
            </button>
          </div>
        </form>

        {/* Remove Liquidity Form */}
        <form onSubmit={handleRemoveLiquidity} className="bg-gray-800/50 backdrop-blur rounded-2xl p-8 border-2 border-gray-700/50 shadow-lg mb-6">
          <h3 className="text-xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Remove Liquidity
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Liquidity Amount</label>
              <input
                type="number"
                value={liquidityAmount}
                onChange={(e) => setLiquidityAmount(e.target.value)}
                placeholder="Enter liquidity amount"
                className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border-2 border-gray-700/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                min="0"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Remove Liquidity'}
            </button>
          </div>
        </form>

        {/* Swap Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form onSubmit={handleSwapETHForTokens} className="bg-gray-800/50 backdrop-blur rounded-2xl p-8 border-2 border-gray-700/50 shadow-lg">
            <h3 className="text-xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Swap ETH for Tokens
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">ETH Amount</label>
                <input
                  type="number"
                  value={ethAmount}
                  onChange={(e) => setEthAmount(e.target.value)}
                  placeholder="Enter ETH amount"
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border-2 border-gray-700/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  step="0.000000000000000001"
                  min="0"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Swap ETH for Tokens'}
              </button>
            </div>
          </form>

          <form onSubmit={handleSwapTokensForETH} className="bg-gray-800/50 backdrop-blur rounded-2xl p-8 border-2 border-gray-700/50 shadow-lg">
            <h3 className="text-xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Swap Tokens for ETH
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Token Amount</label>
                <input
                  type="number"
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(e.target.value)}
                  placeholder="Enter token amount"
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border-2 border-gray-700/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  min="0"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Swap Tokens for ETH'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LiquidityPool;