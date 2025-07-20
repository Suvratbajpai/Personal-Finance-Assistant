# Personal Finance Assistant

A full-stack web application for managing personal finances with receipt processing capabilities.

## 🎥 Demo Video

[![Watch the demo](https://img.youtube.com/vi/YOUTUBE_VIDEO_ID/maxresdefault.jpg)](https://www.youtube.com/watch?v=Zo_1hcF6zNs)

Click the image above to see a full walkthrough of the Personal Finance Assistant.


## 🌟 Features

- **User Authentication**: Secure signup, login, and logout using Passport.js
- **Transaction Management**: Add, view, and categorize income and expenses
- **Smart Receipt Processing**: Upload receipts (images/PDFs) with automatic OCR text extraction
- **Financial Analytics**: Interactive charts showing expenses by category and monthly trends
- **Date Range Filtering**: View transactions within specific date ranges
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React.js** - User interface library
- **Bootstrap 5** - CSS framework for responsive design
- **Chart.js** - Interactive charts and data visualization
- **Axios** - HTTP client for API requests
- **React Router** - Client-side routing

### Backend
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **Passport.js** - Authentication middleware
- **Multer** - File upload handling
- **Tesseract.js** - OCR (Optical Character Recognition) for receipt processing
- **pdf-parse** - PDF text extraction
- **bcrypt** - Password hashing

## 📂 Project Structure

```
personal-finance-assistant/
├── server/
│   ├── config/
│   │   ├── database.js          # MongoDB connection setup
│   │   └── passport.js          # Authentication setup
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── transactionController.js # Transaction management
│   │   └── categoryController.js # Category management
│   ├── models/
│   │   ├── User.js             # User Mongoose schema
│   │   ├── Transaction.js      # Transaction Mongoose schema
│   │   └── Category.js         # Category Mongoose schema
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── transactions.js     # Transaction routes
│   │   └── categories.js       # Category routes
│   ├── utils/
│   │   └── documentParser.js   # OCR and PDF processing utilities
│   ├── middleware/
│   │   └── auth.js             # Authentication middleware
│   └── server.js               # Main server file
├── src/
│   ├── components/
│   │   └── Navbar.jsx          # Navigation component
│   ├── contexts/
│   │   └── AuthContext.jsx     # Authentication context
│   ├── pages/
│   │   ├── Dashboard.jsx       # Main dashboard
│   │   ├── Login.jsx           # Login page
│   │   ├── Register.jsx        # Registration page
│   │   ├── Transactions.jsx    # Transaction list
│   │   ├── AddTransaction.jsx  # Add transaction form
│   │   ├── Analytics.jsx       # Charts and analytics
│   │   └── ReceiptUpload.jsx   # Receipt processing
│   ├── App.jsx                 # Main app component
│   └── main.jsx                # App entry point
├── .env                        # Environment variables
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Update the `.env` file with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/personal-finance-assistant
   ```
   
   For MongoDB Atlas, use your connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/personal-finance-assistant
   ```

3. **Start the application**:
   ```bash
   npm run dev
   ```

   This will start both the frontend (React) and backend (Express) servers:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Development Scripts

- `npm run dev` - Start both frontend and backend in development mode

### 1. **Create an Account**
- Visit http://localhost:5173
- Click "Register" to create a new account
- Fill in your username, email, and password

### 2. **Add Transactions**
- Navigate to "Add Transaction"
- Select income or expense
- Enter amount, category, description, and date
- Optionally upload a receipt

### 3. **Process Receipts**
- Go to "Receipt Upload"
- Upload an image or PDF receipt
- The app will extract text and suggest transaction details
- Review and save the transaction

### 4. **View Analytics**
- Check the "Analytics" page for visual insights
- See expense breakdowns by category
- Track monthly income vs. expense trends

### 5. **Manage Transactions**
- View all transactions in the "Transactions" page
- Filter by date range, type, or category
- Click on receipt links to view uploaded files

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Transactions
- `POST /api/transactions` - Add a new transaction
- `GET /api/transactions` - Get user transactions (with optional date filters)
- `GET /api/transactions/stats` - Get transaction statistics
- `POST /api/transactions/process-receipt` - Process uploaded receipt

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:type` - Get categories by type (income/expense)


