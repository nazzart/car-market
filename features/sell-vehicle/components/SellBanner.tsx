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
      <div className="relative overflow-hidden rounded-3xl bg-gray-900">
        <Image
          src="/cars/bmw5.jpg"
          alt=""
          fill
          sizes="(min-width: 1280px) 1248px, 100vw"
          className="object-cover object-[80%_center]"
        />

        <div className="absolute inset-0 bg-linear-to-r from-gray-900 via-gray-900/85 to-gray-900/10" />

        <div className="relative px-6 py-10 sm:px-12 sm:py-14 max-w-xl">
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white">
            Продайте автомобиль быстро
          </h2>

          <p className="text-white/70 mt-3 sm:text-lg">
            Разместите объявление — его увидят покупатели со всей Латвии.
          </p>

          <ul className="mt-6 space-y-2.5">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-2.5 text-white/90">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <CheckIcon sx={{ fontSize: 14 }} />
                </span>
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
            sx={{ mt: 4, px: 3, py: 1.25, fontWeight: 600, borderRadius: "999px" }}
          >
            Разместить объявление
          </Button>
        </div>
      </div>
    </section>
  );
}
