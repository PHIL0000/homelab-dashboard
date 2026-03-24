import { Card } from '@heroui/react'

export default function Calendar() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-100">Calender</h1>
        <p className="text-slate-400 mt-2">Verwalte deine Termine und Ereignisse</p>
      </div>

      <Card className="p-6 bg-slate-800 border border-slate-700">
        <h2 className="text-xl font-semibold text-slate-100">Kalender</h2>
        <p className="text-slate-400 mt-2">Kalender Inhalte kommen hier hin</p>
      </Card>
    </div>
  )
}
