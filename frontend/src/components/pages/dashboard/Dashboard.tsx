import { Card } from '@heroui/react'

export default function Dashboard() {
  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome to your homelab dashboard</p>
        </div>
      </div>

      <div className="page-content-scroll">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-slate-900/50 border border-slate-700/50">
          <h2 className="text-xl font-semibold text-slate-100">Card 1</h2>
          <p className="text-slate-400 mt-2">Dashboard content will appear here</p>
        </Card>
        <Card className="p-6 bg-slate-900/50 border border-slate-700/50">
          <h2 className="text-xl font-semibold text-slate-100">Card 2</h2>
          <p className="text-slate-400 mt-2">Dashboard content will appear here</p>
        </Card>
        <Card className="p-6 bg-slate-900/50 border border-slate-700/50">
          <h2 className="text-xl font-semibold text-slate-100">Card 3</h2>
          <p className="text-slate-400 mt-2">Dashboard content will appear here</p>
        </Card>
      </div>
      </div>
    </div>
  )
}
