import { cn } from "@/lib/utils";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full bg-white max-w-[1280px] px-4", className)}
    >
      {children}
    </div>
  );
}
