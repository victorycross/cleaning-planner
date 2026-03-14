import { useState } from 'react'
import Sidebar, { type View } from './components/layout/Sidebar'
import Today from './views/Today'
import Schedule from './views/Schedule'
import Rooms from './views/Rooms'
import People from './views/People'
import Library from './views/Library'
import Print from './views/Print'
import useAppData from './hooks/useAppData'
import { getDueStatus } from './lib/scheduler'

export default function App() {
  const [view, setView] = useState<View>('today')
  const {
    data,
    addTask, deleteTask, completeTask,
    addRoom, deleteRoom,
    addPerson, deletePerson,
    addLibraryTask, deleteLibraryTask,
  } = useAppData()

  const overdueCnt = data.tasks.filter(t => getDueStatus(t) === 'overdue').length

  return (
    <div className="flex min-h-screen">
      <Sidebar current={view} onChange={setView} overdueCnt={overdueCnt} />
      <main className="flex-1 overflow-auto">
        {view === 'today' && (
          <Today
            data={data}
            onComplete={completeTask}
            onDelete={deleteTask}
            onAdd={addTask}
          />
        )}
        {view === 'schedule' && (
          <Schedule
            data={data}
            onComplete={completeTask}
            onDelete={deleteTask}
            onAdd={addTask}
          />
        )}
        {view === 'rooms' && (
          <Rooms
            data={data}
            onComplete={completeTask}
            onDeleteTask={deleteTask}
            onAddTask={addTask}
            onAddRoom={addRoom}
            onDeleteRoom={deleteRoom}
          />
        )}
        {view === 'people' && (
          <People
            data={data}
            onComplete={completeTask}
            onDeleteTask={deleteTask}
            onAddPerson={addPerson}
            onDeletePerson={deletePerson}
          />
        )}
        {view === 'library' && (
          <Library
            data={data}
            onAddTask={addTask}
            onAddLibraryTask={addLibraryTask}
            onDeleteLibraryTask={deleteLibraryTask}
          />
        )}
        {view === 'print' && (
          <Print data={data} />
        )}
      </main>
    </div>
  )
}
