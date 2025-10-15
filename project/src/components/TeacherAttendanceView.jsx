import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const TeacherAttendanceView = () => {
    const { id } = useParams();
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAttendanceData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/attendance/teacher/${id}`);
                setAttendanceData(response.data);
            } catch (err) {
                setError('Error fetching attendance data');
            } finally {
                setLoading(false);
            }
        };

        fetchAttendanceData();
    }, [id]);

    if (loading) {
        return <div className="text-center py-4">Loading...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500 py-4">{error}</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Teacher Attendance</h1>
            <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2">Date</th>
                        <th className="border border-gray-300 px-4 py-2">Student Name</th>
                        <th className="border border-gray-300 px-4 py-2">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {attendanceData.map((record) => (
                        <tr key={record._id} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2">{new Date(record.date).toLocaleDateString()}</td>
                            <td className="border border-gray-300 px-4 py-2">{record.studentId.firstName} {record.studentId.lastName}</td>
                            <td className="border border-gray-300 px-4 py-2 capitalize">{record.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TeacherAttendanceView;
