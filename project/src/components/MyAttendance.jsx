import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  ClipboardCheck, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  TrendingUp,
  BarChart3
} from 'lucide-react';

const MyAttendance = () => {
  const { user, isAdmin } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchMyAttendance();
    fetchMyClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      calculateStats();
    }
  }, [selectedClass, attendance]);

  const fetchMyAttendance = async () => {
    if (!user) return;
    
    try {
      const response = await axios.get(`http://localhost:5000/api/attendance/student/${user.id}`);
      setAttendance(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyClasses = async () => {
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

  const calculateStats = () => {
    if (!selectedClass) return;
    
    const classAttendance = attendance.filter(record => record.classId._id === selectedClass);
    const total = classAttendance.length;
    const present = classAttendance.filter(record => record.status === 'present').length;
    const late = classAttendance.filter(record => record.status === 'late').length;
    const absent = classAttendance.filter(record => record.status === 'absent').length;
    
    setStats({
      total,
      present,
      late,
      absent,
      presentPercentage: total > 0 ? Math.round((present / total) * 100) : 0,
      latePercentage: total > 0 ? Math.round((late / total) * 100) : 0,
      absentPercentage: total > 0 ? Math.round((absent / total) * 100) : 0
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'absent': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'late': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-100';
      case 'absent': return 'text-red-600 bg-red-100';
      case 'late': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isAdmin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Student View Only</h2>
        <p className="text-gray-600 mt-2">This page is only available for students.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const selectedClassData = classes.find(c => c._id === selectedClass);
  const filteredAttendance = selectedClass 
    ? attendance.filter(record => record.classId._id === selectedClass)
    : attendance;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-gray-600 mt-2">Track your attendance across all enrolled classes</p>
      </div>

      {/* Class Filter */}
      {classes.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Filter by Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full md:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Classes</option>
            {classes.map((classItem) => (
              <option key={classItem._id} value={classItem._id}>
                {classItem.name} ({classItem.code})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Statistics Cards */}
      {selectedClass && stats.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Classes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Present</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.presentPercentage}%</p>
                <p className="text-sm text-gray-500">{stats.present} classes</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Late</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.latePercentage}%</p>
                <p className="text-sm text-gray-500">{stats.late} classes</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Absent</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.absentPercentage}%</p>
                <p className="text-sm text-gray-500">{stats.absent} classes</p>
              </div>
              <div className="p-3 rounded-lg bg-red-500">
                <XCircle className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Class Info */}
      {selectedClassData && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center space-x-4">
            <BookOpen className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold">{selectedClassData.name}</h2>
              <p className="text-blue-100">
                {selectedClassData.code} • {selectedClassData.instructor}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Records */}
      {filteredAttendance.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAttendance
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {new Date(record.date).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {record.classId.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.classId.code}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {getStatusIcon(record.status)}
                          <span className="capitalize">{record.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">
                          {record.notes || '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <ClipboardCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Attendance Records</h3>
          <p className="text-gray-600">
            {selectedClass 
              ? "No attendance records found for this class yet."
              : "You don't have any attendance records yet. Attend some classes to see your records here."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default MyAttendance;