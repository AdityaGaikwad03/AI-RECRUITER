import { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchCandidates } from '../api';
import styles from './RecruiterDashboard.module.css';

function parseIds(search) {
  const params = new URLSearchParams(search);
  const ids = params.get('ids');
  return ids ? ids.split(',').map(i => parseInt(i, 10)).filter(Boolean) : [];
}

export default function CompareCandidates() {
  const location = useLocation();
  const navigate = useNavigate();
  const ids = useMemo(() => parseIds(location.search), [location.search]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    searchCandidates({}).then(({ data }) => {
      if (!mounted) return;
      setCandidates(data || []);
    }).catch(() => {
      if (!mounted) return;
      setCandidates([]);
    }).finally(() => {
      if (!mounted) return;
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70vh' }}><div className="spinner" /></div>;

  return (
    <div className={styles.page} style={{ padding: 20 }}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.title}>Candidate Compare</h1>
          <p className={styles.subtitle}>{ids.length} candidate{ids.length !==1 ? 's' : ''} selected</p>
        </div>
        <button onClick={() => navigate('/recruiter')} className="btn btn-ghost btn-sm">← Back to dashboard</button>
      </div>

      {ids.length < 2 && (
        <div style={{ padding: 24 }}>
          <p style={{ fontSize: 16 }}>Select at least 2 candidates to compare. Use the dashboard checkboxes to choose up to 3 candidates.</p>
        </div>
      )}

      {ids.length >= 2 && (
        <div className={styles.compareGrid} style={{ gridTemplateColumns: `repeat(${ids.length}, minmax(240px, 1fr))`, gap: '12px' }}>
          {ids.map((id) => {
            const [card] = candidates?.filter(c => c.id === parseInt(id, 10)) || [];
            if (!card) {
              return (
                <div key={id} className={styles.candidateCard} style={{ minHeight: 260, padding: 14 }}>
                  <p>Candidate ID {id} not found</p>
                </div>
              );
            }
            return (
              <div key={id} className={styles.candidateCard} style={{ minHeight: 260, padding: 14 }}>
                <h3 style={{ marginBottom: 6 }}>{card.name}</h3>
                <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>{card.headline || 'No headline yet'}</p>
                <p style={{ fontSize: 13, margin: '0 0 8px' }}><strong>Completion:</strong> {card.completion}%</p>
                <p style={{ fontSize: 13, margin: '0 0 8px' }}><strong>Availability:</strong> {card.availability}</p>
                <p style={{ fontSize: 13, margin: '0 0 8px' }}><strong>Target roles:</strong> {card.desired_roles?.join(', ') || 'n/a'}</p>
                <p style={{ fontSize: 13, margin: '0 0 8px' }}><strong>Skills:</strong> {card.skills?.slice(0, 5).map(s => s.name).join(', ') || 'n/a'}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
