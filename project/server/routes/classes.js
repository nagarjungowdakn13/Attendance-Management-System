import express from 'express';
import Class from '../models/Class.js';
import User from '../models/User.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Create a new class (Admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const classData = new Class({
      ...req.body,
      createdBy: req.user._id
    });
    
    await classData.save();
    res.status(201).json(classData);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.code) {
      return res.status(400).json({ message: 'Class code already exists' });
    }
    res.status(400).json({ message: 'Error creating class', error: error.message });
  }
});

// Get all classes
router.get('/', authenticate, async (req, res) => {
  try {
    let classes;
    
    if (req.user.role === 'admin') {
      classes = await Class.find({ isActive: true })
        .populate('enrolledStudents', 'firstName lastName email studentId')
        .populate('createdBy', 'firstName lastName');
    } else {
      classes = await Class.find({ 
        enrolledStudents: req.user._id,
        isActive: true 
      }).populate('createdBy', 'firstName lastName');
    }
    
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classes', error: error.message });
  }
});

// Get class by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('enrolledStudents', 'firstName lastName email studentId')
      .populate('createdBy', 'firstName lastName');
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Check if student is enrolled or if user is admin
    if (req.user.role !== 'admin' && !classData.enrolledStudents.some(student => student._id.equals(req.user._id))) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(classData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching class', error: error.message });
  }
});

// Enroll student in class (Admin only)
router.post('/:id/enroll', authenticate, requireAdmin, async (req, res) => {
  try {
    const { studentId } = req.body;
    
    const classData = await Class.findById(req.params.id);
    const student = await User.findById(studentId);
    
    if (!classData || !student) {
      return res.status(404).json({ message: 'Class or student not found' });
    }
    
    if (student.role !== 'student') {
      return res.status(400).json({ message: 'Only students can be enrolled in classes' });
    }
    
    if (classData.enrolledStudents.includes(studentId)) {
      return res.status(400).json({ message: 'Student already enrolled' });
    }
    
    if (classData.enrolledStudents.length >= classData.maxCapacity) {
      return res.status(400).json({ message: 'Class is at maximum capacity' });
    }
    
    classData.enrolledStudents.push(studentId);
    student.enrolledClasses.push(classData._id);
    
    await classData.save();
    await student.save();
    
    res.json({ message: 'Student enrolled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error enrolling student', error: error.message });
  }
});

// Update class (Admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const classData = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(classData);
  } catch (error) {
    res.status(400).json({ message: 'Error updating class', error: error.message });
  }
});

// Assign teacher to class (Admin only)
router.put('/:id/assign-teacher', authenticate, requireAdmin, async (req, res) => {
  try {
    const { teacherId } = req.body;
    const classData = await Class.findByIdAndUpdate(
      req.params.id,
      { teacher: teacherId },
      { new: true, runValidators: true }
    ).populate('teacher', 'firstName lastName email');
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    // Add class to teacher's assignedClasses if not already present
    await User.findByIdAndUpdate(teacherId, { $addToSet: { assignedClasses: classData._id } });
    res.json(classData);
  } catch (error) {
    res.status(400).json({ message: 'Error assigning teacher', error: error.message });
  }
});

// Get classes for a teacher (for teacher dashboard)
router.get('/teacher/:teacherId', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.teacherId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const classes = await Class.find({ teacher: req.params.teacherId })
      .populate('enrolledStudents', 'firstName lastName studentId email');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teacher classes', error: error.message });
  }
});

export default router;