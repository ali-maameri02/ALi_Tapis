import { Button } from "../ui/button";
import { useCart } from '../context/Cartcontext';
import { Link } from 'react-router-dom';
import { TrashIcon } from "lucide-react";
import { submitOrder } from '@/api/serviceOrders';
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';

interface UserData {
  name: string;
  email: string;
  phone: string;
  wilaya?: string;
  address?: string;
}

export const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartCount, clearCart } = useCart();
  const { t } = useTranslation();
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    phone: '',
    wilaya: '',
    address: ''
  });

  const total = cartItems.reduce(
    (sum, item) => sum + (parseFloat(item.price.replace(',', '.'))) * item.quantity,
    0
  ).toFixed(2).replace('.', ',');

  const showSuccessAlert = () => {
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
              <p>{t('order.successMessage')}</p>
              <p className="mt-1">{t('order.successContact')}</p>
            </div>
          </div>
        </div>
      </div>
    ), {
      duration: 3000
    });
  };

  const handleOrderAll = async () => {
    if (cartItems.length === 0) {
      toast.warning(t('cart.emptyWarning'));
      return;
    }

    const storedUserData = localStorage.getItem("userData");
    if (!storedUserData || !JSON.parse(storedUserData).name) {
      setShowOrderForm(true);
      return;
    }
    
    await proceedWithOrder();
  };

  const proceedWithOrder = async () => {
    setIsSubmitting(true);
    const orderItems = cartItems.map(item => ({
      productname: item.name,
      id: item.id,
      price: item.price.replace(' DA', ''),
      quantity: item.quantity,
      wilaya: userData.wilaya,
      image: item.image, // This is the selected image from the product details
      color: item.color || '' // Include color if available
    }));

    try {
      await submitOrder(orderItems);
      clearCart();
      showSuccessAlert();
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
    <div className="container mx-auto px-4 py-8 mt-24">
      <h1 className="text-3xl font-bold mb-8">{t('cart.title')}</h1>
      
      {cartCount === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">{t('cart.empty')}</h2>
          <p className="text-gray-500 mb-6">{t('cart.emptyDescription')}</p>
          <Button asChild>
            <Link to="/">{t('cart.viewProducts')}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex gap-4 border-b pb-4">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  {item.color && (
                    <p className="text-sm text-gray-600">Color: {item.color}</p>
                  )}
                  <p className="text-white font-bold">{item.price}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-black"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </Button>
                    <span>{item.quantity}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="text-black"
                    >
                      +
                    </Button>
                  </div>
                </div>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => removeFromCart(item.id)}
                  className="bg-white text-black cursor-pointer hover:text-white hover:bg-[#d6b66d]"
                >
                  {t('cart.remove')} <TrashIcon className="ml-1 h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="border p-6 rounded-lg h-fit">
            <h3 className="text-xl font-semibold mb-4">{t('cart.summary')}</h3>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span>{t('cart.subtotal')}</span>
                <span>{total} DA</span>
              </div>
              <div className="flex justify-between">
                <span>{t('cart.shipping')}</span>
                <span>{t('cart.free')}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>{t('cart.total')}</span>
                <span>{total} DA</span>
              </div>
            </div>
            <Button 
              className="w-full mb-4 bg-[#d6b66d] hover:bg-[#c9a95d] text-black"
              onClick={handleOrderAll}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                  {t('order.submitting')}
                </>
              ) : (
                t('cart.orderAll')
              )}
            </Button>
          </div>
        </div>
      )}

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
    </div>
  );
};