import bcrypt from 'bcryptjs';
import userModel from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

const registerUser = async ({ fullName, email, password, studentId, departmentId, programId, academicLevelId, imagePath }) => {
  const existingUser = await userModel.findUserByEmail(email);

  if (existingUser) {
    const error = new Error('An account with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const userId = await userModel.createUser({ fullName, email, passwordHash });

  await userModel.createStudentProfile({
    userId,
    studentId,
    departmentId,
    programId,
    academicLevelId,
  });

  await userModel.createVerificationRecord({
    userId,
    studentId,
    imagePath,
  });

  return {
    userId,
    fullName,
    email,
    role: 'student',
    accountStatus: 'pending',
  };
};

const loginUser = async ({ email, password }) => {
  const user = await userModel.findUserByEmail(email);

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({ id: user.id, role: user.role, email: user.email });

  return {
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      account_status: user.account_status,
    },
  };
};

export default {
  registerUser,
  loginUser,
};
