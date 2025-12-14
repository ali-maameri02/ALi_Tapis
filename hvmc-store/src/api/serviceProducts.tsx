// src/services/serviceProducts.tsx
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://alitapis.com/fr/api';
console.log("API_URL utilisée :", API_URL)
// src/services/serviceProducts.tsx
export interface ProductImage {
  id: number;
  image: string;
  order: number;
  color: string;
  color_name: string;
}

/// serviceProducts.ts
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  metre_price: string;  // This is coming as a string from backend
  poids?: string;
  is_available: boolean;
  created_at: string;
  image: string;
  images: ProductImage[];
  category: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
}


export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await axios.get(`${API_URL}/catalog/products/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const fetchProductById = async (id: number): Promise<Product> => {
  try {
    const response = await axios.get(`${API_URL}/catalog/products/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    throw error;
  }
};

export const fetchProductsByCategory = async (categoryId: number): Promise<Product[]> => {
  try {
    const response = await axios.get(`${API_URL}/catalog/categories/${categoryId}/products/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
    throw error;
  }
};
