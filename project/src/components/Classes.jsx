import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  BookOpen, 
  Plus, 
  Users, 
  Calendar,
  Clock,
  MapPin,
  Edit,
  Trash2,
  UserPlus,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const Classes = () => {
  const { isAdmin } = useAuth();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [newClass, setNewClass] = useState({
    name: '',
    code: '',
    description: '',
    instructor: '',
    semester: '',
    year: new Date().getFullYear(),
    maxCapacity: 50,
    schedule: {
      days: [],
      time: { start: '', end: '' }
    }
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editClass, setEditClass] = useState(null);
  const [editMessage, setEditMessage] = useState({ type: '', text: '' });
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchClasses();
    if (isAdmin) {
      fetchStudents();
    }
  }, [isAdmin]);

  const fetchClasses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/classes', newClass);
      setMessage({ type: 'success', text: 'Class created successfully!' });
      setShowCreateForm(false);
      setNewClass({
        name: '',
        code: '',
        description: '',
        instructor: '',
        semester: '',
        year: new Date().getFullYear(),
        maxCapacity: 50,
        schedule: {
          days: [],
          time: { start: '', end: '' }
        }
      });
      fetchClasses();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error creating class' 
      });
    }
  };

  const handleEnrollStudent = async (studentId) => {
    try {
      await axios.post(`http://localhost:5000/api/classes/${selectedClass._id}/enroll`, {
        studentId
      });
      setMessage({ type: 'success', text: 'Student enrolled successfully!' });
      setShowEnrollModal(false);
      fetchClasses();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error enrolling student' 
      });
    }
  };

  const handleDayChange = (day) => {
    const updatedDays = newClass.schedule.days.includes(day)
      ? newClass.schedule.days.filter(d => d !== day)
      : [...newClass.schedule.days, day];
    
    setNewClass({
      ...newClass,
      schedule: { ...newClass.schedule, days: updatedDays }
    });
  };

  const handleEditClick = (classItem) => {
    setEditClass({ ...classItem });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditClass((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/classes/${editClass._id}`, editClass);
      setEditMessage({ type: 'success', text: 'Class updated successfully!' });
      setShowEditModal(false);
      setEditClass(null);
      fetchClasses();
    } catch (error) {
      setEditMessage({ type: 'error', text: error.response?.data?.message || 'Error updating class' });
    }
  };

  const handleViewDetails = (classItem) => {
    setEditClass({ ...classItem });
    setShowDetailsModal(true);
  };

  // Add this handler for editing schedule days in edit modal
  const handleEditDayChange = (day) => {
    const updatedDays = editClass.schedule?.days?.includes(day)
      ? editClass.schedule.days.filter(d => d !== day)
      : [...(editClass.schedule.days || []), day];
    setEditClass({
      ...editClass,
      schedule: {
        ...editClass.schedule,
        days: updatedDays
      }
    });
  };

  // Add this handler for editing schedule time in edit modal
  const handleEditTimeChange = (field, value) => {
    setEditClass({
      ...editClass,
      schedule: {
        ...editClass.schedule,
        time: {
          ...((editClass.schedule && editClass.schedule.time) || { start: '', end: '' }),
          [field]: value
        }
      }
    });
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
          <h1 className="text-3xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-600 mt-2">Manage your classes and enrollments</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Create Class</span>
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <div key={classItem._id} className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{classItem.name}</h3>
                    <p className="text-sm text-gray-500">{classItem.code}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{classItem.enrolledStudents.length}/{classItem.maxCapacity} students</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{classItem.semester} {classItem.year}</span>
                </div>
                
                {classItem.schedule.days.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{classItem.schedule.days.join(', ')}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>Instructor: {classItem.instructor}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedClass(classItem);
                    setShowEnrollModal(true);
                  }}
                  className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Enroll</span>
                </button>
                <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
                  onClick={() => handleEditClick(classItem)}>
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
                  onClick={() => handleViewDetails(classItem)}>
                  <span>View Details</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Class Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Class</h2>
              
              <form onSubmit={handleCreateClass} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Class Name *
                    </label>
                    <input
                      type="text"
                      value={newClass.name}
                      onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Introduction to Computer Science"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Class Code *
                    </label>
                    <input
                      type="text"
                      value={newClass.code}
                      onChange={(e) => setNewClass({ ...newClass, code: e.target.value.toUpperCase() })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., CS101"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Description
                  </label>
                  <textarea
                    value={newClass.description}
                    onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of the class"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Instructor *
                    </label>
                    <input
                      type="text"
                      value={newClass.instructor}
                      onChange={(e) => setNewClass({ ...newClass, instructor: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Instructor name"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Max Capacity
                    </label>
                    <input
                      type="number"
                      value={newClass.maxCapacity}
                      onChange={(e) => setNewClass({ ...newClass, maxCapacity: parseInt(e.target.value) })}
                      min={1}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Semester *
                    </label>
                    <select
                      value={newClass.semester}
                      onChange={(e) => setNewClass({ ...newClass, semester: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Semester</option>
                      {[...Array(8)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Year *
                    </label>
                    <input
                      type="number"
                      value={newClass.year}
                      onChange={(e) => setNewClass({ ...newClass, year: parseInt(e.target.value) })}
                      required
                      min={2020}
                      max={2030}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Schedule Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map((day) => (
                      <label key={day} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newClass.schedule.days.includes(day)}
                          onChange={() => handleDayChange(day)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={newClass.schedule.time.start}
                      onChange={(e) => setNewClass({
                        ...newClass,
                        schedule: { ...newClass.schedule, time: { ...newClass.schedule.time, start: e.target.value }}
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={newClass.schedule.time.end}
                      onChange={(e) => setNewClass({
                        ...newClass,
                        schedule: { ...newClass.schedule, time: { ...newClass.schedule.time, end: e.target.value }}
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    Create Class
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Enroll Student Modal */}
      {showEnrollModal && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Enroll Student in {selectedClass.name}
              </h2>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {students
                  .filter(student => !selectedClass.enrolledStudents.some(enrolled => enrolled._id === student._id))
                  .map((student) => (
                    <div key={student._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-sm text-gray-500">ID: {student.studentId}</p>
                      </div>
                      <button
                        onClick={() => handleEnrollStudent(student._id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Enroll
                      </button>
                    </div>
                  ))}
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {showEditModal && editClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Class</h2>
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Class Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={editClass.name}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Class Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={editClass.code}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Description</label>
                  <textarea
                    name="description"
                    value={editClass.description}
                    onChange={handleEditChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Instructor *</label>
                  <input
                    type="text"
                    name="instructor"
                    value={editClass.instructor}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Semester *</label>
                  <input
                    type="number"
                    name="semester"
                    value={editClass.semester}
                    onChange={handleEditChange}
                    required
                    min={1}
                    max={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Year *</label>
                  <input
                    type="number"
                    name="year"
                    value={editClass.year}
                    onChange={handleEditChange}
                    required
                    min={2020}
                    max={2030}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Max Capacity</label>
                  <input
                    type="number"
                    name="maxCapacity"
                    value={editClass.maxCapacity}
                    onChange={handleEditChange}
                    min={1}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Schedule Days</label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map((day) => (
                      <label key={day} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editClass.schedule?.days?.includes(day) || false}
                          onChange={() => handleEditDayChange(day)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Start Time</label>
                    <input
                      type="time"
                      value={editClass.schedule?.time?.start || ''}
                      onChange={e => handleEditTimeChange('start', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">End Time</label>
                    <input
                      type="time"
                      value={editClass.schedule?.time?.end || ''}
                      onChange={e => handleEditTimeChange('end', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && editClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Class Details</h2>
              <div className="space-y-4">
                <div><strong>Name:</strong> {editClass.name}</div>
                <div><strong>Code:</strong> {editClass.code}</div>
                <div><strong>Description:</strong> {editClass.description}</div>
                <div><strong>Instructor:</strong> {editClass.instructor}</div>
                <div><strong>Semester:</strong> {editClass.semester}</div>
                <div><strong>Year:</strong> {editClass.year}</div>
                <div><strong>Max Capacity:</strong> {editClass.maxCapacity}</div>
                <div><strong>Enrolled Students:</strong> {editClass.enrolledStudents?.length || 0}</div>
              </div>
              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;