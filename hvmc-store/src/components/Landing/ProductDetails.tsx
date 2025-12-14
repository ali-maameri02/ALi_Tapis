import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { ShoppingCart, ArrowLeft, MessageSquare, Phone, X, Truck, MapPin, User, Mail, Ruler } from "lucide-react";
import { useCart } from '../context/Cartcontext';
import { fetchProductById, type Product, type ProductImage } from '@/api/serviceProducts';
import { toast } from "sonner";
import { submitOrder, type OrderItem, getDeliveryPrice, getDeliveryWilayas } from '@/api/serviceOrders';
import { useTranslation } from "react-i18next";
import { Footer } from "./Footer";
import { FaSpinner } from 'react-icons/fa';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../../index.css'

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

export const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoomStyle, setZoomStyle] = useState({});
  const [showZoom, setShowZoom] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    phone: '',
    wilaya: '',
    address: ''
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [longueur, setLongueur] = useState<string>('');
  const [deliveryPrice, setDeliveryPrice] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [isDeliveryLoading, setIsDeliveryLoading] = useState(false);
  const [wilayas, setWilayas] = useState<WilayaDelivery[]>([]);
  const [selectedWilaya, setSelectedWilaya] = useState<string>('');
  const [formStep, setFormStep] = useState<'details' | 'delivery' | 'payment'>('details');
  
  const imgRef = useRef<HTMLImageElement>(null);
  const { t } = useTranslation();

  // Load product and wilayas on component mount
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
        if (!id) {
          setError(t('product.idRequired'));
          return;
        }
        
        // Load product
        const productData = await fetchProductById(Number(id));
        setProduct(productData);
        
        if (productData.images && productData.images.length > 0) {
          setSelectedColor(productData.images[0].color);
        }
        
        // Load wilayas
        const wilayaData = await getDeliveryWilayas();
        setWilayas(wilayaData);
        
      } catch (err) {
        setError(t('product.notFound'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, t]);

  useEffect(() => {
    if (product) {
      const metrePrice = parseFloat(product.metre_price || "0");
      const standardPrice = parseFloat(product.price?.toString() || "0");
      
      let itemPrice = 0;
      
      // PRIORITIZE metre_price over standard price
      if (metrePrice > 0) {
        if (longueur && parseFloat(longueur) > 0) {
          // Use metre_price × longueur × quantity
          itemPrice = metrePrice * parseFloat(longueur) * quantity;
        } else {
          // Product has metre_price but no length entered yet
          itemPrice = 0;
        }
      } else {
        // Only use standard price if metre_price is not available
        itemPrice = standardPrice * quantity;
      }
      
      // Total = item price + delivery price
      const finalTotal = itemPrice + deliveryPrice;
      setTotalPrice(finalTotal);
    }
  }, [product, quantity, longueur, deliveryPrice]);

  // Fetch delivery price when wilaya changes
  useEffect(() => {
    const fetchPrice = async () => {
      if (selectedWilaya) {
        setIsDeliveryLoading(true);
        try {
          const price = await getDeliveryPrice(selectedWilaya);
          setDeliveryPrice(price);
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
  }, [selectedWilaya]);

  // Get unique colors from product images
  const uniqueColors = product?.images?.reduce((acc: Array<{color: string, color_name: string, image: string, id: number}>, image: ProductImage) => {
    const existingColor = acc.find(item => item.color === image.color && item.color_name === image.color_name);
    if (!existingColor) {
      acc.push({
        color: image.color,
        color_name: image.color_name,
        image: image.image,
        id: image.id
      });
    }
    return acc;
  }, []) || [];

  // Filter images by selected color
  const filteredImages = selectedColor 
    ? product?.images?.filter(img => img.color === selectedColor) || []
    : product?.images || [];

  const currentImage = filteredImages[currentImageIndex]?.image || product?.image;

  // Reset image index when color changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedColor]);

  // Success notification
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

  // Add to cart handler
  const handleAddToCart = () => {
    if (!product) return;
    
    const metrePrice = parseFloat(product.metre_price || "0");
    const standardPrice = parseFloat(product.price?.toString() || "0");
    
    // STRICTER VALIDATION: If product has metre_price, longueur is REQUIRED
    if (metrePrice > 0 && (!longueur || parseFloat(longueur) <= 0)) {
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
    
    const selectedColorName = uniqueColors.find((color: {color: string, color_name: string}) => color.color === selectedColor)?.color_name || '';
    
    // Calculate price - PRIORITIZE metre_price over standard price
    let displayPrice = 0;
    if (metrePrice > 0 && longueur && parseFloat(longueur) > 0) {
      // Use metre_price × longueur × quantity
      displayPrice = metrePrice * parseFloat(longueur) * quantity;
    } else if (metrePrice > 0) {
      // Has metre_price but no length - cannot add to cart
      toast.error(t('product.lengthRequired'), {
        description: t('product.meterRequired'),
        style: {
          background: '#FF3333',
          color: 'white',
          borderRadius: '12px'
        }
      });
      return;
    } else {
      // Use standard price × quantity
      displayPrice = standardPrice * quantity;
    }
    
    addToCart({
      id: product.id.toString(),
      name: product.name,
      price: `${displayPrice.toFixed(2)} DA`,
      image: currentImage || product.image,
      quantity: quantity,
      color: selectedColorName,
      selectedImage: currentImage,
      longueur: longueur || undefined,
      metre_price: product.metre_price || undefined,
      poids: product.poids || undefined,
    });
    
    toast.success(t('notifications.addedToCart'), {
      description: t('notifications.productAdded'),
      action: {
        label: t('cart.viewCart'),
        onClick: () => navigate('/cart')
      },
      style: {
        background: 'linear-gradient(to right, #4BB543, #2E8B57)',
        color: 'white',
        borderRadius: '12px'
      }
    });
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
  
  const metrePrice = parseFloat(product.metre_price || "0");
  const standardPrice = parseFloat(product.price?.toString() || "0");
  
  // STRICTER VALIDATION for metre-priced products
  if (metrePrice > 0 && (!longueur || parseFloat(longueur) <= 0)) {
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
  
  const selectedColorName = uniqueColors.find((color: {color: string, color_name: string}) => color.color === selectedColor)?.color_name || '';
  
  // Calculate item price - PRIORITIZE metre_price
  let itemPrice: number;
  let calculationMethod = '';
  
  if (metrePrice > 0 && longueur && parseFloat(longueur) > 0) {
    // Use metre_price × longueur × quantity
    itemPrice = metrePrice * parseFloat(longueur) * quantity;
    calculationMethod = `${metrePrice} DA/m × ${longueur}m × ${quantity}`;
  } else if (metrePrice > 0) {
    // Should not happen due to validation above, but as fallback
    itemPrice = 0;
    calculationMethod = 'Prix au mètre (longueur manquante)';
  } else {
    // Use standard price × quantity
    itemPrice = standardPrice * quantity;
    calculationMethod = `${standardPrice} DA × ${quantity}`;
  }
  
  // Calculate total with delivery
  const finalPrice = itemPrice + deliveryPrice;
  
  // Create order item - convert price to string if needed
  const orderItem: OrderItem = {
    productname: product.name,
    id: product.id.toString(),
    price: itemPrice, // This is a number, allowed in updated interface
    quantity: quantity,
    image: currentImage,
    color: selectedColorName,
    longueur: longueur ? parseFloat(longueur) : undefined,
    metre_price: product.metre_price || undefined,
    unit_price: standardPrice,
    metre_price_value: product.metre_price,
    wilaya: selectedWilaya,
    address: userData.address,
    delivery_price: deliveryPrice,
    total_price: finalPrice,
    calculation: calculationMethod
  };
  
  try {
    // Save user data
    const userDataToSave = {
      ...userData,
      wilaya: selectedWilaya
    };
    localStorage.setItem("userData", JSON.stringify(userDataToSave));
    
    await submitOrder([orderItem]);
    
    // Show success
    showSuccessNotification();
    setShowOrderForm(false);
    setFormStep('details');
    
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
  // Image handlers
  const handleNextImage = () => {
    if (filteredImages.length === 0) return;
    setCurrentImageIndex((prev) => 
      prev === filteredImages.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = () => {
    if (filteredImages.length === 0) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? filteredImages.length - 1 : prev - 1 
    );
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  // Mouse move for zoom effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    
    const { left, top, width, height } = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomStyle({
      backgroundPosition: `${x}% ${y}%`,
      transform: 'scale(1.2)',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="h-12 w-12 animate-spin mx-auto text-[#d6b66d]" />
          <p className="mt-4 text-gray-600">{t('product.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold">{t('product.notFound')}</h2>
        <p className="text-gray-500 mt-2">{t('product.notFoundDescription')}</p>
      </div>
    );
  }

  // Get prices
  const standardPrice = parseFloat(product.price?.toString() || "0");
  const metrePrice = parseFloat(product.metre_price || "0");
  
  // Calculate display product price
  const displayProductPrice = (() => {
    if (!product) return 0;
    
    // PRIORITIZE metre_price over standard price
    if (metrePrice > 0) {
      if (longueur && parseFloat(longueur) > 0) {
        // Calculate using metre_price × longueur × quantity
        return metrePrice * parseFloat(longueur) * quantity;
      } else {
        // Product has metre_price but no length yet
        return 0;
      }
    } else {
      // Regular product - use standard price × quantity
      return standardPrice * quantity;
    }
  })();

  // Get price display text
  const getPriceDisplay = () => {
    // PRIORITIZE metre_price display
    if (metrePrice > 0) {
      if (longueur && parseFloat(longueur) > 0) {
        return `${metrePrice.toFixed(2)} DA/m × ${longueur}m × ${quantity}`;
      } else {
        return `${metrePrice.toFixed(2)} DA/m (${t('product.enterValidLength')})`;
      }
    } else {
      // Fallback to standard price
      return `${standardPrice.toFixed(2)} DA × ${quantity}`;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-black">
        {/* Floating Action Buttons */}
        <div className="fixed right-6 bottom-6 z-40 flex flex-col gap-3">
          <a 
            href="https://wa.me/213557098663" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-green-500 text-white p-4 rounded-full shadow-xl hover:bg-green-600 transition-all duration-300 hover:scale-110"
            title={t('common.whatsApp')}
          >
            <MessageSquare className="h-6 w-6" />
          </a>
          <a
            href="tel:+213557098663"
            className="bg-[#d6b66d] text-white p-4 rounded-full shadow-xl hover:bg-[#c9a95d] transition-all duration-300 hover:scale-110"
            title={t('order.call')}
          >
            <Phone className="h-6 w-6" />
          </a>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            className="mb-6 flex items-center gap-2 hover:bg-gray-100 transition-colors"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            {t('product.backToProducts')}
          </Button>
          
          {/* Product Grid */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Images Section */}
            <div className="space-y-8">
              {/* Main Image Container */}
              <div className="relative group">
                <div 
                  className="relative rounded-2xl overflow-hidden bg-black shadow-xl h-[500px]"
                  onMouseEnter={() => setShowZoom(true)}
                  onMouseLeave={() => setShowZoom(false)}
                  onMouseMove={handleMouseMove}
                >
                  <img
                    ref={imgRef}
                    src={currentImage}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  {/* Zoom Overlay */}
                  {showZoom && (
                    <div 
                      className="absolute inset-0 pointer-events-none z-10"
                      style={{
                        backgroundImage: `url(${currentImage})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '200%',
                        ...zoomStyle
                      }}
                    />
                  )}
                </div>
                
                {/* Navigation Arrows */}
                {filteredImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/90 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black transition-all duration-300 z-50 shadow-lg hover:shadow-xl hover:scale-110"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/90 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black transition-all duration-300 z-50 shadow-lg hover:shadow-xl hover:scale-110"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
                
                {/* Image Counter */}
                {filteredImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                    {t('product.imageCounter', { current: currentImageIndex + 1, total: filteredImages.length })}
                  </div>
                )}
              </div>
              
              {/* Thumbnails */}
              {filteredImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-4">
                  {filteredImages.map((img, index) => (
                    <button
                      key={img.id}
                      onClick={() => handleThumbnailClick(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                        currentImageIndex === index 
                          ? 'border-[#d6b66d] scale-105 shadow-lg' 
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img.image}
                        alt={`${product.name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
              
              {/* Color Selection */}
              {uniqueColors.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">{t('product.colorSelection')}</h3>
                  <div className="flex flex-wrap gap-3">
                    {uniqueColors.map((colorObj) => (
                      <button
                        key={`${colorObj.color}-${colorObj.color_name}-${colorObj.id}`}
                        onClick={() => handleColorSelect(colorObj.color)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                          selectedColor === colorObj.color
                            ? 'border-[#d6b66d] bg-gradient-to-r from-[#d6b66d]/10 to-[#d6b66d]/5 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }`}
                      >
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                          style={{ backgroundColor: colorObj.color }}
                        />
                        <span className="text-sm font-medium text-white">
                          {colorObj.color_name || colorObj.color}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Product Info Section */}
            <div className="space-y-8">
              {/* Product Header */}
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{product.name}</h1>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-[#d6b66d]/10 text-[#d6b66d] rounded-full text-sm font-medium">
                    {product.category.name}
                  </span>
                  {product.is_available ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      ✅ {t('product.available')}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                      ❌ {t('product.outOfStock')}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Price Card - PRIORITIZE metre_price */}
              <div className="bg-black rounded-2xl shadow-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-3xl font-bold text-white">
                      {displayProductPrice.toFixed(2)} <span className="text-lg">DA</span>
                    </div>
                    
                    {/* Display metre_price prominently when available */}
                    <div className="flex gap-4 mt-2 text-sm">
                      {metrePrice > 0 ? (
                        <div className="text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                          <span className="font-semibold">{t('product.mainPrice')}: {metrePrice.toFixed(2)} DA/m</span>
                          {longueur && parseFloat(longueur) > 0 && (
                            <span className="ml-2">(× {longueur}m × {quantity})</span>
                          )}
                        </div>
                      ) : standardPrice > 0 ? (
                        <div className="text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                          <span className="font-semibold">{t('product.unitPrice')}: {standardPrice.toFixed(2)} DA</span>
                        </div>
                      ) : null}
                    </div>
                    
                    {/* Show price breakdown */}
                    <div className="text-sm text-green-600 mt-1">
                      {getPriceDisplay()}
                    </div>
                    
                    {/* Warnings or info messages */}
                    {metrePrice > 0 && !longueur && (
                      <div className="text-sm text-yellow-600 mt-1">
                        ⚠️ {t('product.lengthWarning')}
                      </div>
                    )}
                    
                    {/* Show standard price as reference if metre_price exists */}
                    {metrePrice > 0 && standardPrice > 0 && (
                      <div className="text-sm text-gray-500 mt-1">
                        ({t('product.referencePrice')}: {standardPrice.toFixed(2)} DA)
                      </div>
                    )}
                  </div>
                  
                  {product.poids && (
                    <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      ⚖️ {product.poids} kg
                    </div>
                  )}
                </div>
                
                <div className="space-y-3 text-sm">
                  {/* Show metre price first if available */}
                  {metrePrice > 0 ? (
                    <>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 flex items-center gap-2">
                          <Ruler className="h-4 w-4" />
                          <span className="font-medium">{t('product.meterPrice')} ({t('common.used')})</span>
                        </span>
                        <span className="text-white font-medium">{metrePrice.toFixed(2)} DA/m</span>
                      </div>
                      
                      {/* Show unit price as reference if different */}
                      {standardPrice > 0 && standardPrice !== metrePrice && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600 flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            <span className="font-medium">{t('product.unitPrice')} ({t('common.reference')})</span>
                          </span>
                          <span className="text-white font-medium">{standardPrice.toFixed(2)} DA</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">{t('product.length')} {longueur ? `(${t('common.entered')})` : `(${t('common.required')})`}</span>
                        <span className="text-white font-medium">
                          {longueur ? `${longueur} m` : t('common.toSpecify')}
                        </span>
                      </div>
                    </>
                  ) : (
                    /* Only show standard price section if no metre_price */
                    <>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4" />
                          <span className="font-medium">{t('product.unitPrice')}</span>
                        </span>
                        <span className="text-white font-medium">{standardPrice.toFixed(2)} DA</span>
                      </div>
                      
                      {/* Optional longueur for regular products */}
                      {longueur && parseFloat(longueur) > 0 && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600 font-medium">{t('product.customLengthRequired')}</span>
                          <span className="text-white font-medium">{longueur} m</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">{t('product.quantity')}</span>
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <Button 
                        variant="ghost" 
                        className="h-10 w-10 hover:bg-gray-100"
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      >
                        -
                      </Button>
                      <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                      <Button 
                        variant="ghost" 
                        className="h-10 w-10 hover:bg-gray-100"
                        onClick={() => setQuantity(q => q + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dimensions Input */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Ruler className="h-5 w-5" />
                  {metrePrice > 0 ? t('product.dimensions') : t('product.customDimensions')}
                </h3>
                <div className="bg-black rounded-xl border border-gray-300 p-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        {t('product.length')} {metrePrice > 0 ? <span className="text-red-500">*</span> : `(${t('common.optional')})`}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={longueur}
                          onChange={(e) => {
                            const value = e.target.value;
                            setLongueur(value);
                            // Recalculate price immediately when longueur changes
                            if (product && metrePrice > 0 && value && parseFloat(value) > 0) {
                              const itemPrice = metrePrice * parseFloat(value) * quantity;
                              const finalTotal = itemPrice + deliveryPrice;
                              setTotalPrice(finalTotal);
                            }
                          }}
                          placeholder={metrePrice > 0 ? t('product.enterLengthPlaceholder') : t('product.enterLengthOptional')}
                          className="w-full border border-gray-300 rounded-lg p-3 pl-10 text-white bg-black focus:ring-2 focus:ring-[#d6b66d] focus:border-transparent transition-colors"
                          min={metrePrice > 0 ? "0.1" : "0"}
                          step="0.1"
                        />
                        <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {metrePrice > 0 
                        ? t('product.priceCalculation', { price: metrePrice.toFixed(2), quantity })
                        : t('product.optionalLength')
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Delivery Card */}
              <div className="bg-black rounded-2xl shadow-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                  <Truck className="h-5 w-5 text-[#d6b66d]" />
                  {t('product.deliveryAndFees')}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      {t('product.deliveryWilaya')}
                    </label>
                    <select
                      value={selectedWilaya}
                      onChange={(e) => setSelectedWilaya(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 text-white bg-black focus:ring-2 focus:ring-[#d6b66d] focus:border-transparent transition-colors"
                    >
                      <option value="">{t('product.selectWilaya')}</option>
                      {wilayas.map((wilaya) => (
                        <option key={wilaya.id} value={wilaya.name}>
                          {wilaya.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedWilaya && (
                    <div className="bg-black rounded-xl p-4 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-600">{t('cart.delivery')} {t('common.to')}</div>
                          <div className="font-semibold text-white">{selectedWilaya}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">{t('cart.deliveryPrice')}</div>
                          <div className="text-2xl font-bold text-white">
                            {isDeliveryLoading ? (
                              <FaSpinner className="h-5 w-5 animate-spin inline" />
                            ) : deliveryPrice > 0 ? (
                              `${deliveryPrice.toFixed(2)} DA`
                            ) : (
                              <span className="text-green-600">{t('product.freeDelivery')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Total Summary */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-4">{t('product.totalSummary')}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">{t('product.productTotal')}</span>
                    <span className="font-medium">{displayProductPrice.toFixed(2)} DA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">{t('product.delivery')}</span>
                    <span className="font-medium">
                      {deliveryPrice > 0 ? `${deliveryPrice.toFixed(2)} DA` : t('product.freeDelivery')}
                    </span>
                  </div>
                  <div className="border-t border-gray-700 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">{t('product.totalToPay')}</span>
                      <div className="text-3xl font-bold text-[#d6b66d]">
                        {totalPrice.toFixed(2)} DA
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-4 mt-8">
                  <Button 
                    variant="outline"
                    className="flex-1 bg-black/10 text-white border-white/20 hover:bg-black/20 hover:text-white"
                    onClick={handleAddToCart}
                    disabled={metrePrice > 0 && (!longueur || parseFloat(longueur) <= 0)}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {t('product.addToCart')}
                  </Button>
                  
                  <Button 
                    className="flex-1 bg-gradient-to-r from-[#d6b66d] to-[#c9a95d] text-white hover:opacity-90"
                    onClick={() => setShowOrderForm(true)}
                    disabled={
                      isSubmitting || 
                      (metrePrice > 0 && (!longueur || parseFloat(longueur) <= 0)) || 
                      !selectedWilaya ||
                      (metrePrice > 0 && displayProductPrice === 0)
                    }
                  >
                    {t('product.orderNow')}
                  </Button>
                </div>

                {metrePrice > 0 && (!longueur || parseFloat(longueur) <= 0) && (
                  <p className="text-sm text-red-300 text-center mt-4">
                    ⚠️ {t('product.meterRequired')}
                  </p>
                )}
              </div>
              
              {/* Product Description */}
              {product.description && (
                <div className="bg-black rounded-2xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-white mb-4">{t('product.description')}</h3>
                  <p className="text-white leading-relaxed">{product.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Footer />
      </div>

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-black rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
            {/* Modal Header */}
            <div className="sticky top-0 bg-black border-b border-gray-200 rounded-t-3xl p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">{t('orderForm.finalizeOrder')}</h2>
                  <p className="text-gray-600 mt-1">{t('orderForm.provideInfo')}</p>
                </div>
                <button
                  onClick={() => setShowOrderForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              {/* Progress Steps */}
              <div className="flex items-center justify-center mt-8">
                <div className={`flex items-center ${formStep === 'details' ? 'text-[#d6b66d]' : 'text-gray-400'}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${formStep === 'details' ? 'bg-[#d6b66d] text-white' : 'bg-gray-200'}`}>
                    1
                  </div>
                  <span className="ml-2 text-sm font-medium">{t('orderForm.progressSteps.details')}</span>
                </div>
                <div className="h-0.5 w-12 bg-gray-300 mx-2"></div>
                <div className={`flex items-center ${formStep === 'delivery' ? 'text-[#d6b66d]' : 'text-gray-400'}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${formStep === 'delivery' ? 'bg-[#d6b66d] text-white' : 'bg-gray-200'}`}>
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium">{t('orderForm.progressSteps.delivery')}</span>
                </div>
                <div className="h-0.5 w-12 bg-gray-300 mx-2"></div>
                <div className={`flex items-center ${formStep === 'payment' ? 'text-[#d6b66d]' : 'text-gray-400'}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${formStep === 'payment' ? 'bg-[#d6b66d] text-white' : 'bg-gray-200'}`}>
                    3
                  </div>
                  <span className="ml-2 text-sm font-medium">{t('orderForm.progressSteps.payment')}</span>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="p-6">
              <div className="bg-black rounded-xl p-4 mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-white">{product.name}</h4>
                    {selectedColor && (
                      <p className="text-sm text-gray-600 mt-1">
                        {t('cart.color')}: {uniqueColors.find((color) => color.color === selectedColor)?.color_name || selectedColor}
                      </p>
                    )}
                    {longueur && (
                      <p className="text-sm text-gray-600">
                        {t('product.length')}: {longueur}m
                        {metrePrice > 0 && (
                          <span className="text-green-600 ml-2">
                            ({metrePrice} DA/m × {longueur}m × {quantity})
                          </span>
                        )}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">{t('product.quantity')}: {quantity}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{displayProductPrice.toFixed(2)} DA</div>
                    {deliveryPrice > 0 && (
                      <div className="text-sm text-gray-600">+ {deliveryPrice.toFixed(2)} DA {t('cart.delivery').toLowerCase()}</div>
                    )}
                    <div className="text-sm text-gray-600 mt-2">{t('common.total')}: {totalPrice.toFixed(2)} DA</div>
                    {metrePrice > 0 && longueur && (
                      <div className="text-xs text-blue-600 mt-1">
                        {t('common.calculation')}: {metrePrice} DA/m × {longueur}m × {quantity} + {deliveryPrice.toFixed(2)} DA {t('cart.delivery').toLowerCase()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Form Steps */}
              <form onSubmit={handleOrderSubmit}>
                {formStep === 'details' && (
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
                          <div className="text-2xl font-bold text-white mt-1">{selectedWilaya}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {t('cart.deliveryPrice')}: {deliveryPrice > 0 ? `${deliveryPrice.toFixed(2)} DA` : t('product.freeDelivery')}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white">
                        {t('orderForm.changeWilaya')}
                      </label>
                      <select
                        value={selectedWilaya}
                        onChange={(e) => setSelectedWilaya(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 text-white bg-black focus:ring-2 focus:ring-[#d6b66d] focus:border-transparent"
                      >
                        <option value="">{t('orderForm.changeWilaya')}</option>
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
                        onClick={() => setFormStep('details')}
                      >
                        {t('orderForm.previous')}
                      </Button>
                      <Button
                        type="button"
                        className="bg-[#d6b66d] hover:bg-[#c9a95d] text-white"
                        onClick={() => setFormStep('payment')}
                        disabled={!selectedWilaya}
                      >
                        {t('orderForm.next')}
                      </Button>
                    </div>
                  </div>
                )}
                
                {formStep === 'payment' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">{t('orderForm.finalSummary')}</h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b pb-3">
                        <span className="text-gray-600">{t('product.productTotal')}</span>
                        <span className="font-medium">{displayProductPrice.toFixed(2)} DA</span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-3">
                        <span className="text-gray-600">{t('product.delivery')} ({selectedWilaya})</span>
                        <span className="font-medium">{deliveryPrice > 0 ? `${deliveryPrice.toFixed(2)} DA` : t('product.freeDelivery')}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3">
                        <span className="text-xl font-bold text-white">{t('common.total')}</span>
                        <span className="text-3xl font-bold text-[#d6b66d]">{totalPrice.toFixed(2)} DA</span>
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
                        disabled={isSubmitting}
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
              
              {/* Contact Info */}
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