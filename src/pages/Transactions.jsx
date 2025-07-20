import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: 'all',
    category: 'all'
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, filters]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/transactions');
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Date range filter
    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filters.type);
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(transaction => transaction.category === filters.category);
    }

    setFilteredTransactions(filtered);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      type: 'all',
      category: 'all'
    });
  };

  const getTotalAmount = () => {
    return filteredTransactions.reduce((total, transaction) => {
      return transaction.type === 'income' 
        ? total + parseFloat(transaction.amount)
        : total - parseFloat(transaction.amount);
    }, 0);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Transactions</h1>
            <Link to="/add-transaction" className="btn btn-primary">
              ➕ Add Transaction
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Filters</h5>
          <div className="row">
            <div className="col-md-3">
              <label htmlFor="startDate" className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                id="startDate"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-3">
              <label htmlFor="endDate" className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                id="endDate"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-2">
              <label htmlFor="type" className="form-label">Type</label>
              <select
                className="form-select"
                id="type"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
              >
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="col-md-3">
              <label htmlFor="category" className="form-label">Category</label>
              <select
                className="form-select"
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-1 d-flex align-items-end">
              <button className="btn btn-secondary" onClick={clearFilters}>
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row text-center">
            <div className="col-md-4">
              <h6>Filtered Transactions</h6>
              <h4>{filteredTransactions.length}</h4>
            </div>
            <div className="col-md-4">
              <h6>Total Income</h6>
              <h4 className="text-success">
                ${filteredTransactions
                  .filter(t => t.type === 'income')
                  .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                  .toFixed(2)}
              </h4>
            </div>
            <div className="col-md-4">
              <h6>Total Expenses</h6>
              <h4 className="text-danger">
                ${filteredTransactions
                  .filter(t => t.type === 'expense')
                  .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                  .toFixed(2)}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="card-body">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No transactions found matching your filters.</p>
              <Link to="/add-transaction" className="btn btn-primary">
                Add Your First Transaction
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{new Date(transaction.date).toLocaleDateString()}</td>
                      <td>{transaction.description || 'No description'}</td>
                      <td>
                        <span className="badge bg-secondary">
                          {transaction.category}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${transaction.type === 'income' ? 'bg-success' : 'bg-danger'}`}>
                          {transaction.type === 'income' ? '📈' : '📉'} {transaction.type}
                        </span>
                      </td>
                      <td className={transaction.type === 'income' ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                        {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                      </td>
                      <td>
                        {transaction.receipt_path ? (
                          <a 
                            href={`http://localhost:5000/${transaction.receipt_path}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-info"
                          >
                            📎 View
                          </a>
                        ) : (
                          <span className="text-muted">No receipt</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Transactions;