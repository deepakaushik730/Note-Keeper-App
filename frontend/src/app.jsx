import React, { useEffect, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import Column from "./components/Column";
import Header from "./components/Header";

import {
  fetch_tasks,
  create_task,
  reorder_tasks,
  deleteTask,
  signout,
} from "./api";
import AuthForm from "./components/AuthForm";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState({
    todo: [],
    inprogress: [],
    completed: [],
  });
  const [text, setText] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated]);

  async function load() {
    console.log("Loading tasks from API...");
    setLoading(true);
    try {
      const allTasks = await fetch_tasks();
      const grouped = { todo: [], inprogress: [], completed: [] };

      for (const t of allTasks) {
        if (grouped[t.status]) grouped[t.status].push(t);
      }
      Object.values(grouped).forEach((col) =>
        col.sort((a, b) => a.position - b.position)
      );
      setColumns(grouped);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e) {
  e.preventDefault();

  const trimmedText = text.trim();
  if (!trimmedText) return;

  try {
    const newTask = await create_task(trimmedText);
    // safety check
    if (!newTask || !newTask.status) {
      await load();
      return;
    }

    setColumns((prev) => ({
      ...prev,
      [newTask.status]: [...prev[newTask.status], newTask],
    }));

    setText("");
  } catch (err) {
    console.error("Failed to add task:", err);
    await load(); // fallback safety
  }
}


  async function handleDelete(taskId) {
    try {
      const newColumns = { ...columns };
      for (const status in newColumns) {
        newColumns[status] = newColumns[status].filter(
          (task) => task.id !== taskId
        );
      }
      setColumns(newColumns);
      await deleteTask(taskId);
    } catch (err) {
      console.error(`Failed to delete task ${taskId}:`, err);
      alert("Failed to delete task. Restoring state.");
      await load();
    }
  }

  async function onDragEnd(result) {
    const { source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const srcCol = Array.from(columns[source.droppableId]);
    const [movedTask] = srcCol.splice(source.index, 1);
    let newColumnsState;

    if (source.droppableId === destination.droppableId) {
      srcCol.splice(destination.index, 0, movedTask);
      newColumnsState = { ...columns, [source.droppableId]: srcCol };
    } else {
      const destCol = Array.from(columns[destination.droppableId]);
      destCol.splice(destination.index, 0, movedTask);
      newColumnsState = {
        ...columns,
        [source.droppableId]: srcCol,
        [destination.droppableId]: destCol,
      };
    }

    setColumns(newColumnsState);

    const payload = Object.fromEntries(
      Object.entries(newColumnsState).map(([status, tasks]) => [
        status,
        tasks.map((t) => t.id),
      ])
    );

    try {
      await reorder_tasks(payload);
    } catch (err) {
      console.error("Failed to reorder tasks:", err);
      alert("Failed to save new order. Reverting.");
      await load();
    }
  }

  // --- Auth handling ---
  if (!isAuthenticated) {
    return <AuthForm onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <ProtectedRoute>
      <div className="app">
       
        <Header onLogout={() => setIsAuthenticated(false)} />
          
        <form onSubmit={handleAdd} className="addform">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add task and press Enter"
          />
        </form>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="board">
              <Column
                status="todo"
                title="To Do"
                tasks={columns.todo}
                onDelete={handleDelete}
              />
              <Column
                status="inprogress"
                title="In Progress"
                tasks={columns.inprogress}
                onDelete={handleDelete}
              />
              <Column
                status="completed"
                title="Completed"
                tasks={columns.completed}
                onDelete={handleDelete}
              />
            </div>
          </DragDropContext>
        )}
      </div>
    </ProtectedRoute>
  );
}
