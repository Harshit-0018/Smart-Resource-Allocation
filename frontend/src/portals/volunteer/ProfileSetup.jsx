/**
 * ProfileSetup — volunteer onboarding form.
 * Fields: name, phone, skills (tag input → Vertex AI embedding on save),
 * experience, languages, location (Maps autocomplete), availability (dates + time slots).
 */
export default function ProfileSetup() {
  // TODO: Implement volunteer profile form with Maps autocomplete and skill tags
  return (
    <div>
      <h1 className="text-2xl font-bold">Profile Setup</h1>
      <p className="text-gray-500 mt-2">Tell us about your skills and availability.</p>
    </div>
  );
}
