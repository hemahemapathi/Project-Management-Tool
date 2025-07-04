import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import { getReports, deleteReport, getReport } from '../../services/api';
import { DeleteOutlined, EyeOutlined, PlusOutlined, FileTextOutlined, BarChartOutlined, DownloadOutlined } from '@ant-design/icons';
import { Line } from 'react-chartjs-2';
import { FaExclamationTriangle } from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';
import './reportlist.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend);

const ReportList = () => {
  const navigate = useNavigate(); 
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('table');

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, filterType]);

  const fetchReports = async () => {
    try {
      const response = await getReports();
      setReports(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = reports;
    
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.project?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.generatedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(report => report.type === filterType);
    }
    
    setFilteredReports(filtered);
  };

  const handleDelete = async (reportId) => {
    try {
      await deleteReport(reportId);
      fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const handleView = async (reportId) => {
    try {
      const response = await getReport(reportId);
      setSelectedReport(response.data);
      setIsModalOpen(true);
      prepareChartData(response.data);
    } catch (error) {
      console.error('Error fetching report details:', error);
    }
  };

  const prepareChartData = (report) => {
    if (report && report.data) {
      const labels = Object.keys(report.data);
      const data = Object.values(report.data);

      setChartData({
        labels: labels,
        datasets: [
          {
            label: `${report.type} Report Data`,
            data: data,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            pointBackgroundColor: '#6366f1',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
          },
        ],
      });
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
    setChartData(null);
  };

  
  const handleCreateReport = () => {
    navigate('/reports/create');
  };

  
  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
  };

  const getReportTypeColor = (type) => {
    const colors = {
      'Progress': 'success',
      'BudgetUtilization': 'info',
      'Timeline': 'warning',
      'Performance': 'primary',
      'default': 'secondary'
    };
    return colors[type] || colors.default;
  };

  const getReportTypeIcon = (type) => {
    const icons = {
      'Progress': '📊',
      'BudgetUtilization': '💰',
      'Timeline': '📅',
      'Performance': '⚡',
      'default': '📄'
    };
    return icons[type] || icons.default;
  };

  const getStatsData = () => {
    return {
      total: reports.length,
      progress: reports.filter(r => r.type === 'Progress').length,
      budget: reports.filter(r => r.type === 'BudgetUtilization').length,
      timeline: reports.filter(r => r.type === 'Timeline').length,
      performance: reports.filter(r => r.type === 'Performance').length,
    };
  };

  const stats = getStatsData();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const renderTableView = () => (
    <div className="table-container">
      <div className="table-wrapper">
        <table className="reports-table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Project</th>
              <th className="table-header-cell">Type</th>
              <th className="table-header-cell">Created By</th>
              <th className="table-header-cell">Created At</th>
              
            </tr>
          </thead>
          <tbody className="table-body">
            {loading ? (
              <tr>
                <td colSpan={5} className="loading-cell">
                  <div className="loading-spinner">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="loading-text">Loading reports...</p>
                  </div>
                </td>
              </tr>
            ) : filteredReports.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-state-cell">
                  <div className="empty-state">
                    <i className="fas fa-inbox empty-icon"></i>
                    <h5 className="empty-title">No reports found</h5>
                    <p className="empty-description">Try adjusting your search or filter criteria</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <tr key={report._id} className="table-row">
                  <td className="table-cell">
                    <div className="project-info">
                      <div className="project-avatar">
                        {(report.project?.name || 'N').charAt(0).toUpperCase()}
                      </div>
                      <div className="project-details">
                        <div className="project-name">{report.project?.name || 'N/A'}</div>
                        <div className="project-type">Project Report</div>
                      </div>
                    </div>
                    </td>
                  <td className="table-cell">
                    <div className="user-info">
                      <div className="user-avatar">
                        {(report.generatedBy?.name || 'N').charAt(0).toUpperCase()}
                      </div>
                      <span className="user-name">{report.generatedBy?.name || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    {report.generatedAt ? (
                      <div className="date-info">
                        <div className="date-primary">{formatDate(report.generatedAt)}</div>
                        <div className="date-secondary">{formatTime(report.generatedAt)}</div>
                      </div>
                    ) : (
                      <span className="date-primary">N/A</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <div className="action-buttons">
                      <button 
                        className="action-btn btn btn-outline-primary"
                        onClick={() => handleView(report._id)}
                      >
                        <EyeOutlined />
                        <span className="d-none d-sm-inline ms-1">View</span>
                      </button>
                      <button 
                        className="action-btn btn btn-outline-danger"
                        onClick={() => handleDelete(report._id)}
                      >
                        <DeleteOutlined />
                        <span className="d-none d-sm-inline ms-1">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {filteredReports.length > 0 && (
        <div className="pagination-wrapper">
          <span className="pagination-text">
            Showing {filteredReports.length} of {reports.length} reports
          </span>
          <nav className="pagination-nav">
            <ul className="pagination mb-0">
              <li className="page-item disabled">
                <span className="page-link">Previous</span>
              </li>
              <li className="page-item active">
                <span className="page-link">1</span>
              </li>
              <li className="page-item disabled">
                <span className="page-link">Next</span>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );

  const renderCardView = () => (
    <div className="cards-container">
      {filteredReports.map((report) => (
        <div key={report._id} className="report-card">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <span className={`report-badge bg-${getReportTypeColor(report.type)}`}>
                {getReportTypeIcon(report.type)} {report.type}
              </span>
            </div>
          </div>
          
          <div className="card-body">
            <h6 className="project-name mb-2">{report.project?.name || 'N/A'}</h6>
            
            <div className="user-info mb-3">
              <div className="user-avatar">
                {(report.generatedBy?.name || 'N').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="user-name">{report.generatedBy?.name || 'N/A'}</div>
                <small className="date-secondary">
                  {formatDate(report.generatedAt)}
                </small>
              </div>
            </div>
            
            <div className="action-buttons">
              <button 
                className="action-btn btn btn-primary flex-fill"
                onClick={() => handleView(report._id)}
              >
                <EyeOutlined className="me-1" />
                View Report
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="report-dashboard">
      <div className="report-container">
         {/* Header Section - Fixed Alignment */}
                <div className="team-header">
                  <div className="header-content-wrapper">
                    <div className="header-left">
                      <div className="page-title-section">
                        <h1 className="page-title">
                          <FaExclamationTriangle className="title-icon" />
                          <span className="title-text">Report Dashboard</span>
                        </h1>
                        <p className="page-subtitle">Manage your project teams and members</p>
                      </div>
                    </div>
                     <button 
                className="btn btn-primary btn-create"
                onClick={handleCreateReport}
              >
                <PlusOutlined className="me-2" />
                Create New Report
              </button>
                  </div>
                </div>
       

        {/* Stats Cards */}
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-icon bg-primary">
                  <i className="fas fa-chart-bar"></i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-number">{stats.total}</h3>
                  <p className="stat-label">Total Reports</p>
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-icon bg-success">
                  <i className="fas fa-tasks"></i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-number">{stats.progress}</h3>
                  <p className="stat-label">Progress Reports</p>
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-icon bg-info">
                  <i className="fas fa-dollar-sign"></i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-number">{stats.budget}</h3>
                  <p className="stat-label">Budget Reports</p>
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-icon bg-warning">
                  <i className="fas fa-calendar"></i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-number">{stats.timeline}</h3>
                  <p className="stat-label">Timeline Reports</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="filters-section">
          <div className="filters-card">
            <div className="filters-grid">
              <div className="filter-group">
                <label className="filter-label">Search Reports</label>
                <div className="search-input-wrapper">
                  <i className="fas fa-search search-icon"></i>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search by project, type, or creator..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="filter-group">
                <label className="filter-label">Filter by Type</label>
                <select 
                  className="filter-select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="Progress">Progress</option>
                  <option value="BudgetUtilization">Budget Utilization</option>
                  <option value="Timeline">Timeline</option>
                  <option value="Performance">Performance</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label className="filter-label">View Mode</label>
                <div className="view-mode-toggle">
                  <button 
                    type="button" 
                    className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                    onClick={() => setViewMode('table')}
                  >
                    <i className="fas fa-table me-1"></i>
                    <span className="d-none d-sm-inline">Table</span>
                  </button>
                  <button 
                    type="button" 
                    className={`view-btn ${viewMode === 'card' ? 'active' : ''}`}
                    onClick={() => setViewMode('card')}
                  >
                    <i className="fas fa-th-large me-1"></i>
                    <span className="d-none d-sm-inline">Cards</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Content */}
        <div className="content-section">
          {viewMode === 'table' ? renderTableView() : renderCardView()}
        </div>
      </div>

      {/* View Report Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title">
                <FileTextOutlined />
                Report Details
              </h5>
              <button type="button" className="modal-close" onClick={handleModalClose}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {selectedReport && (
                <div>
                  <div className="report-details-grid">
                    <div className="detail-card">
                      <h6 className="detail-title">Report Information</h6>
                      <div className="detail-item">
                        <div className="detail-label">Report Type</div>
                        <div className="detail-value">
                          <span className={`report-badge bg-${getReportTypeColor(selectedReport.type)}`}>
                            {getReportTypeIcon(selectedReport.type)} {selectedReport.type}
                          </span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Project</div>
                        <div className="detail-value">{selectedReport.project?.name || 'N/A'}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Generated</div>
                        <div className="detail-value">
                          {formatDate(selectedReport.generatedAt)} {formatTime(selectedReport.generatedAt)}
                        </div>
                      </div>
                    </div>
                    <div className="detail-card">
                      <h6 className="detail-title">Creator Information</h6>
                      <div className="creator-info">
                        <div className="creator-avatar">
                          {(selectedReport.generatedBy?.name || 'N').charAt(0).toUpperCase()}
                        </div>
                        <div className="creator-details">
                          <div className="creator-name">{selectedReport.generatedBy?.name || 'N/A'}</div>
                          <div className="creator-email">{selectedReport.generatedBy?.email || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {chartData && (
                    <div className="chart-section">
                      <div className="chart-header">
                        <h6 className="chart-title">
                          <BarChartOutlined />
                          Report Data Visualization
                        </h6>
                      </div>
                      <div className="chart-container">
                        <Line 
                          data={chartData} 
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'top',
                                labels: {
                                  usePointStyle: true,
                                  padding: 20,
                                  color: '#374151'
                                }
                              },
                              title: {
                                display: true,
                                text: `${selectedReport.type} Report Analysis`,
                                font: {
                                  size: 16,
                                  weight: 'bold'
                                },
                                color: '#374151'
                              },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                grid: {
                                  color: 'rgba(0,0,0,0.1)',
                                },
                                ticks: {
                                  color: '#6b7280'
                                }
                              },
                              x: {
                                grid: {
                                  color: 'rgba(0,0,0,0.1)',
                                },
                                ticks: {
                                  color: '#6b7280'
                                }
                              }
                            }
                          }} 
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={handleModalClose}>
                Close
              </button>
              <button type="button" className="btn btn-primary">
                <DownloadOutlined className="me-1" />
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Report Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={handleCreateModalClose}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title">
                <PlusOutlined />
                Create New Report
              </h5>
              <button type="button" className="modal-close" onClick={handleCreateModalClose}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <CreateReport onClose={handleCreateModalClose} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportList;

                      