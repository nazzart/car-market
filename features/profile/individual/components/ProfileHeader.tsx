import { ProfileMode } from "../../types/profile";

export default function ProfileHeader({ mode }: { mode: ProfileMode }) {
  const isEdit = mode === "edit";
  return (
    <header>
      <h1 className="text-[28px] font-semibold tracking-tight">
        {isEdit ? "Edit account" : "Create account"}
      </h1>

      <p className="text-gray-500 mt-2">
        Manage your personal information and contact details.
      </p>
    </header>
  );
}
