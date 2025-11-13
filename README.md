# Banking Application

A full stack banking application using Node.js, React and MongoDB.

## 🏦 Application Screenshots

### User Registration & Authentication
![Create Account](screenshots/createAccount.png)
*User registration page with comprehensive form validation and secure account creation*

### Main Dashboard
![Dashboard Overview](screenshots/dashboard.png)
*Main dashboard displaying account balances, recent transactions, and quick action buttons for all banking operations*

### Transaction Management
![Deposit Money](screenshots/depositMoney.png)
*Intuitive deposit interface with account selection and amount validation*

![Transfer Money](screenshots/transferMoney.png)
*Comprehensive transfer system with account number search and user selection capabilities*

![Withdraw Money](screenshots/withdrawMoney.png)
*Secure withdrawal interface with balance validation and transaction confirmation*

## ✨ Features Overview

### 🔐 Authentication & Security
- JWT-based authentication with secure password hashing
- Rate limiting and input validation
- CORS protection and security headers
- Session management with automatic logout

### 🏦 Account Management
- Automatic savings account creation with $1000 welcome bonus
- Unique account numbers (ACC format)
- Real-time balance tracking
- Account status management

### 💰 Banking Operations
- **Deposits**: Add money to your account with validation
- **Withdrawals**: Remove money with balance verification
- **Transfers**: Send money between users with dual search methods:
  - Search by account number
  - Select from user list
- Real-time balance updates
- Complete transaction history

### 👥 User Features
- Secure user registration with personal details
- User discovery for easy transfers
- Account search functionality
- Masked email display for privacy

### 📱 User Interface
- Modern responsive design with Tailwind CSS
- Clean and intuitive banking interface
- Form validation with user-friendly error messages
- Real-time notifications for all actions
- Mobile-friendly design

### 🔍 Transaction Management
- Transaction status tracking
- Detailed transaction records

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account

### Installation & Setup

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd FullStackBankingApplication
   npm run install:all
   ```

2. **Configure environment**
   
   Backend (`backend/.env`):
   ```env
   NODE_ENV=development
   PORT=3001
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/banking
   JWT_SECRET=your-super-secret-jwt-key
   ```
   
   Frontend (`frontend/.env`):
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

3. **Start the application**
   ```bash
   npm run dev
   ```
   
   Access at: `http://localhost:3000`

## 💻 Development Commands

```bash
npm run dev                    # Start both frontend and backend
npm run backend:dev           # Start backend only
npm run frontend:dev          # Start frontend only
npm run build                 # Build for production
npm run test                  # Run tests
```

## 🛠️ Technology Stack

**Frontend**: React 18, Vite, Tailwind CSS

**Backend**: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Express Validator

**Database**: MongoDB Atlas with optimized indexes