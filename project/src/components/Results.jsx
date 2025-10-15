import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Results = () => {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/results/teacher/${id}`);
        setResults(response.data);
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
        <ul className="space-y-2">
          {results.map((result) => (
            <li key={result._id} className="text-lg">
              {result.studentId.firstName} {result.studentId.lastName}: {result.grade}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Results;
