import { useState, useRef, useEffect } from 'react';
import { aiChat } from '../api';
import styles from './AIChat.module.css';

export default function AIChat({ step, context, onExtracted, userName }) {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: getWelcomeMessage(step, userName),
      suggestions: getSuggestions(step),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function getWelcomeMessage(step, name) {
    const greetings = {
      skills: `Hi ${name}! Let's add your skills. You can say something like "I'm good at React and have 3 years of Python experience" — I'll structure it automatically.`,
      experience: `Tell me about your work experience! Just describe it naturally: "I worked at [Company] as [Role] for [Duration] and did [what you did]."`,
      projects: `What projects have you built? Tell me about them — personal, academic, or professional. Include the tech stack if you can!`,
      education: `Tell me about your education — degree, institution, graduation year, any notable achievements.`,
      summary: `I'll generate a professional summary for you based on your profile. Or describe yourself in your own words and I'll refine it!`,
      default: `Hi ${name}! I'm your profile assistant. What would you like to add to your profile?`,
    };
    return greetings[step] || greetings.default;
  }

  function getSuggestions(step) {
    const s = {
      skills: ['Add programming skills', 'Add soft skills', 'Add domain expertise'],
      experience: ['Add a job', 'I freelanced', 'I interned at a company'],
      projects: ['Add a personal project', 'Add a college project', 'Built an app'],
      education: ['Add my degree', 'Add certifications', 'Self-taught developer'],
      summary: ['Generate summary for me', 'I\'ll write my own', 'Mix both'],
    };
    return s[step] || ['Tell me about yourself', 'What should I add?'];
  }

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', text };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await aiChat(text, context, step);
      const aiMsg = {
        role: 'ai',
        text: data.message,
        suggestions: data.suggestions || [],
        extracted: data.extracted,
      };
      setMessages(m => [...m, aiMsg]);
      if (data.extracted && Object.keys(data.extracted).length > 0) {
        onExtracted?.(data.extracted);
      }
    } catch {
      setMessages(m => [...m, { role: 'ai', text: 'Sorry, I had trouble processing that. Please try again!', suggestions: [] }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  return (
    <div className={styles.chat}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.aiAvatar}>✦</div>
          <div>
            <p className={styles.aiName}>HireSmart Assistant</p>
            <p className={styles.aiStatus}><span className={styles.statusDot} /> Online · Smart assistant</p>
          </div>
        </div>
        <span className="ai-badge">Smart Assistant</span>
      </div>

      <div className={styles.messages}>
        {messages.map((msg, i) => (
          <div key={i} className={`${styles.msgRow} ${msg.role === 'user' ? styles.userRow : ''}`}>
            {msg.role === 'ai' && <div className={styles.msgAvatar}>✦</div>}
            <div className={`${styles.bubble} ${msg.role === 'user' ? styles.userBubble : styles.aiBubble}`}>
              {msg.text}
              {msg.extracted && Object.keys(msg.extracted).length > 0 && (
                <div className={styles.extracted}>
                  <span className={styles.extractedLabel}>✓ Captured:</span>
                  {Object.entries(msg.extracted).map(([k, v]) => (
                    <span key={k} className={styles.extractedItem}>{k}: {typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                  ))}
                </div>
              )}
            </div>
            {msg.role === 'user' && <div className={styles.userAvatar}>{userName?.[0] || 'U'}</div>}
          </div>
        ))}

        {/* Suggestions */}
        {messages[messages.length - 1]?.suggestions?.length > 0 && !loading && (
          <div className={styles.suggestions}>
            {messages[messages.length - 1].suggestions.map((s, i) => (
              <button key={i} onClick={() => sendMessage(s)} className={styles.suggestionBtn}>{s}</button>
            ))}
          </div>
        )}

        {loading && (
          <div className={styles.msgRow}>
            <div className={styles.msgAvatar}>✦</div>
            <div className={`${styles.bubble} ${styles.aiBubble} ${styles.typingBubble}`}>
              <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className={styles.inputArea}>
        <textarea
          className={`${styles.inputBox} input input-smart`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type naturally... the assistant will structure it"
          rows={2}
        />
        <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading} className={`btn btn-ai ${styles.sendBtn}`}>
          {loading ? <div className="spinner" style={{ borderTopColor: '#000', width: '16px', height: '16px' }} /> : '↑'}
        </button>
      </div>
    </div>
  );
}
