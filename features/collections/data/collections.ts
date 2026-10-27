import type { SvgIconComponent } from "@mui/icons-material";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import SportsScoreOutlinedIcon from "@mui/icons-material/SportsScoreOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import DiamondOutlinedIcon from "@mui/icons-material/DiamondOutlined";
import ElectricBoltOutlinedIcon from "@mui/icons-material/ElectricBoltOutlined";

import type { Listing } from "@/features/cars/data/listings";

// Временные данные — count позже будет считаться в БД
// Название и описание — в messages/{locale}/options.json → collections.{slug}
export type Collection = {
  slug: string;
  icon: SvgIconComponent;
  count: number;
  // правило попадания объявления в подборку (позже — условие запроса к БД)
  matches: (listing: Listing) => boolean;
};

const EXOTIC_BRANDS = [
  "ferrari",
  "lamborghini",
  "rolls-royce",
  "bentley",
  "aston-martin",
  "maserati",
];

export const collections: Collection[] = [
  {
    slug: "retro",
    icon: HistoryOutlinedIcon,
    count: 1204,
    matches: (l) => l.year <= 1995,
  },
  {
    slug: "sport",
    icon: SportsScoreOutlinedIcon,
    count: 876,
    matches: (l) =>
      ["coupe", "convertible"].includes(l.bodyType) && l.power >= 300,
  },
  {
    slug: "tuning",
    icon: BuildOutlinedIcon,
    count: 432,
    // продавец отмечает «Автомобиль с тюнингом» (с модерацией)
    matches: (l) => Boolean(l.tuned),
  },
  {
    slug: "exotic",
    icon: DiamondOutlinedIcon,
    count: 118,
    matches: (l) => EXOTIC_BRANDS.includes(l.brand) || l.price >= 100000,
  },
  {
    slug: "electric",
    icon: ElectricBoltOutlinedIcon,
    count: 2310,
    matches: (l) => l.fuel === "electric",
  },
];

// Почти пустая подборка выглядит хуже, чем её отсутствие
const MIN_COLLECTION_SIZE = 10;

export const visibleCollections = collections.filter(
  (c) => c.count >= MIN_COLLECTION_SIZE
);

export const collectionHref = (slug: string) => `/cars?collection=${slug}`;
