const express = require('express');
const { authenticate } = require('./auth');
const router = express.Router();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

async function callClaude(systemPrompt, userMessage) {
  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    // Return structured mock response if no API key
    return null;
  }
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || null;
}

// Parse natural language experience into structured data
router.post('/parse-experience', authenticate, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });

  const system = `You are an AI that structures professional experience descriptions. 
Extract structured data from the user's natural language description and return ONLY valid JSON with this exact structure:
{
  "company": "company name",
  "role": "job title",
  "duration": "start - end (e.g. 2022 - Present)",
  "description": "clean 1-2 sentence professional description",
  "skills_used": ["skill1", "skill2", "skill3"],
  "key_achievements": ["achievement1", "achievement2"]
}
If information is missing, make reasonable inferences or leave as empty string.`;

  const aiText = await callClaude(system, text);
  
  if (!aiText) {
    // Smart mock fallback
    const mock = {
      company: text.includes('at ') ? text.split('at ')[1]?.split(' ')[0] || 'Company Name' : 'Company Name',
      role: text.toLowerCase().includes('developer') ? 'Software Developer' : text.toLowerCase().includes('design') ? 'UI/UX Designer' : 'Professional',
      duration: '2023 - Present',
      description: text.length > 50 ? text.substring(0, 120) + '...' : text,
      skills_used: ['JavaScript', 'React', 'Node.js'],
      key_achievements: ['Contributed to team projects', 'Improved system performance'],
    };
    return res.json({ structured: mock, ai_powered: false });
  }

  try {
    const structured = JSON.parse(aiText.replace(/```json|```/g, '').trim());
    res.json({ structured, ai_powered: true });
  } catch {
    res.json({ raw: aiText, ai_powered: true });
  }
});

// Suggest skills based on role
router.post('/suggest-skills', authenticate, async (req, res) => {
  const { role, current_skills = [] } = req.body;

  const system = `You are a tech recruiter AI that suggests relevant skills for job roles.
Return ONLY a valid JSON array of skill objects (no explanation, no markdown):
[
  {"name": "Skill Name", "category": "Technical|Soft|Domain", "relevance": "high|medium"},
  ...
]
Suggest 8-12 skills. Exclude skills already in current_skills.`;

  const aiText = await callClaude(system, `Role: ${role}. Current skills: ${current_skills.join(', ')}`);

  if (!aiText) {
    const defaults = {
      'developer': [
        { name: 'React', category: 'Technical', relevance: 'high' },
        { name: 'Node.js', category: 'Technical', relevance: 'high' },
        { name: 'TypeScript', category: 'Technical', relevance: 'high' },
        { name: 'PostgreSQL', category: 'Technical', relevance: 'medium' },
        { name: 'Docker', category: 'Technical', relevance: 'medium' },
        { name: 'AWS', category: 'Technical', relevance: 'medium' },
        { name: 'System Design', category: 'Domain', relevance: 'high' },
        { name: 'Problem Solving', category: 'Soft', relevance: 'high' },
      ],
      'designer': [
        { name: 'Figma', category: 'Technical', relevance: 'high' },
        { name: 'User Research', category: 'Domain', relevance: 'high' },
        { name: 'Prototyping', category: 'Technical', relevance: 'high' },
        { name: 'Design Systems', category: 'Domain', relevance: 'high' },
        { name: 'Adobe XD', category: 'Technical', relevance: 'medium' },
        { name: 'Usability Testing', category: 'Domain', relevance: 'medium' },
      ],
    };
    const key = role?.toLowerCase().includes('design') ? 'designer' : 'developer';
    const suggestions = (defaults[key] || defaults['developer']).filter(s => !current_skills.includes(s.name));
    return res.json({ suggestions, ai_powered: false });
  }

  try {
    const suggestions = JSON.parse(aiText.replace(/```json|```/g, '').trim());
    res.json({ suggestions, ai_powered: true });
  } catch {
    res.json({ suggestions: [], ai_powered: false });
  }
});

