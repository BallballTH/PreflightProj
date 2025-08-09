import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Marketplace from "./pages/marketplace";

function App() {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "yes";
  console.log(isLoggedIn);

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={isLoggedIn ? "/marketplace" : "/login"} />}
      />
      <Route
        path="/login"
        element={isLoggedIn ? <Navigate to="/marketplace" /> : <Login />}
      />
      <Route
        path="/register"
        element={isLoggedIn ? <Navigate to="/marketplace" /> : <Register />}
      />
      <Route
        path="/marketplace"
        element={isLoggedIn ? <Marketplace /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}

export default App;
