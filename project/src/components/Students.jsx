import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  Users, 
  Search, 
  BookOpen,
  Mail,
  User,
  Calendar,
  GraduationCap
} from 'lucide-react';

const Students = () => {
  const { isAdmin } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [editMessage, setEditMessage] = useState({ type: '', text: '' });
  const [showStudentDetailsModal, setShowStudentDetailsModal] = useState(false);
  const [studentDetails, setStudentDetails] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (student) => {
    setEditStudent({ ...student, password: '' });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/students/${editStudent._id}`, editStudent);
      setEditMessage({ type: 'success', text: 'Student updated successfully!' });
      setShowEditModal(false);
      setEditStudent(null);
      fetchStudents();
    } catch (error) {
      setEditMessage({ type: 'error', text: error.response?.data?.message || 'Error updating student' });
    }
  };

  const handleViewStudentDetails = async (studentId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/students/${studentId}`);
      setStudentDetails(response.data);
      setShowStudentDetailsModal(true);
    } catch (error) {
      setStudentDetails(null);
      setShowStudentDetailsModal(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-600 mt-2">Only administrators can access this page.</p>
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-2">Manage student accounts and enrollments</p>
        </div>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>{students.length} Total Students</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search students by name, ID, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div key={student._id} className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="p-6">
              {/* Student Header */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">ID: {student.studentId}</p>
                </div>
              </div>

              {/* Student Details */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{student.email}</span>
                </div>
                
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <BookOpen className="w-4 h-4" />
                  <span>{student.enrolledClasses.length} Classes Enrolled</span>
                </div>

                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(student.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center space-x-3 text-sm">
                  <div className={`w-2 h-2 rounded-full ${student.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={student.isActive ? 'text-green-600' : 'text-red-600'}>
                    {student.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Enrolled Classes */}
              {student.enrolledClasses.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Enrolled Classes</h4>
                  <div className="space-y-2">
                    {student.enrolledClasses.slice(0, 3).map((classItem) => (
                      <div key={classItem._id} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-900">{classItem.name}</p>
                        <p className="text-xs text-gray-500">{classItem.code}</p>
                      </div>
                    ))}
                    {student.enrolledClasses.length > 3 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{student.enrolledClasses.length - 3} more classes
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex space-x-2">
                <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-3 rounded-lg transition-colors text-sm"
                  onClick={() => handleViewStudentDetails(student._id)}>
                  View Details
                </button>
                <button className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-2 px-3 rounded-lg transition-colors text-sm"
                  onClick={() => handleEditClick(student)}>
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && !loading && (
        <div className="text-center py-12">
          <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No students found' : 'No students yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Try adjusting your search criteria' 
              : 'Start by creating student accounts to manage your class enrollment'
            }
          </p>
          {!searchTerm && (
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all">
              Create First Student
            </button>
          )}
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && editStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Student Profile</h2>
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">First Name *</label>
                  <input type="text" name="firstName" value={editStudent.firstName} onChange={handleEditChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Last Name *</label>
                  <input type="text" name="lastName" value={editStudent.lastName} onChange={handleEditChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Student ID *</label>
                  <input type="text" name="studentId" value={editStudent.studentId} onChange={handleEditChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Email *</label>
                  <input type="email" name="email" value={editStudent.email} onChange={handleEditChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Username *</label>
                  <input type="text" name="username" value={editStudent.username} onChange={handleEditChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Password</label>
                  <input type="text" name="password" value={editStudent.password} onChange={handleEditChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Leave blank to keep current password" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Classes Enrolled</label>
                  <input type="text" value={editStudent.enrolledClasses?.map(c => c.name || c).join(', ')} disabled className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Joined Date</label>
                  <input type="text" value={new Date(editStudent.createdAt).toLocaleDateString()} disabled className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100" />
                </div>
                <div className="flex space-x-4 pt-6">
                  <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {showStudentDetailsModal && studentDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Student Details</h2>
              <div className="space-y-3">
                <div><strong>Name:</strong> {studentDetails.firstName} {studentDetails.lastName}</div>
                <div><strong>Username:</strong> {studentDetails.username}</div>
                <div><strong>Email:</strong> {studentDetails.email}</div>
                <div><strong>Student ID:</strong> {studentDetails.studentId}</div>
                <div><strong>Joined:</strong> {new Date(studentDetails.createdAt).toLocaleDateString()}</div>
                <div><strong>Status:</strong> {studentDetails.isActive ? 'Active' : 'Inactive'}</div>
                <div><strong>Classes Enrolled:</strong> {studentDetails.enrolledClasses?.map(c => c.name).join(', ') || 'None'}</div>
              </div>
              <div className="flex space-x-4 pt-6">
                <button type="button" onClick={() => setShowStudentDetailsModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;