// Generate professional summary
router.post('/generate-summary', authenticate, async (req, res) => {
  const { name, skills, experience, desired_roles } = req.body;

  const system = `You are a professional career coach. Write a compelling 2-3 sentence professional summary for a candidate's profile.
Return ONLY the summary text — no quotes, no explanation, no markdown.
Make it specific, achievement-oriented, and tailored to their target roles.`;

  const context = `Name: ${name}
Skills: ${skills?.map(s => s.name).join(', ')}
Experience: ${experience?.map(e => `${e.role} at ${e.company}`).join('; ')}
Target roles: ${desired_roles?.join(', ')}`;

  const aiText = await callClaude(system, context);

  if (!aiText) {
    const topSkills = skills?.slice(0, 3).map(s => s.name).join(', ') || 'modern technologies';
    const latestRole = experience?.[0]?.role || 'professional';
    const summary = `${name} is a results-driven ${latestRole} with hands-on expertise in ${topSkills}. Passionate about building scalable solutions and contributing to high-impact teams. Actively seeking opportunities in ${desired_roles?.join(' and ') || 'technology'} to drive innovation and growth.`;
    return res.json({ summary, ai_powered: false });
  }

  res.json({ summary: aiText.trim(), ai_powered: true });
});

// AI Chat for profile building (conversational)
router.post('/chat', authenticate, async (req, res) => {
  const { message, context, step } = req.body;

  const system = `You are HireAI, a friendly AI career assistant helping candidates build their professional profile.
Current step: ${step || 'general'}
Profile context: ${JSON.stringify(context || {})}

Your job is to:
1. Extract structured profile data from what the user tells you
2. Ask friendly follow-up questions to fill gaps
3. Be encouraging and professional
4. Keep responses concise (2-3 sentences max)

ALWAYS respond with JSON in this format:
{
  "message": "Your friendly response to the user",
  "extracted": {
    "field": "value"
  },
  "next_question": "optional follow-up question",
  "suggestions": ["optional", "quick", "replies"]
}`;

  const aiText = await callClaude(system, message);

  if (!aiText) {
    const responses = {
      skills: { message: "Great! I've noted those skills. What proficiency level would you say you have — beginner, intermediate, or advanced?", extracted: {}, suggestions: ['Beginner', 'Intermediate', 'Advanced'] },
      experience: { message: "Excellent experience! I've structured that for your profile. How long were you in this role?", extracted: {}, suggestions: ['Less than 1 year', '1-2 years', '2-5 years', '5+ years'] },
      default: { message: "Got it! I've captured that information. What else would you like to add to your profile?", extracted: {}, suggestions: ['Add skills', 'Add experience', 'Add projects', 'Generate summary'] },
    };
    return res.json(responses[step] || responses.default);
  }

  try {
    const parsed = JSON.parse(aiText.replace(/```json|```/g, '').trim());
    res.json(parsed);
  } catch {
    res.json({ message: aiText, extracted: {}, suggestions: [] });
  }
});

// Role recommendations
router.post('/recommend-roles', authenticate, async (req, res) => {
  const { skills, experience } = req.body;

  const system = `Based on the candidate's skills and experience, suggest 5 ideal job roles.
Return ONLY valid JSON array:
[{"role": "Role Title", "match": 85, "reason": "Brief reason"}]
Match should be 0-100.`;

  const aiText = await callClaude(system, `Skills: ${skills?.map(s=>s.name).join(', ')}. Experience: ${experience?.map(e=>e.role).join(', ')}`);

  if (!aiText) {
    return res.json({ roles: [
      { role: 'Full Stack Developer', match: 92, reason: 'Strong match with React and Node.js skills' },
      { role: 'Frontend Developer', match: 88, reason: 'Excellent React and UI development skills' },
      { role: 'Software Engineer', match: 85, reason: 'Solid programming fundamentals' },
      { role: 'Technical Lead', match: 72, reason: 'Leadership potential with strong technical base' },
      { role: 'Solutions Architect', match: 65, reason: 'Good systems understanding for architecture roles' },
    ], ai_powered: false });
  }

  try {
    const roles = JSON.parse(aiText.replace(/```json|```/g, '').trim());
    res.json({ roles, ai_powered: true });
  } catch {
    res.json({ roles: [], ai_powered: false });
  }
});

module.exports = router;
