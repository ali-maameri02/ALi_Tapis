import { CategoryButton } from './CategoryButton';
import { useTranslation } from 'react-i18next';
import { useEffect, useState, useRef } from 'react';
import { catalogService, type Category } from '@/api/catalog';
import { Skeleton } from '../ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const SearchCategories = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await catalogService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setError(t('common.errors.loadingCategories'));
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [t]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  if (error) {
    return (
      <section className="px-4 py-6 text-center text-red-500">
        {error}
      </section>
    );
  }

  if (loading) {
    return (
      <section className="px-4   bg-gradient-to-r from-black via-black to-zinc-900 ">
        <div className="flex justify-center">
          <div className="relative w-full max-w-7xl mx-auto">
            {/* Navigation Buttons Skeleton */}
            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
              {[...Array(12)].map((_, index) => (
                <div key={index} className="flex flex-col items-center gap-2 flex-shrink-0 w-20">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <Skeleton className="h-4 w-[70px]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4  space-y-2 bg-gradient-to-r from-black via-black to-zinc-900 mt-">
      <div className="flex justify-center">
        <div className="relative w-full max-w-7xl mx-auto">
          {/* Navigation Buttons */}
          {categories.length > 0 && (
            <>
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/3 -translate-y-1/2 -translate-x-4 bg-black/80 text-white p-2 rounded-full hover:bg-black transition-colors z-10 shadow-lg"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/3 -translate-y-1/2 translate-x-4 bg-black/80 text-white p-2 rounded-full hover:bg-black transition-colors z-10 shadow-lg"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
          
          {/* Horizontal Scrollable Categories */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-6 px-4 scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {categories.map((category) => (
              <div 
                key={category.id} 
                className="flex flex-col items-center gap-2 flex-shrink-0 w-20"
              >
                <CategoryButton
                  id={category.id}
                  name={category.name}
                  image={category.image || '/placeholder-category.jpg'}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};