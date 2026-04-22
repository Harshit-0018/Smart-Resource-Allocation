/**
 * VolunteerCard — displays a volunteer profile summary.
 * Used in Admin ManageVolunteers and NGO MatchResults views.
 *
 * @param {{ volunteer: object, onClick?: function }} props
 */
export default function VolunteerCard({ volunteer, onClick }) {
  // TODO: Implement volunteer card UI with skills, rating, and verification badge
  return (
    <div
      className="rounded-lg border p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick?.(volunteer)}
    >
      <h3 className="font-semibold text-lg">{volunteer?.name || 'Unknown Volunteer'}</h3>
      <p className="text-sm text-gray-500 mt-1">{volunteer?.email}</p>
    </div>
  );
}
