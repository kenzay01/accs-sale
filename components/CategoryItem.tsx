import Image from "next/image";

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
      className={`px-4 py-2 rounded-lg  bg-gray-950 border-2 border-gray-900  transition-all flex flex-col items-center w-32 min-w-32 h-auto shadow-[0px_10px_10px_rgba(255,0,0,0.5)] ${
        active ? "bg-gray-900 -translate-y-2" : ""
      }`}
    >
      {/* <img
        src={imageSrc}
        alt={imageAlt}
        className="w-12 h-12 mb-2 rounded-full"
      /> */}
      <Image
        src={imageSrc}
        alt={imageAlt}
        width={48}
        height={48}
        className="w-22 h-16 mb-2 rounded-lg object-cover"
      />
      {/* Placeholder for image if needed */}
      {/* <div className="w-22 h-16 mb-2 rounded-lg bg-gray-300"></div> */}
      {label}
    </button>
  );
}
