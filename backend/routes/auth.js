const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database');

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'ai_recruiter_dev_secret';

router.post('/signup', (req, res) => {
  const { name, email, password, role, company, position } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ error: 'All fields required' });
  if (!['candidate', 'recruiter'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

  try {
    const hashed = bcrypt.hashSync(password, 10);
    const user = db.users.create({ name, email, password: hashed, role });

    if (role === 'candidate') {
      db.candidates.create({ user_id: user.id, name, email, skills: [], experience: [], projects: [], education: [], desired_roles: [], shortlisted_by: [] });
    } else {
      db.recruiters.create({ id: user.id, user_id: user.id, name, email, company: company || '', position: position || '' });
    }

    const token = jwt.sign({ id: user.id, role }, SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, name, email, role } });
  } catch (err) {
    if (err.message === 'EMAIL_EXISTS') return res.status(409).json({ error: 'Email already registered' });
    throw err;
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.findByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try { req.user = jwt.verify(token, SECRET); next(); } catch { res.status(401).json({ error: 'Invalid token' }); }
}

module.exports = router;
module.exports.authenticate = authenticate;
