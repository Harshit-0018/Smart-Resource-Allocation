/**
 * TaskCard — displays a single task summary.
 * Used in NGO TaskList, Volunteer BrowseTasks, and Admin views.
 *
 * @param {{ task: object, onClick?: function }} props
 */
export default function TaskCard({ task, onClick }) {
  // TODO: Implement task card UI with urgency badge, location, skills, and status
  return (
    <div
      className="rounded-lg border p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick?.(task)}
    >
      <h3 className="font-semibold text-lg">{task?.title || 'Untitled Task'}</h3>
      <p className="text-sm text-gray-500 mt-1">{task?.ngoName}</p>
      <p className="text-sm mt-2 line-clamp-2">{task?.description}</p>
    </div>
  );
}
