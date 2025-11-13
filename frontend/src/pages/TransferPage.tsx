import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { Account, UserInfo, AccountSearchResult } from '../types';
import { accountService, transactionService } from '../services/api';

interface TransferForm {
  fromAccountId: string;
  toAccountId: string;
  accountNumber: string;
  amount: number;
  description: string;
  transferType: 'account_number' | 'user_list';
}

const TransferPage: React.FC = () => {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<TransferForm>();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [searchedAccount, setSearchedAccount] = useState<AccountSearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const navigate = useNavigate();

  const fromAccountId = watch('fromAccountId');
  const transferType = watch('transferType');
  const accountNumber = watch('accountNumber');

  const fetchData = useCallback(async () => {
    if (dataLoaded) return;
    
    setLoading(true);
    try {
      const [accountsData, usersData] = await Promise.all([
        accountService.getAccounts(),
        accountService.getAllUsers()
      ]);
      setAccounts(accountsData.filter(account => account.status === 'active'));
      setUsers(usersData);
      setDataLoaded(true);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [dataLoaded]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAccountSearch = async () => {
    if (!accountNumber || accountNumber.length < 3) {
      toast.error('Please enter at least 3 characters');
      return;
    }

    setSearchLoading(true);
    setSearchedAccount(null);
    
    try {
      const account = await accountService.searchAccountByNumber(accountNumber);
      setSearchedAccount(account);
      setValue('toAccountId', account._id);
      toast.success('Account found!');
    } catch (error: any) {
      setSearchedAccount(null);
      setValue('toAccountId', '');
      toast.error(error.response?.data?.error || 'Account not found');
    } finally {
      setSearchLoading(false);
    }
  };

  const onSubmit = async (data: TransferForm) => {
    try {
      await transactionService.transfer({
        fromAccountId: data.fromAccountId,
        toAccountId: data.toAccountId,
        amount: data.amount,
        description: data.description
      });
      toast.success('Transfer completed successfully!');
      reset();
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Transfer failed');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const selectedFromAccount = accounts.find(account => account._id === fromAccountId);

  if (loading) {
    return (
      <Layout title="Transfer Money">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Transfer Money">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="fromAccountId" className="block text-sm font-medium text-gray-700 mb-2">
                From Account
              </label>
              <select
                {...register('fromAccountId', { required: 'Please select a source account' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select account</option>
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.accountType.toUpperCase()} - {account.accountNumber} 
                    ({formatCurrency(account.balance)})
                  </option>
                ))}
              </select>
              {errors.fromAccountId && (
                <p className="mt-1 text-sm text-red-600">{errors.fromAccountId.message}</p>
              )}
            </div>

            {selectedFromAccount && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                  Available balance: <span className="font-medium">{formatCurrency(selectedFromAccount.balance)}</span>
                </p>
              </div>
            )}

            {/* Transfer Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How would you like to find the recipient?
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    {...register('transferType', { required: 'Please select a transfer method' })}
                    type="radio"
                    value="account_number"
                    className="mr-2"
                  />
                  <span className="text-sm">By Account Number</span>
                </label>
                <label className="flex items-center">
                  <input
                    {...register('transferType', { required: 'Please select a transfer method' })}
                    type="radio"
                    value="user_list"
                    className="mr-2"
                  />
                  <span className="text-sm">From User List</span>
                </label>
              </div>
              {errors.transferType && (
                <p className="mt-1 text-sm text-red-600">{errors.transferType.message}</p>
              )}
            </div>

            {/* Account Number Search */}
            {transferType === 'account_number' && (
              <div>
                <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Account Number
                </label>
                <div className="flex space-x-3">
                  <input
                    {...register('accountNumber', {
                      required: transferType === 'account_number' ? 'Account number is required' : false
                    })}
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter account number (e.g., ACC123456789)"
                  />
                  <button
                    type="button"
                    onClick={handleAccountSearch}
                    disabled={searchLoading || !accountNumber}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {searchLoading ? 'Searching...' : 'Search'}
                  </button>
                </div>
                
                {searchedAccount && (
                  <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-md">
                    <h4 className="font-medium text-green-800">Account Found:</h4>
                    <p className="text-sm text-green-700">
                      <strong>Owner:</strong> {searchedAccount.ownerName}
                    </p>
                    <p className="text-sm text-green-700">
                      <strong>Account:</strong> {searchedAccount.accountNumber} ({searchedAccount.accountType})
                    </p>
                    <p className="text-sm text-green-700">
                      <strong>Email:</strong> {searchedAccount.ownerEmail}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* User List Selection */}
            {transferType === 'user_list' && (
              <div>
                <label htmlFor="toAccountId" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Recipient
                </label>
                <select
                  {...register('toAccountId', { 
                    required: transferType === 'user_list' ? 'Please select a recipient account' : false 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select recipient</option>
                  {users.map((user) => 
                    user.accounts.map((account) => (
                      <option key={account._id} value={account._id}>
                        {user.firstName} {user.lastName} - {account.accountNumber} ({account.accountType})
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  {...register('amount', { 
                    required: 'Amount is required',
                    min: { value: 0.01, message: 'Amount must be at least $0.01' },
                    max: selectedFromAccount ? { 
                      value: selectedFromAccount.balance, 
                      message: 'Amount cannot exceed available balance' 
                    } : undefined
                  })}
                  type="number"
                  step="0.01"
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                {...register('description', { 
                  required: 'Description is required',
                  maxLength: { value: 500, message: 'Description cannot exceed 500 characters' }
                })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="What's this transfer for?"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !watch('toAccountId')}
                className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Transfer Money'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default TransferPage;