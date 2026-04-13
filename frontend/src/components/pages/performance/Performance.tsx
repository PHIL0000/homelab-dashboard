import { Card } from '@heroui/react'

export default function Performance() {
  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">Performance</h1>
          <p className="page-subtitle">Monitor the performance of your systems</p>
        </div>
      </div>

      <div className="page-content-scroll">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-100">CPU</h2>
          <p className="text-slate-400 mt-2">Performance content will appear here</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-100">Memory</h2>
          <p className="text-slate-400 mt-2">Performance content will appear here</p>
        </Card>
      </div>
      </div>
    </div>
  )
}
