import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Timetable = () => {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/teachers/${id}`);
        setTimetable(response.data.timetable);
      } catch (error) {
        console.error('Error fetching timetable:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Timetable</h1>
        <p className="text-gray-600 mt-2">
          {isAdmin
            ? 'View and manage all teachers\' timetables.'
            : user?.role === 'teacher'
              ? 'View your teaching timetable.'
              : 'View your class schedule.'}
        </p>
      </div>
      {/* Timetable UI will go here */}
      <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
        <ul>
          {timetable.map((entry, index) => (
            <li key={index}>
              {entry.day}: {entry.startTime} - {entry.endTime}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Timetable;
