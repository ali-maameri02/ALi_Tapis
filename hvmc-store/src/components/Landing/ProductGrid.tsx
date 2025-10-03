// src/components/ProductGrid.tsx
import { useEffect, useState } from 'react';
import { ProductCard } from './ProductCard';
import { fetchProducts } from '@/api/serviceProducts';
import { type Product } from '@/api/serviceProducts';
import { useSearch } from '@/components/context/SearchContext';

export const ProductGrid = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { searchQuery } = useSearch();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  if (loading) {
    return <div className="px-4 py-8 text-center">Loading products...</div>;
  }

  if (error) {
    return <div className="px-4 py-8 text-center text-red-500">{error}</div>;
  }

  return (
    <section className="container px-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-5">
      {filteredProducts.length > 0 ? (
        filteredProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={{
              id: product.id.toString(),
              name: product.name,
              category: product.category.name,
              price: `${product.price} `,
              image: product.image,
              description: product.description
            }} 
          />
        ))
      ) : (
        <div className="col-span-full text-center py-8">
          No products found matching your search.
        </div>
      )}
    </section>
  );
};