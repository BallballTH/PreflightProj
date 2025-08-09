import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    axios
      .post("/api/login", { username, password })
      .then((res) => {
        sessionStorage.setItem("isLoggedIn", "yes");
        sessionStorage.setItem("userId", res.data.uuid);
        sessionStorage.setItem("userName", res.data.name);

        navigate("/marketplace");
        window.location.reload();
      })
      .catch((err) => {
        console.error(err);
        alert("Login failed: " + err.response.data.message);
      });
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
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </article>
    </main>
  );
}

export default Login;
