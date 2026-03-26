import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { signOut(); navigate('/'); };

  const isCandidate = user?.role === 'candidate';
  const links = isCandidate
    ? [{ to: '/builder', label: 'Profile Builder' }, { to: '/preview', label: 'My Profile' }]
    : [{ to: '/recruiter', label: 'Dashboard' }];

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to={isCandidate ? '/builder' : '/recruiter'} className={styles.logo}>
          <span className={styles.logoIcon}>✦</span>
          <span>HireAI</span>
        </Link>
        <div className={styles.links}>
          {links.map(l => (
            <Link key={l.to} to={l.to} className={`${styles.link} ${location.pathname === l.to ? styles.active : ''}`}>{l.label}</Link>
          ))}
        </div>
        <div className={styles.right}>
          <div className={styles.userPill}>
            <div className={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <span className={styles.userName}>{user?.name?.split(' ')[0]}</span>
            <span className={styles.roleBadge}>{user?.role}</span>
          </div>
          <button onClick={handleLogout} className={`btn btn-ghost btn-sm ${styles.logoutBtn}`}>Sign out</button>
        </div>
      </div>
    </nav>
  );
}
