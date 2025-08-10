import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";

function Register() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    axios
      .request({
        url: "/api/register",
        method: "post",
        data: { username: user, password: password },
      })
      .then((res) => {
        alert(res.data.message);
        navigate("/login");
      })
      .catch((err) => {
        console.error(err);
        alert("Login failed: " + err.response.data.message);
      });
  };

  return (
    <main className="login-container">
      <article>
        <h1 style={{ textAlign: "center" }}>Register</h1>
        <form onSubmit={handleRegister}>
          <label>
            Username
            <input
              type="text"
              placeholder="Enter your username"
              value={user}
              onChange={(e) => setUser(e.target.value)}
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
            Register
          </button>
        </form>
        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </article>
    </main>
  );
}

export default Register;
