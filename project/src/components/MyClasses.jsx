import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  BookOpen, 
  Calendar,
  Clock,
  MapPin,
  Users,
  GraduationCap
} from 'lucide-react';

const MyClasses = () => {
  const { user, isAdmin } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyClasses();
  }, []);

  const fetchMyClasses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
        <p className="text-gray-600 mt-2">View your enrolled classes and schedules</p>
      </div>

      {/* Classes Grid */}
      {classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <div key={classItem._id} className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="p-6">
                {/* Class Header */}
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

                {/* Class Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>Instructor: {classItem.instructor}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{classItem.semester} {classItem.year}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{classItem.enrolledStudents.length} students enrolled</span>
                  </div>
                  
                  {classItem.schedule.days.length > 0 && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        {classItem.schedule.days.join(', ')}
                        {classItem.schedule.time.start && classItem.schedule.time.end && (
                          <span className="ml-1">
                            ({classItem.schedule.time.start} - {classItem.schedule.time.end})
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {classItem.description && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {classItem.description}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-3 rounded-lg transition-colors text-sm">
                    View Details
                  </button>
                  <button className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-2 px-3 rounded-lg transition-colors text-sm">
                    My Attendance
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Classes Enrolled</h3>
          <p className="text-gray-600 mb-6">
            You are not currently enrolled in any classes. Contact your administrator to get enrolled.
          </p>
        </div>
      )}
    </div>
  );
};

export default MyClasses;