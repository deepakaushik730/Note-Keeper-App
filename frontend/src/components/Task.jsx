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
            "task d-flex justify-content-between align-items-center p-2 rounded shadow-sm " +
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
              style={{ flex: 1, marginRight: "0.5rem" }}
            />
          ) : (
            <span style={{ flex: 1 }}>{title}</span>
          )}

          <div className="icons">
            <i
              className="bi bi-pencil edit-icon"
              onClick={() => setEditing(true)}
            ></i>

            <i className="bi bi-trash delete-icon" onClick={handleDelete}></i>
          </div>
        </div>
      )}
    </Draggable>
  );
}
