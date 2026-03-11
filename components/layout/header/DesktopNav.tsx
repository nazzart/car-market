export default function DesktopNav() {
    return (
      <nav className="flex items-center gap-8 text-sm text-gray-700">
  
        <a className="text-primary font-medium cursor-pointer">
          Легковые
        </a>
  
        <a className="hover:text-black cursor-pointer">
          Дилеры
        </a>
  
        <a className="hover:text-black cursor-pointer">
          Коммерческие
        </a>
  
      </nav>
    );
  }