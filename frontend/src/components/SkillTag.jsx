/**
 * SkillTag — displays a single skill as a styled tag/chip.
 *
 * @param {{ skill: string }} props
 */
export default function SkillTag({ skill }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
      {skill}
    </span>
  );
}
