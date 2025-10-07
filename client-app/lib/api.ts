import { Product } from "@/type";

const API_URL = 'https://fakestoreapi.com';
//get all products
const getProducts = async () : Promise<Product[]> => {
  try{
const response = await fetch(`${API_URL}/products`);
if(!response.ok){
  throw new Error('Failed to fetch products');
}
return await response.json();
  }catch(error){
    console.log('Network fetching products:', error);
    throw error;
  }
}
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