export default function Header() {
  return (
    <header className="p-4 flex items-center justify-between">
      <div className="text-red-500 font-bold text-xl">auto.ru</div>

      <input
        placeholder="Поиск машин..."
        className="border rounded-lg px-4 py-2 w-96"
      />
    </header>
  );
}
