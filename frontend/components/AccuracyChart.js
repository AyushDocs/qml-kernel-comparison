import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'

const COLORS = { quantum: '#f43f5e', rbf: '#a855f7', polynomial: '#38bdf8' }
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
      <div style={{ fontSize: '0.9rem', color: '#9f8e93', marginBottom: '1rem', fontWeight: 500 }}>
        Best Performing: <span style={{ color: '#fff1f2', fontWeight: 600 }}>{best.map(d => d.name).join(', ')}</span> ({maxAcc.toFixed(1)}%)
      </div>
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={data} margin={{ top: 20, right: 10, bottom: 5, left: -10 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9f8e93' }} axisLine={{ stroke: 'rgba(244, 63, 94, 0.15)' }} tickLine={false} />
          <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: '#9f8e93' }} axisLine={{ stroke: 'rgba(244, 63, 94, 0.15)' }} tickLine={false} />
          <Tooltip 
            formatter={(v) => [`${v}%`, 'Accuracy']}
            contentStyle={{
              backgroundColor: '#150d0f',
              borderColor: 'rgba(244, 63, 94, 0.25)',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              color: '#fff1f2',
              fontSize: '0.85rem'
            }}
          />
          <Bar dataKey="accuracy" radius={[6, 6, 0, 0]} maxBarSize={50}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
            <LabelList dataKey="accuracy" position="top" formatter={v => `${v}%`} style={{ fontSize: 12, fill: '#fff1f2', fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

