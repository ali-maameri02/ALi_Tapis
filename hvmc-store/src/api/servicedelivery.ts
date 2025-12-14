import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export interface WilayaPrice {
  id: number;
  wilaya: string;
  price: number;
}

export const fetchDeliveryPrices = async (): Promise<WilayaPrice[]> => {
  try {
    const response = await axios.get(`${API_URL}/delivery/prices/`);
    return response.data;
  } catch (error) {
    console.error("Erreur prix livraison:", error);
    throw error;
  }
};
