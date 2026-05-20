const COLORS = { quantum: '#4361ee', rbf: '#f72585', polynomial: '#4cc9f0' }

export default function KernelHeatmap({ name, matrix }) {
  const n = matrix.length
  const allVals = matrix.flat()
  const maxVal = Math.max(...allVals)
  const minVal = Math.min(...allVals)

  const cellSize = Math.max(6, Math.min(14, 280 / n))

  return (
    <div>
      <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', color: COLORS[name], textTransform: 'capitalize' }}>
        {name}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, ${cellSize}px)`, gap: 1 }}>
        {matrix.map((row, i) =>
          row.map((val, j) => {
            const intensity = (val - minVal) / (maxVal - minVal || 1)
            const r = Math.round(66 + (67 - 66) * intensity)
            const g = Math.round(97 + (249 - 97) * intensity)
            const b = Math.round(238 + (133 - 238) * intensity)
            return (
              <div
                key={`${i}-${j}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  background: intensity === 0 ? '#f8f8fc' : `rgb(${255 - Math.round(200 * intensity)}, ${255 - Math.round(180 * intensity)}, 255)`,
                  borderRadius: 1,
                }}
                title={`K[${i},${j}] = ${val.toFixed(4)}`}
              />
            )
          })
        )}
      </div>
      <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.3rem' }}>
        [{n}×{n}] K[{n},{n}] = K(xn, xn)
      </div>
    </div>
  )
}
