import Tesseract from 'tesseract.js';
import fs from 'fs/promises';
import pdfParse from 'pdf-parse';

// Extract text from image using OCR
export const extractTextFromImage = async (imagePath) => {
  try {
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
      logger: m => console.log(m) // Log progress
    });
    return text;
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error('Failed to extract text from image');
  }
};

// Extract text from PDF
export const extractTextFromPDF = async (pdfPath) => {
  try {
    const pdfBuffer = await fs.readFile(pdfPath);
    const data = await pdfParse(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

// Parse bank statement or transaction history from text
export const parseTransactionHistory = (text) => {
  const transactions = [];
  const lines = text.split('\n');
  
  // Look for transaction patterns
  // This is a simplified parser - in real-world apps, you'd need more sophisticated parsing
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) continue;
    
    // Look for date patterns (MM/DD/YYYY or YYYY-MM-DD)
    const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/;
    const amountRegex = /\$?(\d+\.?\d*)/;
    
    const dateMatch = trimmedLine.match(dateRegex);
    const amountMatch = trimmedLine.match(amountRegex);
    
    if (dateMatch && amountMatch) {
      const date = dateMatch[1];
      const amount = parseFloat(amountMatch[1]);
      
      // Simple description extraction (everything before the amount)
      const description = trimmedLine.split(amountMatch[0])[0].trim();
      
      transactions.push({
        date,
        amount,
        description,
        type: 'expense', // Default to expense, can be refined
        category: 'Other'
      });
    }
  }
  
  return transactions;
};