import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ReceiptUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [categories, setCategories] = useState([]);

  React.useEffect(() => {
    fetchCategories();
  }, [formData.type]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`/categories/${formData.type}`);
      setCategories(response.data.categories);
      
      if (response.data.categories.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: response.data.categories[0].name }));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError('');
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const processReceipt = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('receipt', file);

      const response = await axios.post('/transactions/process-receipt', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResult(response.data);
      
      // Auto-fill form with extracted data
      if (response.data.extractedData) {
        const extracted = response.data.extractedData;
        setFormData(prev => ({
          ...prev,
          amount: extracted.amount || prev.amount,
          description: extracted.description || prev.description,
          category: extracted.category || prev.category
        }));
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to process receipt');
    } finally {
      setProcessing(false);
    }
  };

  const saveTransaction = async () => {
    try {
      // Validate amount
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        setError('Please enter a valid amount');
        return;
      }

      const submitData = new FormData();
      submitData.append('type', formData.type);
      submitData.append('amount', formData.amount);
      submitData.append('category', formData.category);
      submitData.append('description', formData.description);
      submitData.append('date', formData.date);
      
      if (file) {
        submitData.append('receipt', file);
      }

      await axios.post('/transactions', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Redirect to transactions page
      navigate('/transactions');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save transaction');
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">📄 Receipt Upload & Processing</h1>
        </div>
      </div>

      <div className="row">
        {/* File Upload Section */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Upload Receipt</h5>
              <p className="text-muted">
                Upload an image (JPG, PNG) or PDF receipt to automatically extract transaction data.
              </p>
              
              <div className="mb-3">
                <input
                  type="file"
                  className="form-control"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                />
                <div className="form-text">
                  Supported formats: Images (JPG, PNG) and PDF files (max 5MB)
                </div>
              </div>

              <button 
                className="btn btn-primary w-100"
                onClick={processReceipt}
                disabled={!file || processing}
              >
                {processing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Processing Receipt...
                  </>
                ) : (
                  '🔍 Process Receipt'
                )}
              </button>

              {error && (
                <div className="alert alert-danger mt-3" role="alert">
                  {error}
                </div>
              )}

              {result && (
                <div className="mt-3">
                  <div className="alert alert-success">
                    ✅ Receipt processed successfully!
                  </div>
                  
                  <div className="card bg-light">
                    <div className="card-body">
                      <h6 className="card-title">Extracted Data:</h6>
                      {result.extractedData && (
                        <div className="mb-2">
                          <strong>Amount:</strong> ${result.extractedData.amount || 'Not detected'}<br/>
                          <strong>Description:</strong> {result.extractedData.description || 'Not detected'}<br/>
                          <strong>Category:</strong> {result.extractedData.category || 'Other'}
                        </div>
                      )}
                      
                      <details>
                        <summary className="btn btn-sm btn-outline-secondary">View Full Text</summary>
                        <div className="mt-2 p-2 bg-white border rounded">
                          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.85em' }}>
                            {result.extractedText}
                          </pre>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transaction Form Section */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Transaction Details</h5>
              <p className="text-muted">
                Review and edit the transaction details before saving.
              </p>

              <form>
                <div className="mb-3">
                  <label htmlFor="type" className="form-label">Type</label>
                  <select
                    className="form-select"
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleFormChange}
                  >
                    <option value="expense">💸 Expense</option>
                    <option value="income">💰 Income</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="amount" className="form-label">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="form-control"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleFormChange}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="category" className="form-label">Category</label>
                  <select
                    className="form-select"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    required
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Enter a description..."
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="date" className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="d-grid gap-2">
                  <button 
                    type="button"
                    className="btn btn-success btn-lg"
                    onClick={saveTransaction}
                    disabled={!formData.amount || parseFloat(formData.amount) <= 0}
                  >
                    💾 Save Transaction
                  </button>
                  <button 
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/transactions')}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="row">
        <div className="col-12">
          <div className="card bg-light">
            <div className="card-body">
              <h6 className="card-title">💡 Tips for Better OCR Results</h6>
              <ul className="mb-0">
                <li>Ensure the receipt is well-lit and clearly visible</li>
                <li>Avoid shadows and reflections on the receipt</li>
                <li>Make sure the text is horizontal and not skewed</li>
                <li>For PDFs, ensure the text is selectable (not scanned images)</li>
                <li>Higher resolution images generally produce better results</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceiptUpload;