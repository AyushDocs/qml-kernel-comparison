import { useRef, useEffect } from 'react'

const COLORS = { quantum: '#f43f5e', rbf: '#a855f7', polynomial: '#38bdf8' }
const NAMES = { quantum: 'Quantum Kernel SVM', rbf: 'RBF Kernel SVM', polynomial: 'Polynomial Kernel SVM' }

export default function DecisionBoundary({ name, data, points }) {
  const ref = useRef(null)
  const Z = data.Z[name]
  const gridX = data.grid.x
  const gridY = data.grid.y

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || !Z || !gridX || !gridY) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width
    const h = canvas.height

    const nx = gridX.length
    const ny = gridX[0].length
    const xMin = gridX[0][0]
    const xMax = gridX[nx - 1][0]
    const yMin = gridY[0][0]
    const yMax = gridY[0][ny - 1]

    const sx = v => ((v - xMin) / (xMax - xMin)) * w
    const sy = v => h - ((v - yMin) / (yMax - yMin)) * h

    ctx.clearRect(0, 0, w, h)

    const imageData = ctx.createImageData(w, h)
    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const ix = Math.min(Math.round(px / w * (nx - 1)), nx - 2)
        const iy = Math.min(Math.round(py / h * (ny - 1)), ny - 2)
        const z = Z[iy]?.[ix] ?? 0
        const idx = (py * w + px) * 4
        // Class +1 (z === 1) -> Translucent Rose Red (244, 63, 94)
        // Class -1 (z === 0) -> Translucent Slate Cyan (56, 189, 248)
        imageData.data[idx] = z === 1 ? 244 : 56
        imageData.data[idx + 1] = z === 1 ? 63 : 189
        imageData.data[idx + 2] = z === 1 ? 94 : 248
        imageData.data[idx + 3] = 45 // Alpha opacity
      }
    }
    ctx.putImageData(imageData, 0, 0)

    const { X_train, y_train } = points
    for (let i = 0; i < X_train.length; i++) {
      const [px, pyVal] = X_train[i]
      ctx.beginPath()
      ctx.arc(sx(px), sy(pyVal), 4.5, 0, Math.PI * 2)
      ctx.fillStyle = y_train[i] === 1 ? '#f43f5e' : '#38bdf8'
      ctx.fill()
      ctx.strokeStyle = '#0b0506' // Dark background color for high-contrast border
      ctx.lineWidth = 1.2
      ctx.stroke()
    }
  }, [Z, gridX, gridY, points])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h3 style={{ margin: '0 0 0.8rem', fontSize: '0.95rem', color: COLORS[name], fontWeight: 600 }}>
        {NAMES[name]}
      </h3>
      <canvas ref={ref} width={320} height={280}
        style={{ 
          width: '100%', 
          maxWidth: 320, 
          aspectRatio: '320/280', 
          borderRadius: 10, 
          border: '1px solid rgba(244, 63, 94, 0.15)',
          background: '#0d0708'
        }}
      />
      <div style={{ fontSize: '0.75rem', color: '#9f8e93', marginTop: '0.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <span><span style={{ color: '#f43f5e', fontWeight: 'bold' }}>●</span> Class +1</span>
        <span><span style={{ color: '#38bdf8', fontWeight: 'bold' }}>●</span> Class -1</span>
        <span style={{ color: '#7e6c71' }}>Shaded area = Decision space</span>
      </div>
    </div>
  )
}

