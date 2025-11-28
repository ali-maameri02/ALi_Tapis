// serviceOrders.ts
import { toast } from "sonner";
import { apiClient } from './auth';
// serviceOrders.ts - Update OrderItem interface
export interface OrderItem {
  productname: string;
  id: string;
  price: string | number;
  quantity: number;
  date?: string;
  image?: string;
  wilaya?: string;
  address?: string;
  color?: string;
  hauteur?: number | string;  // Add measurement fields
  largeur?: number | string;
  carr?: number | string;
}
// Cache user data to avoid repeated localStorage access
let cachedUserData: any = null;

export const submitOrder = async (items: OrderItem | OrderItem[]) => {
  // Get user data once and cache it
  if (!cachedUserData) {
    cachedUserData = JSON.parse(localStorage.getItem("userData") || "{}");
  }

  const basePayload = {
    name: cachedUserData.name || "Client inconnu",
    email: cachedUserData.email || "",
    phone: cachedUserData.phone || "Non fourni",
    wilaya: cachedUserData.wilaya || "Non spécifiée",
    address: cachedUserData.address || "Non spécifiée"
  };

  try {
    const orders = Array.isArray(items) ? items : [items];
    const timestamp = new Date().toISOString();
    
    // Prepare all orders at once
    const ordersWithDate = orders.map(item => ({
      ...basePayload,
      ...item,
      date: timestamp,
      image: item.image || '/placeholder-product.jpg'
    }));
    
    // Update localStorage in one operation
    const existingOrders = JSON.parse(localStorage.getItem("userOrders") || "[]");
    localStorage.setItem("userOrders", JSON.stringify([...existingOrders, ...ordersWithDate]));
    
    // Prepare order payload for API
    const orderPayload = {
      is_sent: false,
      items: orders.map(item => ({
        product: parseInt(item.id),
        quantity: item.quantity,
        product_name: item.productname,
        price: typeof item.price === 'number' ? item.price : parseFloat(item.price as string),
        color: item.color || '',
        hauteur: item.hauteur ? parseFloat(item.hauteur as string) : null,  // Add measurements
        largeur: item.largeur ? parseFloat(item.largeur as string) : null,
        carr: item.carr ? parseFloat(item.carr as string) : null
      })),
      guest_email: basePayload.email,
      guest_name: basePayload.name,
      guest_phone: basePayload.phone,
      guest_wilaya: basePayload.wilaya,
      guest_address: basePayload.address
    };

    // Use apiClient which automatically handles auth tokens and CSRF
    const response = await apiClient.post('/orders/', orderPayload);
    
    console.log("Order submitted successfully:", response.data);
    
    toast.success("Commande(s) bien enregistrée(s) !");
    return true;
  } catch (error: any) {
    console.error("Erreur lors de la commande :", error);
    
    // More specific error messages
    if (error.response?.status === 400) {
      const errorData = error.response.data;
      if (typeof errorData === 'object') {
        // Handle field-specific errors
        const errorMessages = Object.values(errorData).flat().join(', ');
        toast.error(`Données invalides: ${errorMessages}`);
      } else {
        toast.error("Données de commande invalides.");
      }
    } else if (error.response?.status === 404) {
      toast.error("Endpoint de commande non trouvé.");
    } else {
      toast.error("Échec de l'envoi de la commande.");
    }
    
    return false;
  }
};

export const getLocalOrders = (): OrderItem[] => {
  try {
    if (!cachedUserData) {
      cachedUserData = JSON.parse(localStorage.getItem("userData") || "{}");
    }
    const userEmail = cachedUserData.email;
    
    if (!userEmail) return [];
    
    const allOrders = JSON.parse(localStorage.getItem("userOrders") || "[]");
    return allOrders
      .filter((order: any) => order.email === userEmail)
      .map((order: any) => ({
        ...order,
        price: typeof order.price === 'string' ? 
          parseFloat(order.price.trim()) : 
          order.price
      }));
  } catch (error) {
    console.error("Error reading orders from localStorage:", error);
    return [];
  }
};

// New function to get orders from API (for authenticated users)
export const getApiOrders = async () => {
  try {
    const response = await apiClient.get('/orders/');
    return response.data;
  } catch (error) {
    console.error("Error fetching orders from API:", error);
    throw error;
  }
};