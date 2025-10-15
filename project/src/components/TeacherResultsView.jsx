import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const TeacherResultsView = () => {
    const { id } = useParams();
    const [resultsData, setResultsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResultsData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/results/teacher/${id}`);
                setResultsData(response.data);
            } catch (err) {
                setError('Error fetching results data');
            } finally {
                setLoading(false);
            }
        };

        fetchResultsData();
    }, [id]);

    if (loading) {
        return <div className="text-center py-4">Loading...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500 py-4">{error}</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Teacher Results</h1>
            <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2">Student Name</th>
                        <th className="border border-gray-300 px-4 py-2">Subject</th>
                        <th className="border border-gray-300 px-4 py-2">Marks</th>
                        <th className="border border-gray-300 px-4 py-2">Grade</th>
                    </tr>
                </thead>
                <tbody>
                    {resultsData.map((result) => (
                        <tr key={result._id} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2">{result.studentId.firstName} {result.studentId.lastName}</td>
                            <td className="border border-gray-300 px-4 py-2">{result.subject}</td>
                            <td className="border border-gray-300 px-4 py-2">{result.marks}</td>
                            <td className="border border-gray-300 px-4 py-2 capitalize">{result.grade}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TeacherResultsView;
