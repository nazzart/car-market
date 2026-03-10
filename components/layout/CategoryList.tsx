export default function CategoryList() {
  return (
    <div className="flex gap-8 py-6 text-lg">
      <button className="text-red-500 font-semibold"><a href="cars">Легковые</a></button>

      <button>Дилеры</button>

      <button>Коммерческие</button>
    </div>
  );
}
