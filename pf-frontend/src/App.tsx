import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Marketplace from "./pages/marketplace";

function App() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

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
        path="/marketplace"
        element={isLoggedIn ? <Marketplace /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}

export default App;
