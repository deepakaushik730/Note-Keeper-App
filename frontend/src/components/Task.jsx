import React, { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { deleteTask, updateTask } from "../api";

export default function Task({ task, index, onDelete }) {
  const [removing, setRemoving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const handleDelete = async () => {
    setRemoving(true);
    try {
      await deleteTask(task.id);
      setTimeout(() => onDelete && onDelete(task.id), 400);
    } catch {
      setRemoving(false);
    }
  };

  const handleEditSave = async () => {
    setEditing(false);
    if (title.trim() && title !== task.title) {
      await updateTask(task.id, { title });
    } else {
      setTitle(task.title);
    }
  };

  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={
            "task p-2 rounded shadow-sm " +
            (snapshot.isDragging ? "dragging " : "") +
            (removing ? "fade-out " : "")
          }
        >
          {editing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleEditSave}
              onKeyDown={(e) => e.key === "Enter" && handleEditSave()}
              autoFocus
              className="form-control form-control-sm"
            />
          ) : (
            <span className="task-text">{title}</span>
          )}

          <div className="task-footer">
            <small className="note-time">
             {new Date(task.created_at).toLocaleDateString(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
})},{" "}
{new Date(task.created_at).toLocaleTimeString(undefined, {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})}
            </small>

            <div className="icons">
              <i
                className="bi bi-pencil edit-icon"
                onClick={() => setEditing(true)}
              ></i>
              <i
                className="bi bi-trash delete-icon"
                onClick={handleDelete}
              ></i>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
