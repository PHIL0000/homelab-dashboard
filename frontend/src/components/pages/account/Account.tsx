import { Card } from '@heroui/react'

export default function Account() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-text mb-2">Account</h1>
        <p className="text-text-secondary">Verwalte dein Benutzerkonto</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-content border border-border">
          <h2 className="text-xl font-semibold mb-2 text-text">Profilinformation</h2>
          <p className="text-text-secondary">Account Inhalte kommen hier hin</p>
        </Card>
        <Card className="p-6 bg-content border border-border">
          <h2 className="text-xl font-semibold mb-2 text-text">Sicherheit</h2>
          <p className="text-text-secondary">Account Inhalte kommen hier hin</p>
        </Card>
      </div>
    </div>
  )
}
