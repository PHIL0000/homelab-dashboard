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
        <Card className="p-6 bg-content border border-border">
          <h2 className="text-xl font-semibold text-text">Card 1</h2>
          <p className="text-text-secondary mt-2">Dashboard content will appear here</p>
        </Card>
        <Card className="p-6 bg-content border border-border">
          <h2 className="text-xl font-semibold text-text">Card 2</h2>
          <p className="text-text-secondary mt-2">Dashboard content will appear here</p>
        </Card>
        <Card className="p-6 bg-content border border-border">
          <h2 className="text-xl font-semibold text-text">Card 3</h2>
          <p className="text-text-secondary mt-2">Dashboard content will appear here</p>
        </Card>
      </div>
      </div>
    </div>
  )
}
