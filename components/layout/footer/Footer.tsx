import Link from "next/link";

import Container from "../Container";

// "#" — страницы, которые ещё не созданы
const columns = [
  {
    title: "Покупателям",
    links: [
      { label: "Легковые", href: "/cars" },
      { label: "Дилеры", href: "/dealers" },
      { label: "Избранное", href: "#" },
    ],
  },
  {
    title: "Продавцам",
    links: [
      { label: "Разместить объявление", href: "/sell" },
      { label: "Личный кабинет", href: "/account" },
      { label: "Профиль", href: "/account/profile" },
    ],
  },
  {
    title: "О сервисе",
    links: [
      { label: "О нас", href: "#" },
      { label: "Правила размещения", href: "#" },
      { label: "Конфиденциальность", href: "#" },
      { label: "Контакты", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200 bg-gray-50">
      <Container className="bg-transparent py-10">
        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-bold text-lg text-primary">
              bestauto.lv
            </Link>

            <p className="text-sm text-gray-500 mt-2 max-w-xs">
              Покупка и продажа новых и подержанных автомобилей в Латвии.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                {col.title}
              </h3>

              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-black transition"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 text-xs text-gray-500">
          © {new Date().getFullYear()} bestauto.lv
        </div>
      </Container>
    </footer>
  );
}
