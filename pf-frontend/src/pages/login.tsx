import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // In real life, you'd call backend API here
    // We'll simulate login with localStorage
    localStorage.setItem("isLoggedIn", "true");

    navigate("/marketplace");
  };

  return (
    <main className="login-container">
      <article>
        <h1 style={{ textAlign: "center" }}>Login</h1>
        <form onSubmit={handleLogin}>
          <label>
            Username
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" style={{ width: "100%" }}>
            Log In
          </button>
        </form>
      </article>
    </main>
  );
}

export default Login;
