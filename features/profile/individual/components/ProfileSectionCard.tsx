import { Typography } from "@mui/material";

type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function ProfileSectionCard({
  title,
  description,
  children,
}: Props) {
  return (
    <section
      className="bg-white border border-gray-200
    shadow-[0_4px_16px_rgba(0,0,0,0.08)] rounded-xl p-7"
    >
      <div className="mb-6">
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          {title}
        </Typography>

        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>

      {children}
    </section>
  );
}
