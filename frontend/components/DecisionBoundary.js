const COLORS = { quantum: '#4361ee', rbf: '#f72585', polynomial: '#4cc9f0' }
const NAMES = { quantum: 'Quantum Kernel SVM', rbf: 'RBF Kernel SVM', polynomial: 'Polynomial Kernel SVM' }

export default function DecisionBoundary({ name, data, points }) {
  const { grid_x, grid_y, Z } = data

  const canvasRef = React => {
    const ref = React.useRef(null)
    const { useEffect } = React
    useEffect(() => {
      const canvas = ref.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const w = canvas.width
      const h = canvas.height

      const nx = grid_x.length
      const ny = grid_y[0].length
      const xMin = grid_x[0][0], xMax = grid_x[nx - 1][0]
      const yMin = grid_y[0][0], yMax = grid_y[0][ny - 1]

      function sx(v) { return ((v - xMin) / (xMax - xMin)) * w }
      function sy(v) { return h - ((v - yMin) / (yMax - yMin)) * h }

      ctx.clearRect(0, 0, w, h)

      // Draw decision boundary
      const imageData = ctx.createImageData(w, h)
      for (let py = 0; py < h; py++) {
        for (let px = 0; px < w; px++) {
          const gx = px / w * (nx - 1)
          const gy = py / h * (ny - 1)
          const ix = Math.round(gx)
          const iy = Math.round(gy)
          const ix2 = Math.min(ix, nx - 2)
          const iy2 = Math.min(iy, ny - 2)
          let z
          try {
            z = Z[iy2]?.[ix2] ?? 0
          } catch { z = 0 }
          const idx = (py * w + px) * 4
          if (z === 1) {
            imageData.data[idx] = 200; imageData.data[idx+1] = 220; imageData.data[idx+2] = 255; imageData.data[idx+3] = 120
          } else {
            imageData.data[idx] = 255; imageData.data[idx+1] = 200; imageData.data[idx+2] = 200; imageData.data[idx+3] = 120
          }
        }
      }
      ctx.putImageData(imageData, 0, 0)

      // Draw training points
      const { X_train, y_train } = points
      for (let i = 0; i < X_train.length; i++) {
        const [px, py_val] = X_train[i]
        const cx = sx(px)
        const cy = sy(py_val)
        ctx.beginPath()
        ctx.arc(cx, cy, 4, 0, Math.PI * 2)
        ctx.fillStyle = y_train[i] === 1 ? '#4361ee' : '#e74c3c'
        ctx.fill()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    }, [grid_x, grid_y, Z, points])
    return ref
  }

  const canvasRefHook = canvasRef(React)

  return (
    <div>
      <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', color: COLORS[name], textTransform: 'capitalize' }}>
        {NAMES[name]}
      </h3>
      <canvas ref={canvasRefHook} width={320} height={280}
        style={{ width: '100%', maxWidth: 320, height: 'auto', aspectRatio: '320/280', borderRadius: 8, border: '1px solid #e8e8f0' }}
      />
      <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.3rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <span><span style={{ color: '#4361ee', fontWeight: 'bold' }}>●</span> Class +1</span>
        <span><span style={{ color: '#e74c3c', fontWeight: 'bold' }}>●</span> Class -1</span>
        <span style={{ color: '#999' }}>Background = decision region</span>
      </div>
    </div>
  )
}
