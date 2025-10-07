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

export {getProducts, getCategories};