import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense']
  },
  color: {
    type: String,
    default: '#007bff'
  }
}, {
  timestamps: true
});

// Ensure unique category names per type
categorySchema.index({ name: 1, type: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);

// Create default categories
const createDefaultCategories = async () => {
  try {
    const existingCategories = await Category.countDocuments();
    
    if (existingCategories === 0) {
      const defaultCategories = [
        // Income categories
        { name: 'Salary', type: 'income', color: '#28a745' },
        { name: 'Freelance', type: 'income', color: '#20c997' },
        { name: 'Investment', type: 'income', color: '#17a2b8' },
        { name: 'Other Income', type: 'income', color: '#6f42c1' },
        
        // Expense categories
        { name: 'Food', type: 'expense', color: '#dc3545' },
        { name: 'Transportation', type: 'expense', color: '#fd7e14' },
        { name: 'Entertainment', type: 'expense', color: '#6f42c1' },
        { name: 'Utilities', type: 'expense', color: '#6c757d' },
        { name: 'Healthcare', type: 'expense', color: '#e83e8c' },
        { name: 'Shopping', type: 'expense', color: '#ffc107' },
        { name: 'Other', type: 'expense', color: '#343a40' }
      ];

      await Category.insertMany(defaultCategories);
      console.log('Default categories created');
    }
  } catch (error) {
    console.error('Error creating default categories:', error);
  }
};

// Call this function when the app starts
createDefaultCategories();

export default Category;