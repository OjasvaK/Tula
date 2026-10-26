import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../api/client";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Field } from "../components/ui/Field";
import { ThemeToggle } from "../components/ui/ThemeToggle";

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/app" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      navigate("/app", { replace: true });
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Incorrect username or password."
          : errorMessage(err, "Login failed. Is the backend running?")
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-brand text-on-brand lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-24 size-[32rem] rounded-full bg-white/10 blur-3xl"
        />
        <Link to="/" className="relative flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-white/15">
            <ShieldCheck className="size-5" />
          </div>
          <span className="font-bold">Metrology Compliance Checker</span>
        </Link>
        <div className="relative">
          <h2 className="text-3xl font-extrabold leading-tight">
            Explainable Legal Metrology checks for e-commerce listings.
          </h2>
          <p className="mt-4 max-w-md text-sm text-on-brand/80">
            Every flagged declaration is traced to the exact clause of LMPC Rules
            2011, Rule 6 — no black-box scoring.
          </p>
        </div>
        <p className="relative text-xs text-on-brand/70">
          Internal regulator tool · access by issued account only
        </p>
      </div>

      {/* Form */}
      <div className="relative flex items-center justify-center p-6">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-brand text-on-brand">
                <ShieldCheck className="size-5" />
              </div>
              <span className="font-bold text-content">Compliance Checker</span>
            </Link>
          </div>

          <h1 className="text-xl font-bold text-content">Sign in</h1>
          <p className="mt-1 text-sm text-muted">
            Use your issued regulator account.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Field label="Username" required>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                autoComplete="username"
                required
              />
            </Field>
            <Field label="Password" required>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </Field>

            {error && (
              <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" loading={submitting} className="w-full">
              {submitting ? "Signing in…" : "Sign in"}
              {!submitting && <ArrowRight className="size-4" />}
            </Button>
          </form>

          <p className="mt-6 flex items-center gap-1.5 text-xs text-subtle">
            <Lock className="size-3" />
            Local dev account: <code className="text-muted">admin / dev-password-123</code>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
