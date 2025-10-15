import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/class-attendance';

async function createAdmin() {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Always remove existing admin user first
  await User.deleteOne({ username: 'admin' });

  const admin = new User({
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isActive: true,
  });

  await admin.save();
  console.log('Admin user created: admin / admin123');
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error('Error creating admin user:', err);
  process.exit(1);
});
