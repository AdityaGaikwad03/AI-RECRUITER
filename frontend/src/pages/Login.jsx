import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await login(form);
      signIn(data.user, data.token);
      navigate(data.user.role === 'recruiter' ? '/recruiter' : '/builder');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  const fillDemo = () => setForm({ email: 'hire-me@anshumat.org', password: 'HireMe@2025!' });

  return (
    <div className={styles.page}>
      <div className={styles.bg}><div className={styles.orb} /></div>
      <div className={styles.card}>
        <Link to="/" className={styles.logo}><span>✦</span> HireAI</Link>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.sub}>Sign in to continue your journey</p>

        <button onClick={fillDemo} className={`btn btn-ghost ${styles.demoBtn}`}>
          Use demo login ↗
        </button>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" required />
          </div>
          <div className={styles.field}>
            <label className="label">Password</label>
            <input className="input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? <><div className="spinner" /> Signing in...</> : 'Sign In →'}
          </button>
        </form>

        <p className={styles.switchText}>Don't have an account? <Link to="/signup" className={styles.switchLink}>Sign up</Link></p>
      </div>
    </div>
  );
}
