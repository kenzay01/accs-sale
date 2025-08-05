interface CategoryItemProps {
  id: string;
  label: string;
  onClick: (id: string) => void;
  imageSrc?: string;
  imageAlt?: string;
  active?: boolean;
}

export default function CategoryItem({
  id,
  label,
  onClick,
  imageSrc = "",
  imageAlt = "",
  active = false,
}: CategoryItemProps) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 rounded-lg  hover:bg-gray-700 transition-all flex flex-col items-center w-32 min-w-32 h-auto shadow-[10px_10px_10px_rgba(0,0,0,1)] ${
        active ? "bg-gray-800 -translate-y-2" : ""
      }`}
    >
      {/* <img
        src={imageSrc}
        alt={imageAlt}
        className="w-12 h-12 mb-2 rounded-full"
      /> */}
      <div className="w-16 h-16 mb-2 rounded-full bg-gray-300"></div>
      {label}
    </button>
  );
}
