import axios from 'axios';
import {
  BookOpen,
  Calendar,
  ClipboardCheck,
  TrendingUp,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    todayAttendance: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [classesRes, studentsRes, attendanceRes] = await Promise.all([
        axios.get('http://localhost:5000/api/classes'),
        isAdmin ? axios.get('http://localhost:5000/api/students') : Promise.resolve({ data: [] }),
        isAdmin ? axios.get('http://localhost:5000/api/attendance/today/count', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }) : Promise.resolve({ data: { count: 0 } })
      ]);

      setStats({
        totalClasses: classesRes.data.length,
        totalStudents: isAdmin ? studentsRes.data.length : 0,
        todayAttendance: isAdmin ? attendanceRes.data.count : 0,
        recentActivity: []
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, change }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 text-sm font-medium">{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-blue-100">
          {isAdmin
            ? "Manage your classes, teachers, and track student attendance from your dashboard."
            : user?.role === 'teacher'
              ? "View your assigned classes, mark attendance, manage results, and view your timetable."
              : "View your classes and attendance records from your dashboard."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={BookOpen}
          title={isAdmin ? "Total Classes" : "My Classes"}
          value={stats.totalClasses}
          color="bg-blue-500"
          change="+12% from last month"
        />

        {isAdmin && (
          <StatCard
            icon={Users}
            title="Total Students"
            value={stats.totalStudents}
            color="bg-green-500"
            change="+8% from last month"
          />
        )}

        <StatCard
          icon={ClipboardCheck}
          title="Today's Attendance"
          value={stats.todayAttendance}
          color="bg-purple-500"
          change="95% attendance rate"
        />

        <StatCard
          icon={Calendar}
          title="This Week"
          value="5"
          color="bg-orange-500"
          change="Classes scheduled"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="space-y-4">
          {isAdmin ? (
            <>
              <button
                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-3 px-4 rounded-lg transition-colors text-left"
                onClick={() => navigate('/classes')}
              >
                View Classes
              </button>
              <button
                className="w-full bg-green-50 hover:bg-green-100 text-green-700 font-medium py-3 px-4 rounded-lg transition-colors text-left"
                onClick={() => navigate('/create-student')}
              >
                Add Student
              </button>
              <button
                className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-3 px-4 rounded-lg transition-colors text-left"
                onClick={() => navigate('/attendance')}
              >
                Mark Attendance
              </button>
              <button
                className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium py-3 px-4 rounded-lg transition-colors text-left"
                onClick={() => navigate('/teachers')}
              >
                Manage Teachers
              </button>
            </>
          ) : (
            <>
              <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-3 px-4 rounded-lg transition-colors text-left" onClick={() => navigate('/my-classes')}>
                View My Classes
              </button>
              <button className="w-full bg-green-50 hover:bg-green-100 text-green-700 font-medium py-3 px-4 rounded-lg transition-colors text-left" onClick={() => navigate('/my-attendance')}>
                Check My Attendance
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;