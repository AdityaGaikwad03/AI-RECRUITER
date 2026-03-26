const express = require('express');
const { db } = require('../database');
const { authenticate } = require('./auth');

const router = express.Router();

router.get('/me', authenticate, (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ error: 'Recruiters only' });
  res.json(db.recruiters.byUserId(req.user.id));
});

router.post('/shortlist/:candidateId', authenticate, (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ error: 'Recruiters only' });
  const isShortlisted = db.recruiters.shortlist(req.user.id, req.params.candidateId);
  res.json({ shortlisted: isShortlisted });
});

router.get('/shortlist', authenticate, (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ error: 'Recruiters only' });
  const rec = db.recruiters.byUserId(req.user.id);
  const all = db.candidates.all();
  const shortlisted = all.filter(c => rec?.shortlists?.includes(c.id));
  res.json(shortlisted);
});

module.exports = router;
