import { notFound } from "next/navigation";

// Любой неизвестный адрес внутри языка → наша страница 404 с шапкой и подвалом
export default function CatchAllPage() {
  notFound();
}
