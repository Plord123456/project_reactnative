import { Product } from "@/type";

const API_URL = 'https://fakestoreapi.com';
//get all products
const getProducts = async () : Promise<Product[]> => {
  try{
const response = await fetch(`${API_URL}/products`);
console.log(response,"api response");
if(!response.ok){
  throw new Error('Failed to fetch products');
}
return await response.json();
  }catch(error){
    console.log('Network fetching products:', error);
    throw error;
  }
}
//GetSigleproduct

export const getProduct = async (id: number): Promise<Product> => {
  try {
    const response = await fetch(`${API_URL}/products/${id}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch product with ID ${id}:`, error);
    throw error;
  }
};

//get all categories
const getCategories = async () : Promise<string[]> => {
  try{
const response = await fetch(`${API_URL}/products/categories`);
if(!response.ok){
  throw new Error('Failed to fetch categories');
}
return await response.json();
  }catch(error){
    console.log('Network fetching categories:', error);
    throw error;
  }
}
const getProductsByCategory = async (
  category: string
): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_URL}/products/category/${category}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch products in category ${category}:`, error);
    throw error;
  }
};

const searchProductsAPI = async (query: string): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const  products = await response.json();
    const searchResults = query.toLowerCase().trim();
    // Lọc sản phẩm dựa trên tiêu đề chứa từ khóa tìm kiếm (không phân biệt hoa thường)
    return products.filter((product: Product) =>
      product.title.toLowerCase().includes(searchResults) ||
      product.description.toLowerCase().includes(searchResults) ||
      product.category.toLowerCase().includes(searchResults)
    );
  } catch (error) {
    console.error(`Failed to search products with query ${query}:`, error);
    throw error;
  }
};

export {getProducts, getCategories, getProductsByCategory, searchProductsAPI};