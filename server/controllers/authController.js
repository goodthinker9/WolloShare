import authService from '../services/authService.js';

const register = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'University ID image is required' });
    }

    const result = await authService.registerUser({
      fullName: req.body.full_name,
      email: req.body.email,
      password: req.body.password,
      studentId: req.body.student_id,
      departmentId: Number(req.body.department_id),
      programId: Number(req.body.program_id),
      academicLevelId: Number(req.body.academic_level_id),
      imagePath: req.file.filename,
    });

    res.status(201).json({ success: true, message: 'Registration successful', data: result });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser({
      email: req.body.email,
      password: req.body.password,
    });

    res.status(200).json({ success: true, message: 'Login successful', data: result });
  } catch (error) {
    next(error);
  }
};

export { register, login };
