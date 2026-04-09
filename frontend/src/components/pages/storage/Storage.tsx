import { Card } from '@heroui/react'

export default function Storage() {
  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">Storage</h1>
          <p className="page-subtitle">Overview of your storage devices</p>
        </div>
      </div>

      <div className="page-content-scroll">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-text">Storage 1</h2>
          <p className="text-text-secondary mt-2">Storage content will appear here</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-text">Storage 2</h2>
          <p className="text-text-secondary mt-2">Storage content will appear here</p>
        </Card>
      </div>
      </div>
    </div>
  )
}
