import { cn } from "@/lib/utils";

// Серый мигающий блок на месте ещё не загруженного: размеры и скругление — через className
export default function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("bg-gray-100 animate-pulse", className)} />;
}
