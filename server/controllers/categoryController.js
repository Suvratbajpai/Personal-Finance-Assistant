import Category from '../models/Category.js';

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ type: 1, name: 1 });
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
};

// Get categories by type
export const getCategoriesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const categories = await Category.find({ type }).sort({ name: 1 });
    res.json({ categories });
  } catch (error) {
    console.error('Get categories by type error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
};