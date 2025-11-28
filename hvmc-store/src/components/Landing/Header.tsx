import {  Search, ShoppingCart, User } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import logo from '@/assets/photo_de_profile-removebg-preview.png';
import cover from '@/assets/cover page ali.jpg';
import { useCart } from '../context/Cartcontext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { AuthModal } from "./AuthModal";
import { useState, useEffect } from "react";
import { authService } from "@/api/auth";
import { useSearch } from "../context/SearchContext";

export const Header = () => {
  const { cartCount, cartItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Check auth status on component mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setIsLoggedIn(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setIsAuthModalOpen(false);
  };

  // SVG flags as React components
  const FrenchFlag = () => (
    <svg viewBox="0 0 36 24" className="h-5 w-5">
      <rect width="12" height="24" x="0" fill="#ED2939" />
      <rect width="12" height="24" x="12" fill="#fff" />
      <rect width="12" height="24" x="24" fill="#002395" />
    </svg>
  );

  const AlgerianFlag = () => (
    <svg viewBox="0 0 36 24" className="h-5 w-5">
      <rect width="36" height="24" fill="#fff" />
      <rect width="18" height="24" fill="#006233" />
      <path 
        d="M18 15.5a5.5 5.5 0 1 1 0-7 4.5 4.5 0 1 0 0 7z" 
        fill="#d21034"
      />
      <path 
        d="M19.5 9l1 2h2l-1.6 1.2.6 2-1.6-1.2-1.6 1.2.6-2L16.5 11h2z" 
        fill="#d21034"
      />
    </svg>
  );

  return (
    <header className="bg-gradient-to-r from-black via-black to-zinc-900 text-white  w-full top-0 z-50 shadow-lg ">
      {/* Top Navigation Bar */}
      <div className="container mx-auto px-4 py-3 pb-0 flex justify-between items-center border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center  gap-2">
<img src={logo} width={100} height={150} />


          <span className="font-light text-sm hidden md:block text-zinc-300">
              {t('header.title')}
            </span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Shopping Cart with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="relative h-10 w-10 rounded-full hover:text-[#d6b66d]"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-transparent text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center hover:text-[#d6b66d]">
                    {cartCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-72 p-4 bg-zinc-900 border-zinc-700 text-white"
            >
              {cartCount === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm">{t('header.cartEmpty')}</p>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold mb-2">
                    {t('header.cartTitle')} ({cartCount})
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex gap-3 items-center">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-zinc-400">
                            {item.quantity} × {item.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-700">
                    <Button asChild className="w-full" size="sm">
                      <Link to="/cart">
                        {t('header.viewCart')}
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile Dropdown */}
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-10 w-10 rounded-full hover:bg-white/10"
                  aria-label="User profile"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-zinc-900 border-zinc-700 text-white"
              >
               
                <DropdownMenuItem 
                  className="hover:bg-zinc-800 cursor-pointer"
                  onClick={() => navigate('/orders')}
                >
                  {t('header.orders')}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-zinc-800 cursor-pointer text-red-400"
                  onClick={handleLogout}
                >
                  {t('header.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="outline" 
              className="text-black cursor-pointer" 
              onClick={() => setIsAuthModalOpen(true)}
            >
              {t('header.login')}
            </Button>
          )}

          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-white/10"
                aria-label="Change language"
              >
                {i18n.language === 'ar' ? <AlgerianFlag /> : <FrenchFlag />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-40 bg-zinc-900 border-zinc-700 text-white"
            >
              <DropdownMenuItem 
                className="flex items-center gap-2 hover:bg-zinc-800"
                onClick={() => changeLanguage('fr')}
              >
                <FrenchFlag />
                <span>Français</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="flex items-center gap-2 hover:bg-zinc-800"
                onClick={() => changeLanguage('ar')}
              >
                <AlgerianFlag />
                <span>العربية</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Hero Section - Only on homepage */}
      {location.pathname === '/' && (
  <div
    className="
      container mx-auto px-4 py-0 flex flex-col items-center mt-16 
      bg-cover bg-center md:bg-top  
      min-h-[50vh] md:min-h-[70vh] lg:h-100
      relative
    "
    style={{
      backgroundImage: `url(${cover})`,
      backgroundRepeat: 'no-repeat',
    }}
  >
    <p className="text-lg md:text-xl mb-8 text-center max-w-2xl text-zinc-300">
      {t('home.subtitle')}
    </p>

    {/* Search Bar */}
    <div className="relative w-full max-w-2xl ">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
      <Input
        type="search"
        placeholder={t('home.searchPlaceholder')}
        className="pl-10 py-6 rounded-full bg-zinc-100 border-0 focus-visible:ring-2 focus-visible:ring-primary/50 text-black"
        value={searchQuery}
        onChange={handleSearchChange}
      />
    </div>
  </div>
)}

      {/* Auth Modal */}
      <AuthModal
        open={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
        onLoginSuccess={handleLoginSuccess}
      />
    </header>
  );
};