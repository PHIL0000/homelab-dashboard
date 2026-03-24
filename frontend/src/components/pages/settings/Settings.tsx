import { Card } from '@heroui/react'

export default function Settings() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-100">Settings</h1>
        <p className="text-slate-400 mt-2">Konfiguriere deine Einstellungen</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-slate-800 border border-slate-700">
          <h2 className="text-xl font-semibold text-slate-100">Allgemein</h2>
          <p className="text-slate-400 mt-2">Settings Inhalte kommen hier hin</p>
        </Card>
        <Card className="p-6 bg-slate-800 border border-slate-700">
          <h2 className="text-xl font-semibold text-slate-100">Benachrichtigungen</h2>
          <p className="text-slate-400 mt-2">Settings Inhalte kommen hier hin</p>
        </Card>
      </div>
    </div>
  )
}
