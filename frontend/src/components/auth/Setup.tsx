import { useState, type FormEvent } from 'react';
import { Button, Input } from '@heroui/react';
import { useAuth } from '@/context/AuthContext';

export default function Setup() {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSetup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-content border border-border rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-text text-center">Welcome</h1>
        <p className="text-text-secondary text-center mb-8">It seems this is your first time here. Let's set up the admin account.</p>
        
        {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg mb-6 text-sm">{error}</div>}
        
        <form onSubmit={handleSetup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Username *</label>
            <Input
              type="text"
              required
              placeholder="Username"
              variant="secondary"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">First Name (optional)</label>
              <Input
                type="text"
                placeholder="First Name"
                variant="secondary"
                fullWidth
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Last Name (optional)</label>
              <Input
                type="text"
                placeholder="Last Name"
                variant="secondary"
                fullWidth
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Email (optional)</label>
            <Input
              type="email"
              placeholder="Email"
              variant="secondary"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Password *</label>
            <Input
              type="password"
              required
              placeholder="Password"
              variant="secondary"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary text-white font-medium py-2 rounded-lg mt-4 hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_50%,transparent)] transition-all"
              variant="primary"
          >
            Create Admin Account
          </Button>
        </form>
      </div>
    </div>
  );
}
