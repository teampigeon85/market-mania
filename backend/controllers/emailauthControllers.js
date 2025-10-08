import bcrypt from 'bcrypt';

import { 
  checkEmailExists, 
  createUser, 
  findUser, 
  updateLastLogin, 
  getUserById 
} from '../config/loginAndRegisterQueries.js';

// ✅ Password validation logic (unchanged)
const validatePassword = (password) => {
  const minLength = 8;
  let hasLowerCaseLetter = false;
  let hasUpperCaseLetter = false;
  let hasNumber = false;
  let hasOtherCharacter = false;

  for (let i = 0; i < password.length; i++) {
    if (password[i] >= '0' && password[i] <= '9') hasNumber = true;
    else if (password[i] >= 'a' && password[i] <= 'z') hasLowerCaseLetter = true;
    else if (password[i] >= 'A' && password[i] <= 'Z') hasUpperCaseLetter = true;
    else hasOtherCharacter = true;
  }

  const errors = [];
  if (password.length < minLength)
    errors.push('Password must have at least 8 characters');
  if (!hasUpperCaseLetter)
    errors.push('Password must have at least one uppercase letter');
  if (!hasLowerCaseLetter)
    errors.push('Password must have at least one lowercase letter');
  if (!hasNumber)
    errors.push('Password must have at least one number');
  if (!hasOtherCharacter)
    errors.push('Password must have at least one special character');
  
  return errors;
};

// ✅ Register a new user
export const registerUser = async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Password validation failed', 
        details: passwordErrors 
      });
    }

    // Check if email already exists
    const emailExists = await checkEmailExists(email);
    if (emailExists) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const saltRound = 10;
    const hashed_password = await bcrypt.hash(password, saltRound);

    // Create user in `users` table
    const user = await createUser({ email, full_name, hashed_password });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        google_id: null
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error registering user' });
  }
};

// ✅ Login user (no JWT)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await findUser(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // If it's a Google account (no password login allowed)
    if (user.google_id) {
      return res.status(401).json({ 
        error: 'This account uses Google authentication. Please sign in with Google.'
      });
    }

    const validPassword = await bcrypt.compare(password, user.hashed_password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await updateLastLogin(user.user_id);

    res.json({
      message: 'Login successful',
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        google_id: user.google_id,
        last_login: new Date()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
};

// ✅ Logout user (simple response since no JWT)
export const logoutUser = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};
