import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { signup } from '../api';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

export default function Signup() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: params.get('role') || 'candidate', company: '', position: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const update = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    setLoading(true); setError('');
    try {
      const { data } = await signup(form);
      signIn(data.user, data.token);
      navigate(data.user.role === 'recruiter' ? '/recruiter' : '/onboarding');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally { setLoading(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bg}><div className={styles.orb} /></div>
      <div className={styles.card}>
        <Link to="/" className={styles.logo}><span>✦</span> HireAI</Link>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.sub}>Start building your AI-powered profile</p>

        {/* Role Toggle */}
        <div className={styles.roleToggle}>
          {['candidate', 'recruiter'].map(r => (
            <button key={r} type="button" onClick={() => setForm(f => ({ ...f, role: r }))} className={`${styles.roleBtn} ${form.role === r ? styles.roleActive : ''}`}>
              {r === 'candidate' ? '🎯 Candidate' : '🔍 Recruiter'}
            </button>
          ))}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className="label">Full Name</label>
            <input className="input" value={form.name} onChange={update('name')} placeholder="Your full name" required />
          </div>
          <div className={styles.field}>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" required />
          </div>
          {form.role === 'recruiter' && (
            <>
              <div className={styles.field}>
                <label className="label">Company</label>
                <input className="input" value={form.company} onChange={update('company')} placeholder="Company name" />
              </div>
              <div className={styles.field}>
                <label className="label">Your Position</label>
                <input className="input" value={form.position} onChange={update('position')} placeholder="e.g. HR Manager" />
              </div>
            </>
          )}
          <div className={styles.field}>
            <label className="label">Password</label>
            <input className="input" type="password" value={form.password} onChange={update('password')} placeholder="Min 8 characters" required />
          </div>
          <button type="submit" className="btn btn-ai" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? <><div className="spinner" style={{ borderTopColor: '#000' }} /> Creating account...</> : `Create ${form.role === 'recruiter' ? 'Recruiter' : 'Candidate'} Account →`}
          </button>
        </form>

        <p className={styles.switchText}>Already have an account? <Link to="/login" className={styles.switchLink}>Sign in</Link></p>
      </div>
    </div>
  );
}
