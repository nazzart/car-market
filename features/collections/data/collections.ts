import type { SvgIconComponent } from "@mui/icons-material";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import SportsScoreOutlinedIcon from "@mui/icons-material/SportsScoreOutlined";
import DiamondOutlinedIcon from "@mui/icons-material/DiamondOutlined";
import ElectricBoltOutlinedIcon from "@mui/icons-material/ElectricBoltOutlined";

import { Listing, listings } from "@/features/cars/data/listings";

// Название и описание — в messages/{locale}/options.json → collections.{slug}
type CollectionConfig = {
  slug: string;
  icon: SvgIconComponent;
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

const config: CollectionConfig[] = [
  {
    slug: "retro",
    icon: HistoryOutlinedIcon,
    matches: (l) => l.year <= 1995,
  },
  {
    slug: "sport",
    icon: SportsScoreOutlinedIcon,
    matches: (l) =>
      ["coupe", "convertible"].includes(l.bodyType) && l.power >= 300,
  },
  {
    slug: "exotic",
    icon: DiamondOutlinedIcon,
    matches: (l) => EXOTIC_BRANDS.includes(l.brand) || l.price >= 100000,
  },
  {
    slug: "electric",
    icon: ElectricBoltOutlinedIcon,
    matches: (l) => l.fuel === "electric",
  },
];

export type Collection = CollectionConfig & { count: number };

// count — по реальным объявлениям (позже — агрегат из БД)
export const collections: Collection[] = config.map((c) => ({
  ...c,
  count: listings.filter(c.matches).length,
}));

// Почти пустая подборка выглядит хуже, чем её отсутствие.
// TODO: вернуть 10, когда объявления будут из БД — сейчас в демо-данных их всего несколько
const MIN_COLLECTION_SIZE = 0;

export const visibleCollections = collections.filter(
  (c) => c.count >= MIN_COLLECTION_SIZE
);

export const collectionHref = (slug: string) => `/cars?collection=${slug}`;
