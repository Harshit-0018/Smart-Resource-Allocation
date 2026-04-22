/**
 * UrgencyBadge — colour-coded badge for task urgency level (1–5).
 *
 * @param {{ level: number }} props
 */
const URGENCY_COLORS = {
  1: 'bg-green-100 text-green-800',
  2: 'bg-yellow-100 text-yellow-800',
  3: 'bg-orange-100 text-orange-800',
  4: 'bg-red-100 text-red-800',
  5: 'bg-red-200 text-red-900 font-bold',
};

const URGENCY_LABELS = {
  1: 'Low',
  2: 'Moderate',
  3: 'Medium',
  4: 'High',
  5: 'Critical',
};

export default function UrgencyBadge({ level = 1 }) {
  const color = URGENCY_COLORS[level] || URGENCY_COLORS[1];
  const label = URGENCY_LABELS[level] || 'Unknown';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${color}`}>
      {label} ({level}/5)
    </span>
  );
}
