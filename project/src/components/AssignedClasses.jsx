import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const AssignedClasses = () => {
    const { id } = useParams();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/teachers/${id}/classes`);
                setClasses(response.data);
            } catch (error) {
                console.error('Error fetching assigned classes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Assigned Classes</h1>
            <ul>
                {classes.map((classItem) => (
                    <li key={classItem._id}>{classItem.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default AssignedClasses;
