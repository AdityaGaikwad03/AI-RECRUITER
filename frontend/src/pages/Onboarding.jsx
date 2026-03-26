import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Onboarding.module.css';

const steps = [
  {
    icon: '👋',
    title: 'Welcome to HireAI',
    sub: 'No resumes. No PDFs. Just you, talking naturally.',
    content: "Traditional resumes are broken. Formatting issues, parsing errors, and unconscious bias from irrelevant details hold great candidates back. We fixed that.",
    action: 'Let\'s Fix This Together',
  },
  {
    icon: '🧠',
    title: 'Meet Your AI Profile Builder',
    sub: 'Just talk — we\'ll structure everything',
    content: "Tell me about your work experience in plain English. Say 'I worked at Flipkart for 2 years building the payments system' and I'll instantly create a structured, professional entry with extracted skills, timeline, and highlights.",
    action: 'Got It, Show Me How',
    aiDemo: { user: 'I worked at Zomato building the delivery tracking feature using React and WebSockets', ai: 'Structured: Frontend Developer at Zomato · Real-time Systems. Skills extracted: React, WebSockets, geolocation APIs, real-time data handling. Shall I add this?' },
  },
  {
    icon: '⚡',
    title: 'Your Profile, In 5 Minutes',
    sub: 'We guide you through every section',
    content: "Skills, experience, projects, education — I'll ask you one thing at a time and build your complete professional profile. You'll also get AI-generated role recommendations and a professional summary.",
    action: 'Build My Profile Now →',
    final: true,
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const current = steps[step];

  const handleAction = () => {
    if (current.final) navigate('/builder');
    else setStep(s => s + 1);
  };

  return (
    <div className={styles.page}>
      <div className={styles.bg}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
      </div>

      <div className={styles.container}>
        <div className={styles.progress}>
          {steps.map((_, i) => (
            <div key={i} className={`${styles.dot} ${i <= step ? styles.dotActive : ''}`} />
          ))}
        </div>

        <div className={styles.card} key={step}>
          <div className={styles.icon}>{current.icon}</div>
          <div className={styles.stepNum}>Step {step + 1} of {steps.length}</div>
          <h1 className={styles.title}>{current.title}</h1>
          <p className={styles.sub}>{current.sub}</p>
          <p className={styles.content}>{current.content}</p>

          {current.aiDemo && (
            <div className={styles.aiDemo}>
              <div className={styles.aiDemoHeader}>
                <span className="ai-badge">Live AI Example</span>
              </div>
              <div className={styles.chatRow}>
                <div className={styles.userBubble}>
                  <span className={styles.bubbleAvatar}>{user?.name?.[0] || 'U'}</span>
                  <p>{current.aiDemo.user}</p>
                </div>
              </div>
              <div className={styles.chatRow}>
                <div className={styles.aiBubble}>
                  <span className={styles.aiAvatar}>✦</span>
                  <p>{current.aiDemo.ai}</p>
                </div>
              </div>
            </div>
          )}

          <button onClick={handleAction} className={`btn btn-ai btn-lg ${styles.actionBtn}`}>
            {current.action}
          </button>

          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className={`btn btn-ghost ${styles.backBtn}`}>
              ← Back
            </button>
          )}
        </div>

        <p className={styles.skip} onClick={() => navigate('/builder')}>Skip intro, go straight to builder →</p>
      </div>
    </div>
  );
}
