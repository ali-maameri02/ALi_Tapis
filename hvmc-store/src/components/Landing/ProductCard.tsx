import { ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/Cartcontext";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { submitOrder, getDeliveryPrice, getDeliveryWilayas } from '@/api/serviceOrders';
import { FaSpinner } from 'react-icons/fa';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Truck, 
  X,
  MessageSquare,
  Ruler 
} from 'lucide-react';

type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
  description?: string;
  is_available?: boolean;
  created_at?: string;
  category?: string;
  metre_price?: string;
  poids?: string;
};

interface ProductCardProps {
  product: Product;
}

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

interface OrderItem {
  productname: string;
  id: string;
  price: number;
  quantity: number;
  image: string;
  color?: string;
  longueur?: number;
  metre_price?: string;
  unit_price?: number;
  metre_price_value?: string;
  wilaya: string;
  address?: string;
  delivery_price: number;
  total_price: number;
  calculation: string;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [quantity, setQuantity] = useState(1);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    phone: '',
    wilaya: '',
    address: ''
  });
  
  const [selectedWilaya, setSelectedWilaya] = useState<string>('');
  const [deliveryPrice, setDeliveryPrice] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [wilayas, setWilayas] = useState<WilayaDelivery[]>([]);
  const [longueur, setLongueur] = useState<string>('');
  const [formStep, setFormStep] = useState<'contact' | 'delivery' | 'summary'>('contact');

  // CORRIGÉ: Toujours parser en number
  const metrePrice = parseFloat(product.metre_price || "0");
  const standardPrice = parseFloat(product.price || "0");
  
  // CORRIGÉ: Vérifier si c'est un produit au mètre
  const hasMetrePrice = !isNaN(metrePrice) && metrePrice > 0;

  // CORRIGÉ: Calcul cohérent du prix du produit
  const calculateProductPrice = (): number => {
    if (hasMetrePrice && longueur && parseFloat(longueur) > 0) {
      return metrePrice * parseFloat(longueur) * quantity;
    } else if (hasMetrePrice) {
      // Pas encore de longueur, retourner 0
      return 0;
    } else {
      // Produit régulier
      return standardPrice * quantity;
    }
  };

  // CORRIGÉ: Calcul du total
  const calculateTotalPrice = (): number => {
    const productPrice = calculateProductPrice();
    return productPrice + deliveryPrice;
  };

  // Load user data and wilayas
  useEffect(() => {
    const loadData = async () => {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
        if (parsedData.wilaya) {
          setSelectedWilaya(parsedData.wilaya);
        }
      }

      try {
        const wilayaData = await getDeliveryWilayas();
        setWilayas(wilayaData);
      } catch (err) {
        console.error('Error loading wilayas:', err);
      }
    };

    if (showOrderForm) {
      loadData();
    }
  }, [showOrderForm]);

  // Fetch delivery price when wilaya changes
  useEffect(() => {
    const fetchPrice = async () => {
      if (selectedWilaya) {
        try {
          const price = await getDeliveryPrice(selectedWilaya);
          setDeliveryPrice(price);
        } catch (error) {
          console.error('Error fetching delivery price:', error);
          setDeliveryPrice(0);
        }
      } else {
        setDeliveryPrice(0);
      }
    };

    fetchPrice();
  }, [selectedWilaya]);

  // Update total price whenever longueur, quantity, or deliveryPrice changes
  useEffect(() => {
    setTotalPrice(calculateTotalPrice());
  }, [longueur, quantity, deliveryPrice]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product) return;
    
    // Require length for metre-priced products
    if (hasMetrePrice && (!longueur || parseFloat(longueur) <= 0)) {
      toast.error(t('product.lengthRequired'), {
        description: t('product.meterRequired'),
        style: {
          background: '#FF3333',
          color: 'white',
          borderRadius: '12px'
        }
      });
      return;
    }
    
    // CORRIGÉ: Calcul du prix à afficher
    const displayPrice = calculateProductPrice();
    
    // CORRIGÉ: Ajouter au panier avec les bonnes données
    addToCart({
      id: product.id.toString(),
      name: product.name,
      // Si c'est un produit au mètre, on stocke le prix au mètre
      // Sinon, on stocke le prix unitaire
      price: hasMetrePrice ? metrePrice.toString() : standardPrice.toString(),
      image: product.image,
      quantity: quantity,
      longueur: longueur || undefined,
      metre_price: hasMetrePrice ? metrePrice.toString() : undefined,
      poids: product.poids || undefined,
      // Stocker aussi le prix standard pour référence
      // standard_price: standardPrice.toString(),
    });
    
    toast.success(t('cart.added'), {
      description: `${product.name} - ${displayPrice.toFixed(2)} DA`,
      action: {
        label: t('cart.viewCart'),
        onClick: () => navigate('/cart')
      },
      style: {
        background: '#4BB543',
        color: 'white',
        width: '20rem',
        height: 'auto'
      }
    });
  };

  const handleOrderNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOrderForm(true);
  };

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
            <h3 className="text-xl font-bold text-white">{t('order.orderConfirmed')}</h3>
            <div className="mt-2 text-sm text-gray-600">
              <p className="font-medium">{t('order.successMessage', { product: product?.name })}</p>
              <p className="mt-1">{t('order.teamContact')}</p>
            </div>
            <div className="flex gap-3 mt-4">
              <a 
                href="https://wa.me/213541779717" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-center font-medium"
              >
                <MessageSquare className="inline h-4 w-4 mr-2" />
                {t('order.whatsApp')}
              </a>
              <a
                href="tel:+213541779717"
                className="flex-1 bg-[#d6b66d] text-white px-4 py-2 rounded-lg hover:bg-[#c9a95d] transition-colors text-center font-medium"
              >
                <Phone className="inline h-4 w-4 mr-2" />
                {t('order.call')}
              </a>
            </div>
          </div>
        </div>
      </div>
    ), { duration: 10000 });
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product) return;
    
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
    
    // Require length for metre-priced products
    if (hasMetrePrice && (!longueur || parseFloat(longueur) <= 0)) {
      toast.error(t('product.lengthRequired'), {
        description: t('product.meterRequired'),
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
        description: t('errors.deliveryRequiredDescription'),
        style: {
          background: '#FF3333',
          color: 'white',
          borderRadius: '12px'
        }
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // CORRIGÉ: Calcul cohérent du prix
    const productPrice = calculateProductPrice();
    const finalTotal = productPrice + deliveryPrice;
    
    // CORRIGÉ: Construire l'OrderItem correctement
    const orderItem: OrderItem = {
      productname: product.name,
      id: product.id.toString(),
      price: productPrice, // Prix total du produit (déjà calculé avec longueur si applicable)
      quantity: quantity,
      image: product.image,
      longueur: longueur ? parseFloat(longueur) : undefined,
      metre_price: hasMetrePrice ? metrePrice.toString() : undefined,
      unit_price: hasMetrePrice ? metrePrice : standardPrice, // Prix unitaire (mètre ou pièce)
      metre_price_value: hasMetrePrice ? metrePrice.toString() : undefined,
      wilaya: selectedWilaya,
      address: userData.address,
      delivery_price: deliveryPrice,
      total_price: finalTotal,
      // CORRIGÉ: Formule de calcul correcte
      calculation: hasMetrePrice 
        ? `${metrePrice.toFixed(2)} × ${longueur} × ${quantity} = ${productPrice.toFixed(2)}`
        : `${standardPrice.toFixed(2)} × ${quantity} = ${productPrice.toFixed(2)}`
    };
    
    try {
      // Sauvegarder les données utilisateur
      const userDataToSave = {
        ...userData,
        wilaya: selectedWilaya
      };
      localStorage.setItem("userData", JSON.stringify(userDataToSave));
      
      // CORRIGÉ: Envoyer la commande avec le bon OrderItem
      await submitOrder(orderItem);
      
      showSuccessNotification();
      setShowOrderForm(false);
      setFormStep('contact');
      
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

  const currentProductPrice = calculateProductPrice();

  return (
    <>
      <Card 
        className="hover:shadow-lg transition-all duration-300 shadow-none border-0 pb-3 group cursor-pointer pt-0 w-full h-full flex flex-col max-w-[180px] mx-auto"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <CardContent className="p-0 flex flex-col h-full pb-3">
          {/* Image Section */}
          <div className="aspect-[5/4] overflow-hidden rounded-t-lg bg-gray-100 relative">
            <img 
              src={product.image} 
              alt={`${product.name} - ${product.category}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
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
          
          <div className="p-2 flex flex-col flex-grow">
            <div className="flex-grow">
              <h3 className="font-semibold text-xs line-clamp-2 leading-tight mb-1">{product.name}</h3>
              <p className="text-[10px] text-gray-500 mb-1">{product.category}</p>
              
              <div className="mb-1">
                {/* CORRIGÉ: Afficher clairement les deux types de prix */}
                {hasMetrePrice ? (
                  <>
                    <p className="font-bold text-primary text-xs">
                      {metrePrice.toFixed(2)} DA/m
                    </p>
                    <p className="text-[9px] text-gray-500 mt-0.5">
                      {t('product.pricePerMeter')}
                    </p>
                    {/* Montrer le prix standard comme référence */}
                    {standardPrice > 0 && !isNaN(standardPrice) && (
                      <p className="text-[8px] text-gray-400 mt-0.5">
                        ({t('product.reference')}: {standardPrice.toFixed(2)} DA)
                      </p>
                    )}
                  </>
                ) : (
                  <p className="font-bold text-primary text-xs">
                    {standardPrice.toFixed(2)} DA
                  </p>
                )}
              </div>
            </div>
            
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
            
            <div className="mt-2 flex flex-col gap-1">
              <Button 
                variant="outline" 
                className="gap-1 text-white bg-black hover:bg-[#d6b66d] hover:text-black cursor-pointer text-xs h-7"
                onClick={handleAddToCart}
                disabled={hasMetrePrice && (!longueur || parseFloat(longueur) <= 0)}
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

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-black rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="sticky top-0 bg-black border-b border-gray-200 rounded-t-3xl p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">{t('orderForm.finalizeOrder')}</h2>
                  <p className="text-gray-600 mt-1">{t('orderForm.provideInfo')}</p>
                </div>
                <button
                  onClick={() => {
                    setShowOrderForm(false);
                    setFormStep('contact');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              {/* Progress Steps */}
              <div className="flex items-center justify-center mt-8">
                <div className={`flex items-center ${formStep === 'contact' ? 'text-[#d6b66d]' : 'text-gray-400'}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${formStep === 'contact' ? 'bg-[#d6b66d] text-white' : 'bg-gray-200'}`}>
                    1
                  </div>
                  <span className="ml-2 text-sm font-medium">{t('orderForm.contactInfo')}</span>
                </div>
                <div className="h-0.5 w-8 bg-gray-300 mx-1"></div>
                <div className={`flex items-center ${formStep === 'delivery' ? 'text-[#d6b66d]' : 'text-gray-400'}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${formStep === 'delivery' ? 'bg-[#d6b66d] text-white' : 'bg-gray-200'}`}>
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium">{t('orderForm.deliveryInfo')}</span>
                </div>
                <div className="h-0.5 w-8 bg-gray-300 mx-1"></div>
                <div className={`flex items-center ${formStep === 'summary' ? 'text-[#d6b66d]' : 'text-gray-400'}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${formStep === 'summary' ? 'bg-[#d6b66d] text-white' : 'bg-gray-200'}`}>
                    3
                  </div>
                  <span className="ml-2 text-sm font-medium">{t('orderForm.finalSummary')}</span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Product Info */}
              <div className="bg-black rounded-xl p-4 mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-white">{product.name}</h4>
                    <p className="text-sm text-gray-600">{t('product.quantity')}: {quantity}</p>
                    
                    {/* CORRIGÉ: Afficher clairement les prix */}
                    <div className="mt-2 space-y-1">
                      {hasMetrePrice ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-blue-400 font-medium">Prix au mètre:</span>
                            <span className="text-lg font-bold text-white">{metrePrice.toFixed(2)} DA/m</span>
                          </div>
                          {standardPrice > 0 && !isNaN(standardPrice) && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-400">Prix standard (référence):</span>
                              <span className="text-sm font-medium text-gray-300">{standardPrice.toFixed(2)} DA</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-blue-400 font-medium">Prix unitaire:</span>
                          <span className="text-lg font-bold text-white">{standardPrice.toFixed(2)} DA</span>
                        </div>
                      )}
                    </div>
                    
                    {/* CORRIGÉ: Champ longueur obligatoire pour produits au mètre */}
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-white mb-1">
                        {t('product.length')} 
                        {hasMetrePrice && <span className="text-red-500">*</span>}
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            value={longueur}
                            onChange={(e) => {
                              const value = e.target.value;
                              setLongueur(value);
                              // Recalculer automatiquement
                              setTotalPrice(calculateTotalPrice());
                            }}
                            placeholder={t('product.enterLengthPlaceholder')}
                            className="w-full border border-gray-300 rounded-lg p-2 pl-9 text-white bg-black focus:ring-2 focus:ring-[#d6b66d] focus:border-transparent transition-colors"
                            min="0.1"
                            step="0.1"
                            required={hasMetrePrice}
                          />
                          <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-500 whitespace-nowrap">mètres</span>
                      </div>
                      
                      {/* CORRIGÉ: Affichage détaillé du calcul */}
                      {hasMetrePrice && (
                        <div className="mt-2 p-2 bg-black/50 rounded-lg">
                          <p className="text-xs font-medium text-green-500 mb-1">Calcul détaillé:</p>
                          <div className="text-xs text-green-400 space-y-1">
                            <div>Prix au mètre: {metrePrice.toFixed(2)} DA</div>
                            {longueur && parseFloat(longueur) > 0 && (
                              <>
                                <div>Longueur: {longueur} m</div>
                                <div>Quantité: {quantity}</div>
                                <div className="pt-1 border-t border-green-800">
                                  <span className="font-bold">Total produit:</span> 
                                  {metrePrice.toFixed(2)} × {longueur} × {quantity} = <strong>{currentProductPrice.toFixed(2)} DA</strong>
                                </div>
                              </>
                            )}
                            {(!longueur || parseFloat(longueur) <= 0) && (
                              <div className="text-red-400">
                                ⚠️ Veuillez entrer la longueur pour calculer le prix
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Pour produits réguliers */}
                      {!hasMetrePrice && (
                        <div className="mt-2 p-2 bg-black/50 rounded-lg">
                          <p className="text-xs font-medium text-green-500 mb-1">Calcul détaillé:</p>
                          <div className="text-xs text-green-400">
                            <span className="font-bold">Total produit:</span> 
                            {standardPrice.toFixed(2)} × {quantity} = <strong>{currentProductPrice.toFixed(2)} DA</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {/* CORRIGÉ: Prix du produit calculé */}
                    <div className="text-2xl font-bold text-white">{currentProductPrice.toFixed(2)} DA</div>
                    
                    {/* CORRIGÉ: Formule de calcul */}
                    {hasMetrePrice && longueur && parseFloat(longueur) > 0 && (
                      <div className="text-xs text-green-600 mt-2 bg-black/50 p-2 rounded">
                        <div className="font-medium">Formule:</div>
                        <div>{metrePrice.toFixed(2)} DA/m × {longueur}m × {quantity}</div>
                        <div className="text-xs mt-1 text-green-400">
                          = {currentProductPrice.toFixed(2)} DA
                        </div>
                      </div>
                    )}
                    {hasMetrePrice && (!longueur || parseFloat(longueur) <= 0) && (
                      <div className="text-xs text-red-500 mt-2 bg-black/50 p-2 rounded">
                        <div className="font-medium">Formule:</div>
                        <div>{metrePrice.toFixed(2)} DA/m × [longueur]m × {quantity}</div>
                        <div className="text-xs mt-1">⚠️ Entrez la longueur</div>
                      </div>
                    )}
                    {!hasMetrePrice && (
                      <div className="text-xs text-gray-600 mt-2 bg-black/50 p-2 rounded">
                        <div className="font-medium">Formule:</div>
                        <div>{standardPrice.toFixed(2)} DA × {quantity}</div>
                        <div className="text-xs mt-1 text-green-400">
                          = {currentProductPrice.toFixed(2)} DA
                        </div>
                      </div>
                    )}
                    
                    {/* Labels de prix */}
                    {hasMetrePrice && (
                      <div className="mt-2">
                        <div className="text-xs text-blue-400 font-medium">
                          Prix/m: {metrePrice.toFixed(2)} DA
                        </div>
                        {standardPrice > 0 && !isNaN(standardPrice) && (
                          <div className="text-xs text-gray-400 mt-1">
                            Prix réf: {standardPrice.toFixed(2)} DA
                          </div>
                        )}
                      </div>
                    )}
                    {!hasMetrePrice && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-400 font-medium">
                          Prix unitaire: {standardPrice.toFixed(2)} DA
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleOrderSubmit}>
                {formStep === 'contact' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">{t('orderForm.contactInfo')}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white">
                          <User className="inline h-4 w-4 mr-2" />
                          {t('orderForm.fullName')} *
                        </label>
                        <input
                          type="text"
                          value={userData.name}
                          onChange={(e) => setUserData({...userData, name: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg p-3 text-white bg-black focus:ring-2 focus:ring-[#d6b66d] focus:border-transparent"
                          required
                          placeholder={t('auth.signup.namePlaceholder')}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white">
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
                          className="w-full border border-gray-300 rounded-lg p-3 text-white bg-black focus:ring-2 focus:ring-[#d6b66d] focus:border-transparent"
                          required
                          pattern="[0-9]{10}"
                          placeholder={t('auth.signup.phonePlaceholder')}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white">
                        <Mail className="inline h-4 w-4 mr-2" />
                        {t('orderForm.emailOptional')}
                      </label>
                      <input
                        type="email"
                        value={userData.email}
                        onChange={(e) => setUserData({...userData, email: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg p-3 text-white bg-black focus:ring-2 focus:ring-[#d6b66d] focus:border-transparent"
                        placeholder={t('auth.signup.emailPlaceholder')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white">
                        <MapPin className="inline h-4 w-4 mr-2" />
                        {t('orderForm.deliveryAddress')}
                      </label>
                      <textarea
                        value={userData.address}
                        onChange={(e) => setUserData({...userData, address: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg p-3 text-white bg-black focus:ring-2 focus:ring-[#d6b66d] focus:border-transparent"
                        rows={3}
                        placeholder={t('auth.signup.addressPlaceholder')}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        className="bg-[#d6b66d] hover:bg-[#c9a95d] text-white"
                        onClick={() => setFormStep('delivery')}
                        disabled={!userData.name.trim() || !userData.phone.trim()}
                      >
                        {t('orderForm.next')}
                      </Button>
                    </div>
                  </div>
                )}
                
                {formStep === 'delivery' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">{t('orderForm.deliveryInfo')}</h3>
                    
                    <div className="bg-black rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center gap-3">
                        <Truck className="h-6 w-6 text-blue-600" />
                        <div>
                          <div className="font-semibold text-white">{t('orderForm.selectedWilaya')}</div>
                          <div className="text-2xl font-bold text-white mt-1">{selectedWilaya || t('orderForm.notSelected')}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {t('cart.deliveryPrice')}: {selectedWilaya ? 
                              (deliveryPrice > 0 ? `${deliveryPrice.toFixed(2)} DA` : t('product.freeDelivery')) : 
                              t('orderForm.selectToSeePrice')}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white">
                        {t('orderForm.selectWilaya')}
                      </label>
                      <select
                        value={selectedWilaya}
                        onChange={(e) => setSelectedWilaya(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 text-white bg-black focus:ring-2 focus:ring-[#d6b66d] focus:border-transparent"
                      >
                        <option value="">{t('orderForm.chooseWilaya')}</option>
                        {wilayas.map((wilaya) => (
                          <option key={wilaya.id} value={wilaya.name}>
                            {wilaya.name} - {wilaya.delivery_price} DA
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormStep('contact')}
                      >
                        {t('orderForm.previous')}
                      </Button>
                      <Button
                        type="button"
                        className="bg-[#d6b66d] hover:bg-[#c9a95d] text-white"
                        onClick={() => setFormStep('summary')}
                        disabled={!selectedWilaya || (hasMetrePrice && (!longueur || parseFloat(longueur) <= 0))}
                      >
                        {t('orderForm.next')}
                      </Button>
                    </div>
                  </div>
                )}
                
                {formStep === 'summary' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">{t('orderForm.finalSummary')}</h3>
                    
                    {/* CORRIGÉ: Détails avec calculs cohérents */}
                    <div className="bg-black rounded-xl p-4 border border-gray-200">
                      <h4 className="font-semibold text-white mb-3">Détails de la commande</h4>
                      
                      <div className="space-y-3">
                        {/* Produit */}
                        <div className="flex justify-between items-start border-b pb-3">
                          <div>
                            <div className="text-gray-600">Produit</div>
                            <div className="text-sm text-gray-400">{product.name}</div>
                            <div className="text-sm text-gray-400">Quantité: {quantity}</div>
                            
                            {/* CORRIGÉ: Afficher le bon type de prix */}
                            <div className="mt-2 space-y-1">
                              {hasMetrePrice ? (
                                <>
                                  <div className="text-sm">
                                    <span className="text-blue-400">Prix au mètre:</span>
                                    <span className="ml-2 font-medium">{metrePrice.toFixed(2)} DA/m</span>
                                  </div>
                                  <div className="text-sm">
                                    <span className="text-gray-400">Longueur:</span>
                                    <span className="ml-2 font-medium text-white">{longueur || "0"} m</span>
                                  </div>
                                  <div className="text-sm text-green-500">
                                    Calcul: {metrePrice.toFixed(2)} × {longueur || "0"} × {quantity}
                                  </div>
                                </>
                              ) : (
                                <div className="text-sm">
                                  <span className="text-gray-400">Prix unitaire:</span>
                                  <span className="ml-2 font-medium text-gray-300">{standardPrice.toFixed(2)} DA</span>
                                  <div className="text-sm text-green-500 mt-1">
                                    Calcul: {standardPrice.toFixed(2)} × {quantity}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-white">{currentProductPrice.toFixed(2)} DA</div>
                            {hasMetrePrice && longueur && parseFloat(longueur) > 0 && (
                              <div className="text-xs text-green-500 mt-1">
                                = {metrePrice.toFixed(2)} × {longueur} × {quantity}
                              </div>
                            )}
                            {!hasMetrePrice && (
                              <div className="text-xs text-gray-500 mt-1">
                                = {standardPrice.toFixed(2)} × {quantity}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Livraison */}
                        <div className="flex justify-between items-center border-b pb-3">
                          <div>
                            <div className="text-gray-600">Livraison</div>
                            <div className="text-sm text-gray-400">Wilaya: {selectedWilaya}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{deliveryPrice > 0 ? `${deliveryPrice.toFixed(2)} DA` : 'Gratuite'}</div>
                          </div>
                        </div>
                        
                        {/* TOTAL - CORRIGÉ: Calcul cohérent */}
                        <div className="flex justify-between items-center pt-3">
                          <div>
                            <div className="text-xl font-bold text-white">Total</div>
                            {/* CORRIGÉ: Formule correcte */}
                            {hasMetrePrice && longueur && parseFloat(longueur) > 0 && (
                              <div className="text-sm text-green-500 mt-1">
                                ({metrePrice.toFixed(2)} × {longueur} × {quantity}) + {deliveryPrice.toFixed(2)}
                              </div>
                            )}
                            {!hasMetrePrice && (
                              <div className="text-sm text-gray-500 mt-1">
                                ({standardPrice.toFixed(2)} × {quantity}) + {deliveryPrice.toFixed(2)}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-[#d6b66d]">{totalPrice.toFixed(2)} DA</div>
                            <div className="text-xs text-gray-400">
                              ({currentProductPrice.toFixed(2)} + {deliveryPrice.toFixed(2)})
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* CORRIGÉ: Récapitulatif avec calculs corrects */}

{/* CORRIGÉ: Récapitulatif avec calculs corrects */}
<div className="bg-black rounded-xl p-4 border border-blue-200">
  <h4 className="font-semibold text-white mb-2">Récapitulatif du calcul</h4>
  <div className="text-sm space-y-2">
    {/* PROBLÈME: Vérifier si c'est un produit au mètre ET si longueur est définie */}
    {hasMetrePrice && longueur && parseFloat(longueur) > 0 ? (
      <div className="space-y-1">
        <div className="text-gray-400">Type de prix: <span className="text-white font-medium">Prix au mètre</span></div>
        <div className="text-gray-400">Prix au mètre: <span className="text-white font-medium">{metrePrice.toFixed(2)} DA</span></div>
        <div className="text-gray-400">Longueur: <span className="text-white font-medium">{longueur} m</span></div>
        <div className="text-gray-400">Quantité: <span className="text-white font-medium">{quantity}</span></div>
        <div className="pt-2">
          <div className="text-green-500 font-medium">
            Produit: {metrePrice.toFixed(2)} × {longueur} × {quantity} = {currentProductPrice.toFixed(2)} DA
          </div>
        </div>
        {standardPrice > 0 && !isNaN(standardPrice) && (
          <div className="text-xs text-gray-400 mt-1">
            (Prix standard de référence: {standardPrice.toFixed(2)} DA)
          </div>
        )}
      </div>
    ) : hasMetrePrice && (!longueur || parseFloat(longueur) <= 0) ? (
      <div className="space-y-1 text-red-400">
        <div className="font-medium">⚠️ Calcul impossible</div>
        <div>Type de prix: Prix au mètre</div>
        <div>Prix au mètre: {metrePrice.toFixed(2)} DA</div>
        <div>Longueur: Non spécifiée</div>
        <div className="mt-2">Veuillez entrer une longueur pour calculer le prix</div>
      </div>
    ) : (
      <div className="space-y-1">
        <div className="text-gray-400">Type de prix: <span className="text-white font-medium">Prix unitaire</span></div>
        <div className="text-gray-400">Prix unitaire: <span className="text-white font-medium">{standardPrice.toFixed(2)} DA</span></div>
        <div className="text-gray-400">Quantité: <span className="text-white font-medium">{quantity}</span></div>
        <div className="pt-2">
          <div className="text-green-500 font-medium">
            Produit: {standardPrice.toFixed(2)} × {quantity} = {currentProductPrice.toFixed(2)} DA
          </div>
        </div>
      </div>
    )}
    
    <div className="pt-2 border-t border-gray-700">
      <div className="text-gray-400">Livraison: <span className="text-white font-medium">{deliveryPrice > 0 ? `${deliveryPrice.toFixed(2)} DA` : 'Gratuite'}</span></div>
      <div className="mt-2 text-lg font-bold text-white">
        Total: {currentProductPrice.toFixed(2)} + {deliveryPrice.toFixed(2)} = {totalPrice.toFixed(2)} DA
      </div>
    </div>
  </div>
</div>
                    <div className="bg-black rounded-xl p-4 border border-green-200">
                      <h4 className="font-semibold text-white mb-2">{t('orderForm.paymentMethod')}</h4>
                      <p className="text-sm text-gray-600">
                        💳 {t('orderForm.paymentDescription')}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        {t('orderForm.paymentNote')}
                      </p>
                    </div>
                    
                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormStep('delivery')}
                      >
                        {t('orderForm.previous')}
                      </Button>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8"
                        disabled={isSubmitting || (hasMetrePrice && (!longueur || parseFloat(longueur) <= 0))}
                      >
                        {isSubmitting ? (
                          <>
                            <FaSpinner className="mr-2 h-5 w-5 animate-spin inline" />
                            {t('orderForm.processing')}
                          </>
                        ) : (
                          `${t('orderForm.confirmOrder')} (${totalPrice.toFixed(2)} DA)`
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  {t('footer.contact')} 
                  <a href="tel:+213541779717" className="text-[#d6b66d] font-medium ml-1">+213 541 77 97 17</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};