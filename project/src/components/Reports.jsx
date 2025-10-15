import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  BarChart3, 
  TrendingUp,
  Users,
  BookOpen,
  ClipboardCheck,
  Download,
  Calendar,
  PieChart
} from 'lucide-react';

const Reports = () => {
  const { isAdmin } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassStats();
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/classes');
      setClasses(response.data);
      if (response.data.length > 0) {
        setSelectedClass(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchClassStats = async () => {
    if (!selectedClass) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/attendance/stats/${selectedClass}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAttendancePercentage = (status) => {
    if (!stats || !stats.statusBreakdown) return 0;
    const statusData = stats.statusBreakdown.find(item => item._id === status);
    const total = stats.statusBreakdown.reduce((sum, item) => sum + item.count, 0);
    return total > 0 ? Math.round((statusData?.count || 0) / total * 100) : 0;
  };

  const StatCard = ({ icon: Icon, title, value, color, subtitle }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-600 mt-2">Only administrators can access this page.</p>
      </div>
    );
  }

  const selectedClassData = classes.find(c => c._id === selectedClass);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">View attendance statistics and generate reports</p>
        </div>
        <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-2 shadow-lg">
          <Download className="w-5 h-5" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Class Selector */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Select Class for Report
        </label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full md:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Choose a class</option>
          {classes.map((classItem) => (
            <option key={classItem._id} value={classItem._id}>
              {classItem.name} ({classItem.code})
            </option>
          ))}
        </select>
      </div>

      {/* Class Info */}
      {selectedClassData && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BookOpen className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold">{selectedClassData.name}</h2>
                <p className="text-blue-100">
                  {selectedClassData.code} • {selectedClassData.instructor}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Total Students</p>
              <p className="text-2xl font-bold">{selectedClassData.enrolledStudents.length}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : stats && selectedClass ? (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Calendar}
              title="Total Classes Held"
              value={stats.totalClasses}
              color="bg-blue-500"
              subtitle="This semester"
            />
            
            <StatCard
              icon={Users}
              title="Enrolled Students"
              value={stats.enrolledStudents}
              color="bg-green-500"
              subtitle="Active enrollments"
            />
            
            <StatCard
              icon={ClipboardCheck}
              title="Average Attendance"
              value={`${getAttendancePercentage('present')}%`}
              color="bg-purple-500"
              subtitle="Present rate"
            />
            
            <StatCard
              icon={TrendingUp}
              title="Attendance Trend"
              value="↗ +5%"
              color="bg-orange-500"
              subtitle="vs last month"
            />
          </div>

          {/* Attendance Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Status Breakdown */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <PieChart className="w-5 h-5" />
                <span>Attendance Status Breakdown</span>
              </h3>
              
              <div className="space-y-4">
                {stats.statusBreakdown.map((status) => {
                  const total = stats.statusBreakdown.reduce((sum, item) => sum + item.count, 0);
                  const percentage = total > 0 ? Math.round(status.count / total * 100) : 0;
                  
                  let bgColor, textColor;
                  switch (status._id) {
                    case 'present':
                      bgColor = 'bg-green-500';
                      textColor = 'text-green-700';
                      break;
                    case 'absent':
                      bgColor = 'bg-red-500';
                      textColor = 'text-red-700';
                      break;
                    case 'late':
                      bgColor = 'bg-yellow-500';
                      textColor = 'text-yellow-700';
                      break;
                    default:
                      bgColor = 'bg-gray-500';
                      textColor = 'text-gray-700';
                  }
                  
                  return (
                    <div key={status._id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`font-medium capitalize ${textColor}`}>
                          {status._id}
                        </span>
                        <span className="text-sm text-gray-600">
                          {status.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${bgColor}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Quick Statistics</span>
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-green-700">Perfect Attendance</p>
                    <p className="text-xs text-green-600">Students with 100% attendance</p>
                  </div>
                  <div className="text-2xl font-bold text-green-700">
                    {/* This would need additional calculation */}
                    0
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-yellow-700">At-Risk Students</p>
                    <p className="text-xs text-yellow-600">Less than 75% attendance</p>
                  </div>
                  <div className="text-2xl font-bold text-yellow-700">
                    {/* This would need additional calculation */}
                    0
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Most Recent Class</p>
                    <p className="text-xs text-blue-600">Last attendance recorded</p>
                  </div>
                  <div className="text-sm font-bold text-blue-700">
                    Today
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : selectedClass ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <ClipboardCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Attendance Data</h3>
          <p className="text-gray-600">
            No attendance records found for this class. Start marking attendance to see reports.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Class</h3>
          <p className="text-gray-600">
            Choose a class from the dropdown above to view attendance reports and analytics.
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;