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

export type Page = {
  id: string;
  title_ru: string;
  title_en: string;
  content_ru: string | FAQ[];
  content_en: string | FAQ[];
  content_type: "text" | "faq";
};

export type FAQ = {
  question: string;
  answer: string;
};
