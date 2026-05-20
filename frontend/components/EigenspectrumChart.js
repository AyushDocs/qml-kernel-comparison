import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'

const COLORS = { quantum: '#4361ee', rbf: '#f72585', polynomial: '#4cc9f0' }
const LABELS = { quantum: 'Quantum', rbf: 'RBF', polynomial: 'Polynomial' }

export default function EigenspectrumChart({ spectra }) {
  const maxLen = Math.max(...Object.values(spectra).map(s => s.length))
  const data = []
  for (let i = 0; i < maxLen; i++) {
    const point = { index: i + 1 }
    for (const [name, vals] of Object.entries(spectra)) {
      if (i < vals.length) point[LABELS[name]] = vals[i]
    }
    data.push(point)
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="index" label={{ value: 'Eigenvalue rank', position: 'insideBottom', offset: -5 }} />
        <YAxis scale="log" domain={['auto', 'auto']} label={{ value: 'Magnitude (log)', angle: -90, position: 'insideLeft' }} />
        <Tooltip formatter={(v) => v.toFixed(4)} />
        <Legend />
        {Object.entries(LABELS).map(([key, label]) => (
          <Line key={key} type="monotone" dataKey={label} stroke={COLORS[key]} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
