"use client"

import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const colors = ["#1d4ed8", "#d4af37", "#ef4444", "#60a5fa"]

export default function DashboardCharts({ data }: { data: { accepted: number; pending: number; declined: number; maybe: number } }) {
  const chartData = [
    { label: "Confirmés", value: data.accepted },
    { label: "En attente", value: data.pending },
    { label: "Refus", value: data.declined },
    { label: "Peut-être", value: data.maybe },
  ]
  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Réponses RSVP</h2>
        <p className="mt-1 text-sm text-slate-500">Répartition actuelle des réponses invités.</p>
        <div className="mt-6 h-64" aria-label="Graphique des réponses RSVP">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dbeafe" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: "#eff6ff" }} />
              <Bar dataKey="value" name="Invités" radius={[8, 8, 0, 0]} fill="#1d4ed8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Vue proportionnelle</h2>
        <p className="mt-1 text-sm text-slate-500">Un aperçu rapide des statuts.</p>
        <div className="mt-2 h-64" aria-label="Graphique circulaire des réponses RSVP">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="label" innerRadius={55} outerRadius={88} paddingAngle={3}>
                {chartData.map((entry, index) => <Cell key={entry.label} fill={colors[index]} />)}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
