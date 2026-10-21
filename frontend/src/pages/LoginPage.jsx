import { LoginForm } from "../components/LoginForm";

export function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Compliance Checker</h1>
        <p className="subtitle">Regulator dashboard login</p>
        <LoginForm />
      </div>
    </div>
  );
}
