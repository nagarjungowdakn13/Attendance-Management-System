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
