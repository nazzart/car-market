import type { SvgIconComponent } from "@mui/icons-material";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import SportsScoreOutlinedIcon from "@mui/icons-material/SportsScoreOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import DiamondOutlinedIcon from "@mui/icons-material/DiamondOutlined";
import ElectricBoltOutlinedIcon from "@mui/icons-material/ElectricBoltOutlined";

// Временные данные — count позже будет считаться в БД
export type Collection = {
  slug: string;
  label: string;
  description: string;
  icon: SvgIconComponent;
  count: number;
};

// Правила попадания в подборку (для будущего запроса к БД):
// retro    — год выпуска ≤ 1995
// sport    — купе/кабриолет с мощностью от 300 л.с. или модель из списка (M4, RS7, 911…)
// tuning   — продавец отметил «Автомобиль с тюнингом» (с модерацией)
// exotic   — марка из списка (Ferrari, Lamborghini, Rolls-Royce…) или цена от 100 000 €
// electric — тип топлива: электро
export const collections: Collection[] = [
  {
    slug: "retro",
    label: "Ретро",
    description: "Автомобили 1995 года и старше",
    icon: HistoryOutlinedIcon,
    count: 1204,
  },
  {
    slug: "sport",
    label: "Спортивные",
    description: "Купе и кабриолеты от 300 л.с.",
    icon: SportsScoreOutlinedIcon,
    count: 876,
  },
  {
    slug: "tuning",
    label: "Тюнинг",
    description: "Доработанные автомобили",
    icon: BuildOutlinedIcon,
    count: 432,
  },
  {
    slug: "exotic",
    label: "Эксклюзив",
    description: "Редкие марки и авто от 100 000 €",
    icon: DiamondOutlinedIcon,
    count: 118,
  },
  {
    slug: "electric",
    label: "Электромобили",
    description: "Полностью электрические",
    icon: ElectricBoltOutlinedIcon,
    count: 2310,
  },
];

// Почти пустая подборка выглядит хуже, чем её отсутствие
const MIN_COLLECTION_SIZE = 10;

export const visibleCollections = collections.filter(
  (c) => c.count >= MIN_COLLECTION_SIZE
);

export const collectionHref = (slug: string) => `/cars?collection=${slug}`;
