create table if not exists tasks (
  id serial primary key,
  title text not null,
  status text not null default 'todo',
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_tasks_status_position on tasks(status, position);
