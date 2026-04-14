import { useState, type FormEvent } from 'react';
import { Button, Input, Card } from '@heroui/react';
import { useAuth } from '@/context/AuthContext';

export default function Setup() {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSetup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, firstName, lastName, email, password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        login(data.token, data.user);
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError('Setup failed. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 shadow-2xl shadow-purple-500/50">
              <span className="text-3xl font-bold text-white">🚀</span>
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Welcome!</h1>
            <p className="mt-2 text-slate-400">Let's set up your admin account</p>
          </div>
        </div>

        {/* Card */}
        <Card className="border border-purple-500/20 bg-slate-900/50 backdrop-blur-md shadow-2xl p-8">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
              <p className="text-sm font-medium text-red-400">⚠️ {error}</p>
            </div>
          )}
          
          {/* Form */}
          <form onSubmit={handleSetup} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Username *</label>
              <Input
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
                <Input
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
                <Input
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <Input
                type="email"
                placeholder="admin@homelab.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password *</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button
              fullWidth
              size="lg"
              type="submit"
              isDisabled={loading}
              className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 font-semibold text-white text-base shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all"
            >
              {loading ? 'Creating Account...' : 'Create Admin Account'}
            </Button>
          </form>

          <div className="mt-6 border-t border-slate-700/50 pt-6 text-center text-xs text-slate-500">
            🔐 Your account will be the system administrator
          </div>
        </Card>
      </div>
    </div>
  );
}