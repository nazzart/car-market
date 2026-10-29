import Image from "next/image";
import { useTranslations } from "next-intl";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";

import Button from "@/components/ui/Button";

const benefits = ["free", "fast", "buyers"];

export default function SellBanner() {
  const t = useTranslations("home.sellBanner");

  return (
    <section className="py-8 sm:py-10">
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
            {t("title")}
          </h2>

          <p className="text-white/70 mt-3 sm:text-lg">
            {t("text")}
          </p>

          <ul className="mt-6 space-y-2.5">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-2.5 text-white/90">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <CheckIcon sx={{ fontSize: 14 }} />
                </span>
                {t(`benefits.${b}`)}
              </li>
            ))}
          </ul>

          <Button size="lg" href="/sell" className="mt-8">
            <AddIcon fontSize="small" />
            {t("cta")}
          </Button>
        </div>
      </div>
    </section>
  );
}
