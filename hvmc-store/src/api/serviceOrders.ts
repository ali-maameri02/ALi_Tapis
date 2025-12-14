import { toast } from "sonner";
import { apiClient } from "./auth";

export interface OrderItem {
  id: string;
  productname: string;
  price: number; // Calculated total price for the item(s)
  quantity: number;
  image?: string;
  color?: string;
  longueur?: number;
  metre_price?: string; // Price per meter from product
  metre_price_value?: string; // Same as metre_price, for clarity
  unit_price?: number; // Original unit price (for regular products)
  date?: string;
  wilaya?: string;
  address?: string;
  delivery_price?: number; // Delivery price
  total_price?: number; // Total price = (metre_price × longueur × quantity) + delivery_price
  calculation?: string; // String showing the calculation
  calculated_item_price?: number; // Explicit calculated item price
}

interface WilayaDelivery {
  id: number;
  name: string;
  delivery_price: number;
}

let cachedUserData: any = null;

// In your serviceOrders.ts, update the submitOrder function:
export const submitOrder = async (items: OrderItem | OrderItem[]) => {
  if (!cachedUserData) {
    cachedUserData = JSON.parse(localStorage.getItem("userData") || "{}");
  }

  const basePayload = {
    name: cachedUserData.name || "Client inconnu",
    email: cachedUserData.email || "",
    phone: cachedUserData.phone || "Non fourni",
    wilaya: cachedUserData.wilaya || "Non spécifiée",
    address: cachedUserData.address || "Non spécifiée",
  };

  try {
    const orders = Array.isArray(items) ? items : [items];
    const timestamp = new Date().toISOString();

    // Calculate total for this order using metre_price when applicable
    const orderTotal = orders.reduce((sum, item) => {
      let itemPrice = item.price || 0;
      
      // If product has metre_price and longueur, use that calculation
      if (item.metre_price && item.longueur) {
        const metrePrice = parseFloat(item.metre_price);
        const longueur = item.longueur;
        itemPrice = metrePrice * longueur * item.quantity;
      }
      
      return sum + itemPrice;
    }, 0);
    
    const deliveryPrice = orders[0]?.delivery_price || 0;
    const finalTotal = orderTotal + deliveryPrice;

    // Local storage save
    const ordersWithDate = orders.map((item) => ({
      ...basePayload,
      ...item,
      date: timestamp,
      image: item.image || "/placeholder-product.jpg",
      metre_price: item.metre_price || "",
      delivery_price: deliveryPrice,
      total_price: finalTotal,
      // Include both price and metre_price for reference
      unit_price: item.metre_price ? null : item.price,
      metre_price_value: item.metre_price || null
    }));

    const existingOrders = JSON.parse(localStorage.getItem("userOrders") || "[]");
    localStorage.setItem("userOrders", JSON.stringify([...existingOrders, ...ordersWithDate]));

    // BACKEND Structure - Use metre_price for calculation when applicable
    const orderPayload = {
      is_sent: false,
      items: orders.map((item) => {
        // Determine which price to use
        let finalPrice = item.price || 0;
        let priceType = 'unit';
        
        if (item.metre_price && item.longueur) {
          const metrePrice = parseFloat(item.metre_price);
          finalPrice = metrePrice * (item.longueur || 1);
          priceType = 'metre';
        }
        
        return {
          product: parseInt(item.id),
          quantity: item.quantity,
          product_name: item.productname,
          price: finalPrice,
          price_type: priceType,
          color: item.color || "",
          longueur: item.longueur || null,
          metre_price: item.metre_price ? parseFloat(item.metre_price) : null,
          unit_price: item.price || null, // Keep original unit price for reference
        };
      }),
      guest_email: basePayload.email,
      guest_name: basePayload.name,
      guest_phone: basePayload.phone,
      guest_wilaya: basePayload.wilaya,
      guest_address: basePayload.address,
      delivery_price: deliveryPrice,
      total_price: finalTotal,
      price_breakdown: {
        uses_metre_pricing: orders.some(item => item.metre_price),
        item_count: orders.length,
      }
    };

    console.log("Sending order payload:", JSON.stringify(orderPayload, null, 2));
    
    const response = await apiClient.post("/orders/", orderPayload, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log("Order submitted:", response.data);
    toast.success("Commande enregistrée !");
    return true;
  } catch (error: any) {
    console.error("Erreur commande:", error);
    if (error.response) {
      console.error("Server response:", error.response.data);
      toast.error(`Erreur: ${error.response.data.detail || "Problème serveur"}`);
    } else {
      toast.error("Erreur réseau, vérifiez votre connexion");
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

export const getApiOrders = async () => {
  try {
    const response = await apiClient.get('/orders/');
    return response.data;
  } catch (error) {
    console.error("Error fetching orders from API:", error);
    throw error;
  }
};

export const getDeliveryPrice = async (wilaya: string): Promise<number> => {
  try {
    if (!wilaya) return 0;
    
    const response = await apiClient.get(`/orders/get-delivery-price/?wilaya=${encodeURIComponent(wilaya)}`);
    
    if (response.data && typeof response.data === 'object') {
      return response.data.delivery_price || 0;
    }
    
    return response.data || 0;
  } catch (error) {
    console.error('Error fetching delivery price:', error);
    return 0;
  }
};

export const getDeliveryWilayas = async (): Promise<WilayaDelivery[]> => {
  try {
    const response = await apiClient.get('/orders/wilaya-delivery/');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching wilayas:', error);
    return [];
  }
};