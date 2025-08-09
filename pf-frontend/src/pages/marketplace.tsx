import { useEffect, useState } from "react";

import { type item } from "../types";
import axios from "axios";
import dayjs from "dayjs";

function Marketplace() {
  const [items, setItems] = useState<item[]>([]);

  async function fetchData() {
    const res = await axios.get<item[]>("api/items");
    setItems(res.data);
  }

  useEffect(() => {
    fetchData();
  }, []);

  interface FormDataType {
    userId: string; // 👈 อาจจะใช้เพื่อเก็บ user ID ถ้าต้องการ
    name: string;
    detail: string;
    status: number;
    image: string | File; // 👈 เก็บได้ทั้ง URL string และไฟล์
  }

  const [form, setForm] = useState<FormDataType>({
    userId: sessionStorage.getItem("userId") || "",
    name: "",
    detail: "",
    image: "",
    status: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("userId", form.userId);
    formData.append("image", form.image); // รูปภาพ
    formData.append("name", form.name);
    formData.append("detail", form.detail);
    formData.append("status", form.status.toString());

    const res = await fetch("api/sell", {
      method: "post",
      body: formData,
    });

    const data = await res.json();
    console.log("Posted item:", data);
    alert("Item posted successfully!");

    fetchData();
  };

  return (
    <main className="container">
      <h1>Marketplace</h1>

      <h2>Post New Item</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Item Name
          <input
            type="text"
            placeholder="e.g., Wooden Chair"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>

        <label>
          Detail
          <textarea
            placeholder="Write some details about the item..."
            value={form.detail}
            onChange={(e) => setForm({ ...form, detail: e.target.value })}
          />
        </label>

        <label>
          Image
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setForm({ ...form, image: file }); // เก็บไฟล์ไว้ใน state
              }
            }}
            required
          />
        </label>

        <label>
          Status
          <select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: Number(e.target.value) })
            }
          >
            <option value={0}>Inactive</option>
            <option value={1}>Available</option>
            <option value={2}>Reserved</option>
          </select>
        </label>

        <button type="submit">Post Item</button>
      </form>

      <hr />

      <h2>Items for Sale</h2>
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1rem",
        }}
      >
        {items.sort(compareDate).map((item: item) => {
          const { date: dateC, time: timeC } = formatDateTime(item.createdAt);
          const { date: dateU, time: timeU } = formatDateTime(item.updatedAt);
          return (
            <article key={item.id}>
              <img
                src={item.image}
                alt={item.name}
                style={{ height: "200px", objectFit: "cover", width: "100%" }}
              />
              <h3>{item.name}</h3>
              <p>{item.detail}</p>
              <p>
                <strong>Status:</strong>{" "}
                {item.is_purchased
                  ? "Sold"
                  : item.status === 1
                  ? "Available"
                  : item.status === 0
                  ? "Inactive"
                  : item.status === 2
                  ? "Reserved"
                  : "Unknown"}
              </p>

              <p>
                <strong>Seller:</strong> {item.seller || "-"}
              </p>
              <p>
                <strong>Customer:</strong> {item.customer || "-"}
              </p>
              <p>
                <strong>
                  Created At: {dateC} {timeC}
                </strong>
              </p>
              <p>
                <strong>
                  Updated At: {dateU} {timeU}
                </strong>
              </p>

              <button disabled={item.is_purchased}>
                {item.is_purchased ? "Sold Out" : "Buy"}
              </button>
            </article>
          );
        })}
      </div>
    </main>
  );
}

function formatDateTime(dateStr: string) {
  if (!dayjs(dateStr).isValid()) {
    return { date: "N/A", time: "N/A" };
  }
  const dt = dayjs(dateStr);
  const date = dt.format("D/MM/YY");
  const time = dt.format("HH:mm");
  return { date, time };
}

function compareDate(a: item, b: item) {
  const da = dayjs(a.createdAt);
  const db = dayjs(b.createdAt);
  return da.isBefore(db) ? -1 : 1;
}

export default Marketplace;
