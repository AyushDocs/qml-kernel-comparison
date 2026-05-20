import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), '..', 'results.json')
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    res.status(200).json(data)
  } catch {
    res.status(404).json({ error: 'Run experiment.py first to generate results.json' })
  }
}
