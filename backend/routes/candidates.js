const express = require('express');
const { db } = require('../database');
const { authenticate } = require('./auth');

const router = express.Router();

// Get own profile
router.get('/me', authenticate, (req, res) => {
  const c = db.candidates.byUserId(req.user.id);
  if (!c) return res.status(404).json({ error: 'Profile not found' });
  res.json(c);
});

// Update profile
router.put('/me', authenticate, (req, res) => {
  const { name, headline, summary, location, skills, experience, projects, education, desired_roles, availability, avatar_color } = req.body;
  
  // Calculate completion %
  let score = 0;
  if (name) score += 10;
  if (headline) score += 10;
  if (summary) score += 15;
  if (skills?.length > 0) score += 20;
  if (experience?.length > 0) score += 20;
  if (projects?.length > 0) score += 15;
  if (education?.length > 0) score += 10;

  db.candidates.update(req.user.id, {
    name, headline, summary, location, skills, experience, projects, education,
    desired_roles, availability, avatar_color,
    completion: score,
    profile_completed: score >= 60,
  });
  res.json({ message: 'Profile updated', completion: score });
});

// Search candidates (recruiter)
router.get('/search', authenticate, (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ error: 'Recruiters only' });
  res.json(db.candidates.search(req.query));
});

// Get candidate by ID (recruiter)
router.get('/:id', authenticate, (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ error: 'Recruiters only' });
  const c = db.candidates.byId(req.params.id);
  if (!c) return res.status(404).json({ error: 'Candidate not found' });
  res.json(c);
});

// Get public candidate profile by ID (no auth required)
router.get('/public/:id', (req, res) => {
  const c = db.candidates.byId(req.params.id);
  if (!c) return res.status(404).json({ error: 'Profile not found' });
  res.json(c);
});

module.exports = router;
