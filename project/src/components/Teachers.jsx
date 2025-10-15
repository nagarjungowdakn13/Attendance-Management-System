import axios from 'axios';
import { AlertCircle, CheckCircle, Edit, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/teachers');
      setTeachers(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error fetching teachers' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/teachers', newTeacher);
      setMessage({ type: 'success', text: 'Teacher created successfully!' });
      setShowCreateForm(false);
      setNewTeacher({ firstName: '', lastName: '', username: '', email: '', password: '' });
      fetchTeachers();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error creating teacher' });
    }
  };

  const handleChange = (e) => {
    setNewTeacher({ ...newTeacher, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Teachers</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add Teacher</span>
        </button>
      </div>
      {message.text && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher) => (
          <div key={teacher._id} className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Edit className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{teacher.firstName} {teacher.lastName}</h3>
                <p className="text-sm text-gray-500">{teacher.email}</p>
                <p className="text-xs text-gray-400">Username: {teacher.username}</p>
              </div>
            </div>
            <div className="text-sm text-gray-700 mb-2">Assigned Classes: {teacher.assignedClasses?.length || 0}</div>
            <div className="flex flex-col gap-2 mt-4">
              <button
                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-3 rounded-lg transition-colors"
                onClick={() => navigate(`/teachers/${teacher._id}/classes`)}
              >
                View Assigned Classes
              </button>
              <button
                className="w-full bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2 px-3 rounded-lg transition-colors"
                onClick={() => navigate(`/attendance/class/${teacher.assignedClasses[0]?._id}`)}
              >
                View Attendance
              </button>
              <button
                className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-2 px-3 rounded-lg transition-colors"
                onClick={() => navigate(`/results/teacher/${teacher._id}`)}
              >
                View Results
              </button>
              <button
                className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium py-2 px-3 rounded-lg transition-colors"
                onClick={() => navigate(`/teachers/${teacher._id}/timetable`)}
              >
                View Timetable
              </button>
            </div>
          </div>
        ))}
      </div>
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Teacher</h2>
              <form onSubmit={handleCreateTeacher} className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">First Name *</label>
                  <input type="text" name="firstName" value={newTeacher.firstName} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Last Name *</label>
                  <input type="text" name="lastName" value={newTeacher.lastName} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Username *</label>
                  <input type="text" name="username" value={newTeacher.username} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Email *</label>
                  <input type="email" name="email" value={newTeacher.email} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Password *</label>
                  <input type="password" name="password" value={newTeacher.password} onChange={handleChange} required minLength={6} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div className="flex space-x-4 pt-6">
                  <button type="button" onClick={() => setShowCreateForm(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">Add Teacher</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
