import express from 'express';
import Result from '../models/Result.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Create or update result (Admin or Teacher)
router.post('/', authenticate, async (req, res) => {
  try {
    const { classId, studentId, marks, grade, remarks } = req.body;
    const teacherId = req.user.role === 'teacher' ? req.user._id : req.body.teacherId;
    if (!teacherId) return res.status(400).json({ message: 'Teacher required' });
    const result = await Result.findOneAndUpdate(
      { classId, studentId },
      { classId, studentId, teacherId, marks, grade, remarks, updatedBy: req.user._id },
      { upsert: true, new: true, runValidators: true }
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: 'Error saving result', error: error.message });
  }
});

// Get results for a class (Admin, Teacher, or Student)
router.get('/class/:classId', authenticate, async (req, res) => {
  try {
    const { classId } = req.params;
    let query = { classId };
    if (req.user.role === 'student') query.studentId = req.user._id;
    if (req.user.role === 'teacher') query.teacherId = req.user._id;
    const results = await Result.find(query)
      .populate('studentId', 'firstName lastName studentId')
      .populate('teacherId', 'firstName lastName')
      .populate('classId', 'name code');
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching results', error: error.message });
  }
});

// Get results for a student (Admin, Teacher, or Student)
router.get('/student/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;
    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const results = await Result.find({ studentId })
      .populate('classId', 'name code')
      .populate('teacherId', 'firstName lastName');
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching results', error: error.message });
  }
});

export default router;
