// src/components/Landing/ProductsCategorie.tsx
import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { ProductCard } from './ProductCard';
import { fetchProductsByCategory, type Product } from '@/api/serviceProducts';
import { catalogService, type Category } from '@/api/catalog';
import { Skeleton } from '../ui/skeleton';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const ProductsCategorie = () => {
  const { t } = useTranslation();
  const { categoryId } = useParams<{ categoryId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!categoryId) {
          throw new Error('Category ID is required');
        }
        
        const id = Number(categoryId);
        const [categoryData, productsData] = await Promise.all([
          catalogService.getCategoryById(id),
          fetchProductsByCategory(id)
        ]);
        
        setCategory(categoryData);
        setProducts(productsData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(t('errors.categoryProducts'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [categoryId, t]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 mt-24">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 mt-24 text-center">
        <h2 className="text-2xl font-bold mb-4">{t('errors.loadingFailed')}</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <Button asChild>
          <Link to="/">{t('actions.backToHome')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container  px-4 ">
      <h1 className="text-3xl font-bold mb-8">
        {category?.name || t('titles.categoryProducts')}
      </h1>
      
      {products.length === 0 ? (
        <div className="text-center py-5">
          <h2 className="text-xl font-medium mb-2">{t('messages.noProducts')}</h2>
          <p className="text-gray-500 mb-6">
            {category 
              ? t('messages.noProductsInCategory', { category: category.name })
              : t('messages.noProductsAvailable')}
          </p>
          <Button asChild>
            <Link to="/categories">{t('actions.browseCategories')}</Link>
          </Button>
        </div>
      ) : (
        <>
          {category?.description && (
            <p className="text-gray-400 mb-8 max-w-3xl">
              {category.description}
            </p>
          )}
          
          {/* Horizontal Scroll Container */}
          <div className="relative">
            {/* Navigation Buttons */}
            {products.length > 0 && (
              <>
                <button
                  onClick={scrollLeft}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-black/80 text-white p-2 rounded-full hover:bg-black transition-colors z-10 shadow-lg"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={scrollRight}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-black/80 text-white p-2 rounded-full hover:bg-black transition-colors z-10 shadow-lg"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
            
            {/* Horizontal Scrollable Products */}
            <div
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {products.map(product => (
                <div 
                  key={product.id.toString()} 
                  className="flex-shrink-0 w-64" // Fixed width for consistent cards
                >
                  <ProductCard 
                    product={{
                      id: product.id.toString(),
                      name: product.name,
                      // Convert price to string - FIX FOR THE ERROR
                      price: typeof product.price === 'number' 
                        ? product.price.toString() + ' DA' 
                        : String(product.price) + ' DA',
                      image: product.image,
                      description: product.description,
                      is_available: product.is_available,
                      created_at: product.created_at,
                      category: product.category?.name || ''
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};