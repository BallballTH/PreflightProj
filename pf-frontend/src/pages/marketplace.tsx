import { useEffect, useState } from "react";
import { type item } from "../types";
import axios from "axios";
import dayjs from "dayjs";

function Marketplace() {
  const [items, setItems] = useState<item[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    const res = await axios.get<item[]>("api/items");
    setItems(res.data);
  }

  useEffect(() => {
    fetchData();
  }, []);

  interface FormDataType {
    userId: string;
    name: string;
    detail: string;
    status: number;
    image: string | File;
  }

  const [form, setForm] = useState<FormDataType>({
    userId: sessionStorage.getItem("userId") || "",
    name: "",
    detail: "",
    image: "",
    status: 1,
  });

  /** สร้าง item ใหม่ */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); // เริ่มโหลด

    try {
      const formData = new FormData();
      formData.append("userId", form.userId);
      formData.append("image", form.image);
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

      setForm({
        userId: sessionStorage.getItem("userId") || "",
        name: "",
        detail: "",
        image: "",
        status: 1,
      });

      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to post item");
    } finally {
      setLoading(false); // จบโหลด
    }
  };

  /** กด Edit → เตรียมข้อมูลฟอร์ม (ไม่เปลี่ยนรูป) */
  const startEdit = (it: item) => {
    setEditingId(it.id);
    setForm({
      userId: sessionStorage.getItem("userId") || "",
      name: it.name,
      detail: it.detail,
      image: it.image, // เก็บเป็น string เดิม
      status: it.status,
    });
  };

  /** อัปเดต item (ไม่อัปโหลดรูปใหม่) */
  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingId) return;

    const res = await fetch("api/sell", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item_id: editingId,
        name: form.name,
        detail: form.detail,
        image: form.image, // ส่งรูปเดิม
        status: form.status,
        seller: form.userId,
        date: new Date().toISOString(),
      }),
    });

    const data = await res.json();
    console.log("Edited item:", data);
    alert("Item updated successfully!");
    setEditingId(null);
    fetchData();
  };

  /** ลบ item */
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    await fetch("api/sell", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: sessionStorage.getItem("userId"),
        item_id: id,
      }),
    });
    alert("Item deleted!");
    fetchData();
  };

  /** ซื้อ item */
  const handleBuy = async (id: string) => {
    const uuid = sessionStorage.getItem("userId");
    if (!uuid) {
      alert("Please log in to buy items.");
      return;
    }

    const res = await fetch("api/buy", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid,
        item_id: id,
      }),
    });

    const data = await res.json();
    if (data.status === "success") {
      alert("Item purchased!");
      fetchData();
    } else {
      alert(data.message || "Failed to buy item");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("isLoggedIn");
    alert("Logged out!");
    window.location.reload(); // รีเฟรชหน้า หรือจะใช้ navigate ไปหน้า login ก็ได้
  };

  return (
    <main className="container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Marketplace</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <h2>{editingId ? "Edit Item" : "Post New Item"}</h2>
      <form onSubmit={editingId ? handleEdit : handleSubmit}>
        <label>
          Item Name
          <input
            type="text"
            value={form.name}
            disabled={loading}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>

        <label>
          Detail
          <textarea
            value={form.detail}
            disabled={loading}
            onChange={(e) => setForm({ ...form, detail: e.target.value })}
          />
        </label>

        {!editingId && (
          <label>
            Image
            <input
              type="file"
              accept="image/*"
              disabled={loading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setForm({ ...form, image: file });
                }
              }}
              required
            />
          </label>
        )}

        <label>
          Status
          <select
            value={form.status}
            disabled={loading}
            onChange={(e) =>
              setForm({ ...form, status: Number(e.target.value) })
            }
          >
            <option value={0}>Inactive</option>
            <option value={1}>Available</option>
            <option value={2}>Reserved</option>
          </select>
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Posting" : editingId ? "Update Item" : "Post Item"}
        </button>
        {editingId && (
          <button
            type="button"
            disabled={loading}
            onClick={() => setEditingId(null)}
          >
            Cancel
          </button>
        )}
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
        {items.sort(compareDate).map((it) => {
          const { date: dateC, time: timeC } = formatDateTime(it.createdAt);
          const { date: dateU, time: timeU } = formatDateTime(it.updatedAt);
          const isSeller =
            sessionStorage.getItem("userName") &&
            sessionStorage.getItem("userName") === it.seller;

          return (
            <article key={it.id}>
              <img
                src={it.image}
                alt={it.name}
                style={{ height: "200px", objectFit: "cover", width: "100%" }}
              />
              <h3>{it.name}</h3>
              <p>{it.detail}</p>
              <p>
                <strong>Status:</strong>{" "}
                {it.is_purchased
                  ? "Sold"
                  : it.status === 1
                  ? "Available"
                  : it.status === 0
                  ? "Inactive"
                  : it.status === 2
                  ? "Reserved"
                  : "Unknown"}
              </p>
              <p>
                <strong>Seller:</strong> {it.seller || "-"}
              </p>
              <p>
                <strong>Customer:</strong> {it.customer || "-"}
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

              {!isSeller && (
                <button
                  style={{ marginRight: "8px" }}
                  disabled={it.is_purchased || it.status !== 1}
                  onClick={() => handleBuy(it.id)}
                >
                  {it.is_purchased ? "Sold Out" : "Buy"}
                </button>
              )}

              {isSeller && (
                <>
                  <button
                    style={{ marginRight: "8px" }}
                    onClick={() => startEdit(it)}
                  >
                    Edit
                  </button>
                  <button
                    style={{ marginRight: "8px" }}
                    onClick={() => handleDelete(it.id)}
                  >
                    Delete
                  </button>
                </>
              )}
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
  return { date: dt.format("D/MM/YY"), time: dt.format("HH:mm") };
}

function compareDate(a: item, b: item) {
  const da = dayjs(a.createdAt);
  const db = dayjs(b.createdAt);
  return da.isBefore(db) ? -1 : 1;
}

export default Marketplace;
