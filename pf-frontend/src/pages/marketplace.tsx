import { useState } from "react";

function Marketplace() {
  const [items, setItems] = useState([
    {
      id: 1,
      name: "Raffan",
      detail: "A beautiful handsome gentleman.",
      image:
        "https://scontent.fcnx1-1.fna.fbcdn.net/v/t39.30808-1/338020354_226709259894491_5132916288736129825_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=111&ccb=1-7&_nc_sid=e99d92&_nc_eui2=AeE1xg1XZVjBYkreVQotRiYslGVO4DnlRbeUZU7gOeVFt_4U7m1oO2IRcZcBDJeMJPOCswzPd1jhvQsNuO_6DIfA&_nc_ohc=NGIuQH7Mo7EQ7kNvwFN0RE6&_nc_oc=AdnCYQ5d6sbaz75qCmKnTfuk7rtmlsW96ivZ9ibJE4y3RUZUZI67r9EAP7sffnubQcI&_nc_zt=24&_nc_ht=scontent.fcnx1-1.fna&_nc_gid=Bvvp5DK4yQBmtInuXICJsg&oh=00_AfW7EyYk0baALTNpBodAirq776MWbrzj3nfLiy__Z8w8NA&oe=689940E6",
      status: 1,
      is_purchased: false,
      is_active: true,
      seller: 1,
    },
    {
      id: 2,
      name: "Vintage Lamp",
      detail: "Classic vintage lamp from the 70s.",
      image: "https://picsum.photos/300/200?random=2",
      status: 1,
      is_purchased: true,
      is_active: true,
      seller: 1,
    },
  ]);

  interface FormDataType {
    name: string;
    detail: string;
    status: number;
    image: string | File; // 👈 เก็บได้ทั้ง URL string และไฟล์
  }

  const [form, setForm] = useState<FormDataType>({
    name: "",
    detail: "",
    image: "",
    status: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("image", form.image); // รูปภาพ
    formData.append("name", form.name);
    formData.append("detail", form.detail);
    formData.append("status", form.status.toString());

    const res = await fetch("api/item", {
      method: "post",
      body: formData,
    });

    const data = await res.json();
    console.log("Posted item:", data);
    alert("Item posted successfully!");
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
        {items.map((item) => (
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
              {item.is_purchased ? "Sold" : "Available"}
            </p>
            <button disabled={item.is_purchased}>
              {item.is_purchased ? "Sold Out" : "Buy"}
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}

export default Marketplace;
