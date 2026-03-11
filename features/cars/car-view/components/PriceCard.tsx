import { Button } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShareIcon from "@mui/icons-material/Share";
export default function PriceCard() {
  return (
    <div className="bg-white rounded-xl p-6 space-y-4">
      <div className="text-3xl font-bold tracking-tight">2 090 000 ₽</div>

      <Button variant="contained" color="secondary" fullWidth size="large">
        Показать телефон
      </Button>

      <div className="flex justify-between text-sm text-gray-600 pt-6">
        <div className="flex items-center gap-2 cursor-pointer">
          <FavoriteBorderIcon fontSize="small" />В избранное
        </div>

        <div className="flex items-center gap-2 cursor-pointer">
          <ShareIcon fontSize="small" />
          Поделиться
        </div>
      </div>
    </div>
  );
}
