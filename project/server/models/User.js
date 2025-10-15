import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'student', 'teacher'],
    default: 'student'
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true,
    required: function () { return this.role === 'student'; }
  },
  enrolledClasses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  assignedClasses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    // Only for teachers
  }],
  timetable: [{
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    day: { type: String }, // e.g., 'Monday'
    startTime: { type: String }, // e.g., '09:00'
    endTime: { type: String } // e.g., '10:00'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
//userSchema.pre('save', async function(next) {
//  if (!this.isModified('password')) return next();
//
// try {
//    const salt = await bcrypt.genSalt(10);
//    this.password = await bcrypt.hash(this.password, salt);
//    next();
//  } catch (error) {
//    next(error);
//  }
//});

// Compare password method
//userSchema.methods.comparePassword = async function(candidatePassword) {
//  return bcrypt.compare(candidatePassword, this.password);
//};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);