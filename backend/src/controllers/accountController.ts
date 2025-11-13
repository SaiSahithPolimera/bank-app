import { Response } from 'express';
import Account from '../models/Account';
import Transaction from '../models/Transaction';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getAccounts = async (req: AuthRequest, res: Response) => {
  try {
    const accounts = await Account.find({ userId: req.user!._id }).select('-__v');
    res.json(accounts);
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAccountById = async (req: AuthRequest, res: Response) => {
  try {
    const { accountId } = req.params;
    
    const account = await Account.findOne({ 
      _id: accountId, 
      userId: req.user!._id 
    }).select('-__v');
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json(account);
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAccountTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const { accountId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const account = await Account.findOne({ 
      _id: accountId, 
      userId: req.user!._id 
    });
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const transactions = await Transaction.find({
      $or: [
        { fromAccountId: accountId },
        { toAccountId: accountId }
      ]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate('fromAccountId', 'accountNumber accountType')
    .populate('toAccountId', 'accountNumber accountType');

    const total = await Transaction.countDocuments({
      $or: [
        { fromAccountId: accountId },
        { toAccountId: accountId }
      ]
    });

    res.json({
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get account transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const searchAccountByNumber = async (req: AuthRequest, res: Response) => {
  try {
    const { accountNumber } = req.params;
    
    if (!accountNumber || accountNumber.length < 3) {
      return res.status(400).json({ error: 'Account number must be at least 3 characters' });
    }

    const account = await Account.findOne({ 
      accountNumber,
      status: 'active'
    }).populate('userId', 'firstName lastName email');
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found or inactive' });
    }

    if (account.userId._id.toString() === req.user!._id.toString()) {
      return res.status(400).json({ error: 'Cannot transfer to your own account' });
    }

    const populatedUser = account.userId as any;

    const accountInfo = {
      _id: account._id,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      ownerName: `${populatedUser.firstName} ${populatedUser.lastName}`,
      ownerEmail: populatedUser.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    };

    res.json(accountInfo);
  } catch (error) {
    console.error('Search account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllActiveUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user!._id }
    }).select('firstName lastName email').limit(50);

    const usersWithAccounts = await Promise.all(
      users.map(async (user) => {
        const accounts = await Account.find({
          userId: user._id,
          status: 'active'
        }).select('accountNumber accountType');

        return {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
          accounts: accounts.map(acc => ({
            _id: acc._id,
            accountNumber: acc.accountNumber,
            accountType: acc.accountType
          }))
        };
      })
    );

    const activeUsers = usersWithAccounts.filter(user => user.accounts.length > 0);

    res.json(activeUsers);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};