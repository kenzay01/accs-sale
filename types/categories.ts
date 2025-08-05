export interface Category {
  id: string;
  label_ru: string;
  label_en: string;
  img: string; // Assuming categories have images
}

export interface Subcategory {
  id: string;
  label_ru: string;
  label_en: string;
  img: string; // Assuming subcategories have images
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  img: string;
  categoryId: string;
  subcategoryId: string;
  timeAdded: string;
  quantity: number;
}
