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

  if (!results) return <div className="loading">Loading QML benchmarks...</div>

  const data = results[dataset]

  return (
    <div className="container">
      <Head>
        <title>Quantum Kernel vs Classical SVM</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          background-color: #0b0506;
          color: #e2d8db;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          line-height: 1.6;
          min-height: 100vh;
          overflow-x: hidden;
        }
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Outfit', sans-serif;
          color: #fff1f2;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3.5rem 1.5rem;
          position: relative;
        }
        .glow-rose {
          position: absolute;
          top: -150px;
          right: -100px;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(244, 63, 94, 0.05) 0%, rgba(0,0,0,0) 70%);
          z-index: -1;
          filter: blur(80px);
          pointer-events: none;
        }
        .glow-purple {
          position: absolute;
          top: 600px;
          left: -200px;
          width: 700px;
          height: 700px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.04) 0%, rgba(0,0,0,0) 70%);
          z-index: -1;
          filter: blur(100px);
          pointer-events: none;
        }
        .header {
          text-align: center;
          margin-bottom: 3.5rem;
        }
        .title {
          font-size: 3rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #fff1f2 20%, #fda4af 60%, #f43f5e 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 1rem;
          font-family: 'Outfit', sans-serif;
        }
        .subtitle {
          color: #9f8e93;
          max-width: 650px;
          margin: 0 auto;
          font-size: 1.05rem;
          line-height: 1.6;
          font-weight: 400;
        }
        .controls {
          display: flex;
          gap: 0.8rem;
          align-items: center;
          justify-content: center;
          margin-bottom: 3rem;
        }
        .controls label {
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #9f8e93;
        }
        .select {
          background: #150d0f;
          border: 1px solid rgba(244, 63, 94, 0.2);
          border-radius: 8px;
          padding: 0.5rem 2.2rem 0.5rem 1rem;
          color: #fff1f2;
          font-size: 0.95rem;
          font-family: 'Outfit', sans-serif;
          font-weight: 500;
          outline: none;
          cursor: pointer;
          transition: border-color 0.25s, box-shadow 0.25s;
          appearance: none;
          background-image: url("data:image/svg+xml;utf8,<svg fill='%23f43f5e' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
          background-repeat: no-repeat;
          background-position: right 8px center;
          background-size: 18px;
        }
        .select:hover, .select:focus {
          border-color: rgba(244, 63, 94, 0.5);
          box-shadow: 0 0 0 2px rgba(244, 63, 94, 0.15);
        }
        .grid {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }
        .grid-two {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: 2.5rem;
          margin-bottom: 2.5rem;
        }
        @media (max-width: 980px) {
          .grid-two {
            grid-template-columns: 1fr;
          }
        }
        .card {
          background: rgba(21, 13, 15, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 16px;
          padding: 2rem;
          border: 1px solid rgba(244, 63, 94, 0.12);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03);
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .card:hover {
          transform: translateY(-2px);
          border-color: rgba(244, 63, 94, 0.22);
          box-shadow: 0 12px 35px rgba(244, 63, 94, 0.04), 0 10px 30px rgba(0, 0, 0, 0.35);
        }
        .card h2 {
          font-size: 1.3rem;
          font-weight: 700;
          color: #fff1f2;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid rgba(244, 63, 94, 0.12);
          padding-bottom: 0.75rem;
          letter-spacing: -0.01em;
        }
        .heatmaps, .boundaries {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          justify-content: center;
        }
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-size: 1.2rem;
          font-weight: 500;
          color: #f43f5e;
          background-color: #0b0506;
          font-family: 'Outfit', sans-serif;
        }
        .explanation {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2.5rem;
        }
        .explanation-section h3 {
          font-size: 1.1rem;
          color: #f43f5e;
          margin-bottom: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .explanation-section h3::before {
          content: '▪';
          color: #fb7185;
        }
        .explanation-section p {
          font-size: 0.95rem;
          color: #e2d8db;
          line-height: 1.6;
          margin-bottom: 1.2rem;
        }
        .code {
          background: #0d0708;
          border: 1px solid rgba(244, 63, 94, 0.15);
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          font-size: 0.85rem;
          font-family: 'Fira Code', monospace;
          color: #fda4af;
          margin-bottom: 1.2rem;
          box-shadow: inset 0 2px 8px rgba(0,0,0,0.8);
        }
        code {
          font-family: 'Fira Code', monospace;
          background: #0d0708;
          padding: 2px 6px;
          border-radius: 4px;
          color: #f43f5e;
          font-size: 0.9em;
          border: 1px solid rgba(244, 63, 94, 0.1);
        }
        /* Scrollbar for pre/code */
        pre::-webkit-scrollbar {
          height: 6px;
        }
        pre::-webkit-scrollbar-track {
          background: #0d0708;
        }
        pre::-webkit-scrollbar-thumb {
          background: #2b171c;
          border-radius: 3px;
        }
        pre::-webkit-scrollbar-thumb:hover {
          background: #f43f5e;
        }
        /* Custom Scrollbar for html */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0b0506;
        }
        ::-webkit-scrollbar-thumb {
          background: #2b171c;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #f43f5e;
        }
      `}</style>

      <div className="glow-rose" />
      <div className="glow-purple" />

      <header className="header">
        <h1 className="title">Quantum Kernel vs Classical SVM</h1>
        <p className="subtitle">
          Comparing quantum kernel methods (angle encoding) against RBF and polynomial kernels
          on synthetic datasets — all built from scratch using NumPy
        </p>
      </header>

      <div className="controls">
        <label htmlFor="dataset-select">Dataset:</label>
        <select 
          id="dataset-select" 
          value={dataset} 
          onChange={e => setDataset(e.target.value)} 
          className="select"
        >
          <option value="moons">Two Moons</option>
          <option value="circles">Concentric Circles</option>
        </select>
      </div>

      <div className="grid-two">
        <div className="card">
          <h2>Classification Accuracy</h2>
          <AccuracyChart kernels={data.kernels} />
        </div>

        <div className="card">
          <h2>Kernel Alignment (CKA)</h2>
          <AlignmentTable alignment={data.alignment} />
        </div>
      </div>

      <div className="grid">
        <div className="card card-full">
          <h2>Kernel Matrices</h2>
          <div className="heatmaps">
            {Object.entries(data.kernel_matrices).map(([name, mat]) => (
              <KernelHeatmap key={name} name={name} matrix={mat} />
            ))}
          </div>
        </div>

        <div className="card card-full">
          <h2>Eigenspectrum (Top 20 Eigenvalues)</h2>
          <EigenspectrumChart spectra={data.eigenspectra} />
        </div>

        <div className="card card-full">
          <h2>Decision Boundaries</h2>
          <div className="boundaries">
            {['quantum', 'rbf', 'polynomial'].map(name => (
              <DecisionBoundary key={name} name={name} data={data.decision_boundary} points={data.data} />
            ))}
          </div>
        </div>

        <div className="card card-full">
          <h2>How It Works</h2>
          <div className="explanation">
            <div className="explanation-section">
              <h3>Quantum Feature Map</h3>
              <p>
                Each data point <code>x = (x₁, x₂)</code> is encoded as a quantum state via
                angle encoding:
              </p>
              <pre className="code">
|ϕ(x)⟩ = cos(x₁)|0⟩ + sin(x₁)|1⟩ ⊗ cos(x₂)|0⟩ + sin(x₂)|1⟩
              </pre>
              <p>
                This is a tensor product of single-qubit rotation gates — implemented as a
                pure matrix operation in NumPy, without needing quantum hardware.
              </p>
            </div>

            <div className="explanation-section">
              <h3>Quantum Kernel</h3>
              <p>
                The kernel is the squared overlap between encoded states:
              </p>
              <pre className="code">
{'K[i,j] = |\u27E8\u03C6(x\u1D62)|\u03C6(x\u2C7C)\u27E9|\u00B2 = \u220F_{k=1}^{d} cos\u00B2(x\u1D62\u2096 - x\u2C7C\u2096)'}
              </pre>
              <p>
                The inner product factorises across dimensions because of the tensor product
                structure — giving us a simple, closed-form expression.
              </p>
            </div>

            <div className="explanation-section">
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

