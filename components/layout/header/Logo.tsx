import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="font-bold text-lg text-primary"
    >
      auto.ru
    </Link>
  );
}