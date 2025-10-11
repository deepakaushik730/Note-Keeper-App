import React, { useEffect, useState } from "react";

import { DragDropContext } from "@hello-pangea/dnd";

import Column from "./components/Column";

import { fetch_tasks, create_task, reorder_tasks, deleteTask } from "./api";

export default function App() {
  // --- State Management ---

  // A flag to display a loading indicator while fetching data.

  const [loading, setLoading] = useState(true); // The primary state for the application. An object where keys are column statuses // and values are arrays of task objects.

  const [columns, setColumns] = useState({
    todo: [],
    inprogress: [],
    completed: [],
  }); // The controlled state for the new task input field.

  const [text, setText] = useState(""); /** // --- Data Fetching ---

 * useEffect hook with an empty dependency array `[]` ensures that the `load`

 * function is called only once, when the component first mounts.

 */

  useEffect(() => {
    load();
  }, []); /**

 * Fetches all tasks from the API and organizes them into the `columns` state.

 * This function is the single source of truth for hydrating the UI with data from the server.

 */

  async function load() {
    console.log("Loading tasks from API...");

    setLoading(true);

    try {
      const allTasks = await fetch_tasks();

      const grouped = { todo: [], inprogress: [], completed: [] };

      for (const t of allTasks) {
        // Ensure the status exists in our grouped object before pushing

        if (grouped[t.status]) {
          grouped[t.status].push(t);
        }
      } // Sort each column by the 'position' field to maintain order.

      Object.values(grouped).forEach((col) =>
        col.sort((a, b) => a.position - b.position)
      );

      console.log("Tasks loaded and grouped:"); // console.table(allTasks) // console.table is great for viewing arrays of objects.

      setColumns(grouped);
    } catch (err) {
      console.error("Failed to load tasks:", err); // Here you could set an error state to show a message to the user
    } finally {
      setLoading(false);
    }
  } /**

 * Handles the form submission for creating a new task.

 * @param {React.FormEvent} e - The form event.

 */

  async function handleAdd(e) {
    e.preventDefault(); // Prevent the default browser page reload

    const trimmedText = text.trim();

    if (!trimmedText) return;

    console.log(`Adding new task: "${trimmedText}"`);

    try {
      await create_task(trimmedText);

      setText(""); // OPTIMIZATION NOTE: Calling load() is simple and guarantees consistency, but it re-fetches all tasks. // A more advanced approach would be to update the state locally with the new task returned from the API call.

      await load();
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  } /**

 * Handles the deletion of a task.

 * @param {string|number} taskId - The ID of the task to be deleted.

 */

  async function handleDelete(taskId) {
    console.log(`Handling delete for task ID: ${taskId}`);

    try {
      // Optimistic UI update: remove the task from the local state immediately for a fast UX.

      const newColumns = { ...columns };

      for (const status in newColumns) {
        newColumns[status] = newColumns[status].filter(
          (task) => task.id !== taskId
        );
      }

      setColumns(newColumns); // Call the API to delete the task from the database.

      await deleteTask(taskId);
    } catch (err) {
      console.error(`Failed to delete task ${taskId}:`, err); // If the API call fails, revert the state by reloading from the server.

      alert("Failed to delete task. Restoring state.");

      await load();
    }
  } /**

 * The main handler for the drag-and-drop library. Fired when a user drops a task.

 * @param {Object} result - The result object from the drag-and-drop action.

 */

  async function onDragEnd(result) {
    console.log("Drag ended. Result:", result);

    const { source, destination } = result;

    if (!destination) return; // Dropped outside of a valid column

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return; // Dropped in the same place
    } // --- Optimistic UI Update --- // The UI state is updated immediately without waiting for the API response. // This makes the interface feel fast and responsive.

    const srcCol = Array.from(columns[source.droppableId]);

    const [movedTask] = srcCol.splice(source.index, 1); // Remove task from source

    let newColumnsState;

    if (source.droppableId === destination.droppableId) {
      // Task moved within the same column

      srcCol.splice(destination.index, 0, movedTask);

      newColumnsState = { ...columns, [source.droppableId]: srcCol };
    } else {
      // Task moved to a different column

      const destCol = Array.from(columns[destination.droppableId]);

      destCol.splice(destination.index, 0, movedTask); // Add task to destination

      newColumnsState = {
        ...columns,
        [source.droppableId]: srcCol,
        [destination.droppableId]: destCol,
      };
    }

    setColumns(newColumnsState); // --- API Call --- // Prepare a payload with only the necessary data (arrays of task IDs) for the backend.

    const payload = Object.fromEntries(
      Object.entries(newColumnsState).map(([status, tasks]) => [
        status,
        tasks.map((t) => t.id),
      ])
    );

    console.log("Sending reorder payload to API:", payload);

    try {
      await reorder_tasks(payload); // After a successful reorder, we reload from the server to get the final, authoritative state. // This syncs the `position` properties which are only updated on the backend.

      await load();
    } catch (err) {
      console.error("Failed to reorder tasks:", err); // If the API call fails, revert the UI to the last known good state from the server.

      alert("Failed to save new order. Reverting.");

      await load();
    }
  }

  return (
    <div className="app">
      <h1>Note Keeper App (Drag&Drop)</h1>  {" "}
      <form onSubmit={handleAdd} className="addform">
           {" "}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="add task and press enter"
        />
          {" "}
      </form>
         {/* Conditionally render a loading message or the main board */} 
      {" "}
      {loading ? (
        <div>Loading...</div>
      ) : (
        // The DragDropContext provides the ability for its children to use drag-and-drop.

        <DragDropContext onDragEnd={onDragEnd}>
              {" "}
          <div className="board">
                 {" "}
            <Column
              status="todo"
              title="To Do"
              tasks={columns.todo}
              onDelete={handleDelete}
            />
                 {" "}
            <Column
              status="inprogress"
              title="In Progress"
              tasks={columns.inprogress}
              onDelete={handleDelete}
            />
                 {" "}
            <Column
              status="completed"
              title="Completed"
              tasks={columns.completed}
              onDelete={handleDelete}
            />
                {" "}
          </div>
             {" "}
        </DragDropContext>
      )}
       {" "}
    </div>
  );
}
