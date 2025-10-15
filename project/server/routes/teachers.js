import express from 'express';
import User from '../models/User.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Create a new teacher (Admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    const teacher = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      role: 'teacher',
      assignedClasses: []
    });
    await teacher.save();
    const { password: _, ...teacherData } = teacher.toObject();
    res.status(201).json(teacherData);
  } catch (error) {
    res.status(400).json({ message: 'Error creating teacher', error: error.message });
  }
});

// Get all teachers (Admin only)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' })
      .select('-password')
      .populate('assignedClasses', 'name code');
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teachers', error: error.message });
  }
});

// Assign classes to teacher (Admin only)
router.put('/:id/assign', authenticate, requireAdmin, async (req, res) => {
  try {
    const { assignedClasses } = req.body; // array of class IDs
    const teacher = await User.findByIdAndUpdate(
      req.params.id,
      { assignedClasses },
      { new: true, runValidators: true }
    ).select('-password').populate('assignedClasses', 'name code');
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(400).json({ message: 'Error assigning classes', error: error.message });
  }
});

// Update teacher timetable (Admin only)
router.put('/:id/timetable', authenticate, requireAdmin, async (req, res) => {
  try {
    const { timetable } = req.body; // array of { classId, day, startTime, endTime }
    const teacher = await User.findByIdAndUpdate(
      req.params.id,
      { timetable },
      { new: true, runValidators: true }
    ).select('-password').populate('assignedClasses', 'name code');
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(400).json({ message: 'Error updating timetable', error: error.message });
  }
});

// Get teacher by ID (Admin or self)
router.get('/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const teacher = await User.findById(req.params.id)
      .select('-password')
      .populate('assignedClasses', 'name code');
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teacher', error: error.message });
  }
});

// Get teacher's assigned classes with student details (for teacher dashboard)
router.get('/:id/classes', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const teacher = await User.findById(req.params.id).populate({
      path: 'assignedClasses',
      populate: { path: 'enrolledStudents', select: 'firstName lastName studentId email' }
    });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(teacher.assignedClasses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classes', error: error.message });
  }
});

export default router;
