export default function CarGallery() {
    return (
      <div className="space-y-3">
  
        {/* main image */}
        <div className="aspect-[16/10] w-full overflow-hidden rounded-xl bg-gray-100">
          <img
            src="/cars/bmw.jpg"
            className="w-full h-full object-cover"
          />
        </div>
  
        {/* thumbnails */}
        <div className="flex gap-2 overflow-x-auto">
  
          {[1,2,3,4,5].map((i) => (
            <div
              key={i}
              className="w-20 h-14 rounded-md overflow-hidden border cursor-pointer"
            >
              <img
                src="/cars/bmw.jpg"
                className="w-20 h-14 rounded-md object-cover hover:opacity-80 transition"
              />
            </div>
          ))}
  
        </div>
  
      </div>
    );
  }