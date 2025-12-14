// Cart.tsx
import { Button } from "../ui/button";
import { useCart, type CartItem } from '../context/Cartcontext';
import { Link, useNavigate } from 'react-router-dom';
import { TrashIcon, X, User, Phone, Mail, MapPin, Truck } from "lucide-react";
import { submitOrder, type OrderItem, getDeliveryWilayas } from '@/api/serviceOrders';
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';

interface UserData {
  name: string;
  email: string;
  phone: string;
  wilaya?: string;
  address?: string;
}

interface WilayaDelivery {
  id: number;
  name: string;
  delivery_price: number;
}

export const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartCount, clearCart } = useCart();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    phone: '',
    wilaya: '',
    address: ''
  });
  const [formStep, setFormStep] = useState<'details' | 'delivery' | 'payment'>('details');
  const [selectedWilaya, setSelectedWilaya] = useState<string>('');
  const [deliveryPrice, setDeliveryPrice] = useState<number>(0);
  const [wilayas, setWilayas] = useState<WilayaDelivery[]>([]);
  const [isDeliveryLoading, setIsDeliveryLoading] = useState(false);

  // Load user data and wilayas on component mount
  useEffect(() => {
    const loadData = async () => {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        try {
          const parsedData = JSON.parse(storedUserData);
          setUserData(parsedData);
          if (parsedData.wilaya) {
            setSelectedWilaya(parsedData.wilaya);
          }
        } catch (err) {
          console.error('Failed to parse user data:', err);
        }
      }

      try {
        // Load wilayas
        const wilayaData = await getDeliveryWilayas();
        setWilayas(wilayaData);
      } catch (err) {
        console.error('Failed to load wilayas:', err);
      }
    };

    loadData();
  }, []);

  // Fetch delivery price when wilaya changes
  useEffect(() => {
    const fetchPrice = async () => {
      if (selectedWilaya) {
        setIsDeliveryLoading(true);
        try {
          const wilaya = wilayas.find(w => w.name === selectedWilaya);
          if (wilaya) {
            setDeliveryPrice(Number(wilaya.delivery_price) || 0);
          } else {
            setDeliveryPrice(0);
          }
        } catch (error) {
          console.error('Error fetching delivery price:', error);
          setDeliveryPrice(0);
        } finally {
          setIsDeliveryLoading(false);
        }
      } else {
        setDeliveryPrice(0);
      }
    };

    fetchPrice();
  }, [selectedWilaya, wilayas]);

  // SAFE helper function to parse ANY price string to number
  const parsePriceToNumber = (priceValue: any): number => {
    try {
      // If it's already a number, return it
      if (typeof priceValue === 'number') {
        return isNaN(priceValue) ? 0 : priceValue;
      }
      
      // If it's null or undefined, return 0
      if (priceValue == null) {
        return 0;
      }
      
      // Convert to string and clean
      const priceString = String(priceValue);
      
      // Remove currency symbols, spaces, and any non-numeric characters except dots and commas
      const cleaned = priceString
        .replace(/[^\d.,]/g, '') // Remove all non-numeric except . and ,
        .replace(/\.(?=.*\.)/g, ''); // Remove all dots except the last one
      
      // Replace comma with dot for decimal
      const normalized = cleaned.replace(',', '.');
      
      // Parse to number
      const parsed = parseFloat(normalized);
      
      // Return 0 if NaN
      return isNaN(parsed) ? 0 : parsed;
    } catch (error) {
      console.error('Error parsing price:', error, 'Value:', priceValue);
      return 0;
    }
  };

  // SAFE function to format number with 2 decimal places
  const formatPrice = (value: any): string => {
    const numValue = parsePriceToNumber(value);
    return numValue.toFixed(2);
  };

  // Calculate item price - SAFE version
  const calculateItemPrice = (item: CartItem): number => {
    try {
      let itemPrice = 0;
      
      if (item.metre_price && item.longueur) {
        const metrePrice = parsePriceToNumber(item.metre_price);
        const longueurValue = parsePriceToNumber(item.longueur);
        const quantity = Number(item.quantity) || 1;
        itemPrice = metrePrice * longueurValue * quantity;
      } else {
        const unitPrice = parsePriceToNumber(item.price);
        const quantity = Number(item.quantity) || 1;
        itemPrice = unitPrice * quantity;
      }
      
      return itemPrice;
    } catch (error) {
      console.error('Error calculating item price:', error, 'for item:', item);
      return 0;
    }
  };

  // Calculate total price - SAFE version
  const calculateProductTotal = (): number => {
    return cartItems.reduce((sum: number, item: CartItem) => {
      const itemPrice = calculateItemPrice(item);
      return sum + itemPrice;
    }, 0);
  };

  const productTotal = calculateProductTotal();
  const totalPrice = productTotal + deliveryPrice;
  
  // SAFE display values - always format as strings
  const displayTotal = formatPrice(totalPrice);
  const displayProductTotal = formatPrice(productTotal);

  const showSuccessNotification = () => {
    toast.custom(() => (
      <div className="bg-black rounded-2xl shadow-2xl p-6 border border-green-200 max-w-md">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-xl font-bold text-white">{t('order.successTitle')}</h3>
            <div className="mt-2 text-sm text-gray-600">
              <p className="font-medium">{t('order.successMessageCart')}</p>
              <p className="mt-1">{t('order.successContact')}</p>
            </div>
            <div className="flex gap-3 mt-4">
              <a 
                href="https://wa.me/213541779717" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-center font-medium"
              >
                {t('order.whatsApp')}
              </a>
              <a
                href="tel:+213541779717"
                className="flex-1 bg-[#d6b66d] text-white px-4 py-2 rounded-lg hover:bg-[#c9a95d] transition-colors text-center font-medium"
              >
                {t('order.call')}
              </a>
            </div>
          </div>
        </div>
      </div>
    ), { duration: 10000 });
  };

  const handleOrderAll = async () => {
    if (cartItems.length === 0) {
      toast.warning(t('cart.emptyWarning'));
      return;
    }

    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
        if (parsedData.wilaya) {
          setSelectedWilaya(parsedData.wilaya);
        }
      } catch (err) {
        console.error('Failed to parse user data:', err);
      }
    }
    
    setShowOrderForm(true);
  };

  // In Cart.tsx, update the handleOrderSubmit function:
const handleOrderSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (cartItems.length === 0) {
    toast.error(t('cart.empty'), {
      description: t('cart.emptyDescription'),
      style: {
        background: '#FF3333',
        color: 'white',
        borderRadius: '12px'
      }
    });
    return;
  }
  
  // Validation
  if (!userData.name.trim() || !userData.phone.trim()) {
    toast.error(t('errors.missingFields'), {
      description: t('errors.missingFieldsDescription'),
      style: {
        background: '#FF3333',
        color: 'white',
        borderRadius: '12px'
      }
    });
    return;
  }
  
  if (!selectedWilaya) {
    toast.error(t('errors.deliveryRequired'), {
      description: t('errors.deliveryRequired'),
      style: {
        background: '#FF3333',
        color: 'white',
        borderRadius: '12px'
      }
    });
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    // Create order items
    const orderItems: OrderItem[] = cartItems.map((item: CartItem) => {
      // Calculate price for each item
      const itemPrice = calculateItemPrice(item);
      
      let calculationMethod = '';
      if (item.metre_price && item.longueur) {
        const metrePrice = parsePriceToNumber(item.metre_price);
        const longueurValue = parsePriceToNumber(item.longueur);
        calculationMethod = `${formatPrice(metrePrice)} DA/m × ${longueurValue}m × ${item.quantity}`;
      } else {
        const unitPrice = parsePriceToNumber(item.price);
        calculationMethod = `${formatPrice(unitPrice)} DA × ${item.quantity}`;
      }
      
      return {
        productname: item.name,
        id: item.id,
        price: itemPrice, // This is now a number, which is allowed in the updated interface
        quantity: item.quantity,
        image: item.image,
        color: item.color || '',
        longueur: item.longueur ? parsePriceToNumber(item.longueur) : undefined,
        metre_price: item.metre_price || undefined,
        unit_price: parsePriceToNumber(item.price),
        metre_price_value: item.metre_price,
        wilaya: selectedWilaya,
        address: userData.address,
        delivery_price: deliveryPrice,
        total_price: totalPrice,
        calculation: calculationMethod
      };
    });

    // Save user data
    const userDataToSave = {
      ...userData,
      wilaya: selectedWilaya
    };
    localStorage.setItem("userData", JSON.stringify(userDataToSave));
    
    await submitOrder(orderItems);
    
    // Show success
    showSuccessNotification();
    clearCart();
    setShowOrderForm(false);
    setFormStep('details');
    navigate('/orders');
    
  } catch (error) {
    toast.error(t('errors.orderFailed'), {
      description: t('errors.orderFailedDescription'),
      style: {
        background: '#FF3333',
        color: 'white',
        borderRadius: '12px'
      }
    });
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-white">{t('cart.title')}</h1>
        
        {cartCount === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-medium mb-2 text-white">{t('cart.empty')}</h2>
            <p className="text-gray-400 mb-6">{t('cart.emptyDescription')}</p>
            <Button asChild className="bg-[#d6b66d] hover:bg-[#c9a95d] text-black">
              <Link to="/">{t('cart.viewProducts')}</Link>
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item: CartItem) => {
                const itemPrice = calculateItemPrice(item);
                const displayItemPrice = formatPrice(itemPrice);
                
                return (
                  <div 
                    key={`${item.id}-${item.color || 'default'}-${item.longueur || 'default'}`} 
                    className="flex gap-6 p-6 bg-black rounded-2xl border border-gray-800"
                  >
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-32 h-32 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg text-white">{item.name}</h3>
                          {item.color && (
                            <p className="text-sm text-gray-400 mt-1">{t('cart.color')}: {item.color}</p>
                          )}
                          
                          <div className="text-sm text-gray-400 mt-2">
                            {item.longueur && <span>{t('product.length')}: {item.longueur}m</span>}
                            {item.poids && <span className="ml-3">{t('cart.weight')}: {item.poids}kg</span>}
                          </div>
                          
                          {item.metre_price && (
                            <p className="text-sm text-gray-400">{t('cart.meterPrice')}: {formatPrice(item.metre_price)} DA/m</p>
                          )}
                          
                          <p className="text-white text-xl font-bold mt-3">
                            {displayItemPrice} DA
                          </p>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-4">
                        <div className="flex items-center border border-gray-700 rounded-lg overflow-hidden">
                          <Button 
                            variant="ghost" 
                            className="h-8 w-8 hover:bg-gray-800 text-white"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </Button>
                          <span className="w-10 text-center font-bold text-white">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            className="h-8 w-8 hover:bg-gray-800 text-white"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-black rounded-2xl border border-gray-800 p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">{t('cart.summary')}</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('cart.subtotal')}</span>
                    <span className="text-white font-medium">{displayProductTotal} DA</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('cart.shipping')}</span>
                    <span className="text-white font-medium">
                      {deliveryPrice > 0 ? `${formatPrice(deliveryPrice)} DA` : t('cart.free')}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-white">{t('cart.total')}</span>
                      <div className="text-2xl font-bold text-[#d6b66d]">
                        {displayTotal} DA
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-[#d6b66d] to-[#c9a95d] text-white hover:opacity-90"
                  onClick={handleOrderAll}
                  disabled={cartItems.length === 0}
                >
                  {t('cart.orderAll')}
                </Button>
                
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-700 text-gray-400 hover:text-white hover:border-gray-600"
                    onClick={() => navigate('/')}
                  >
                    {t('cart.continueShopping')}
                  </Button>
                </div>
              </div>
              
              {/* Delivery Info */}
              <div className="bg-black rounded-2xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                  <Truck className="h-5 w-5 text-[#d6b66d]" />
                  {t('cart.delivery')}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      {t('cart.wilaya')}
                    </label>
                    <select
                      value={selectedWilaya}
                      onChange={(e) => setSelectedWilaya(e.target.value)}
                      className="w-full border border-gray-700 rounded-lg p-3 text-white bg-black focus:ring-2 focus:ring-[#d6b66d] focus:border-transparent transition-colors"
                    >
                      <option value="">{t('cart.wilayaPlaceholder')}</option>
                      {wilayas.map((wilaya) => (
                        <option key={wilaya.id} value={wilaya.name}>
                          {wilaya.name} - {formatPrice(wilaya.delivery_price)} DA
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedWilaya && (
                    <div className="bg-gray-900 rounded-xl p-4 border border-green-900">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-400">{t('orderForm.deliveryInfo')}</div>
                          <div className="font-semibold text-white">{selectedWilaya}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">{t('cart.deliveryPrice')}</div>
                          <div className="text-xl font-bold text-white">
                            {isDeliveryLoading ? (
                              <FaSpinner className="h-5 w-5 animate-spin inline" />
                            ) : deliveryPrice > 0 ? (
                              `${formatPrice(deliveryPrice)} DA`
                            ) : (
                              <span className="text-green-500">{t('cart.free')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-black rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp border border-gray-800">
            {/* Modal Header */}
            <div className="sticky top-0 bg-black border-b border-gray-800 rounded-t-3xl p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">{t('orderForm.finalizeOrder')}</h2>
                  <p className="text-gray-400 mt-1">{t('orderForm.provideInfo')}</p>
                </div>
                <button
                  onClick={() => setShowOrderForm(false)}
                  className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              
              {/* Progress Steps */}
              <div className="flex items-center justify-center mt-8">
                <div className={`flex items-center ${formStep === 'details' ? 'text-[#d6b66d]' : 'text-gray-400'}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${formStep === 'details' ? 'bg-[#d6b66d] text-white' : 'bg-gray-800'}`}>
                    1
                  </div>
                  <span className="ml-2 text-sm font-medium">{t('orderForm.contactInfo')}</span>
                </div>
                <div className="h-0.5 w-12 bg-gray-700 mx-2"></div>
                <div className={`flex items-center ${formStep === 'delivery' ? 'text-[#d6b66d]' : 'text-gray-400'}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${formStep === 'delivery' ? 'bg-[#d6b66d] text-white' : 'bg-gray-800'}`}>
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium">{t('orderForm.deliveryInfo')}</span>
                </div>
                <div className="h-0.5 w-12 bg-gray-700 mx-2"></div>
                <div className={`flex items-center ${formStep === 'payment' ? 'text-[#d6b66d]' : 'text-gray-400'}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${formStep === 'payment' ? 'bg-[#d6b66d] text-white' : 'bg-gray-800'}`}>
                    3
                  </div>
                  <span className="ml-2 text-sm font-medium">{t('orderForm.finalSummary')}</span>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="p-6">
              <div className="bg-gray-900 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-white mb-3">{t('orders.orderDetails')}</h4>
                <div className="space-y-3">
                  {cartItems.map((item: CartItem, index: number) => {
                    const itemPrice = calculateItemPrice(item);
                    const displayItemPrice = formatPrice(itemPrice);
                    return (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                        <div>
                          <div className="font-medium text-white">{item.name}</div>
                          <div className="text-sm text-gray-400">
                            {item.quantity} × 
                            {item.longueur ? ` ${item.longueur}m` : ''}
                            {item.metre_price ? ` (${formatPrice(item.metre_price)} DA/m)` : ''}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-white">{displayItemPrice} DA</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Form Steps */}
              <form onSubmit={handleOrderSubmit}>
                {formStep === 'details' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">{t('orderForm.contactInfo')}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-400">
                          <User className="inline h-4 w-4 mr-2" />
                          {t('orderForm.fullName')} *
                        </label>
                        <input
                          type="text"
                          value={userData.name}
                          onChange={(e) => setUserData({...userData, name: e.target.value})}
                          className="w-full border border-gray-700 rounded-lg p-3 text-white bg-black focus:ring-2 focus:ring-[#d6b66d] focus:border-transparent"
                          required
                          placeholder={t('orderForm.fullName')}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-400">
                          <Phone className="inline h-4 w-4 mr-2" />
                          {t('orderForm.phone')} *
                        </label>
                        <input
                          type="tel"
                          value={userData.phone}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setUserData({...userData, phone: value});
                          }}
                          className="w-full border border-gray-700 rounded-lg p-3 text-white bg-black focus:ring-2 focus:ring-[#d6b66d] focus:border-transparent"
                          required
                          pattern="[0-9]{10}"
                          placeholder="05 XX XX XX XX"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-400">
                        <Mail className="inline h-4 w-4 mr-2" />
                        {t('orderForm.emailOptional')}
                      </label>
                      <input
                        type="email"
                        value={userData.email}
                        onChange={(e) => setUserData({...userData, email: e.target.value})}
                        className="w-full border border-gray-700 rounded-lg p-3 text-white bg-black focus:ring-2 focus:ring-[#d6b66d] focus:border-transparent"
                        placeholder={t('orderForm.emailOptional')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-400">
                        <MapPin className="inline h-4 w-4 mr-2" />
                        {t('orderForm.deliveryAddress')}
                      </label>
                      <textarea
                        value={userData.address}
                        onChange={(e) => setUserData({...userData, address: e.target.value})}
                        className="w-full border border-gray-700 rounded-lg p-3 text-white bg-black focus:ring-2 focus:ring-[#d6b66d] focus:border-transparent"
                        rows={3}
                        placeholder={t('orderForm.addressPlaceholder')}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        className="bg-[#d6b66d] hover:bg-[#c9a95d] text-white"
                        onClick={() => setFormStep('delivery')}
                        disabled={!userData.name.trim() || !userData.phone.trim()}
                      >
                        {t('common.next')}
                      </Button>
                    </div>
                  </div>
                )}
                
                {formStep === 'delivery' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">{t('orderForm.deliveryInfo')}</h3>
                    
                    <div className="bg-gray-900 rounded-xl p-4 border border-blue-900">
                      <div className="flex items-center gap-3">
                        <Truck className="h-6 w-6 text-blue-500" />
                        <div>
                          <div className="font-semibold text-gray-400">{t('orderForm.selectedWilaya')}</div>
                          <div className="text-2xl font-bold text-white mt-1">{selectedWilaya}</div>
                          <div className="text-sm text-gray-400 mt-1">
                            {t('cart.deliveryPrice')}: {deliveryPrice > 0 ? `${formatPrice(deliveryPrice)} DA` : t('cart.free')}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-400">
                        {t('orderForm.changeWilaya')}
                      </label>
                      <select
                        value={selectedWilaya}
                        onChange={(e) => setSelectedWilaya(e.target.value)}
                        className="w-full border border-gray-700 rounded-lg p-3 text-white bg-black focus:ring-2 focus:ring-[#d6b66d] focus:border-transparent"
                      >
                        <option value="">{t('orderForm.changeWilaya')}</option>
                        {wilayas.map((wilaya) => (
                          <option key={wilaya.id} value={wilaya.name}>
                            {wilaya.name} - {formatPrice(wilaya.delivery_price)} DA
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormStep('details')}
                        className="border-gray-700 text-gray-400 hover:text-white"
                      >
                        {t('common.back')}
                      </Button>
                      <Button
                        type="button"
                        className="bg-[#d6b66d] hover:bg-[#c9a95d] text-white"
                        onClick={() => setFormStep('payment')}
                        disabled={!selectedWilaya}
                      >
                        {t('common.next')}
                      </Button>
                    </div>
                  </div>
                )}
                
                {formStep === 'payment' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">{t('orderForm.finalSummary')}</h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                        <span className="text-gray-400">{t('orderForm.products')}</span>
                        <span className="font-medium text-white">{displayProductTotal} DA</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                        <span className="text-gray-400">{t('cart.delivery')} ({selectedWilaya})</span>
                        <span className="font-medium text-white">{deliveryPrice > 0 ? `${formatPrice(deliveryPrice)} DA` : t('cart.free')}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3">
                        <span className="text-xl font-bold text-white">{t('cart.total')}</span>
                        <span className="text-3xl font-bold text-[#d6b66d]">{displayTotal} DA</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-900 rounded-xl p-4 border border-green-900">
                      <h4 className="font-semibold text-white mb-2">{t('orderForm.paymentMethod')}</h4>
                      <p className="text-sm text-gray-400">
                        {t('orderForm.paymentDescription')}
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        {t('orderForm.paymentNote')}
                      </p>
                    </div>
                    
                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormStep('delivery')}
                        className="border-gray-700 text-gray-400 hover:text-white"
                      >
                        {t('common.back')}
                      </Button>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <FaSpinner className="mr-2 h-5 w-5 animate-spin inline" />
                            {t('orderForm.processing')}
                          </>
                        ) : (
                          `${t('orderForm.confirmOrder')} (${displayTotal} DA)`
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
              
              {/* Contact Info */}
              <div className="mt-8 pt-6 border-t border-gray-800">
                <p className="text-sm text-gray-500 text-center">
                  {t('footer.contact')} 
                  <a href="tel:+213541779717" className="text-[#d6b66d] font-medium ml-1">+213 541 77 97 17</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};