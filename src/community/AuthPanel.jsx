
import { useState } from "react";
import { loginUser, registerUser } from "./CommunityApi";

function AuthPanel({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const data = await loginUser(email, password);
        setMessage("Login successful!");
        onAuth(data.user);
      } else {
        await registerUser(name, email, password);
        setMessage("Registration successful! Please log in.");
        setIsLogin(true);
        setPassword("");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-panel">
      <h2>{isLogin ? "Sign In" : "Create Account"}</h2>

      <p>
        {isLogin
          ? "Sign in to report road hazards and participate."
          : "Register to become part of the RoadGuard community."}
      </p>

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </>
        )}

        <label>Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />

        <button type="submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : isLogin
              ? "Sign In"
              : "Register"}
        </button>
      </form>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <p>
        {isLogin ? "New to RoadGuard?" : "Already have an account?"}
        {" "}
        <button
          type="button"
          className="auth-switch"
          onClick={() => {
            setIsLogin(!isLogin);
            setMessage("");
            setError("");
          }}
        >
          {isLogin ? "Create account" : "Sign in"}
        </button>
      </p>
    </section>
  );
}

export default AuthPanel;
