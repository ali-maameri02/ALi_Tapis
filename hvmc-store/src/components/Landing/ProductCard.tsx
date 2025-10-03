import { ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/Cartcontext";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useState } from "react";
import { submitOrder } from '@/api/serviceOrders';
import { FaSpinner } from 'react-icons/fa';

type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
  description?: string;
  is_available?: boolean;
  created_at?: string;
  category?: string;
};

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    phone: '',
    wilaya: '',
    address: ''
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product) return;
    
    addToCart({
      id: product.id.toString(),
      name: product.name,
      price: `${product.price} DA`,
      image: product.image,
      quantity: quantity
    });
    
    toast.success(t('cart.added'), {
      description: t('cart.addedDescription'),
      action: {
        label: t('cart.viewCart'),
        onClick: () => navigate('/cart')
      },
      style: {
        background: '#4BB543',
        color: 'white',
        width:'20rem',
        height:'20rem'
      }
    });
  };

  const handleOrderNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    const storedUserData = localStorage.getItem("userData");
    if (!storedUserData || !JSON.parse(storedUserData).name) {
      setShowOrderForm(true);
      return;
    }
    proceedWithOrder();
  };

  const proceedWithOrder = async () => {
    if (!product) return;
    setIsSubmitting(true);
    
    try {
      await submitOrder({
        productname: product.name,
        id: product.id.toString(),
        price: product.price,
        quantity: quantity,
        wilaya: userData.wilaya
      });
      showProductSuccessAlert();
    } catch (error) {
      toast.error(t('errors.orderFailed'), {
        description: t('errors.orderFailedDescription'),
        style: {
          background: '#FF3333',
          color: 'white'
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const showProductSuccessAlert = () => {
    toast.custom(() => (
      <div className="bg-white rounded-lg shadow-xl p-4 border border-green-300 max-w-md">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">{t('order.successTitle')}</h3>
            <div className="mt-2 text-sm text-gray-500">
              <p>{t('order.successMessage', { product: product?.name })}</p>
              <p className="mt-1">{t('order.successContact')}</p>
            </div>
          </div>
        </div>
      </div>
    ), {
      duration: 3000
    });
  };

  const handleUserDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData.name || !userData.phone || !userData.wilaya) {
      toast.error(t('errors.missingFields'), {
        description: t('errors.missingFieldsDescription'),
        style: {
          background: '#FF3333',
          color: 'white'
        }
      });
      return;
    }
    
    localStorage.setItem("userData", JSON.stringify(userData));
    setShowOrderForm(false);
    await proceedWithOrder();
  };

  return (
    <>
      <Card 
        className="hover:shadow-lg transition-all duration-300 shadow-none border-0 pb-3 group cursor-pointer pt-0 w-full h-full flex flex-col max-w-[180px] mx-auto"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <CardContent className="p-0 flex flex-col h-full pb-3">
          {/* Image Section - Optimized for small cards */}
          <div className="aspect-[5/4] overflow-hidden rounded-t-lg bg-gray-100 relative">
            <img 
              src={product.image} 
              alt={`${product.name} - ${product.category}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {/* Quick quantity selector for mobile */}
            <div className="absolute bottom-1 right-1 sm:hidden bg-white/90 rounded-full flex items-center px-1 py-0.5 shadow-sm text-xs">
              <button 
                className="px-0.5 font-bold text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuantity(q => Math.max(1, q - 1));
                }}
              >
                -
              </button>
              <span className="mx-0.5 text-xs min-w-[16px] text-center">{quantity}</span>
              <button 
                className="px-0.5 font-bold text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuantity(q => q + 1);
                }}
              >
                +
              </button>
            </div>
          </div>
          
          {/* Content Section - Compact layout */}
          <div className="p-2 flex flex-col flex-grow">
            <div className="flex-grow">
              <h3 className="font-semibold text-xs line-clamp-2 leading-tight mb-1">{product.name}</h3>
              <p className="text-[10px] text-gray-500 mb-1">{product.category}</p>
              <p className="font-bold text-primary text-xs">{product.price} DA</p>
            </div>
            
            {/* Quantity Selector - Desktop */}
            <div className="mt-1 hidden sm:flex items-center gap-1">
              <div className="flex items-center border rounded-md overflow-hidden text-xs">
                <Button 
                  variant="ghost" 
                  className="h-6 w-6 p-0 text-xs min-w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuantity(q => Math.max(1, q - 1));
                  }}
                >
                  -
                </Button>
                <span className="w-6 text-center text-xs">{quantity}</span>
                <Button 
                  variant="ghost" 
                  className="h-6 w-6 p-0 text-xs min-w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuantity(q => q + 1);
                  }}
                >
                  +
                </Button>
              </div>
            </div>
            
            {/* Buttons - Compact */}
            <div className="mt-2 flex flex-col gap-1">
              <Button 
                variant="outline" 
                className="gap-1 text-white bg-black hover:bg-[#d6b66d] hover:text-black cursor-pointer text-xs h-7"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-3 w-3" />
                {t('product.addToCart')}
              </Button>
              
              <Button 
                className="gap-1 bg-[#d6b66d] hover:bg-[#c9a95d] text-black text-xs h-7"
                onClick={handleOrderNow}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="h-3 w-3 animate-spin" />
                    {t('order.submitting')}
                  </>
                ) : (
                  t('product.orderNow')
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Form */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900">{t('orderForm.title')}</h2>
            <p className="mb-4 text-gray-600">{t('orderForm.description')}</p>
            
            <form onSubmit={handleUserDataSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                    {t('orderForm.name')} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={userData.name}
                    onChange={(e) => setUserData({...userData, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900 bg-white"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label htmlFor="wilaya" className="block text-sm font-medium text-gray-900">
                    {t('orderForm.wilaya')} *
                  </label>
                  <select
                    id="wilaya"
                    value={userData.wilaya || ''}
                    onChange={(e) => setUserData({...userData, wilaya: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900 bg-white"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">{t('orderForm.selectWilaya')}</option>
                    <option value="Adrar">Adrar</option>
                    <option value="Chlef">Chlef</option>
                    <option value="Laghouat">Laghouat</option>
                    <option value="Oum El Bouaghi">Oum El Bouaghi</option>
                    <option value="Batna">Batna</option>
                    <option value="Béjaïa">Béjaïa</option>
                    <option value="Biskra">Biskra</option>
                    <option value="Béchar">Béchar</option>
                    <option value="Blida">Blida</option>
                    <option value="Bouira">Bouira</option>
                    <option value="Tamanrasset">Tamanrasset</option>
                    <option value="Tébessa">Tébessa</option>
                    <option value="Tlemcen">Tlemcen</option>
                    <option value="Tiaret">Tiaret</option>
                    <option value="Tizi Ouzou">Tizi Ouzou</option>
                    <option value="Alger">Alger</option>
                    <option value="Djelfa">Djelfa</option>
                    <option value="Jijel">Jijel</option>
                    <option value="Sétif">Sétif</option>
                    <option value="Saïda">Saïda</option>
                    <option value="Skikda">Skikda</option>
                    <option value="Sidi Bel Abbès">Sidi Bel Abbès</option>
                    <option value="Annaba">Annaba</option>
                    <option value="Guelma">Guelma</option>
                    <option value="Constantine">Constantine</option>
                    <option value="Médéa">Médéa</option>
                    <option value="Mostaganem">Mostaganem</option>
                    <option value="M'Sila">M'Sila</option>
                    <option value="Mascara">Mascara</option>
                    <option value="Ouargla">Ouargla</option>
                    <option value="Oran">Oran</option>
                    <option value="El Bayadh">El Bayadh</option>
                    <option value="Illizi">Illizi</option>
                    <option value="Bordj Bou Arréridj">Bordj Bou Arréridj</option>
                    <option value="Boumerdès">Boumerdès</option>
                    <option value="El Tarf">El Tarf</option>
                    <option value="Tindouf">Tindouf</option>
                    <option value="Tissemsilt">Tissemsilt</option>
                    <option value="El Oued">El Oued</option>
                    <option value="Khenchela">Khenchela</option>
                    <option value="Souk Ahras">Souk Ahras</option>
                    <option value="Tipaza">Tipaza</option>
                    <option value="Mila">Mila</option>
                    <option value="Aïn Defla">Aïn Defla</option>
                    <option value="Naâma">Naâma</option>
                    <option value="Aïn Témouchent">Aïn Témouchent</option>
                    <option value="Ghardaïa">Ghardaïa</option>
                    <option value="Relizane">Relizane</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
                    {t('orderForm.phone')} *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={userData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setUserData({...userData, phone: value});
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900 bg-white"
                    required
                    disabled={isSubmitting}
                    pattern="[0-9]{10}"
                    title="Please enter a 10-digit phone number"
                    inputMode="numeric"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-900">
                    {t('orderForm.address')}
                  </label>
                  <textarea
                    id="address"
                    value={userData.address || ''}
                    onChange={(e) => setUserData({...userData, address: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900 bg-white"
                    rows={2}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="text-gray-900 border-gray-300 hover:bg-gray-100 text-sm sm:text-base"
                  onClick={() => setShowOrderForm(false)}
                  disabled={isSubmitting}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  className="bg-[#d6b66d] hover:bg-[#c9a95d] text-gray-900 text-sm sm:text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                      {t('order.submitting')}
                    </>
                  ) : (
                    t('orderForm.submitOrder')
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};