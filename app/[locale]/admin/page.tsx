"use client";
import React, { useState, useEffect, useRef } from "react";
import { useItemContext } from "@/context/itemsContext";
import { MainItemProps } from "@/types/mainItem";
import { Category, Subcategory, Page } from "@/types/categories";
import { Upload, X, Image as ImageIcon } from "lucide-react";

const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const {
    categories,
    subcategories,
    items,
    pages,
    addCategory,
    editCategory,
    deleteCategory,
    addSubcategory,
    editSubcategory,
    deleteSubcategory,
    addItem,
    editItem,
    deleteItem,
    addPage,
    editPage,
    deletePage,
    loading,
    error,
  } = useItemContext();

  const [newCategory, setNewCategory] = useState<Category>({
    id: "",
    label_ru: "",
    label_en: "",
    img: "",
  });
  const [newSubcategory, setNewSubcategory] = useState<Subcategory>({
    id: "",
    label_ru: "",
    label_en: "",
    img: "",
  });
  const [newItem, setNewItem] = useState<MainItemProps>({
    id: "",
    name: "",
    price: 0,
    description_ru: "",
    description_en: "",
    img: "",
    categoryId: "",
    subcategoryId: "",
    timeAdded: new Date().toISOString(),
  });
  const [newPage, setNewPage] = useState<Page>({
    id: "",
    title_ru: "",
    title_en: "",
    content_ru: "",
    content_en: "",
    content_type: "text",
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] =
    useState<Subcategory | null>(null);
  const [editingItem, setEditingItem] = useState<MainItemProps | null>(null);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [subcategoryImage, setSubcategoryImage] = useState<File | null>(null);
  const [itemImage, setItemImage] = useState<File | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState<
    string | null
  >(null);
  const [subcategoryImagePreview, setSubcategoryImagePreview] = useState<
    string | null
  >(null);
  const [itemImagePreview, setItemImagePreview] = useState<string | null>(null);
  const categoryFileInputRef = useRef<HTMLInputElement>(
    null
  ) as React.RefObject<HTMLInputElement>;
  const subcategoryFileInputRef = useRef<HTMLInputElement>(
    null
  ) as React.RefObject<HTMLInputElement>;
  const itemFileInputRef = useRef<HTMLInputElement>(
    null
  ) as React.RefObject<HTMLInputElement>;

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImage: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>,
    fileInputRef: React.RefObject<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = <T extends { img: string }>(
    setImage: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>,
    fileInputRef: React.RefObject<HTMLInputElement>,
    entity: T | null,
    setEntity: React.Dispatch<React.SetStateAction<T | null>>
  ) => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (entity) {
      setEntity({ ...entity, img: "" });
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!newCategory.label_ru || !newCategory.label_en || !categoryImage) {
      setFormError("Please fill all fields and select an image");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("id", `cat_${Date.now()}`);
      formData.append("label_ru", newCategory.label_ru);
      formData.append("label_en", newCategory.label_en);
      formData.append("img", categoryImage);
      await addCategory(formData);
      setNewCategory({ id: "", label_ru: "", label_en: "", img: "" });
      setCategoryImage(null);
      setCategoryImagePreview(null);
      if (categoryFileInputRef.current) {
        categoryFileInputRef.current.value = "";
      }
    } catch (error) {
      setFormError("Failed to add category");
      console.error("Error adding category:", error);
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (
      !editingCategory ||
      !editingCategory.label_ru ||
      !editingCategory.label_en
    ) {
      setFormError("Please fill all fields");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("id", editingCategory.id);
      formData.append("label_ru", editingCategory.label_ru);
      formData.append("label_en", editingCategory.label_en);
      if (categoryImage) {
        formData.append("img", categoryImage);
      } else {
        formData.append("img", editingCategory.img);
      }
      await editCategory(editingCategory.id, formData);
      setEditingCategory(null);
      setCategoryImage(null);
      setCategoryImagePreview(null);
      if (categoryFileInputRef.current) {
        categoryFileInputRef.current.value = "";
      }
    } catch (error) {
      setFormError("Failed to update category");
      console.error("Error updating category:", error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setFormError(null);
    try {
      await deleteCategory(id);
    } catch (error) {
      setFormError("Failed to delete category");
      console.error("Error deleting category:", error);
    }
  };

  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (
      !newSubcategory.label_ru ||
      !newSubcategory.label_en ||
      !subcategoryImage ||
      !selectedCategory
    ) {
      setFormError(
        "Please fill all fields, select a category, and select an image"
      );
      return;
    }
    try {
      const formData = new FormData();
      formData.append("id", `sub_${Date.now()}`);
      formData.append("category_id", selectedCategory);
      formData.append("label_ru", newSubcategory.label_ru);
      formData.append("label_en", newSubcategory.label_en);
      formData.append("img", subcategoryImage);
      await addSubcategory(selectedCategory, formData);
      setNewSubcategory({
        id: "",
        label_ru: "",
        label_en: "",
        img: "",
      });
      setSubcategoryImage(null);
      setSubcategoryImagePreview(null);
      if (subcategoryFileInputRef.current) {
        subcategoryFileInputRef.current.value = "";
      }
    } catch (error) {
      setFormError("Failed to add subcategory");
      console.error("Error adding subcategory:", error);
    }
  };

  const handleEditSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (
      !editingSubcategory ||
      !editingSubcategory.label_ru ||
      !editingSubcategory.label_en ||
      !selectedCategory
    ) {
      setFormError("Please fill all fields and select a category");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("id", editingSubcategory.id);
      formData.append("category_id", selectedCategory);
      formData.append("label_ru", editingSubcategory.label_ru);
      formData.append("label_en", editingSubcategory.label_en);
      if (subcategoryImage) {
        formData.append("img", subcategoryImage);
      } else {
        formData.append("img", editingSubcategory.img);
      }
      await editSubcategory(selectedCategory, editingSubcategory.id, formData);
      setEditingSubcategory(null);
      setSubcategoryImage(null);
      setSubcategoryImagePreview(null);
      if (subcategoryFileInputRef.current) {
        subcategoryFileInputRef.current.value = "";
      }
    } catch (error) {
      setFormError("Failed to update subcategory");
      console.error("Error updating subcategory:", error);
    }
  };

  const handleDeleteSubcategory = async (
    categoryId: string,
    subcategoryId: string
  ) => {
    setFormError(null);
    try {
      await deleteSubcategory(categoryId, subcategoryId);
    } catch (error) {
      setFormError("Failed to delete subcategory");
      console.error("Error deleting subcategory:", error);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (
      !newItem.name ||
      !newItem.price ||
      !newItem.description_ru ||
      !newItem.description_en ||
      !itemImage ||
      !newItem.categoryId ||
      !newItem.subcategoryId
    ) {
      setFormError(
        "Please fill all fields, select category/subcategory, and select an image"
      );
      return;
    }
    try {
      const formData = new FormData();
      formData.append("id", `item_${Date.now()}`);
      formData.append("category_id", newItem.categoryId);
      formData.append("subcategory_id", newItem.subcategoryId);
      formData.append("name", newItem.name);
      formData.append("price", newItem.price.toString());
      formData.append("description_ru", newItem.description_ru);
      formData.append("description_en", newItem.description_en);
      formData.append("img", itemImage);
      formData.append("time_added", new Date().toISOString());
      await addItem(formData);
      setNewItem({
        id: "",
        name: "",
        price: 0,
        description_ru: "",
        description_en: "",
        img: "",
        categoryId: "",
        subcategoryId: "",
        timeAdded: new Date().toISOString(),
      });
      setItemImage(null);
      setItemImagePreview(null);
      if (itemFileInputRef.current) {
        itemFileInputRef.current.value = "";
      }
    } catch (error) {
      setFormError("Failed to add item");
      console.error("Error adding item:", error);
    }
  };

  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (
      !editingItem ||
      !editingItem.name ||
      !editingItem.price ||
      !editingItem.description_ru ||
      !editingItem.description_en ||
      !editingItem.categoryId ||
      !editingItem.subcategoryId
    ) {
      setFormError("Please fill all fields and select category/subcategory");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("id", editingItem.id);
      formData.append("category_id", editingItem.categoryId);
      formData.append("subcategory_id", editingItem.subcategoryId);
      formData.append("name", editingItem.name);
      formData.append("price", editingItem.price.toString());
      formData.append("description_ru", editingItem.description_ru);
      formData.append("description_en", editingItem.description_en);
      if (itemImage) {
        formData.append("img", itemImage);
      } else {
        formData.append("img", editingItem.img);
      }
      formData.append("time_added", editingItem.timeAdded);
      await editItem(editingItem.id, formData);
      setEditingItem(null);
      setItemImage(null);
      setItemImagePreview(null);
      if (itemFileInputRef.current) {
        itemFileInputRef.current.value = "";
      }
    } catch (error) {
      setFormError("Failed to update item");
      console.error("Error updating item:", error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    setFormError(null);
    try {
      await deleteItem(id);
    } catch (error) {
      setFormError("Failed to delete item");
      console.error("Error deleting item:", error);
    }
  };

  const handleAddPage = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (
      !newPage.id ||
      !newPage.title_ru ||
      !newPage.title_en ||
      !newPage.content_type ||
      (newPage.content_type === "text" &&
        (!newPage.content_ru || !newPage.content_en)) ||
      (newPage.content_type === "faq" &&
        (!newPage.content_ru || !newPage.content_en))
    ) {
      setFormError("Please fill all required fields");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("id", newPage.id);
      formData.append("title_ru", newPage.title_ru);
      formData.append("title_en", newPage.title_en);
      formData.append(
        "content_ru",
        typeof newPage.content_ru === "string"
          ? newPage.content_ru
          : JSON.stringify(newPage.content_ru)
      );
      formData.append(
        "content_en",
        typeof newPage.content_en === "string"
          ? newPage.content_en
          : JSON.stringify(newPage.content_en)
      );
      formData.append("content_type", newPage.content_type);
      await addPage(formData);
      setNewPage({
        id: "",
        title_ru: "",
        title_en: "",
        content_ru: "",
        content_en: "",
        content_type: "text",
      });
    } catch (error) {
      setFormError("Failed to add page");
      console.error("Error adding page:", error);
    }
  };

  const handleEditPage = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (
      !editingPage ||
      !editingPage.title_ru ||
      !editingPage.title_en ||
      !editingPage.content_type ||
      (editingPage.content_type === "text" &&
        (!editingPage.content_ru || !editingPage.content_en)) ||
      (editingPage.content_type === "faq" &&
        (!editingPage.content_ru || !editingPage.content_en))
    ) {
      setFormError("Please fill all required fields");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("id", editingPage.id);
      formData.append("title_ru", editingPage.title_ru);
      formData.append("title_en", editingPage.title_en);
      formData.append(
        "content_ru",
        typeof editingPage.content_ru === "string"
          ? editingPage.content_ru
          : JSON.stringify(editingPage.content_ru)
      );
      formData.append(
        "content_en",
        typeof editingPage.content_en === "string"
          ? editingPage.content_en
          : JSON.stringify(editingPage.content_en)
      );
      formData.append("content_type", editingPage.content_type);
      await editPage(editingPage.id, formData);
      setEditingPage(null);
    } catch (error) {
      setFormError("Failed to update page");
      console.error("Error updating page:", error);
    }
  };

  const handleDeletePage = async (id: string) => {
    setFormError(null);
    try {
      await deletePage(id);
    } catch (error) {
      setFormError("Failed to delete page");
      console.error("Error deleting page:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-red-500 text-xl">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-red-500 text-xl">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-red-500">
            Admin Dashboard
          </h1>
          <button
            onClick={onLogout}
            className="py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {formError && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {formError}
          </div>
        )}

        {/* Categories Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            Categories
          </h2>
          <form
            onSubmit={editingCategory ? handleEditCategory : handleAddCategory}
            className="mb-4 space-y-4"
          >
            <input
              type="text"
              placeholder="Russian Label"
              value={
                editingCategory
                  ? editingCategory.label_ru
                  : newCategory.label_ru
              }
              onChange={(e) =>
                editingCategory
                  ? setEditingCategory({
                      ...editingCategory,
                      label_ru: e.target.value,
                    })
                  : setNewCategory({ ...newCategory, label_ru: e.target.value })
              }
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
            />
            <input
              type="text"
              placeholder="English Label"
              value={
                editingCategory
                  ? editingCategory.label_en
                  : newCategory.label_en
              }
              onChange={(e) =>
                editingCategory
                  ? setEditingCategory({
                      ...editingCategory,
                      label_en: e.target.value,
                    })
                  : setNewCategory({ ...newCategory, label_en: e.target.value })
              }
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
            />
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-4">
              {categoryImagePreview ||
              (editingCategory && editingCategory.img) ? (
                <div className="relative">
                  <img
                    src={categoryImagePreview || editingCategory?.img}
                    alt="Category Preview"
                    className="w-full max-h-48 object-contain rounded-md"
                  />
                  <button
                    onClick={() =>
                      handleRemoveImage(
                        setCategoryImage,
                        setCategoryImagePreview,
                        categoryFileInputRef,
                        editingCategory,
                        setEditingCategory
                      )
                    }
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center h-32 cursor-pointer"
                  onClick={() => categoryFileInputRef.current?.click()}
                >
                  <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-gray-500 text-center">
                    Click to upload category image
                  </p>
                </div>
              )}
              <input
                type="file"
                ref={categoryFileInputRef}
                onChange={(e) =>
                  handleImageChange(
                    e,
                    setCategoryImage,
                    setCategoryImagePreview,
                    categoryFileInputRef
                  )
                }
                accept="image/*"
                className="hidden"
              />
              {!categoryImagePreview && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => categoryFileInputRef.current?.click()}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </button>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              {editingCategory ? "Update Category" : "Add Category"}
            </button>
            {editingCategory && (
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryImage(null);
                  setCategoryImagePreview(null);
                  if (categoryFileInputRef.current) {
                    categoryFileInputRef.current.value = "";
                  }
                }}
                className="py-2 px-4 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </form>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((category: Category) => (
              <div key={category.id} className="p-4 bg-gray-800 rounded-md">
                <img
                  src={category.img}
                  alt={category.label_en}
                  className="w-full h-32 object-cover rounded-md mb-2"
                />
                <h3 className="text-lg font-medium">
                  {category.label_ru} ({category.label_en})
                </h3>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => {
                      setEditingCategory(category);
                      setCategoryImagePreview(category.img);
                    }}
                    className="py-1 px-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="py-1 px-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subcategories Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            Subcategories
          </h2>
          <form
            onSubmit={
              editingSubcategory ? handleEditSubcategory : handleAddSubcategory
            }
            className="mb-4 space-y-4"
          >
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
            >
              <option value="">Select Category</option>
              {categories.map((cat: Category) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label_ru}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Russian Label"
              value={
                editingSubcategory
                  ? editingSubcategory.label_ru
                  : newSubcategory.label_ru
              }
              onChange={(e) =>
                editingSubcategory
                  ? setEditingSubcategory({
                      ...editingSubcategory,
                      label_ru: e.target.value,
                    })
                  : setNewSubcategory({
                      ...newSubcategory,
                      label_ru: e.target.value,
                    })
              }
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
            />
            <input
              type="text"
              placeholder="English Label"
              value={
                editingSubcategory
                  ? editingSubcategory.label_en
                  : newSubcategory.label_en
              }
              onChange={(e) =>
                editingSubcategory
                  ? setEditingSubcategory({
                      ...editingSubcategory,
                      label_en: e.target.value,
                    })
                  : setNewSubcategory({
                      ...newSubcategory,
                      label_en: e.target.value,
                    })
              }
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
            />
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-4">
              {subcategoryImagePreview ||
              (editingSubcategory && editingSubcategory.img) ? (
                <div className="relative">
                  <img
                    src={subcategoryImagePreview || editingSubcategory?.img}
                    alt="Subcategory Preview"
                    className="w-full max-h-48 object-contain rounded-md"
                  />
                  <button
                    onClick={() =>
                      handleRemoveImage(
                        setSubcategoryImage,
                        setSubcategoryImagePreview,
                        subcategoryFileInputRef,
                        editingSubcategory,
                        setEditingSubcategory
                      )
                    }
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center h-32 cursor-pointer"
                  onClick={() => subcategoryFileInputRef.current?.click()}
                >
                  <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-gray-500 text-center">
                    Click to upload subcategory image
                  </p>
                </div>
              )}
              <input
                type="file"
                ref={subcategoryFileInputRef}
                onChange={(e) =>
                  handleImageChange(
                    e,
                    setSubcategoryImage,
                    setSubcategoryImagePreview,
                    subcategoryFileInputRef
                  )
                }
                accept="image/*"
                className="hidden"
              />
              {!subcategoryImagePreview && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => subcategoryFileInputRef.current?.click()}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </button>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              {editingSubcategory ? "Update Subcategory" : "Add Subcategory"}
            </button>
            {editingSubcategory && (
              <button
                type="button"
                onClick={() => {
                  setEditingSubcategory(null);
                  setSubcategoryImage(null);
                  setSubcategoryImagePreview(null);
                  if (subcategoryFileInputRef.current) {
                    subcategoryFileInputRef.current.value = "";
                  }
                }}
                className="py-2 px-4 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </form>
          {categories.map((category: Category) => (
            <div key={category.id} className="mb-4">
              <h3 className="text-lg font-medium text-red-500">
                {category.label_ru}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {subcategories[category.id]?.map((sub: Subcategory) => (
                  <div key={sub.id} className="p-4 bg-gray-800 rounded-md">
                    <img
                      src={sub.img}
                      alt={sub.label_en}
                      className="w-full h-32 object-cover rounded-md mb-2"
                    />
                    <h4 className="text-md font-medium">
                      {sub.label_ru} ({sub.label_en})
                    </h4>
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => {
                          setEditingSubcategory(sub);
                          setSelectedCategory(category.id);
                          setSubcategoryImagePreview(sub.img);
                        }}
                        className="py-1 px-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteSubcategory(category.id, sub.id)
                        }
                        className="py-1 px-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Items Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Items</h2>
          <form
            onSubmit={editingItem ? handleEditItem : handleAddItem}
            className="mb-4 space-y-4"
          >
            <select
              value={editingItem ? editingItem.categoryId : newItem.categoryId}
              onChange={(e) =>
                editingItem
                  ? setEditingItem({
                      ...editingItem,
                      categoryId: e.target.value,
                      subcategoryId: "",
                    })
                  : setNewItem({
                      ...newItem,
                      categoryId: e.target.value,
                      subcategoryId: "",
                    })
              }
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
            >
              <option value="">Select Category</option>
              {categories.map((cat: Category) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label_ru}
                </option>
              ))}
            </select>
            <select
              value={
                editingItem ? editingItem.subcategoryId : newItem.subcategoryId
              }
              onChange={(e) =>
                editingItem
                  ? setEditingItem({
                      ...editingItem,
                      subcategoryId: e.target.value,
                    })
                  : setNewItem({ ...newItem, subcategoryId: e.target.value })
              }
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
            >
              <option value="">Select Subcategory</option>
              {(editingItem ? editingItem.categoryId : newItem.categoryId) &&
                subcategories[
                  editingItem ? editingItem.categoryId : newItem.categoryId
                ]?.map((sub: Subcategory) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.label_ru}
                  </option>
                ))}
            </select>
            <input
              type="text"
              placeholder="Name"
              value={editingItem ? editingItem.name : newItem.name}
              onChange={(e) =>
                editingItem
                  ? setEditingItem({ ...editingItem, name: e.target.value })
                  : setNewItem({ ...newItem, name: e.target.value })
              }
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
            />
            <input
              type="number"
              placeholder="Price"
              value={editingItem ? editingItem.price : newItem.price}
              onChange={(e) =>
                editingItem
                  ? setEditingItem({
                      ...editingItem,
                      price: parseFloat(e.target.value) || 0,
                    })
                  : setNewItem({
                      ...newItem,
                      price: parseFloat(e.target.value) || 0,
                    })
              }
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
            />
            <input
              type="text"
              placeholder="Russian Description"
              value={
                editingItem
                  ? editingItem.description_ru
                  : newItem.description_ru
              }
              onChange={(e) =>
                editingItem
                  ? setEditingItem({
                      ...editingItem,
                      description_ru: e.target.value,
                    })
                  : setNewItem({ ...newItem, description_ru: e.target.value })
              }
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
            />
            <input
              type="text"
              placeholder="English Description"
              value={
                editingItem
                  ? editingItem.description_en
                  : newItem.description_en
              }
              onChange={(e) =>
                editingItem
                  ? setEditingItem({
                      ...editingItem,
                      description_en: e.target.value,
                    })
                  : setNewItem({ ...newItem, description_en: e.target.value })
              }
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
            />
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-4">
              {itemImagePreview || (editingItem && editingItem.img) ? (
                <div className="relative">
                  <img
                    src={itemImagePreview || editingItem?.img}
                    alt="Item Preview"
                    className="w-full max-h-48 object-contain rounded-md"
                  />
                  <button
                    onClick={() =>
                      handleRemoveImage(
                        setItemImage,
                        setItemImagePreview,
                        itemFileInputRef,
                        editingItem,
                        setEditingItem
                      )
                    }
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center h-32 cursor-pointer"
                  onClick={() => itemFileInputRef.current?.click()}
                >
                  <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-gray-500 text-center">
                    Click to upload item image
                  </p>
                </div>
              )}
              <input
                type="file"
                ref={itemFileInputRef}
                onChange={(e) =>
                  handleImageChange(
                    e,
                    setItemImage,
                    setItemImagePreview,
                    itemFileInputRef
                  )
                }
                accept="image/*"
                className="hidden"
              />
              {!itemImagePreview && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => itemFileInputRef.current?.click()}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </button>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              {editingItem ? "Update Item" : "Add Item"}
            </button>
            {editingItem && (
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setItemImage(null);
                  setItemImagePreview(null);
                  if (itemFileInputRef.current) {
                    itemFileInputRef.current.value = "";
                  }
                }}
                className="py-2 px-4 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </form>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item: MainItemProps) => (
              <div key={item.id} className="p-4 bg-gray-800 rounded-md">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-32 object-cover rounded-md mb-2"
                />
                <h3 className="text-lg font-medium">{item.name}</h3>
                <p className="text-gray-400">Price: ${item.price}</p>
                <p className="text-gray-400">{item.description_ru}</p>
                <p className="text-gray-400">{item.description_en}</p>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setItemImagePreview(item.img);
                    }}
                    className="py-1 px-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="py-1 px-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pages Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Pages</h2>
          <form
            onSubmit={editingPage ? handleEditPage : handleAddPage}
            className="mb-4 space-y-4"
          >
            <input
              type="text"
              placeholder="Page ID (e.g., about, faq, promotions)"
              value={editingPage ? editingPage.id : newPage.id}
              onChange={(e) =>
                editingPage
                  ? setEditingPage({ ...editingPage, id: e.target.value })
                  : setNewPage({ ...newPage, id: e.target.value })
              }
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
              disabled={editingPage !== null}
            />
            <input
              type="text"
              placeholder="Russian Title"
              value={editingPage ? editingPage.title_ru : newPage.title_ru}
              onChange={(e) =>
                editingPage
                  ? setEditingPage({ ...editingPage, title_ru: e.target.value })
                  : setNewPage({ ...newPage, title_ru: e.target.value })
              }
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
            />
            <input
              type="text"
              placeholder="English Title"
              value={editingPage ? editingPage.title_en : newPage.title_en}
              onChange={(e) =>
                editingPage
                  ? setEditingPage({ ...editingPage, title_en: e.target.value })
                  : setNewPage({ ...newPage, title_en: e.target.value })
              }
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
            />
            <select
              value={
                editingPage ? editingPage.content_type : newPage.content_type
              }
              onChange={(e) =>
                editingPage
                  ? setEditingPage({
                      ...editingPage,
                      content_type: e.target.value as "text" | "faq",
                    })
                  : setNewPage({
                      ...newPage,
                      content_type: e.target.value as "text" | "faq",
                    })
              }
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
            >
              <option value="text">Text</option>
              <option value="faq">FAQ</option>
            </select>
            {(editingPage ? editingPage.content_type : newPage.content_type) ===
            "text" ? (
              <>
                <textarea
                  placeholder="Russian Content"
                  value={
                    editingPage
                      ? typeof editingPage.content_ru === "string"
                        ? editingPage.content_ru
                        : ""
                      : typeof newPage.content_ru === "string"
                      ? newPage.content_ru
                      : ""
                  }
                  onChange={(e) =>
                    editingPage
                      ? setEditingPage({
                          ...editingPage,
                          content_ru: e.target.value,
                        })
                      : setNewPage({ ...newPage, content_ru: e.target.value })
                  }
                  className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white h-32"
                />
                <textarea
                  placeholder="English Content"
                  value={
                    editingPage
                      ? typeof editingPage.content_en === "string"
                        ? editingPage.content_en
                        : ""
                      : typeof newPage.content_en === "string"
                      ? newPage.content_en
                      : ""
                  }
                  onChange={(e) =>
                    editingPage
                      ? setEditingPage({
                          ...editingPage,
                          content_en: e.target.value,
                        })
                      : setNewPage({ ...newPage, content_en: e.target.value })
                  }
                  className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white h-32"
                />
              </>
            ) : (
              <>
                <textarea
                  placeholder='Russian FAQ Content (JSON format: [{"question": "", "answer": ""}, ...])'
                  value={
                    editingPage
                      ? typeof editingPage.content_ru === "string"
                        ? editingPage.content_ru
                        : JSON.stringify(editingPage.content_ru, null, 2)
                      : typeof newPage.content_ru === "string"
                      ? newPage.content_ru
                      : JSON.stringify(newPage.content_ru, null, 2)
                  }
                  onChange={(e) =>
                    editingPage
                      ? setEditingPage({
                          ...editingPage,
                          content_ru: e.target.value,
                        })
                      : setNewPage({ ...newPage, content_ru: e.target.value })
                  }
                  className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white h-32"
                />
                <textarea
                  placeholder='English FAQ Content (JSON format: [{"question": "", "answer": ""}, ...])'
                  value={
                    editingPage
                      ? typeof editingPage.content_en === "string"
                        ? editingPage.content_en
                        : JSON.stringify(editingPage.content_en, null, 2)
                      : typeof newPage.content_en === "string"
                      ? newPage.content_en
                      : JSON.stringify(newPage.content_en, null, 2)
                  }
                  onChange={(e) =>
                    editingPage
                      ? setEditingPage({
                          ...editingPage,
                          content_en: e.target.value,
                        })
                      : setNewPage({ ...newPage, content_en: e.target.value })
                  }
                  className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white h-32"
                />
              </>
            )}
            <button
              type="submit"
              className="py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              {editingPage ? "Update Page" : "Add Page"}
            </button>
            {editingPage && (
              <button
                type="button"
                onClick={() => setEditingPage(null)}
                className="py-2 px-4 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </form>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {pages.map((page: Page) => (
              <div key={page.id} className="p-4 bg-gray-800 rounded-md">
                <h3 className="text-lg font-medium">
                  {page.title_ru} ({page.title_en})
                </h3>
                <p className="text-gray-400">Type: {page.content_type}</p>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => {
                      setEditingPage({
                        ...page,
                        content_ru:
                          typeof page.content_ru === "string"
                            ? page.content_ru
                            : JSON.stringify(page.content_ru, null, 2),
                        content_en:
                          typeof page.content_en === "string"
                            ? page.content_en
                            : JSON.stringify(page.content_en, null, 2),
                      });
                    }}
                    className="py-1 px-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePage(page.id)}
                    className="py-1 px-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_LOGIN;
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

  const handleLogin = () => {
    setLoading(true);
    setError("");

    setTimeout(() => {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        localStorage.setItem("adminLoggedIn", "true");
        onLogin();
      } else {
        setError("Невірний логін або пароль");
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-7 md:space-y-8 bg-gray-800 p-6 sm:p-7 md:p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl sm:text-2xl md:text-3xl font-extrabold text-red-500">
            Адмін панель
          </h2>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-sm text-gray-400">
            Введіть свої облікові дані для доступу до адмін панелі
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded">
            {error}
          </div>
        )}

        <div className="mt-6 sm:mt-7 md:mt-8 space-y-4 sm:space-y-5 md:space-y-6">
          <div className="rounded-md space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">
                Логін
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded relative block w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 text-xs sm:text-sm md:text-sm bg-gray-800"
                placeholder="Логін"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded relative block w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 text-xs sm:text-sm md:text-sm bg-gray-800"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="button"
              disabled={loading}
              onClick={handleLogin}
              className="group relative w-full flex justify-center py-1.5 sm:py-2 px-3 sm:px-4 border border-transparent text-xs sm:text-sm md:text-sm font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? "Вхід..." : "Увійти"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("adminLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    setIsLoggedIn(false);
  };

  return isLoggedIn ? (
    <AdminDashboard onLogout={handleLogout} />
  ) : (
    <AdminLogin onLogin={handleLogin} />
  );
}
