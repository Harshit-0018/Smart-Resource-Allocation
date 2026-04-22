/**
 * PostTask — form for NGOs to create a new community task.
 * Fields: title, description, category, urgency (1–5), requiredSkills,
 * volunteersRequired, location (Google Maps picker), startDate, endDate.
 */
export default function PostTask() {
  // TODO: Implement task creation form with Google Maps place picker
  return (
    <div>
      <h1 className="text-2xl font-bold">Post a New Task</h1>
      <p className="text-gray-500 mt-2">Create a task and find volunteers to help.</p>
    </div>
  );
}
