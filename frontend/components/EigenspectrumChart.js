import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'

const COLORS = { quantum: '#f43f5e', rbf: '#a855f7', polynomial: '#38bdf8' }
const LABELS = { quantum: 'Quantum (Angle)', rbf: 'RBF', polynomial: 'Polynomial' }

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
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 15, right: 20, left: 10, bottom: 25 }}>
        <CartesianGrid stroke="rgba(244, 63, 94, 0.08)" strokeDasharray="4 4" />
        <XAxis 
          dataKey="index" 
          tick={{ fontSize: 11, fill: '#9f8e93' }} 
          axisLine={{ stroke: 'rgba(244, 63, 94, 0.15)' }} 
          tickLine={false}
          label={{ value: 'Eigenvalue Rank', position: 'bottom', offset: 10, fill: '#9f8e93', fontSize: 12, fontWeight: 500 }} 
        />
        <YAxis 
          scale="log" 
          domain={['auto', 'auto']} 
          tick={{ fontSize: 11, fill: '#9f8e93' }} 
          axisLine={{ stroke: 'rgba(244, 63, 94, 0.15)' }} 
          tickLine={false}
          label={{ value: 'Magnitude (Log)', angle: -90, position: 'insideLeft', offset: -5, fill: '#9f8e93', fontSize: 12, fontWeight: 500 }} 
        />
        <Tooltip 
          formatter={(v) => [v.toFixed(6), 'Eigenvalue']}
          contentStyle={{
            backgroundColor: '#150d0f',
            borderColor: 'rgba(244, 63, 94, 0.25)',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            color: '#fff1f2',
            fontSize: '0.85rem'
          }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: 15, fontSize: 12 }}
          formatter={(value) => <span style={{ color: '#e2d8db', fontWeight: 500 }}>{value}</span>}
        />
        {Object.entries(LABELS).map(([key, label]) => (
          <Line 
            key={key} 
            type="monotone" 
            dataKey={label} 
            stroke={COLORS[key]} 
            strokeWidth={2.5} 
            dot={false} 
            activeDot={{ r: 4, strokeWidth: 0, fill: COLORS[key] }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

