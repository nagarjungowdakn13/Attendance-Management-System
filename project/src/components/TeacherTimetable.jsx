import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const TeacherTimetable = () => {
    const { id } = useParams();
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTimetable = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/timetable/teacher/${id}`);
                setTimetable(response.data);
            } catch (err) {
                setError('Error fetching timetable data');
            } finally {
                setLoading(false);
            }
        };

        fetchTimetable();
    }, [id]);

    if (loading) {
        return <div className="text-center py-4">Loading...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500 py-4">{error}</div>;
    }

    if (timetable.length === 0) {
        return <div className="text-center py-4">No timetable available</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Teacher Timetable</h1>
            <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2">Day</th>
                        <th className="border border-gray-300 px-4 py-2">Time</th>
                        <th className="border border-gray-300 px-4 py-2">Subject</th>
                        <th className="border border-gray-300 px-4 py-2">Class</th>
                        <th className="border border-gray-300 px-4 py-2">Room</th>
                    </tr>
                </thead>
                <tbody>
                    {timetable.map((entry, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2">{entry.day}</td>
                            <td className="border border-gray-300 px-4 py-2">{entry.startTime} - {entry.endTime}</td>
                            <td className="border border-gray-300 px-4 py-2">{entry.subject}</td>
                            <td className="border border-gray-300 px-4 py-2">{entry.class}</td>
                            <td className="border border-gray-300 px-4 py-2">{entry.room}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TeacherTimetable;
