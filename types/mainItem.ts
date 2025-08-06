export interface MainItemProps {
  id: string;
  name: string;
  price: number;
  description_ru: string; // Optional description field
  description_en: string; // Optional description field
  img: string;
  categoryId: string;
  subcategoryId: string;
  timeAdded: string;
}
