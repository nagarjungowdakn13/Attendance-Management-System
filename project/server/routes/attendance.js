import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Attendance from '../models/Attendance.js';
import Class from '../models/Class.js';
import User from '../models/User.js';

const router = express.Router();

// Mark attendance (Admin or Teacher for their classes)
router.post('/', authenticate, async (req, res) => {
  try {
    const { classId, studentId, date, status, notes } = req.body;
    const classData = await Class.findById(classId);
    const student = await User.findById(studentId);
    if (!classData || !student) {
      return res.status(404).json({ message: 'Class or student not found' });
    }
    // Only admin or assigned teacher can mark attendance
    if (
      req.user.role === 'teacher' &&
      (!req.user.assignedClasses || !req.user.assignedClasses.map(String).includes(String(classId)))
    ) {
      return res.status(403).json({ message: 'Not allowed to mark attendance for this class' });
    }
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (!classData.enrolledStudents.includes(studentId)) {
      return res.status(400).json({ message: 'Student is not enrolled in this class' });
    }
    const attendanceData = await Attendance.findOneAndUpdate(
      { classId, studentId, date: new Date(date) },
      {
        status: status,
        notes: notes,
        markedBy: req.user._id,
        timestamp: new Date()
      },
      {
        upsert: true,
        new: true
      }
    );
    res.json(attendanceData);
  } catch (error) {
    res.status(500).json({ message: 'Error marking attendance', error: error.message });
  }
});

// Get attendance for a class
router.get('/class/:classId', authenticate, async (req, res) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;

    // Verify class exists and user has access
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check access permissions
    if (req.user.role !== 'admin' && !classData.enrolledStudents.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let query = { classId };
    if (date) {
      query.date = new Date(date);
    }

    const attendance = await Attendance.find(query)
      .populate('studentId', 'firstName lastName studentId')
      .populate('markedBy', 'firstName lastName')
      .sort({ date: -1, timestamp: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
});

// Get attendance for a student
router.get('/student/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Students can only view their own attendance, admins can view any
    if (req.user.role !== 'admin' && req.user._id.toString() !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const attendance = await Attendance.find({ studentId })
      .populate('classId', 'name code')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
});

// Get attendance statistics
router.get('/stats/:classId', authenticate, async (req, res) => {
  try {
    const { classId } = req.params;

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check access permissions
    if (req.user.role !== 'admin' && !classData.enrolledStudents.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const stats = await Attendance.aggregate([
      { $match: { classId: classData._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalClasses = await Attendance.distinct('date', { classId });

    res.json({
      totalClasses: totalClasses.length,
      statusBreakdown: stats,
      enrolledStudents: classData.enrolledStudents.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

// Get today's attendance count (for dashboard)
router.get('/today/count', authenticate, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Only admin can see all attendance
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const count = await Attendance.countDocuments({
      date: { $gte: today, $lt: tomorrow }
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching today\'s attendance', error: error.message });
  }
});

export default router;