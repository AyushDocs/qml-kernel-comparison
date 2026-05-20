import { useEffect, useState } from 'react'
import Head from 'next/head'
import AccuracyChart from '../components/AccuracyChart'
import KernelHeatmap from '../components/KernelHeatmap'
import AlignmentTable from '../components/AlignmentTable'
import EigenspectrumChart from '../components/EigenspectrumChart'
import DecisionBoundary from '../components/DecisionBoundary'

export default function Home() {
  const [results, setResults] = useState(null)
  const [dataset, setDataset] = useState('moons')

  useEffect(() => {
    fetch('/results.json')
      .then(r => r.json())
      .then(setResults)
      .catch(() => fetch('/api/results').then(r => r.json()).then(setResults))
  }, [])

  if (!results) return <div style={styles.loading}>Loading results...</div>

  const data = results[dataset]

  return (
    <div style={styles.container}>
      <Head>
        <title>Quantum Kernel vs Classical SVM</title>
      </Head>

      <header style={styles.header}>
        <h1>Quantum Kernel vs Classical SVM</h1>
        <p style={styles.subtitle}>
          Comparing quantum kernel methods (angle encoding) against RBF and polynomial kernels
          on synthetic datasets — all from scratch with NumPy
        </p>
      </header>

      <div style={styles.controls}>
        <label>Dataset:</label>
        <select value={dataset} onChange={e => setDataset(e.target.value)} style={styles.select}>
          <option value="moons">Two Moons</option>
          <option value="circles">Concentric Circles</option>
        </select>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h2>Classification Accuracy</h2>
          <AccuracyChart kernels={data.kernels} />
        </div>

        <div style={styles.card}>
          <h2>Kernel Alignment (CKA)</h2>
          <AlignmentTable alignment={data.alignment} />
        </div>

        <div style={styles.cardFull}>
          <h2>Kernel Matrices</h2>
          <div style={styles.heatmaps}>
            {Object.entries(data.kernel_matrices).map(([name, mat]) => (
              <KernelHeatmap key={name} name={name} matrix={mat} />
            ))}
          </div>
        </div>

        <div style={styles.cardFull}>
          <h2>Eigenspectrum (Top 20 Eigenvalues)</h2>
          <EigenspectrumChart spectra={data.eigenspectra} />
        </div>

        <div style={styles.cardFull}>
          <h2>Decision Boundaries</h2>
          <div style={styles.boundaries}>
            {['quantum', 'rbf', 'polynomial'].map(name => (
              <DecisionBoundary key={name} name={name} data={data.decision_boundary} points={data.data} />
            ))}
          </div>
        </div>

        <div style={styles.cardFull}>
          <h2>How It Works</h2>
          <div style={styles.explanation}>
            <div style={styles.explanationSection}>
              <h3>Quantum Feature Map</h3>
              <p>
                Each data point <code>x = (x₁, x₂)</code> is encoded as a quantum state via
                angle encoding:
              </p>
              <pre style={styles.code}>
|ϕ(x)⟩ = cos(x₁)|0⟩ + sin(x₁)|1⟩ ⊗ cos(x₂)|0⟩ + sin(x₂)|1⟩
              </pre>
              <p>
                This is a tensor product of single-qubit rotation gates — implemented as a
                pure matrix operation in NumPy, no quantum hardware needed.
              </p>
            </div>

            <div style={styles.explanationSection}>
              <h3>Quantum Kernel</h3>
              <p>
                The kernel is the squared overlap between encoded states:
              </p>
              <pre style={styles.code}>
K[i,j] = |⟨ϕ(xᵢ)|ϕ(xⱼ)⟩|² = ∏_{k=1}^{d} cos²(xᵢₖ - xⱼₖ)
              </pre>
              <p>
                The inner product factorises across dimensions because of the tensor product
                structure — giving us a simple closed-form expression.
              </p>
            </div>

            <div style={styles.explanationSection}>
              <h3>Why This Matters</h3>
              <p>
                This is <strong>not</strong> a claim of quantum advantage. The quantum kernel
                produces a different <em>geometry</em> in feature space than classical kernels.
                By comparing eigenvalue spectra and kernel alignment, we can study whether
                quantum feature maps capture patterns that classical kernels miss — with full
                intellectual honesty about the limitations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#1a1a2e' },
  header: { textAlign: 'center', marginBottom: '2rem' },
  subtitle: { color: '#555', maxWidth: 600, margin: '0.5rem auto', lineHeight: 1.5 },
  controls: { display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' },
  select: { padding: '0.4rem 0.8rem', borderRadius: 6, border: '1px solid #ccc', fontSize: '1rem' },
  grid: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  card: { background: '#fff', borderRadius: 12, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e8e8f0' },
  cardFull: { background: '#fff', borderRadius: 12, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e8e8f0' },
  heatmaps: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' },
  boundaries: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: '#666' },
  explanation: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', lineHeight: 1.6, color: '#333' },
  explanationSection: {},
  code: { background: '#f4f4f8', padding: '0.8rem', borderRadius: 6, overflow: 'auto', fontSize: '0.85rem', fontFamily: '"Fira Code", monospace' },
}
