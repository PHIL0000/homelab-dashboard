import { useState, type FormEvent } from 'react';
import { Button, Input } from '@heroui/react';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        login(data.token, data.user);
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (e) {
      setError('Login failed. Please check connection.');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-content border border-border rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-text text-center">Login</h1>
        <p className="text-text-secondary text-center mb-8">Access your homelab dashboard.</p>
        
        {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg mb-6 text-sm">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Username or Email</label>
            <Input
              type="text"
              required
              placeholder="Username or Email"
              variant="secondary"
              fullWidth
              className="w-full"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Password</label>
            <Input
              type="password"
              required
              placeholder="Password"
              variant="secondary"
              fullWidth
              className="w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary text-white font-medium py-2 rounded-lg mt-4 hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_50%,transparent)] transition-all"
              variant="primary"
          >
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
