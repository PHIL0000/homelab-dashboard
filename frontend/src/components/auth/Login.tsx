import { useState, type FormEvent } from "react";
import { Button, Input, Card } from "@heroui/react";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();

      if (res.ok) {
        login(data.token, data.user);
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch (e) {
      setError("Login failed. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-theme-background flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-2xl"
              style={{
                backgroundImage:
                  "linear-gradient(145deg, var(--color-primary), var(--color-secondary), var(--color-accent))",
                boxShadow:
                  "0 0 30px color-mix(in srgb, var(--color-glow) 55%, transparent)",
              }}
            >
              <span className="text-3xl font-bold text-white">⚡</span>
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-[var(--color-text)]">
              Homelab Dashboard
            </h1>
          </div>
        </div>

        {/* Card */}
        <Card
          className="backdrop-blur-md shadow-2xl p-8"
          style={{
            borderColor:
              "color-mix(in srgb, var(--color-primary) 35%, transparent)",
            backgroundColor:
              "color-mix(in srgb, var(--color-content) 88%, transparent)",
            boxShadow:
              "0 24px 60px color-mix(in srgb, var(--color-glow) 28%, transparent)",
          }}
        >
          {/* Error Alert */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
              <p className="text-sm font-medium text-red-400">⚠️ {error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--color-textSecondary)] mb-2">
                Username or Email
              </label>
              <Input
                type="text"
                placeholder="you@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-textSecondary)] mb-2">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <Button
              fullWidth
              size="lg"
              type="submit"
              isDisabled={loading}
              className="mt-8 font-semibold text-white text-base shadow-lg transition-all"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, var(--color-primary), var(--color-accent))",
                boxShadow:
                  "0 0 24px color-mix(in srgb, var(--color-glow) 52%, transparent)",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div
            className="mt-6 border-t pt-6 text-center text-xs text-[var(--color-textSecondary)]"
            style={{
              borderColor:
                "color-mix(in srgb, var(--color-border) 72%, transparent)",
            }}
          >
            🔐 Not Protected
          </div>
        </Card>
      </div>
    </div>
  );
}
