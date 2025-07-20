import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import axios from 'axios';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Analytics() {
  const [stats, setStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const response = await axios.get('/transactions/stats');
      setStats(response.data.stats);
      setMonthlyStats(response.data.monthlyStats);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for expense by category chart
  const prepareExpenseByCategoryData = () => {
    const expenseStats = stats.filter(stat => stat.type === 'expense');
    
    const labels = expenseStats.map(stat => stat.category);
    const data = expenseStats.map(stat => parseFloat(stat.total));
    
    const backgroundColors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
    ];

    return {
      labels,
      datasets: [
        {
          label: 'Expenses by Category',
          data,
          backgroundColor: backgroundColors.slice(0, labels.length),
          borderColor: backgroundColors.slice(0, labels.length),
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for monthly trends chart
  const prepareMonthlyTrendsData = () => {
    const months = [...new Set(monthlyStats.map(stat => stat.month))].sort();
    
    const incomeData = months.map(month => {
      const incomeForMonth = monthlyStats.find(stat => stat.month === month && stat.type === 'income');
      return incomeForMonth ? parseFloat(incomeForMonth.total) : 0;
    });
    
    const expenseData = months.map(month => {
      const expenseForMonth = monthlyStats.find(stat => stat.month === month && stat.type === 'expense');
      return expenseForMonth ? parseFloat(expenseForMonth.total) : 0;
    });

    return {
      labels: months.map(month => {
        const [year, monthNum] = month.split('-');
        return new Date(year, monthNum - 1).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
      }),
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          borderColor: '#28a745',
          backgroundColor: 'rgba(40, 167, 69, 0.2)',
          tension: 0.4,
        },
        {
          label: 'Expenses',
          data: expenseData,
          borderColor: '#dc3545',
          backgroundColor: 'rgba(220, 53, 69, 0.2)',
          tension: 0.4,
        },
      ],
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Financial Overview',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toFixed(2);
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Expenses by Category',
      },
    },
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

  if (stats.length === 0) {
    return (
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <h1 className="mb-4">📊 Analytics</h1>
            <div className="card">
              <div className="card-body text-center py-5">
                <h5 className="card-title">No Data Available</h5>
                <p className="card-text text-muted">
                  Start adding transactions to see your financial analytics and insights.
                </p>
                <a href="/add-transaction" className="btn btn-primary">
                  Add Your First Transaction
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const expenseByCategoryData = prepareExpenseByCategoryData();
  const monthlyTrendsData = prepareMonthlyTrendsData();

  // Calculate summary statistics
  const totalIncome = stats
    .filter(stat => stat.type === 'income')
    .reduce((sum, stat) => sum + parseFloat(stat.total), 0);

  const totalExpenses = stats
    .filter(stat => stat.type === 'expense')
    .reduce((sum, stat) => sum + parseFloat(stat.total), 0);

  const topExpenseCategory = stats
    .filter(stat => stat.type === 'expense')
    .sort((a, b) => parseFloat(b.total) - parseFloat(a.total))[0];

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">📊 Analytics</h1>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h6 className="card-title">Total Income</h6>
              <h4>${totalIncome.toFixed(2)}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <h6 className="card-title">Total Expenses</h6>
              <h4>${totalExpenses.toFixed(2)}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h6 className="card-title">Net Savings</h6>
              <h4>${(totalIncome - totalExpenses).toFixed(2)}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <h6 className="card-title">Top Expense</h6>
              <h6>{topExpenseCategory?.category || 'N/A'}</h6>
              <small>${topExpenseCategory ? parseFloat(topExpenseCategory.total).toFixed(2) : '0.00'}</small>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row">
        {/* Monthly Trends */}
        {monthlyTrendsData.labels.length > 0 && (
          <div className="col-lg-8 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Monthly Trends</h5>
                <div style={{ position: 'relative', height: '400px' }}>
                  <Line data={monthlyTrendsData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expenses by Category */}
        {expenseByCategoryData.labels.length > 0 && (
          <div className="col-lg-4 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Expense Categories</h5>
                <div style={{ position: 'relative', height: '400px' }}>
                  <Doughnut data={expenseByCategoryData} options={doughnutOptions} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Breakdown Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Category Breakdown</h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Type</th>
                      <th>Total Amount</th>
                      <th>Transaction Count</th>
                      <th>Average Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats
                      .sort((a, b) => parseFloat(b.total) - parseFloat(a.total))
                      .map((stat) => (
                        <tr key={`${stat.type}-${stat.category}`}>
                          <td>{stat.category}</td>
                          <td>
                            <span className={`badge ${stat.type === 'income' ? 'bg-success' : 'bg-danger'}`}>
                              {stat.type === 'income' ? '📈' : '📉'} {stat.type}
                            </span>
                          </td>
                          <td className={stat.type === 'income' ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                            ${parseFloat(stat.total).toFixed(2)}
                          </td>
                          <td>{stat.count}</td>
                          <td>${(parseFloat(stat.total) / stat.count).toFixed(2)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;