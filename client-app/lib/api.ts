import { Product } from "@/type";
import Constants from "expo-constants";

/*
  IMPORTANT — Quick notes for local dev and emulators (keep this comment for future edits)

  - When running the app on a mobile device or emulator, "localhost" (127.0.0.1) resolves to the device/emulator,
    NOT your development machine. To call a server running on your computer, point the app to your computer's LAN IP.

  How to get your machine LAN IP:
  - Windows: run `ipconfig` and use the IPv4 Address (e.g. 192.168.1.10)
  - macOS/Linux: run `ifconfig` or `ip a` and find the address for en0/wlan0 (e.g. 192.168.1.10)

  Examples:
  - If your server runs on port 4242 on your machine, set:
      API_URL=http://192.168.1.10:4242

  Emulator / Simulator shortcuts:
  - Android emulator (default AVD): use 10.0.2.2 to reach host machine (http://10.0.2.2:4242)
  - Genymotion emulator: use 10.0.3.2
  - iOS Simulator: `localhost` usually works (http://localhost:4242) because it runs on the same host

  Where to set this value:
  - If you used Expo "extra" (app.json), update the value there (expo.extra.API_URL).
  - If you use a .env file in your project, update the API_URL there.
  - After changing, restart Metro and the app:
      npx expo start -c
      (also restart your dev server on the host machine)

  Troubleshooting:
  - Ensure both device/emulator and dev machine are on the same Wi‑Fi / LAN.
  - Disable or allow the port in OS firewall (e.g. 4242).
  - If you see CORS or redirect issues, check the exact redirect URI configured in Supabase / OAuth provider.

  Keep this comment as a reminder to switch API_URL for local testing.
*/

const runtimeExtra = (Constants.expoConfig?.extra ?? (Constants.manifest as any)?.extra) || {};
const API_URL = runtimeExtra.API_URL ?? 'https://fakestoreapi.com';
console.log("Using API_URL =", API_URL);

//get all products
const getProducts = async () : Promise<Product[]> => {
  try {
    const response = await fetch(`${API_URL}/products`);
    console.log(response, "api response");
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    const data = await response.json();
    console.log("Đây là dữ liệu sản phẩm:", data);
    return data;
  } catch (error) {
    console.log("Network fetching products:", error);
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