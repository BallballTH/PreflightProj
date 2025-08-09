import React from "react";
import "./index.css"; // หรือชื่อไฟล์ที่ใส่ไว้
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // <-- เพิ่มตรงนี้
import App from "./App.tsx";
// import "@picocss/pico/css/pico.violet.min.css";
import "@picocss/pico/css/pico.lime.min.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
