import { useEffect, useState } from "react";
import axios from "axios";
import { type TodoItem, type Account } from "../types";
import dayjs from "dayjs";

function Todo() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [users, setUsers] = useState<Account[]>([]);
  const [owners, setOwners] = useState<Account[]>([]);
  const [inputText, setInputText] = useState("");
  const [mode, setMode] = useState<"ADD" | "EDIT">("ADD");
  const [curTodoId, setCurTodoId] = useState("");

  async function fetchData() {
    const res = await axios.get<TodoItem[]>("api/todo");
    setTodos(res.data);

    const userRes = await axios.get<Account[]>("api/todo/user");
    setUsers(userRes.data);

    const ownerRes = await axios.get<Account[]>("api/todo/owner");
    setOwners(ownerRes.data);
  }

  useEffect(() => {
    fetchData();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputText(e.target.value);
  }

  function handleSubmit() {
    if (!inputText) return;
    if (mode === "ADD") {
      axios
        .request({
          url: "/api/todo",
          method: "put",
          data: { todoText: inputText },
        })
        .then(() => {
          setInputText("");
        })
        .then(fetchData)
        .catch((err) => alert(err));
    } else {
      axios
        .request({
          url: "/api/todo",
          method: "patch",
          data: { id: curTodoId, todoText: inputText },
        })
        .then(() => {
          setInputText("");
          setMode("ADD");
          setCurTodoId("");
        })
        .then(fetchData)
        .catch((err) => alert(err));
    }
  }

  function handleDelete(id: string) {
    axios
      .delete("/api/todo", { data: { id } })
      .then(fetchData)
      .then(() => {
        setMode("ADD");
        setInputText("");
      })
      .catch((err) => alert(err));
  }

  function handleCancel() {
    setMode("ADD");
    setInputText("");
    setCurTodoId("");
  }
  return (
    <div className="container">
      <header>
        <h1>Todo App</h1>
      </header>
      <main>
        <div style={{ marginBottom: "1rem" }}>
          {users.map((user) => (
            <div key={`user-${user.id}`} data-cy={`user`}>
              👤 <strong>USER</strong>: {user.name} {user.id} ({user.course_id}-
              {user.section})
            </div>
          ))}
          {owners.map((owner) => (
            <div key={`owner-${owner.id}`} data-cy="owner">
              👤 <strong>OWNER</strong>: {owner.name} {owner.id} (
              {owner.course_id}-{owner.section})
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "start" }}>
          <input
            type="text"
            onChange={handleChange}
            value={inputText}
            data-cy="input-text"
          />
          <button onClick={handleSubmit} data-cy="submit">
            {mode === "ADD" ? "Submit" : "Update"}
          </button>
          {mode === "EDIT" && (
            <button onClick={handleCancel} className="secondary">
              Cancel
            </button>
          )}
        </div>
        <div data-cy="todo-item-wrapper">
          {todos.sort(compareDate).map((item, idx) => {
            const { date, time } = formatDateTime(item.createdAt);
            const text = item.todoText;
            return (
              <article
                key={item.id}
                style={{
                  display: "flex",
                  gap: "0.5rem",
                }}
              >
                <div>({idx + 1})</div>
                <div>📅{date}</div>
                <div>⏰{time}</div>
                <div data-cy="todo-item-text">📰{text}</div>
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setMode("EDIT");
                    setCurTodoId(item.id);
                    setInputText(item.todoText);
                  }}
                  data-cy="todo-item-update"
                >
                  {curTodoId !== item.id ? "🖊️" : "✍🏻"}
                </div>

                {mode === "ADD" && (
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() => handleDelete(item.id)}
                    data-cy="todo-item-delete"
                  >
                    🗑️
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default Todo;

function formatDateTime(dateStr: string) {
  if (!dayjs(dateStr).isValid()) {
    return { date: "N/A", time: "N/A" };
  }
  const dt = dayjs(dateStr);
  const date = dt.format("D/MM/YY");
  const time = dt.format("HH:mm");
  return { date, time };
}

function compareDate(a: TodoItem, b: TodoItem) {
  const da = dayjs(a.createdAt);
  const db = dayjs(b.createdAt);
  return da.isBefore(db) ? -1 : 1;
}
