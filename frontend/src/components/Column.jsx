import React, { useState, useEffect } from 'react'
import { Droppable } from '@hello-pangea/dnd'
import Task from './Task'

export default function Column({ status, title, tasks: initialTasks }) {
  const [tasks, setTasks] = useState(initialTasks)

  // update state if props change (e.g., from re-render or new data)
  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  const handleDelete = id => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="column">
      <h3>{title}</h3>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={'tasklist' + (snapshot.isDraggingOver ? ' over' : '')}
          >
            {tasks.length === 0 && (
              <p className="empty-text">No notes here yet</p>
            )}
            {tasks.map((t, i) => (
              <Task key={t.id} task={t} index={i} onDelete={handleDelete} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
