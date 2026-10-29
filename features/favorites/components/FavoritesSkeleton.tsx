import Skeleton from "@/components/ui/Skeleton";

import { favoriteCardClass } from "./FavoriteCard";

// Заглушки карточек, пока избранное загружается
export default function FavoritesSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={favoriteCardClass}>
          <Skeleton className="w-32 sm:w-44 aspect-[4/3] rounded-xl" />
          <div className="flex-1 space-y-2 py-1">
            <Skeleton className="h-4 w-2/3 rounded" />
            <Skeleton className="h-5 w-1/3 rounded" />
            <Skeleton className="h-3 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
