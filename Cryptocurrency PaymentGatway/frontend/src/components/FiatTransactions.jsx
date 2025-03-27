import React, { useState, useEffect } from 'react';
import { web3Service } from '../services/web3Connector';

const API_URL = 'http://localhost:5000/api';

const FiatTransactions = () => {
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [fiatRate, setFiatRate] = useState(null);

    useEffect(() => {
        fetchFiatRate();
    }, [currency]);

    const fetchFiatRate = async () => {
        try {
            const response = await fetch(`${API_URL}/fiat/rates/${currency}`);
            const rate = await response.json();
            setFiatRate(rate);
        } catch (err) {
            setError('Failed to fetch fiat rate');
        }
    };

    const handleDeposit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (!web3Service || !web3Service.contract) {
                throw new Error('Web3 service not initialized');
            }

            const amountInWei = web3Service.web3.utils.toWei(amount, 'ether');
            const tx = await web3Service.contract.methods.depositFiat(
                web3Service.web3.utils.fromAscii(currency),
                amountInWei
            ).send({
                from: web3Service.account
            });

            const response = await fetch(`${API_URL}/fiat/deposit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    address: web3Service.account,
                    currency,
                    amount: amountInWei,
                    transactionHash: tx.transactionHash
                })
            });

            const data = await response.json();
            if (data.success) {
                setSuccess('Deposit successful!');
                setAmount('');
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            setError(`Deposit failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const verifyFiatTransaction = async (txHash, type, amount) => {
        try {
            const response = await fetch(`${API_URL}/fiat/${type}/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    transactionHash: txHash,
                    currency,
                    amount
                })
            });
            const data = await response.json();
            return data.verified;
        } catch (err) {
            console.error('Transaction verification failed:', err);
            return false;
        }
    };

    // Update handleDepositFiat and handleWithdrawFiat to use verification
    const handleDepositFiat = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
    
        try {
            const tx = await web3Service.contract.methods.depositFiat(currency, fiatAmount).send({
                from: web3Service.account,
                value: ethAmount
            });
            const verified = await verifyFiatTransaction(tx.hash, 'deposit', fiatAmount);
            setSuccess(verified ? 'Fiat deposit verified!' : 'Fiat deposit completed but verification pending');
            setFiatAmount('');
        } catch (err) {
            setError('Fiat deposit failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdrawFiat = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
    
        try {
            await web3Service.contract.methods.withdrawFiat(currency, fiatAmount).send({
                from: web3Service.account
            });
            setSuccess('Fiat withdrawal successful!');
            setFiatAmount('');
        } catch (err) {
            setError('Fiat withdrawal failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const depositFiat = async (currency, amount) => {
        try {
            // First, interact with smart contract
            const tx = await web3Service.contract.methods.depositFiat(currency, amount).send({
                from: web3Service.account
            });
    
            // Then, update backend
            const response = await fetch(`${API_URL}/fiat/deposit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    address: web3Service.account,
                    currency,
                    amount,
                    transactionHash: tx.transactionHash
                })
            });
    
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to deposit fiat');
            }
    
            // Update UI or show success message
            setSuccess('Fiat deposit successful!');
            // Refresh data if needed
            fetchFiatRate();
        } catch (error) {
            setError(`Fiat deposit failed: ${error.message}`);
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
                        Fiat Transactions
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
    
                <div className="grid grid-cols-1 gap-6">
                    {/* Currency Selection */}
                    <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-8 border-2 border-gray-700/50 shadow-lg">
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
                        
                        {fiatRate && (
                            <div className="bg-gray-900/50 rounded-xl p-6 border-2 border-gray-700/50">
                                <div className="grid grid-cols-1 gap-3">
                                    <p className="flex justify-between text-gray-300">
                                        <span>Rate:</span>
                                        <span className="font-mono text-purple-200">{fiatRate.rate} Wei</span>
                                    </p>
                                    <p className="flex justify-between text-gray-300">
                                        <span>Decimals:</span>
                                        <span className="font-mono text-purple-200">{fiatRate.decimals}</span>
                                    </p>
                                    <p className="flex justify-between text-gray-300">
                                        <span>Status:</span>
                                        <span className={fiatRate.isActive ? 'text-green-400' : 'text-red-400'}>
                                            {fiatRate.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
    
                    {/* Deposit Fiat Section */}
                    <form onSubmit={handleDepositFiat} className="bg-gray-800/50 backdrop-blur rounded-2xl p-8 border-2 border-gray-700/50 shadow-lg">
                        <h3 className="text-xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            Deposit {currency}
                        </h3>
                        <div className="flex gap-4">
                            <input
                                type="number"
                                value={fiatAmount}
                                onChange={(e) => setFiatAmount(e.target.value)}
                                placeholder={`Amount in ${currency}`}
                                className="flex-1 px-4 py-3 rounded-xl bg-gray-900/50 border-2 border-gray-700/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                step="0.01"
                                min="0"
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading || !fiatRate?.isActive}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : 'Deposit'}
                            </button>
                        </div>
                        {!fiatRate?.isActive && (
                            <p className="mt-4 text-sm text-red-400">This currency is currently inactive</p>
                        )}
                    </form>
    
                    {/* Withdraw Fiat Section */}
                    <form onSubmit={handleWithdrawFiat} className="bg-gray-800/50 backdrop-blur rounded-2xl p-8 border-2 border-gray-700/50 shadow-lg">
                        <h3 className="text-xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            Withdraw {currency}
                        </h3>
                        <div className="flex gap-4">
                            <input
                                type="number"
                                value={fiatAmount}
                                onChange={(e) => setFiatAmount(e.target.value)}
                                placeholder={`Amount in ${currency}`}
                                className="flex-1 px-4 py-3 rounded-xl bg-gray-900/50 border-2 border-gray-700/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                step="0.01"
                                min="0"
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading || !fiatRate?.isActive}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : 'Withdraw'}
                            </button>
                        </div>
                        {!fiatRate?.isActive && (
                            <p className="mt-4 text-sm text-red-400">This currency is currently inactive</p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FiatTransactions;