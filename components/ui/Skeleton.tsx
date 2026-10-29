import { cn } from "@/lib/utils";

type SkeletonProps = { className?: string };

// Серый мигающий блок на месте ещё не загруженного: размеры и скругление — через className
export default function Skeleton({ className }: SkeletonProps) {
  return <div aria-hidden className={cn("bg-gray-100 animate-pulse", className)} />;
}
