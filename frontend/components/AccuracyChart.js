import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts'

const COLORS = { quantum: '#4361ee', rbf: '#f72585', polynomial: '#4cc9f0' }
const LABELS = { quantum: 'Quantum (Angle)', rbf: 'RBF', polynomial: 'Polynomial' }

export default function AccuracyChart({ kernels }) {
  const data = Object.entries(kernels).map(([name, k]) => ({
    name: LABELS[name] || name,
    accuracy: +(k.accuracy * 100).toFixed(1),
    fill: COLORS[name],
  }))

  const maxAcc = Math.max(...data.map(d => d.accuracy))
  const best = data.filter(d => d.accuracy === maxAcc)

  return (
    <div>
      <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
        Best: {best.map(d => d.name).join(', ')} ({maxAcc.toFixed(1)}%)
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} />
          <Tooltip formatter={(v) => `${v}%`} />
          <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
            <LabelList dataKey="accuracy" position="top" formatter={v => `${v}%`} style={{ fontSize: 13, fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
