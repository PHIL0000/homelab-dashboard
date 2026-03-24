import { Card } from '@heroui/react'

export default function Account() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-100">Account</h1>
        <p className="text-slate-400 mt-2">Verwalte dein Benutzerkonto</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-slate-800 border border-slate-700">
          <h2 className="text-xl font-semibold text-slate-100">Profilinformation</h2>
          <p className="text-slate-400 mt-2">Account Inhalte kommen hier hin</p>
        </Card>
        <Card className="p-6 bg-slate-800 border border-slate-700">
          <h2 className="text-xl font-semibold text-slate-100">Sicherheit</h2>
          <p className="text-slate-400 mt-2">Account Inhalte kommen hier hin</p>
        </Card>
      </div>
    </div>
  )
}
