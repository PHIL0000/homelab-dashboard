import { Card } from '@heroui/react'

export default function Performance() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Performance</h1>
        <p className="text-gray-600 mt-2">Monitor the performance of your systems</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900">CPU</h2>
          <p className="text-gray-600 mt-2">Performance content will appear here</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900">Memory</h2>
          <p className="text-gray-600 mt-2">Performance content will appear here</p>
        </Card>
      </div>
    </div>
  )
}
