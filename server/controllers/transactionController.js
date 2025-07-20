import Transaction from '../models/Transaction.js';
import { extractTextFromImage, extractTextFromPDF } from '../utils/documentParser.js';

// Add a new transaction
export const addTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;
    const userId = req.user._id;
    
    // Validate input
    if (!type || !amount || !category || !date) {
      return res.status(400).json({ error: 'Type, amount, category, and date are required' });
    }

    // Handle receipt upload if present
    let receiptPath = null;
    if (req.file) {
      receiptPath = req.file.path;
    }

    const transactionData = {
      user: userId,
      type,
      amount: parseFloat(amount),
      category,
      description: description || '',
      date: new Date(date),
      receiptPath
    };

    const newTransaction = new Transaction(transactionData);
    await newTransaction.save();

    res.status(201).json({ 
      message: 'Transaction added successfully',
      transaction: newTransaction 
    });
  } catch (error) {
    console.error('Add transaction error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    
    res.status(500).json({ error: 'Failed to add transaction' });
  }
};

// Get user transactions
export const getTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;
    
    // Build query
    let query = { user: userId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .populate('user', 'username email');
    
    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
};

// Get transaction statistics
export const getTransactionStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get category-wise stats
    const categoryStats = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: { type: '$type', category: '$category' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          type: '$_id.type',
          category: '$_id.category',
          total: 1,
          count: 1
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Get monthly stats
    const monthlyStats = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              {
                $cond: {
                  if: { $lt: ['$_id.month', 10] },
                  then: { $concat: ['0', { $toString: '$_id.month' }] },
                  else: { $toString: '$_id.month' }
                }
              }
            ]
          },
          type: '$_id.type',
          total: 1
        }
      },
      { $sort: { month: 1 } }
    ]);
    
    res.json({ 
      stats: categoryStats, 
      monthlyStats 
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({ error: 'Failed to get transaction statistics' });
  }
};

// Process receipt upload
export const processReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype;
    
    let extractedText = '';
    
    if (fileType.startsWith('image/')) {
      // Process image with OCR
      extractedText = await extractTextFromImage(filePath);
    } else if (fileType === 'application/pdf') {
      // Process PDF
      extractedText = await extractTextFromPDF(filePath);
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Try to extract amount and description from text
    const extractedData = parseReceiptText(extractedText);
    
    res.json({
      message: 'Receipt processed successfully',
      extractedText,
      extractedData,
      filePath
    });
  } catch (error) {
    console.error('Process receipt error:', error);
    res.status(500).json({ error: 'Failed to process receipt' });
  }
};

// Helper function to parse receipt text
function parseReceiptText(text) {
  const data = {
    amount: null,
    description: '',
    category: 'Other'
  };

  // Look for amount patterns (e.g., $12.34, 12.34, etc.)
  const amountRegex = /\$?(\d+\.?\d*)/g;
  const amounts = text.match(amountRegex);
  
  if (amounts && amounts.length > 0) {
    // Take the largest amount found (likely the total)
    const numericAmounts = amounts.map(a => parseFloat(a.replace('$', '')));
    data.amount = Math.max(...numericAmounts);
  }

  // Extract first line as potential description
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  if (lines.length > 0) {
    data.description = lines[0].trim();
  }

  // Simple category detection based on keywords
  const lowerText = text.toLowerCase();
  if (lowerText.includes('restaurant') || lowerText.includes('food') || lowerText.includes('cafe')) {
    data.category = 'Food';
  } else if (lowerText.includes('gas') || lowerText.includes('fuel') || lowerText.includes('uber')) {
    data.category = 'Transportation';
  } else if (lowerText.includes('pharmacy') || lowerText.includes('medical')) {
    data.category = 'Healthcare';
  } else if (lowerText.includes('store') || lowerText.includes('shop')) {
    data.category = 'Shopping';
  }

  return data;
}