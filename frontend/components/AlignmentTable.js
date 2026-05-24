const LABELS = {
  quantum_vs_rbf: 'Quantum ↔ RBF',
  quantum_vs_poly: 'Quantum ↔ Polynomial',
  rbf_vs_poly: 'RBF ↔ Polynomial',
}

export default function AlignmentTable({ alignment }) {
  const pairs = Object.entries(alignment).filter(([k]) => k !== 'quantum_vs_quantum')

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid rgba(244, 63, 94, 0.25)' }}>
          <th style={styles.th}>Kernel Pair</th>
          <th style={styles.th}>CKA Score</th>
          <th style={styles.th}>Interpretation</th>
        </tr>
      </thead>
      <tbody>
        {pairs.map(([pair, val]) => (
          <tr key={pair} style={{ borderBottom: '1px solid rgba(244, 63, 94, 0.12)' }}>
            <td style={{ ...styles.td, color: '#fff1f2', fontWeight: 500 }}>{LABELS[pair] || pair}</td>
            <td style={{ ...styles.td, color: '#e2d8db', fontFamily: '"Fira Code", monospace' }}>{val.toFixed(4)}</td>
            <td style={styles.td}>
              <span style={{
                color: val > 0.8 ? '#fb7185' : val > 0.5 ? '#c084fc' : '#94a3b8',
                fontWeight: 600,
                fontSize: '0.85rem',
                backgroundColor: val > 0.8 ? 'rgba(251, 113, 133, 0.1)' : val > 0.5 ? 'rgba(192, 132, 252, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                padding: '2px 8px',
                borderRadius: 4,
              }}>
                {val > 0.8 ? 'Similar geometry' : val > 0.5 ? 'Moderate similarity' : 'Different geometry'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const styles = {
  th: { padding: '0.8rem 0.8rem', textAlign: 'left', fontSize: '0.85rem', color: '#9f8e93', fontWeight: 600 },
  td: { padding: '0.8rem 0.8rem', fontSize: '0.9rem' },
}

