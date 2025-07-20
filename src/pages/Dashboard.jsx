import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get recent transactions (last 30 days)
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const [transactionsResponse, statsResponse] = await Promise.all([
        axios.get(`/transactions?startDate=${startDate}&endDate=${endDate}`),
        axios.get('/transactions/stats')
      ]);

      const transactions = transactionsResponse.data.transactions;
      const transactionStats = statsResponse.data.stats;

      // Calculate totals
      const totalIncome = transactionStats
        .filter(stat => stat.type === 'income')
        .reduce((sum, stat) => sum + parseFloat(stat.total), 0);

      const totalExpenses = transactionStats
        .filter(stat => stat.type === 'expense')
        .reduce((sum, stat) => sum + parseFloat(stat.total), 0);

      setStats({
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        recentTransactions: transactions.slice(0, 5) // Last 5 transactions
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
          <h1 className="mb-4">Welcome back, {user?.username}! 👋</h1>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card text-white bg-success">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title">Total Income</h6>
                  <h3 className="mb-0">${stats.totalIncome.toFixed(2)}</h3>
                </div>
                <div className="fs-1">💰</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card text-white bg-danger">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title">Total Expenses</h6>
                  <h3 className="mb-0">${stats.totalExpenses.toFixed(2)}</h3>
                </div>
                <div className="fs-1">💸</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className={`card text-white ${stats.balance >= 0 ? 'bg-info' : 'bg-warning'}`}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title">Balance</h6>
                  <h3 className="mb-0">${stats.balance.toFixed(2)}</h3>
                </div>
                <div className="fs-1">📊</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Quick Actions</h5>
              <div className="row">
                <div className="col-md-3 mb-2">
                  <Link to="/add-transaction" className="btn btn-primary w-100">
                    ➕ Add Transaction
                  </Link>
                </div>
                <div className="col-md-3 mb-2">
                  <Link to="/receipt-upload" className="btn btn-success w-100">
                    📄 Upload Receipt
                  </Link>
                </div>
                <div className="col-md-3 mb-2">
                  <Link to="/analytics" className="btn btn-info w-100">
                    📈 View Analytics
                  </Link>
                </div>
                <div className="col-md-3 mb-2">
                  <Link to="/transactions" className="btn btn-secondary w-100">
                    📋 All Transactions
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Recent Transactions</h5>
                <Link to="/transactions" className="btn btn-sm btn-outline-primary">
                  View All
                </Link>
              </div>
              
              {stats.recentTransactions.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No transactions yet. Start by adding your first transaction!</p>
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
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentTransactions.map((transaction) => (
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
                          <td className={transaction.type === 'income' ? 'text-success' : 'text-danger'}>
                            {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
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
      </div>
    </div>
  );
}

export default Dashboard;