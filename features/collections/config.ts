import type { SvgIconComponent } from "@mui/icons-material";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import SportsScoreOutlinedIcon from "@mui/icons-material/SportsScoreOutlined";
import DiamondOutlinedIcon from "@mui/icons-material/DiamondOutlined";
import ElectricBoltOutlinedIcon from "@mui/icons-material/ElectricBoltOutlined";

import type { Listing } from "@/features/cars/types";

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

export type Collection = CollectionConfig;

// Правила подборок. Число объявлений в подборке — useCollectionCount() из features/cars/api.
// TODO(backend): скрывать почти пустые подборки (меньше ~10 объявлений), когда данные будут из БД
export const collections: Collection[] = config;

export const collectionHref = (slug: string) => `/cars?collection=${slug}`;
