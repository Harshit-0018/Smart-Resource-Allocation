/**
 * RewardsBadge — displays a volunteer's earned badge with icon and label.
 *
 * @param {{ badgeId: string }} props
 */
const BADGE_MAP = {
  first_responder: { label: 'First Responder', emoji: '🚀' },
  skill_champion: { label: 'Skill Champion', emoji: '🏆' },
  community_hero: { label: 'Community Hero', emoji: '🦸' },
  speed_volunteer: { label: 'Speed Volunteer', emoji: '⚡' },
  multilingual: { label: 'Multilingual', emoji: '🌍' },
};

export default function RewardsBadge({ badgeId }) {
  const badge = BADGE_MAP[badgeId] || { label: badgeId, emoji: '🎖️' };

  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm">
      <span>{badge.emoji}</span>
      <span>{badge.label}</span>
    </span>
  );
}
