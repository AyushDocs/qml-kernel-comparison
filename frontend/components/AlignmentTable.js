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
        <tr style={{ borderBottom: '2px solid #e8e8f0' }}>
          <th style={styles.th}>Kernel Pair</th>
          <th style={styles.th}>CKA Score</th>
          <th style={styles.th}>Interpretation</th>
        </tr>
      </thead>
      <tbody>
        {pairs.map(([pair, val]) => (
          <tr key={pair} style={{ borderBottom: '1px solid #f0f0f5' }}>
            <td style={styles.td}>{LABELS[pair] || pair}</td>
            <td style={styles.td}>{val.toFixed(4)}</td>
            <td style={styles.td}>
              <span style={{
                color: val > 0.8 ? '#2ecc71' : val > 0.5 ? '#f39c12' : '#e74c3c',
                fontWeight: 600,
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
  th: { padding: '0.6rem 0.8rem', textAlign: 'left', fontSize: '0.85rem', color: '#888' },
  td: { padding: '0.6rem 0.8rem', fontSize: '0.9rem' },
}
