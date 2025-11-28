import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { ShoppingCart, ArrowLeft, MessageSquare, Phone, Instagram } from "lucide-react";
import { useCart } from '../context/Cartcontext';
import { fetchProductById, type Product, type ProductImage } from '@/api/serviceProducts';
import { toast } from "sonner";
import { submitOrder } from '@/api/serviceOrders';
import { useTranslation } from "react-i18next";
import { Footer } from "./Footer";
import { FaTiktok } from 'react-icons/fa';
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
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
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
  const [measurements, setMeasurements] = useState({
    hauteur: '',
    largeur: '',
    carr: ''
  });
  
  const imgRef = useRef<HTMLImageElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  
    const loadProduct = async () => {
      try {
        if (!id) {
          setError(t('product.idRequired'));
          return;
        }
        
        const data = await fetchProductById(Number(id));
        console.log('Product data:', data);
        console.log('Product images:', data.images);
        
        setProduct(data);
        
        // Set initial selected color based on first image
        if (data.images && data.images.length > 0) {
          console.log('First image color:', data.images[0].color);
          setSelectedColor(data.images[0].color);
        }
      } catch (err) {
        setError(t('product.notFound'));
      } finally {
        setLoading(false);
      }
    };
  
    loadProduct();
  }, [id, t]);

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

  // Get current image (fallback to main image if no images array)
  const currentImage = filteredImages[currentImageIndex]?.image || product?.image;

  // Reset image index when color changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedColor]);

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
            <div className="flex flex-col gap-3 mt-3">
              <a 
                href="https://wa.me/213541779717" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-colors animate-float"
                aria-label="Chat on WhatsApp"
              >
                <MessageSquare className="h-6 w-6" />
              </a>
              <a
                href="https://m.me/100069071041741"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors animate-float delay-100"
                aria-label="Chat on Facebook"
              >
                <MessageSquare className="h-6 w-6" />
              </a>
              <a
                href="https://www.instagram.com/hamza_hvmc"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-full shadow-lg hover:opacity-90 transition-colors animate-float delay-200"
                aria-label="Visit Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="https://www.tiktok.com/@hamza_hvmc?_t=ZS-8yxWaAzR9g8&_r=1"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors animate-float delay-300"
                aria-label="Visit TikTok"
              >
                <FaTiktok className="h-6 w-6" />
              </a>
              <a
                href="tel:+213541779717"
                className="bg-[#d6b66d] text-black p-3 rounded-full shadow-lg hover:bg-[#c9a95d] transition-colors animate-float delay-400"
                aria-label="Call us"
              >
                <Phone className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
    ), {
      duration: 3000
    });
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // Get selected color name for display
    const selectedColorName = uniqueColors.find((color: {color: string, color_name: string}) => color.color === selectedColor)?.color_name || '';
    
    addToCart({
      id: product.id.toString(),
      name: product.name,
      price: `${product.price} DA`,
      image: currentImage || product.image,
      quantity: quantity,
      color: selectedColorName,
      selectedImage: currentImage,
      hauteur: measurements.hauteur || undefined,
      largeur: measurements.largeur || undefined,
      carr: measurements.carr || undefined
    });
    
    // Reset measurements after adding to cart
    setMeasurements({ hauteur: '', largeur: '', carr: '' });
    
    toast.success(t('cart.added'), {
      description: t('cart.addedDescription'),
      action: {
        label: t('cart.viewCart'),
        onClick: () => navigate('/cart')
      },
      style: {
        background: '#4BB543',
        color: 'white'
      }
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    
    const { left, top, width, height } = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setCursorPos({ x, y });
    
    setZoomStyle({
      backgroundPosition: `${x}% ${y}%`,
      transform: 'scale(1.2)',
    });
  };

  const handleOrderNow = async () => {
    if (!product) return;
    
    const storedUserData = localStorage.getItem("userData");
    if (!storedUserData || !JSON.parse(storedUserData).name) {
      setShowOrderForm(true);
      return;
    }
    
    await proceedWithOrder();
  };

  const proceedWithOrder = async () => {
    if (!product) return;
    
    setIsSubmitting(true);
    
    // Get selected color name for order
    const selectedColorName = uniqueColors.find((color: {color: string, color_name: string}) => color.color === selectedColor)?.color_name || '';
    
    try {
      await submitOrder({
        productname: product.name,
        id: product.id.toString(),
        price: product.price,
        quantity: quantity || 1,
        wilaya: userData.wilaya,
        image: currentImage,
        color: selectedColorName,
        hauteur: measurements.hauteur || undefined,
        largeur: measurements.largeur || undefined,
        carr: measurements.carr || undefined
      });
      showProductSuccessAlert();
    } catch (error) {
      toast.error(t('errors.orderFailed'), {
        description: 'Une erreur est survenue lors de la soumission de votre commande.',
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
        description: 'Veuillez remplir tous les champs obligatoires.',
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

  const handleMeasurementChange = (field: string, value: string) => {
    setMeasurements(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="h-8 w-8 animate-spin" />
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

  return (
    <>
      <div className="container mx-auto px-4 py-8 mt-8 relative">
        <div className="fixed right-4 bottom-4 z-40 flex flex-col gap-3">
          <a 
            href="https://wa.me/213557098663" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-colors animate-float"
            aria-label="Chat on WhatsApp"
          >
            <MessageSquare className="h-6 w-6" />
          </a>
          <a
            href="https://m.me/100063534282260"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors animate-float delay-100"
            aria-label="Chat on Facebook"
          >
            <MessageSquare className="h-6 w-6" />
          </a>
          {/* <a
            href="https://www.instagram.com/hamza_hvmc"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-full shadow-lg hover:opacity-90 transition-colors animate-float delay-200"
            aria-label="Visit Instagram"
          >
            <Instagram className="h-6 w-6" />
          </a> */}
          {/* <a
            href="https://www.tiktok.com/@hamza_hvmc?_t=ZS-8yxWaAzR9g8&_r=1"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors animate-float delay-300"
            aria-label="Visit TikTok"
          >
            <FaTiktok className="h-6 w-6" />
          </a> */}
          <a
            href="tel:+213557098663"
            className="bg-[#d6b66d] text-black p-3 rounded-full shadow-lg hover:bg-[#c9a95d] transition-colors animate-float delay-400"
            aria-label="Call us"
          >
            <Phone className="h-6 w-6" />
          </a>
        </div>

        <Button 
          variant="ghost" 
          className="mb-4 flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          {t('product.back')}
        </Button>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="grid grid-cols gap-8">
            {/* Main image container with relative positioning */}
            <div className="relative">
              <div 
                className="relative rounded-lg overflow-hidden bg-white h-96"
                onMouseEnter={() => setShowZoom(true)}
                onMouseLeave={() => setShowZoom(false)}
                onMouseMove={handleMouseMove}
              >
                <img
                  ref={imgRef}
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-contain cursor-crosshair"
                />
                
                {/* Zoom Overlay */}
                {showZoom && (
                  <div 
                    className="absolute inset-0 pointer-events-none z-10"
                    style={{
                      backgroundImage: `url(${currentImage})`,
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: `${imgRef.current?.offsetWidth ? imgRef.current.offsetWidth * 2 : 0}px ${imgRef.current?.offsetHeight ? imgRef.current.offsetHeight * 2 : 0}px`,
                      ...zoomStyle
                    }}
                  />
                )}
                
                {/* Zoom Lens */}
                {showZoom && (
                  <div 
                    ref={zoomRef}
                    className="absolute hidden md:block w-32 h-32 rounded-full border-2 border-white bg-white bg-opacity-30 pointer-events-none z-20"
                    style={{
                      left: `${cursorPos.x}%`,
                      top: `${cursorPos.y}%`,
                      transform: 'translate(-50%, -50%)',
                      backgroundImage: `url(${currentImage})`,
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: `${imgRef.current?.offsetWidth ? imgRef.current.offsetWidth * 2 : 0}px ${imgRef.current?.offsetHeight ? imgRef.current.offsetHeight * 2 : 0}px`,
                      backgroundPosition: `${cursorPos.x}% ${cursorPos.y}%`,
                    }}
                  />
                )}
              </div>
              
              {/* Navigation Buttons - Positioned outside the image container with highest z-index */}
              {filteredImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-black/80 text-white p-3 rounded-full hover:bg-black transition-colors z-50 shadow-lg"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-black/80 text-white p-3 rounded-full hover:bg-black transition-colors z-50 shadow-lg"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
            
            {/* Color Selection */}
            {uniqueColors.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">{t('product.selectColor') || 'Select Color'}</h3>
                <div className="flex flex-wrap gap-3">
                  {uniqueColors.map((colorObj, index) => (
                    <button
                      key={`${colorObj.color}-${colorObj.color_name}-${colorObj.id}`}
                      onClick={() => handleColorSelect(colorObj.color)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                        selectedColor === colorObj.color
                          ? 'border-[#d6b66d] bg-[#d6b66d] bg-opacity-10'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: colorObj.color }}
                      />
                      <span className="text-sm text-gray-700">
                        {colorObj.color_name || `Color ${index + 1}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Image Thumbnails */}
            {filteredImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto py-2">
                {filteredImages.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => handleThumbnailClick(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                      currentImageIndex === index 
                        ? 'border-[#d6b66d]' 
                        : 'border-transparent'
                    }`}
                    aria-label={`View image ${index + 1}`}
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
          </div>
          
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-white text-2xl font-bold">{product.price} DA</p>
            <p className="text-sm text-[#d6b66d]">{product.category.name}</p>
            
            {product.description && (
              <div className="prose max-w-none">
                <p>{product.description}</p>
              </div>
            )}

            {/* Measurement Section */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Dimensions (Optionnel)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="hauteur" className="block text-sm font-medium text-gray-700 mb-1">
                    Hauteur (cm)
                  </label>
                  <input
                    type="number"
                    id="hauteur"
                    value={measurements.hauteur}
                    onChange={(e) => handleMeasurementChange('hauteur', e.target.value)}
                    placeholder="Hauteur"
                    className="w-full border border-gray-300 rounded-md p-2 text-gray-900 bg-white"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label htmlFor="largeur" className="block text-sm font-medium text-gray-700 mb-1">
                    Largeur (cm)
                  </label>
                  <input
                    type="number"
                    id="largeur"
                    value={measurements.largeur}
                    onChange={(e) => handleMeasurementChange('largeur', e.target.value)}
                    placeholder="Largeur"
                    className="w-full border border-gray-300 rounded-md p-2 text-gray-900 bg-white"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label htmlFor="carr" className="block text-sm font-medium text-gray-700 mb-1">
                    Carré (cm)
                  </label>
                  <input
                    type="number"
                    id="carr"
                    value={measurements.carr}
                    onChange={(e) => handleMeasurementChange('carr', e.target.value)}
                    placeholder="Carré"
                    className="w-full border border-gray-300 rounded-md p-2 text-gray-900 bg-white"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Ces dimensions sont optionnelles. Remplissez-les uniquement si nécessaire pour votre commande.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg overflow-hidden">
                <Button 
                  variant="ghost" 
                  className="h-10 w-10"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >
                  -
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button 
                  variant="ghost" 
                  className="h-10 w-10"
                  onClick={() => setQuantity(q => q + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline" 
                className="gap-2 flex-1 text-black"
                onClick={handleAddToCart}
                disabled={isSubmitting}
              >
                <ShoppingCart className="h-4 w-4" />
                {t('product.addToCart')}
              </Button>
              
              <Button 
                className="gap-2 flex-1 bg-[#d6b66d] hover:bg-[#c9a95d] text-black"
                onClick={handleOrderNow}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="h-4 w-4 animate-spin" />
                    {t('product.submitting')}
                  </>
                ) : (
                  t('product.orderNow')
                )}
              </Button>
            </div>
          </div>
        </div>

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
      <Footer />
    </>
  );
};