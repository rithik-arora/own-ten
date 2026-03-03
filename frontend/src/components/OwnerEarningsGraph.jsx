import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts'
import { paymentService } from '../services/paymentService'

const OwnerEarningsGraph = () => {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      const res = await paymentService.getOwnerPayments()
      const d = res.data
      setTotal(d.totalEarned || 0)

      const chart = d.monthlyEarnings.map(m => ({
        month: `${m._id.month}/${m._id.year}`,
        amount: m.total
      }))
      setData(chart)
    } catch (err) {
      console.log("Earnings error", err)
    }
  }

  // Chart options for dark background
  const chartOptions = {
    cartesianGrid: { stroke: '#3f3f46' }, // zinc-700
    xAxis: { stroke: '#a1a1aa', tick: { fill: '#a1a1aa' } },
    yAxis: { stroke: '#a1a1aa', tick: { fill: '#a1a1aa' } },
    tooltip: {
      contentStyle: { backgroundColor: '#1f1f1f', borderColor: '#3f3f46', color: '#fff' },
      labelStyle: { color: '#e5e7eb' }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mt-6"
    >
      <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
        Earnings
      </h2>

      <p className="text-4xl font-bold text-indigo-400 mb-6">
        ₹{total.toLocaleString()}
      </p>

      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartOptions.cartesianGrid.stroke} />
            <XAxis
              dataKey="month"
              stroke={chartOptions.xAxis.stroke}
              tick={{ fill: chartOptions.xAxis.tick.fill }}
            />
            <YAxis
              stroke={chartOptions.yAxis.stroke}
              tick={{ fill: chartOptions.yAxis.tick.fill }}
            />
            <Tooltip
              contentStyle={chartOptions.tooltip.contentStyle}
              labelStyle={chartOptions.tooltip.labelStyle}
            />
            <Bar dataKey="amount" fill="#6366f1" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

export default OwnerEarningsGraph