'use client'

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import type { PredictionResponse } from '@/lib/types'

const COLORS = {
  High: '#f59e0b',
  Medium: '#eab308',
  Low: '#10b981',
}

export function StakeholderPieChart({
  prediction,
}: {
  prediction: PredictionResponse | null
}) {
  if (!prediction) return null
  const predictions = prediction.predictions
  // Count risk levels across all stakeholders
  const riskCounts = predictions.reduce(
    (acc, pred) => {
      Object.entries(pred.riskLevels).forEach(([, level]) => {
        acc[level] = (acc[level] || 0) + 1
      })
      return acc
    },
    {} as Record<string, number>,
  )

  const data = Object.entries(riskCounts).map(([name, value]) => ({
    name,
    value,
  }))

  if (data.length === 0) return null

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={COLORS[entry.name as keyof typeof COLORS] || '#gray'}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
