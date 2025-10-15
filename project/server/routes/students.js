import express from 'express';
import User from '../models/User.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Create a new student (Admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, studentId } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }, { studentId }]
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Username, email, or student ID already exists' });
    }
    
    const student = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      studentId,
      role: 'student'
    });
    
    await student.save();
    
    // Return student without password
    const { password: _, ...studentData } = student.toObject();
    res.status(201).json(studentData);
  } catch (error) {
    res.status(400).json({ message: 'Error creating student', error: error.message });
  }
});

// Get all students (Admin only)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .populate('enrolledClasses', 'name code');
    
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
});

// Get student by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    // Students can only view their own profile, admins can view any
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const student = await User.findById(req.params.id)
      .select('-password')
      .populate('enrolledClasses', 'name code instructor');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student', error: error.message });
  }
});

// Update student (Admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, studentId, enrolledClasses, isActive } = req.body;
    const studentIdParam = req.params.id;

    // Check for duplicate username, email, or studentId (excluding current student)
    const existingUser = await User.findOne({
      $and: [
        { _id: { $ne: studentIdParam } },
        { $or: [
          { username },
          { email },
          { studentId }
        ] }
      ]
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Username, email, or student ID already exists' });
    }

    // Prepare update object
    const update = {
      username,
      email,
      firstName,
      lastName,
      studentId,
      enrolledClasses,
      isActive
    };

    // Only update password if provided and >= 6 chars
    if (password && password.length >= 6) {
      const bcrypt = await import('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(password, salt);
    } else if (password && password.length > 0 && password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const updatedStudent = await User.findByIdAndUpdate(
      studentIdParam,
      update,
      { new: true, runValidators: true }
    ).select('-password').populate('enrolledClasses', 'name code instructor');

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: 'Error updating student', error: error.message });
  }
});

export default router;