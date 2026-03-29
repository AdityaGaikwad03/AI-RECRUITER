const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, 'data');
const FILES = {
  users:      path.join(DATA_DIR, 'users.json'),
  candidates: path.join(DATA_DIR, 'candidates.json'),
  recruiters: path.join(DATA_DIR, 'recruiters.json'),
  shortlists: path.join(DATA_DIR, 'shortlists.json'),
};

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function read(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return []; }
}
function write(file, data) { fs.writeFileSync(file, JSON.stringify(data, null, 2)); }
function nextId(arr) { return arr.length === 0 ? 1 : Math.max(...arr.map(i => i.id)) + 1; }
function now() { return new Date().toISOString(); }

function seedIfEmpty() {
  // Seed demo candidate
  const users = read(FILES.users);
  if (!users.find(u => u.email === 'hire-me@anshumat.org')) {
    const id = nextId(users);
    users.push({ id, email: 'hire-me@anshumat.org', password: bcrypt.hashSync('HireMe@2025!', 10), role: 'candidate', name: 'Alex Morgan', created_at: now() });
    write(FILES.users, users);

    const candidates = read(FILES.candidates);
    candidates.push({
      id, user_id: id, name: 'Alex Morgan', email: 'hire-me@anshumat.org',
      headline: 'Full Stack Developer | React & Node.js Enthusiast',
      summary: 'Passionate developer with 2 years of experience building scalable web applications. Strong foundation in modern JavaScript frameworks and cloud technologies.',
      location: 'Bangalore, India', avatar_color: '#4F7CFF',
      skills: [
        { name: 'React', level: 'Advanced', endorsed: 12 },
        { name: 'Node.js', level: 'Intermediate', endorsed: 8 },
        { name: 'TypeScript', level: 'Intermediate', endorsed: 6 },
        { name: 'PostgreSQL', level: 'Intermediate', endorsed: 4 },
        { name: 'AWS', level: 'Beginner', endorsed: 2 },
      ],
      experience: [
        { company: 'TechStartup Pvt Ltd', role: 'Junior Frontend Developer', duration: '2023 - Present', description: 'Built responsive React applications serving 50K+ users. Led migration from class to functional components.', skills_used: ['React', 'TypeScript', 'Jest'] },
        { company: 'Freelance', role: 'Web Developer', duration: '2022 - 2023', description: 'Delivered 8 client projects including e-commerce sites and dashboards.', skills_used: ['React', 'Node.js', 'MongoDB'] },
      ],
      projects: [
        { name: 'EduTrack LMS', description: 'Full-stack learning management system with real-time progress tracking and video streaming.', tech: ['React', 'Node.js', 'Socket.io', 'AWS S3'], link: 'https://github.com/demo/edutrack' },
        { name: 'BudgetAI', description: 'Personal finance app using ML to categorize expenses and predict spending patterns.', tech: ['React Native', 'Python', 'TensorFlow'], link: 'https://github.com/demo/budgetai' },
      ],
      education: [{ degree: 'B.Tech in Computer Science', institute: 'VIT University', year: '2022', grade: '8.7 CGPA' }],
      desired_roles: ['Frontend Developer', 'Full Stack Developer', 'React Developer'],
      availability: 'Immediate',
      completion: 85,
      profile_completed: true,
      shortlisted_by: [],
      created_at: now(),
    });
    write(FILES.candidates, candidates);
  }

  // Seed demo recruiter
  if (!users.find(u => u.email === 'recruiter@demo.com')) {
    const rid = nextId(read(FILES.users));
    read(FILES.users).push && (() => {
      const u = read(FILES.users);
      u.push({ id: rid, email: 'recruiter@demo.com', password: bcrypt.hashSync('Recruiter@2025!', 10), role: 'recruiter', name: 'Sarah Chen', created_at: now() });
      write(FILES.users, u);
      const r = read(FILES.recruiters);
      r.push({ id: rid, user_id: rid, name: 'Sarah Chen', email: 'recruiter@demo.com', company: 'TechCorp Solutions', position: 'Senior HR Manager', shortlists: [] });
      write(FILES.recruiters, r);
    })();
  }

  if (!fs.existsSync(FILES.shortlists)) write(FILES.shortlists, []);
  console.log('✅ Database ready');
}

const db = {
  users: {
    findByEmail: (email) => read(FILES.users).find(u => u.email === email.toLowerCase()) || null,
    findById: (id) => read(FILES.users).find(u => u.id === parseInt(id)) || null,
    create: (data) => {
      const users = read(FILES.users);
      if (users.find(u => u.email === data.email.toLowerCase())) throw new Error('EMAIL_EXISTS');
      const user = { id: nextId(users), ...data, email: data.email.toLowerCase(), created_at: now() };
      write(FILES.users, [...users, user]);
      return user;
    },
  },
  candidates: {
    all: () => read(FILES.candidates),
    byUserId: (uid) => read(FILES.candidates).find(c => c.user_id === parseInt(uid)) || null,
    byId: (id) => read(FILES.candidates).find(c => c.id === parseInt(id)) || null,
    create: (data) => {
      const list = read(FILES.candidates);
      const c = { id: data.user_id, ...data, completion: 0, profile_completed: false, shortlisted_by: [], created_at: now() };
      write(FILES.candidates, [...list, c]);
      return c;
    },
    update: (uid, data) => {
      const list = read(FILES.candidates).map(c => c.user_id === parseInt(uid) ? { ...c, ...data } : c);
      write(FILES.candidates, list);
    },
    search: (filters = {}) => {
      let list = read(FILES.candidates).filter(c => c.profile_completed);
      if (filters.skill) list = list.filter(c => c.skills?.some(s => s.name.toLowerCase().includes(filters.skill.toLowerCase())));
      if (filters.role) list = list.filter(c => c.desired_roles?.some(r => r.toLowerCase().includes(filters.role.toLowerCase())));
      if (filters.availability) list = list.filter(c => c.availability === filters.availability);
      return list;
    },
  },
  recruiters: {
    byUserId: (uid) => read(FILES.recruiters).find(r => r.user_id === parseInt(uid)) || null,
    create: (data) => {
      const list = read(FILES.recruiters);
      const r = { ...data, shortlists: [], created_at: now() };
      write(FILES.recruiters, [...list, r]);
      return r;
    },
    update: (uid, data) => {
      const list = read(FILES.recruiters).map(r => r.user_id === parseInt(uid) ? { ...r, ...data } : r);
      write(FILES.recruiters, list);
    },
    shortlist: (recruiterUid, candidateId) => {
      // Add to recruiter shortlist
      const recruiters = read(FILES.recruiters).map(r => {
        if (r.user_id === parseInt(recruiterUid)) {
          const ids = r.shortlists || [];
          return { ...r, shortlists: ids.includes(parseInt(candidateId)) ? ids.filter(i => i !== parseInt(candidateId)) : [...ids, parseInt(candidateId)] };
        }
        return r;
      });
      write(FILES.recruiters, recruiters);
      // Track on candidate
      const cands = read(FILES.candidates).map(c => {
        if (c.id === parseInt(candidateId)) {
          const by = c.shortlisted_by || [];
          return { ...c, shortlisted_by: by.includes(parseInt(recruiterUid)) ? by.filter(i => i !== parseInt(recruiterUid)) : [...by, parseInt(recruiterUid)] };
        }
        return c;
      });
      write(FILES.candidates, cands);
      const rec = read(FILES.recruiters).find(r => r.user_id === parseInt(recruiterUid));
      return rec?.shortlists?.includes(parseInt(candidateId));
    },
  },
};

seedIfEmpty();
module.exports = { db };
