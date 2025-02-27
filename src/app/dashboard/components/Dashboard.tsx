import TaskList from "./TaskList";

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-300">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Task Dashboard</h1>

      <TaskList />
    </div>
  );
}
