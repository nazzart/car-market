import CategoryList from "./CategoryList";

export default function Header() {
  return (
    <header className="py-4 flex items-center justify-between">
      <div className="text-red-500 font-bold text-xl">auto.ru</div>

      <CategoryList />

    </header>
  );
}
