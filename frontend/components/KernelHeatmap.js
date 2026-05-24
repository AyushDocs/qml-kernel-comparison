const COLORS = { quantum: '#f43f5e', rbf: '#a855f7', polynomial: '#38bdf8' }
const LABELS = { quantum: 'Quantum (Angle)', rbf: 'RBF', polynomial: 'Polynomial' }

export default function KernelHeatmap({ name, matrix }) {
  const n = matrix.length
  const allVals = matrix.flat()
  const maxVal = Math.max(...allVals)
  const minVal = Math.min(...allVals)

  const cellSize = Math.max(6, Math.min(14, 280 / n))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.5rem' }}>
      <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: COLORS[name], fontWeight: 600 }}>
        {LABELS[name] || name}
      </h3>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(${n}, ${cellSize}px)`, 
        gap: 1, 
        padding: 6,
        background: '#0d0708', 
        borderRadius: 8,
        border: '1px solid rgba(244, 63, 94, 0.1)'
      }}>
        {matrix.map((row, i) =>
          row.map((val, j) => {
            const intensity = (val - minVal) / (maxVal - minVal || 1)
            // Interpolate from deep dark charcoal-rose (26, 16, 18) to bright rose (244, 63, 94)
            const r = Math.round(26 + (244 - 26) * intensity)
            const g = Math.round(16 + (63 - 16) * intensity)
            const b = Math.round(18 + (94 - 18) * intensity)
            return (
              <div
                key={`${i}-${j}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  background: `rgb(${r}, ${g}, ${b})`,
                  borderRadius: 1,
                  transition: 'background 0.2s ease',
                }}
                title={`K[${i},${j}] = ${val.toFixed(4)}`}
              />
            )
          })
        )}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#9f8e93', marginTop: '0.8rem', fontFamily: '"Fira Code", monospace' }}>
        {n} × {n} matrix • Min: {minVal.toFixed(2)} Max: {maxVal.toFixed(2)}
      </div>
    </div>
  )
}

