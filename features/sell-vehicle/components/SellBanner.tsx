import Image from "next/image";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";

const benefits = [
  "Бесплатное размещение",
  "Объявление за 5 минут",
  "Тысячи покупателей каждый день",
];

export default function SellBanner() {
  return (
    <section className="py-8">
      <div className="relative overflow-hidden rounded-2xl bg-gray-50 border border-gray-100 grid md:grid-cols-[1fr_auto] items-center gap-6 p-6 sm:p-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Продайте автомобиль быстро
          </h2>

          <p className="text-gray-500 mt-2 max-w-md">
            Разместите объявление — его увидят покупатели со всей Латвии.
          </p>

          <ul className="mt-5 space-y-2">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-2 text-gray-700">
                <CheckIcon fontSize="small" className="text-emerald-600" />
                {b}
              </li>
            ))}
          </ul>

          <Button
            href="/sell"
            variant="contained"
            color="success"
            size="large"
            startIcon={<AddIcon />}
            sx={{ mt: 4, px: 3, fontWeight: 600 }}
          >
            Разместить объявление
          </Button>
        </div>

        <Image
          src="/cars/category-car.png"
          alt=""
          width={360}
          height={240}
          className="hidden md:block mix-blend-multiply"
        />
      </div>
    </section>
  );
}
