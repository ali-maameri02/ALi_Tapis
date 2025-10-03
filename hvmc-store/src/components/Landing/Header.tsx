import {  Search, ShoppingCart, User } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
// import logo from '@/assets/7-removebg-preview-214.png';
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
    <header className="bg-gradient-to-r from-black via-black to-zinc-900 text-white fixed w-full top-0 z-50 shadow-lg pb-8">
      {/* Top Navigation Bar */}
      <div className="container mx-auto px-4 py-3 pb-0 flex justify-between items-center border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center  gap-2">
<svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width={48}
    zoomAndPan="magnify"
    viewBox="0 0 375 374.999991"
    height={48}
    preserveAspectRatio="xMidYMid meet"
  >
    <defs>
      <clipPath id="f3aa78bd68">
        <path d="M 85 136 L 102 136 L 102 157 L 85 157 Z M 85 136 " />
      </clipPath>
      <clipPath id="18fa82f470">
        <path d="M 85.972656 138.113281 L 100.457031 136.882812 L 101.996094 154.945312 L 87.511719 156.175781 Z M 85.972656 138.113281 " />
      </clipPath>
      <clipPath id="2e2a7e997a">
        <path d="M 85 146 L 106 146 L 106 157 L 85 157 Z M 85 146 " />
      </clipPath>
      <clipPath id="a6be63a465">
        <path d="M 86.503906 160.765625 L 83.871094 152.027344 L 102.4375 146.429688 L 105.070312 155.167969 Z M 86.503906 160.765625 " />
      </clipPath>
      <clipPath id="c5a23eabe0">
        <path d="M 85.1875 156.394531 L 102.417969 146.4375 L 105.050781 155.175781 Z M 85.1875 156.394531 " />
      </clipPath>
      <clipPath id="b154e495e6">
        <path d="M 101 146 L 106 146 L 106 155 L 101 155 Z M 101 146 " />
      </clipPath>
      <clipPath id="612f4a5a74">
        <path d="M 101.28125 146.539062 L 104.585938 146.257812 L 105.300781 154.664062 L 101.996094 154.945312 Z M 101.28125 146.539062 " />
      </clipPath>
      <clipPath id="209704eceb">
        <path d="M 64 149 L 100 149 L 100 178 L 64 178 Z M 64 149 " />
      </clipPath>
      <clipPath id="dc7d599658">
        <path d="M 56.671875 226.835938 L 22.765625 182.894531 L 86.890625 133.410156 L 120.796875 177.351562 Z M 56.671875 226.835938 " />
      </clipPath>
      <clipPath id="5cfd6beb4a">
        <path d="M 120.910156 177.265625 L 87.003906 133.324219 L 22.875 182.808594 L 56.78125 226.75 Z M 120.910156 177.265625 " />
      </clipPath>
      <clipPath id="fae010d61e">
        <path d="M 23 160 L 108 160 L 108 222 L 23 222 Z M 23 160 " />
      </clipPath>
      <clipPath id="9c029663ef">
        <path d="M 56.671875 226.835938 L 22.765625 182.894531 L 86.890625 133.410156 L 120.796875 177.351562 Z M 56.671875 226.835938 " />
      </clipPath>
      <clipPath id="6a3223c4d6">
        <path d="M 120.910156 177.265625 L 87.003906 133.324219 L 22.875 182.808594 L 56.78125 226.75 Z M 120.910156 177.265625 " />
      </clipPath>
      <clipPath id="401cc392be">
        <path d="M 87.53125 165.882812 L 89.484375 165.882812 L 89.484375 167.832031 L 87.53125 167.832031 Z M 87.53125 165.882812 " />
      </clipPath>
      <clipPath id="a6376d14dc">
        <path d="M 88.507812 165.882812 C 87.96875 165.882812 87.53125 166.320312 87.53125 166.859375 C 87.53125 167.398438 87.96875 167.832031 88.507812 167.832031 C 89.046875 167.832031 89.484375 167.398438 89.484375 166.859375 C 89.484375 166.320312 89.046875 165.882812 88.507812 165.882812 Z M 88.507812 165.882812 " />
      </clipPath>
      <clipPath id="aff37914db">
        <path d="M 90 157 L 105 157 L 105 167 L 90 167 Z M 90 157 " />
      </clipPath>
      <clipPath id="6c7d52c58c">
        <path d="M 90.089844 163.585938 L 103.554688 157.453125 L 104.984375 160.597656 L 91.519531 166.726562 Z M 90.089844 163.585938 " />
      </clipPath>
      <clipPath id="2a967be8f3">
        <path d="M 90 153 L 104 153 L 104 166 L 90 166 Z M 90 153 " />
      </clipPath>
      <clipPath id="75794d8a80">
        <path d="M 90.089844 162.726562 L 101.910156 153.832031 L 103.988281 156.589844 L 92.164062 165.484375 Z M 90.089844 162.726562 " />
      </clipPath>
      <clipPath id="ec8f8d8d4e">
        <path d="M 92 149 L 105 149 L 105 163 L 92 163 Z M 92 149 " />
      </clipPath>
      <clipPath id="6e122dcbea">
        <path d="M 92.472656 160.003906 L 102.429688 149.0625 L 104.984375 151.386719 L 95.027344 162.328125 Z M 92.472656 160.003906 " />
      </clipPath>
      <clipPath id="24eccddf10">
        <path d="M 97 149 L 110 149 L 110 163 L 97 163 Z M 97 149 " />
      </clipPath>
      <clipPath id="d29b8b07cc">
        <path d="M 97.039062 160.003906 L 106.996094 149.0625 L 109.550781 151.386719 L 99.59375 162.328125 Z M 97.039062 160.003906 " />
      </clipPath>
      <clipPath id="aebbf794fe">
        <path d="M 88 163 L 93 163 L 93 168 L 88 168 Z M 88 163 " />
      </clipPath>
      <clipPath id="267d936a35">
        <path d="M 88.039062 164.777344 L 91.09375 163.476562 L 92.394531 166.53125 L 89.339844 167.832031 Z M 88.039062 164.777344 " />
      </clipPath>
      <clipPath id="b52af96b5a">
        <path d="M 87.347656 166.859375 L 88.730469 166.859375 L 88.730469 168.238281 L 87.347656 168.238281 Z M 87.347656 166.859375 " />
      </clipPath>
      <clipPath id="e9230a3a1a">
        <path d="M 88.039062 166.859375 C 87.65625 166.859375 87.347656 167.167969 87.347656 167.546875 C 87.347656 167.929688 87.65625 168.238281 88.039062 168.238281 C 88.421875 168.238281 88.730469 167.929688 88.730469 167.546875 C 88.730469 167.167969 88.421875 166.859375 88.039062 166.859375 Z M 88.039062 166.859375 " />
      </clipPath>
      <clipPath id="3339968b87">
        <path d="M 304.410156 167.347656 L 337.5 167.347656 L 337.5 182.691406 L 304.410156 182.691406 Z M 304.410156 167.347656 " />
      </clipPath>
    </defs>
    <g id="31bddc9763">
      <rect
        x={0}
        width={375}
        y={0}
        height={374.999991}
        style={{
          fill: "#ffffff",
          fillOpacity: 1,
          stroke: "none",
        }}
      />
      <rect
        x={0}
        width={375}
        y={0}
        height={374.999991}
        style={{
          fill: "#000000",
          fillOpacity: 1,
          stroke: "none",
        }}
      />
      <g
        style={{
          fill: "#ffffff",
          fillOpacity: 1,
        }}
      >
        <g transform="translate(83.043222, 197.854035)">
          <path
            style={{
              stroke: "none",
            }}
            d="M 35.546875 0 L 35.546875 -17.25 L 19.484375 -17.25 L 19.484375 0 L 4.890625 0 L 4.890625 -45.453125 L 19.484375 -45.453125 L 19.484375 -28.875 L 35.546875 -28.875 L 35.546875 -45.453125 L 50.140625 -45.453125 L 50.140625 0 Z M 35.546875 0 "
          />
        </g>
      </g>
      <g
        style={{
          fill: "#ffffff",
          fillOpacity: 1,
        }}
      >
        <g transform="translate(138.075397, 197.854035)">
          <path
            style={{
              stroke: "none",
            }}
            d="M 2.578125 -12.953125 L 2.578125 -23.390625 L 19.421875 -23.390625 L 19.421875 -12.953125 Z M 2.578125 -12.953125 "
          />
        </g>
      </g>
      <g
        style={{
          fill: "#ffffff",
          fillOpacity: 1,
        }}
      >
        <g transform="translate(160.075051, 197.854035)">
          <path
            style={{
              stroke: "none",
            }}
            d="M 17.25 0 L 1.125 -45.453125 L 16.71875 -45.453125 L 25.828125 -15.0625 L 26.09375 -15.0625 L 35.28125 -45.453125 L 50.203125 -45.453125 L 34.15625 0 Z M 17.25 0 "
          />
        </g>
      </g>
      <g
        style={{
          fill: "#ffffff",
          fillOpacity: 1,
        }}
      >
        <g transform="translate(211.473647, 197.854035)">
          <path
            style={{
              stroke: "none",
            }}
            d="M 43.9375 0 L 43.9375 -16.390625 C 43.9375 -18.410156 44.007812 -20.488281 44.15625 -22.625 C 44.3125 -24.757812 44.476562 -26.550781 44.65625 -28 C 44.832031 -29.457031 44.941406 -30.382812 44.984375 -30.78125 L 44.71875 -30.78125 L 36.328125 0 L 24.90625 0 L 16.453125 -30.71875 L 16.1875 -30.71875 C 16.226562 -30.320312 16.347656 -29.40625 16.546875 -27.96875 C 16.742188 -26.539062 16.929688 -24.757812 17.109375 -22.625 C 17.285156 -20.488281 17.375 -18.410156 17.375 -16.390625 L 17.375 0 L 3.96875 0 L 3.96875 -45.453125 L 24.578125 -45.453125 L 31.453125 -19.21875 L 31.703125 -19.21875 L 38.515625 -45.453125 L 58.40625 -45.453125 L 58.40625 0 Z M 43.9375 0 "
          />
        </g>
      </g>
      <g
        style={{
          fill: "#ffffff",
          fillOpacity: 1,
        }}
      >
        <g transform="translate(273.839033, 197.854035)">
          <path
            style={{
              stroke: "none",
            }}
            d="M 26.5625 -46.25 C 33.300781 -46.25 38.628906 -44.5625 42.546875 -41.1875 C 46.460938 -37.820312 48.421875 -33.007812 48.421875 -26.75 L 34.484375 -26.75 C 34.484375 -29.394531 33.789062 -31.488281 32.40625 -33.03125 C 31.019531 -34.570312 29.046875 -35.34375 26.484375 -35.34375 C 23.535156 -35.34375 21.367188 -34.414062 19.984375 -32.5625 C 18.597656 -30.71875 17.90625 -28.144531 17.90625 -24.84375 L 17.90625 -20.609375 C 17.90625 -17.347656 18.597656 -14.78125 19.984375 -12.90625 C 21.367188 -11.039062 23.492188 -10.109375 26.359375 -10.109375 C 29.179688 -10.109375 31.316406 -10.832031 32.765625 -12.28125 C 34.222656 -13.738281 34.953125 -15.789062 34.953125 -18.4375 L 48.421875 -18.4375 C 48.421875 -12.21875 46.515625 -7.457031 42.703125 -4.15625 C 38.898438 -0.851562 33.519531 0.796875 26.5625 0.796875 C 18.8125 0.796875 12.941406 -1.179688 8.953125 -5.140625 C 4.960938 -9.109375 2.96875 -14.96875 2.96875 -22.71875 C 2.96875 -30.476562 4.960938 -36.335938 8.953125 -40.296875 C 12.941406 -44.265625 18.8125 -46.25 26.5625 -46.25 Z M 26.5625 -46.25 "
          />
        </g>
      </g>
      <path
        style={{
          fill: "none",
          strokeWidth: 5,
          strokeLinecap: "butt",
          strokeLinejoin: "miter",
          stroke: "#000000",
          strokeOpacity: 1,
          strokeMiterlimit: 4,
        }}
        d="M -0.00104617 2.501059 L 38.657642 2.501077 "
        transform="matrix(0.582623,-0.472283,0.472283,0.582623,80.085028,160.175145)"
      />
      <path
        style={{
          fill: "none",
          strokeWidth: 5,
          strokeLinecap: "butt",
          strokeLinejoin: "miter",
          stroke: "#000000",
          strokeOpacity: 1,
          strokeMiterlimit: 4,
        }}
        d="M -0.00000319443 2.49902 L 38.658685 2.499038 "
        transform="matrix(0.582623,-0.472283,0.472283,0.582623,77.163508,158.204169)"
      />
      <path
        style={{
          fill: "none",
          strokeWidth: 2,
          strokeLinecap: "butt",
          strokeLinejoin: "miter",
          stroke: "#000000",
          strokeOpacity: 1,
          strokeMiterlimit: 4,
        }}
        d="M -0.000711056 1.003093 L 39.460378 1.001377 "
        transform="matrix(0.461219,-0.580457,0.580457,0.461219,85.984482,167.23616)"
      />
      <g clipRule="nonzero" clipPath="url(#f3aa78bd68)">
        <g clipRule="nonzero" clipPath="url(#18fa82f470)">
          <path
            style={{
              stroke: "none",
              fillRule: "nonzero",
              fill: "#ffffff",
              fillOpacity: 1,
            }}
            d="M 85.972656 138.113281 L 100.457031 136.882812 L 101.992188 154.933594 L 87.507812 156.164062 Z M 85.972656 138.113281 "
          />
        </g>
      </g>
      <g clipRule="nonzero" clipPath="url(#2e2a7e997a)">
        <g clipRule="nonzero" clipPath="url(#a6be63a465)">
          <g clipRule="nonzero" clipPath="url(#c5a23eabe0)">
            <path
              style={{
                stroke: "none",
                fillRule: "nonzero",
                fill: "#000000",
                fillOpacity: 1,
              }}
              d="M 86.503906 160.765625 L 83.871094 152.027344 L 102.40625 146.441406 L 105.039062 155.179688 Z M 86.503906 160.765625 "
            />
          </g>
        </g>
      </g>
      <g clipRule="nonzero" clipPath="url(#b154e495e6)">
        <g clipRule="nonzero" clipPath="url(#612f4a5a74)">
          <path
            style={{
              stroke: "none",
              fillRule: "nonzero",
              fill: "#000000",
              fillOpacity: 1,
            }}
            d="M 101.28125 146.539062 L 104.585938 146.257812 L 105.300781 154.65625 L 101.992188 154.9375 Z M 101.28125 146.539062 "
          />
        </g>
      </g>
      <g clipRule="nonzero" clipPath="url(#209704eceb)">
        <g clipRule="nonzero" clipPath="url(#dc7d599658)">
          <g clipRule="nonzero" clipPath="url(#5cfd6beb4a)">
            <path
              style={{
                stroke: "none",
                fillRule: "nonzero",
                fill: "#ffffff",
                fillOpacity: 1,
              }}
              d="M 98.894531 149.707031 C 99.277344 149.394531 99.78125 149.894531 99.476562 150.277344 L 84.855469 168.707031 L 64.984375 177.445312 L 98.894531 149.707031 "
            />
          </g>
        </g>
      </g>
      <g clipRule="nonzero" clipPath="url(#fae010d61e)">
        <g clipRule="nonzero" clipPath="url(#9c029663ef)">
          <g clipRule="nonzero" clipPath="url(#6a3223c4d6)">
            <path
              style={{
                stroke: "none",
                fillRule: "nonzero",
                fill: "#ffffff",
                fillOpacity: 1,
              }}
              d="M 31.335938 189.078125 C 33.902344 192.402344 38.675781 193.019531 42 190.453125 C 45.324219 187.890625 45.941406 183.113281 43.375 179.789062 C 40.808594 176.464844 36.035156 175.851562 32.710938 178.414062 C 29.386719 180.980469 28.769531 185.753906 31.335938 189.078125 Z M 68.84375 181.730469 C 69.730469 182.878906 71.378906 183.09375 72.527344 182.207031 C 73.675781 181.320312 73.890625 179.671875 73.003906 178.519531 C 72.117188 177.371094 70.46875 177.160156 69.320312 178.046875 C 68.171875 178.933594 67.957031 180.582031 68.84375 181.730469 Z M 52.222656 216.148438 C 54.789062 219.472656 59.5625 220.089844 62.886719 217.523438 C 66.214844 214.957031 66.828125 210.183594 64.261719 206.859375 C 61.699219 203.535156 56.921875 202.917969 53.597656 205.484375 C 50.273438 208.050781 49.660156 212.824219 52.222656 216.148438 Z M 31.679688 176.210938 C 35.828125 173.335938 41.570312 174.054688 44.882812 177.863281 C 44.921875 177.90625 44.957031 177.945312 44.988281 177.988281 C 48.398438 182.03125 54.042969 183.378906 58.886719 181.25 L 107.035156 160.074219 C 107.484375 159.875 107.839844 160.492188 107.441406 160.78125 L 68.910156 188.804688 L 66.785156 191.484375 C 63.5 195.625 63.355469 201.429688 66.40625 205.742188 C 66.441406 205.789062 66.476562 205.839844 66.507812 205.886719 C 69.042969 209.605469 68.839844 214.507812 65.910156 217.925781 C 61.453125 223.128906 53.542969 222.492188 49.90625 217.011719 C 47.378906 213.203125 48.066406 207.332031 51.410156 204.214844 C 51.953125 203.707031 52.53125 203.273438 53.140625 202.914062 C 55.289062 201.632812 57.144531 199.914062 58.535156 197.835938 L 64.453125 189.003906 C 64.957031 188.097656 65.238281 187.277344 65.351562 186.535156 C 65.554688 185.21875 64.628906 184.023438 63.304688 183.890625 C 62.558594 183.8125 61.695312 183.878906 60.695312 184.136719 L 50.652344 187.617188 C 48.289062 188.4375 46.15625 189.792969 44.371094 191.550781 C 43.960938 191.957031 43.507812 192.332031 43.011719 192.671875 C 38.773438 195.589844 32.917969 194.765625 29.648438 190.796875 C 28.394531 189.273438 27.671875 187.5 27.445312 185.691406 C 27.390625 185.269531 27.078125 184.929688 26.660156 184.851562 L 24.644531 184.480469 C 24.070312 184.378906 23.6875 183.824219 23.792969 183.25 C 23.898438 182.675781 24.449219 182.296875 25.023438 182.402344 L 26.566406 182.683594 C 27.0625 182.773438 27.546875 182.46875 27.671875 181.980469 C 28.242188 179.726562 29.59375 177.65625 31.679688 176.210938 "
            />
          </g>
        </g>
      </g>
      <g clipRule="nonzero" clipPath="url(#401cc392be)">
        <g clipRule="nonzero" clipPath="url(#a6376d14dc)">
          <path
            style={{
              stroke: "none",
              fillRule: "nonzero",
              fill: "#000000",
              fillOpacity: 1,
            }}
            d="M 87.53125 165.882812 L 89.484375 165.882812 L 89.484375 167.832031 L 87.53125 167.832031 Z M 87.53125 165.882812 "
          />
        </g>
      </g>
      <g clipRule="nonzero" clipPath="url(#aff37914db)">
        <g clipRule="nonzero" clipPath="url(#6c7d52c58c)">
          <path
            style={{
              stroke: "none",
              fillRule: "nonzero",
              fill: "#000000",
              fillOpacity: 1,
            }}
            d="M 90.089844 163.585938 L 103.558594 157.453125 L 104.988281 160.59375 L 91.519531 166.726562 Z M 90.089844 163.585938 "
          />
        </g>
      </g>
      <g clipRule="nonzero" clipPath="url(#2a967be8f3)">
        <g clipRule="nonzero" clipPath="url(#75794d8a80)">
          <path
            style={{
              stroke: "none",
              fillRule: "nonzero",
              fill: "#000000",
              fillOpacity: 1,
            }}
            d="M 90.089844 162.726562 L 101.914062 153.828125 L 103.992188 156.589844 L 92.164062 165.484375 Z M 90.089844 162.726562 "
          />
        </g>
      </g>
      <g clipRule="nonzero" clipPath="url(#ec8f8d8d4e)">
        <g clipRule="nonzero" clipPath="url(#6e122dcbea)">
          <path
            style={{
              stroke: "none",
              fillRule: "nonzero",
              fill: "#000000",
              fillOpacity: 1,
            }}
            d="M 92.472656 160.003906 L 102.433594 149.0625 L 104.988281 151.386719 L 95.027344 162.328125 Z M 92.472656 160.003906 "
          />
        </g>
      </g>
      <g clipRule="nonzero" clipPath="url(#24eccddf10)">
        <g clipRule="nonzero" clipPath="url(#d29b8b07cc)">
          <path
            style={{
              stroke: "none",
              fillRule: "nonzero",
              fill: "#000000",
              fillOpacity: 1,
            }}
            d="M 97.039062 160.003906 L 107 149.0625 L 109.554688 151.386719 L 99.59375 162.328125 Z M 97.039062 160.003906 "
          />
        </g>
      </g>
      <g clipRule="nonzero" clipPath="url(#aebbf794fe)">
        <g clipRule="nonzero" clipPath="url(#267d936a35)">
          <path
            style={{
              stroke: "none",
              fillRule: "nonzero",
              fill: "#000000",
              fillOpacity: 1,
            }}
            d="M 88.039062 164.777344 L 91.09375 163.476562 L 92.394531 166.53125 L 89.339844 167.832031 Z M 88.039062 164.777344 "
          />
        </g>
      </g>
      <g clipRule="nonzero" clipPath="url(#b52af96b5a)">
        <g clipRule="nonzero" clipPath="url(#e9230a3a1a)">
          <path
            style={{
              stroke: "none",
              fillRule: "nonzero",
              fill: "#000000",
              fillOpacity: 1,
            }}
            d="M 87.347656 166.859375 L 88.730469 166.859375 L 88.730469 168.238281 L 87.347656 168.238281 Z M 87.347656 166.859375 "
          />
        </g>
      </g>
      <path
        style={{
          fill: "none",
          strokeWidth: 1,
          strokeLinecap: "butt",
          strokeLinejoin: "miter",
          stroke: "#000000",
          strokeOpacity: 1,
          strokeMiterlimit: 4,
        }}
        d="M 0.00133241 0.503373 L 38.570287 0.503237 "
        transform="matrix(0.685968,-0.303229,0.303229,0.685968,86.420668,168.4637)"
      />
      <g clipRule="nonzero" clipPath="url(#3339968b87)">
        <path
          style={{
            stroke: "none",
            fillRule: "nonzero",
            fill: "#000000",
            fillOpacity: 1,
          }}
          d="M 304.410156 167.347656 L 337.503906 167.347656 L 337.503906 182.691406 L 304.410156 182.691406 Z M 304.410156 167.347656 "
        />
      </g>
      <g
        mask="url(#43b46ef103)"
        transform="matrix(0.24,0,0,0.24,101.039998,203.279987)"
      >
        <image
          width={834}
          xlinkHref="data:image/png;base64,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"
          height={65}
          preserveAspectRatio="xMidYMid meet"
        />
        <mask id="43b46ef103">
          <g>
            <image
              width={834}
              xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA0IAAABBCAAAAADZSUubAAAAAmJLR0QA/4ePzL8AABtoSURBVHic7V173FXD+n9m7f1eqldvFxS5xUEX5BxESO4URy65hFLncLqXIkIU5SikXI7SBUkK0RURTrnFD5WKQleV7r31vm+Xd6+ZeX5/zKy9Z2bNWmvvV058Puv7z541t+d55j7PPDMbIEaMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFiRIAcaAb+pKg16ygAAJjdfd8B5iRGjD8jir5CRET+WCIeg2LEyB2FHyMiYlnbwjznQPMSI8afD8kZiIj48xlFhcl4FooRI1c4ExER8d0j4x4UI0ZlMBIRkQ8pLiqIe1AMSB5oBv58uLnpQiD88dnUZRwPNDMxDjjiYTRXECcvmSDAKGUY96AYkDjQDPzpQBxCECmj/I/QgwqKi7l7oJnIIL9mNQhnp6hWwv0DlNt+hDILFT4iFLT4cLkvWr3e4nfscuhfw57TDy8CAEDb0wAAfn1KDzymu/h95heA3vWC2Zk7C6DpDQGBI9b7vGrfBwAAo1bYUwheZ84z/VtdKH6Hbs34Ne4YzBbcn4K04AQIAGT6jxRcLxe6u2Tl97/omYiigZ2DxWeEnFI0eOP/AqJVueL8psfWBgB3+9JF38zeFcK+B4MkKy/bsPynCl+0iCq2o7jlxac0LAKAshUL/jvLxk3Dq848uX4CADctWTBrPrcT/XaS+JSF5UPFA5ApGx9mzgOA9qcAAMC2IVrQjWcAAMCG4bb8+e6yNT/+oHftUA7sIO+jQBd/2BARsrUQyHq0YxYBACCviq8+evpzZaSzAMiigAwQEZ8EgNuDAk/38/UXEfK+XaJbRGhf099ZKXMcoHheHcIWFkGk4Jbg1SNOUctXFs16OWxFyClFw9vtstUdUaolqnj3xugjKhvJvR/cebAeK0JSK/72WkrLdOJJRoT8fyzV8trYv5aV6KtEKywfyolSNj70BQAyRbhX6Ny+LHwXBee/fdJlSpJwDhQoxU7+Ix09fCVV9Q7xO9YlgaUoQrzwxy/Twrz1YoJAcA4A4DhAAluC3xLAi3tpG1v8osdlpma6a46Vjq6FvqwC+CLBu0YpuCXkmF7fTf2LES8dNULOdLCPewAAuOPnXgdpHvktJy++zBZT5dRGsvCS4eteOlqLFpg+KOSw179tm6dlevPil7UuctXP4xprSeoOWttb3UWkC4eEkwInrOgI8ZWzl4xE5l/rptkLLtKyCuTA/knIB3I51PBiIzVpJ4rDHUsCahQAiGBfZpiYfIIWlokU2lQJiSgfA17cp6pZog88XDqMHEl6ijy0XTrLiC4EJELwgOCrF96SjuZ4lEg4QSFnaBcaMbrI79n4BL+fnnEAycIOywYklFihklpwzXL/mpTc9v1Z6Y+qr00/yhej6Kn5R/iJOoSAUlg2JnyNWAl0MkxqchB9SArK/9Q5TzlmAisHCjLxEHG0dHY30/QQv9N/xawH4xrTi9XAzG/oLBQ6SflD0pGPfMgfeGJP6TDL4syz087emWShukkSOTYHBRdN6GwSIBH0tOncGrFvL1u6Pa9FLOWCSVYZ+GGd6GgBddPvreo277r/vVK6DvusrTXhGd+c4SeaRemELIVULokZApnQwFGi9wSvB4ZxoEIpdOQTSoXrymO1OORCOQePzOUcpMGkypiPhbVVe3SB3g18Qc/kpSPphans0xq2tJb3/gR57vyAgIh0wdGOG5xxu7vTzil+NVD2JM+fd2hU6gD0eSwg28I3jwMAgJof/DUgaZ33zS1Tdvg9j2JufjDHBOrRKt81UWgSnK53a31FDufffsUy3os+0DPCH82sWw65x0py6jdeCRx/jvh9q8zL5CuF7n92q6kAcaM1O4G85y42uvd1l3guo8CPvkb56P2ul/2aF9PD1/ViWbjy0zRpRVEbIbhMVPWQkw6RPolxDUL1vDnJCQBA7s0Xjn0Tpn9fCsnaJ5122akAMDbrAe5dQbJKzcPrp/1OnNNsjx4ruooBAFo/mXaWfrx4Y0Wdwy9qJL8HrQEAcN5O9xP8ev7KsipHnNbC24PWnN1keyin5c8bPGh3S2Yv1kP5l8E52bvd7jcBAKCguGG6JB58Y7kaY8fYMA5A60KIbFQnMXN0fEit1uOuEL8jGWKakUWP6Rlz6qvAvotftTCNQ5PecrOd7EL/XuVl4kIml2c36+lYypJbGhfeOFn7rvJkQETSS8jMHQCAi5oskv6Le3nqCnKp6EIL+khmkCqkIwT3EhE458GmwuvYDqGNOzc5AcC5XvzuvGoJIiDd8Oucocd36PDjt1kvEh5cjYJHqHtR14bS85ThnfX0WVQxwKGjvSax/vHXXUQgMOD4B64CAH7nOEIQ4N7zvQwmDluLCEBI8R295Oa13ug2oUyXDtGCEZn6/d4rOocs5yOyXenqOr7XzcIr+eCtKo3toRyAvk9AvkKOOzVvVXdi3UWkTVOYostHmtLgUv9J45gzTB8A5NSVKdJHbNx1pY/KnhdPoCLlmrzreFLbYJP7Mkomffw56B8AAFAmzwe83RCyNF/UY9X1OKDZCy4TuS79tOWb0q996MIjRzmBNJTHNkO+cysq9lXsq6hIucvvP/XO7O2NuOu6ruumXLphwjk9vMnnX+fpsbKpYjLEW/+9ffYre6UAy2+7oRRSHV/mCABHeycHO67usUqKuv2Js5dI32tbh7PqGjy4qpDcCKXMPG2KhCh9N0WXd5Nnn3C1rqoJ5QD0hRxyNupy4ew+JhOtqIP4HZtS+eMuA6N7+tgrnHa6f1GClHnKF+Yx6XIvD4UES6FBILSF1BvYVwmvrxwG6TuhO8Te9/VR3QsAAG6671eRO/Nm2LQGHr3CQuCZ6TdCcC8RIU6y57mHAQDAWYXGEklDjnICSEUjfO0KCwlCCHESG9ZFdD0FVFYlAcdJTFgwU+qfB7XQcsimio9rJx0TejLKULCTSLz/9wm9PqKUI5D+BSLCriu/Zx6/TmJ1q3fkmdnD00PZNs2otC9uNufcjRblgEWIk3jpklYAAFC12Rw1m1AOwNBWIf9QLgNPapHRkHQUqrWKcXpWnDOuwDoEHj61wOeHnDOBdApkno/WSVk0ARW9GmXcZESh8qHGSkh149it0wEAIL97ehpKc5Hm1PNg2QvuJaLUTZW9JfySjcOmoVzlTHfxoynjHBE5Y9RNpczmFE4yzWQqteRWuXRs3tSIFlnFpJscgxfc6aZcShljnFE35S449SMxXNdoL6N2XppKuVSQdVOpnTfLDfApl5iZmqwG84AGg9kPImZRUNdNueOlXxNixAgtBaMLsRekM6PXJl3F75ubuTlYqrAzeOYYS+PxUqDpY/R2yIKAguR/MrQu/3tAJHLdMQAA8Nn3VKrwO1UN5MJOO0Jwz59zRr3dbqiyK1c5wbNKGnisFxuRs5wWMZjhkrruZy9L75uIPVYgZ8Q70+5d4bqMIwIgIqOuu1esqsh1UvXx3jsulWaFiJxRd61nf9M2dJkbzoNedtnLb8mfM/qd9DvEGiGIiK545mziTuFq7R2FkZYnCsdIXhnT/nZ9AoP2u7Fhi5s9V/4I1V+tIiIXvGMY/VIsx2t1/J1UpMiZp5Qp2K8klsll4VHfjbsgfSJayRYEyBl1h8pteMsc+SRN5OHoxwtcqjQPZK7c15KW0msYpcocgZy646Qd3RW/pXD2XyNCZN6hQGFOHBn3hXj5K0KDnehyn+ROHqt+vkifJRv31Ops1Qw9o7X5YhsAQ7+fnQs/Cv65SyP42pbIFE/MFAdb5C5xTr9NGH+pqpGzzwQAgE3TGCdjnwYAgJ4jGeSACMFVYF3pKAuOUwk56SxpDFDQsWPJR598siTnPbQGZGTTV+cCAMDxRWUKL1lI6llivkWZsUSRDiING9d/Sc0lWNnsGwEA4JCj1v4hTLcRvdPlUiAZjmr21BhPGVp2swshshe6iYHtnw/vBQCABpeKoJHGGvCss7SU7xjlW9LnnSoAAJCYdOZP2YlgYoD++VlI09rx7SUAAIc90hsBAOoJW9olX/lNNOUkND7FkE0eVB0A4PirpuVShRGCK0DwlvlrwjLMQU6RLR/69yreR802baBk7vuzNkQkCs2QOZ+ILuQ0+Frxj5aUeNvPLwJ2cKSaXM18pe9zAZCz+aILQeO1ufOcJrA/e59s6np1HaKfjuweaVI0LAiQr3lPuA4WS1TSU4zh62aEL+N8FkUL5ewFNaYX75dlTKDlFgDAveK8q9vJAABkWDUAALxHLk+UhMcKFSodxxF5mbSr7w2/ASG2daSF1G9u+SUwjh+hcgIAAC7vqTXHmteMWvdF56pB0aOB3LtGUisklkVSIuPjz0ETYW35u8LXfJB7N1Rqh0hcd93GTQpW6qFDNmihlisGueAQryF8HRbLx6yvCzHPXltoqopvFV+jI/Q9PgtE9qY8eIEGk37/LrRaEEs+RwCghVjnvD5fcqzYwd0ppth3NnBEZFKh0NxyiyJrBJleAsBFU6Rjai5DZWQXQs5ev82w5SHNRq68KQciZpaehqJ6CHG/pASkcdwey4mRzFD+lvqbD5fbbgi4nQQAAE4dHToL1fXAot/U0I59T2p9fvgxbIvlqx9zZEH+6VLh+uvZBIDcLo6Zdr8coUswixcpHSjnM2g5NNS0NEuEZsGGCwOH5u0BEs8AAEDZQ56KKiNjcQfxO4ZxBOTLpQVPn9/AnilaXnFxjRo1ahze5B/vfVBTeNHRuWz1o3lB5k5v9gY1fOtOGlFZMRC9KSzMMMJSiURe18sPko94Geb5ghC8A4+KHPgOHWCiJ3AfiKiuQ09s8+JSz5JvZGh1Rc1CgJyNlM4eAOBIjfbk7bmq3Dmld3i2RnffEhp1P4DtuVs4htYgPU4GAIDHfvWxTDqJAeGnuRwBkLMxwr+N3xK/0rhuW0lJSUnJhkXjLvcKe8zy/btdRkbdNZ1Ovv8LQw3S69FKZ+lduivNMZ2Mn1crSEIvw7r+COndezb3bT1EXZUBSGvp7Nd6jBXnYVtLSkpKSjYvf7Ojt79cND431bPvBR/OXn9ELGCvqbcBrpLGdyN9T218OVX9QmORCsA57LzpY7lWfmGAGZwFBqt6LMTQ/QTHOdNbAwDUGTx4IAAALBtpbmABkt3E71gxPyGfvvEwAIBkj77ZF1qU4D583T/8tDQXOWUkhsg3PD+q+LzzzjlRGRX7TQ1dxYfAG4DXqZ5ZSOrFb/KBJRAAYHu5GLVOsYR5fr9Bm2CFLE/jRtVBWmAwdrR3tXazZZj65TMytT2Cxfe8fBcAAOR1eohIG+2Pl/kawfLR6oLRYoGIFFbeNlXkXzjYDM0Cr25W8oywIORI772oCACgc2NhTNG3Ij1Gp68NXH+kcLRqLu1biCys2x+OLNk0IgU38OUN+8Jn8Fzk9GJxlzkJZ/v0GaTWuRde7p3ckl7tKjXfEZBvSZRo/TcLSb3DyFZzAgjzpUKt17TWNh9VeWTkfr+fddol4qdYn4bkqjrcMBxg07Wr9BFvl1YK6C8FXxdCZKOlLfMdj55wvvB83j+OootazVsOjpk7r5/UCPqXwtFwUyoBn4GsDg7rhw4CAEgIlt+ex7in8Ex3IU/jcr6Zuvj2EVlXY6TgGlLPDNlHwxcGOcmZjoacOcRxnK3Tpudd9Yg0m7uwkjreNjL9V1ry6CrGr11Rs7f0t49BiPNFF0rePsQIImc1EY4F/vdPMth8hfplPlY0eJpKi0uDTNlL8hpoVyGk/n1HCDEAmNl7s3HEBVr1od/AwD8LIV8/41oAAKhzozTdXTnbok/RKaFfq4mcktGh7+KEg2sTavjpOyKnz7XNGMmV308ZGhs/cl6w5q3ns+buPJitSMEVrLviF+rS8KPPXORU4xFOhIEpmzJvrngV6bBq5ZXpQ1Uelo63dSvI6CreOVccfdW+5yE7YXxLjlt3jTPPu7yrFFPCJGYrjW6shW5dobVuOUP8LD1aLFFCT5Kz0IqwAmLXfkJdc57RLef9zPq3Z4pCoa+8rzvKtpjnjDPmM83Uc6L07s9DOA6HQSC8bSBnFXdlPp9cz3jaCM/rSiHnP8dcm70yJ1xwt7S0tLS0VJxLw5Enu74qicgv++kQOWOUuhUVqc2egaT1BnYUyHhpw7Vrhk48uor5a9Jxr3FRInm/2Irggh+ER+2X9KZG+jUXjr1TwqfxChUpvXiYFpqiwgLvMxnnNpWc9/GJnj2K6pJnBInL3ZRvzZCxi7bXj0XDgWz+QuFqLJQUpRNsxYfR9knI6b52uRwr5kpAo8U+m+R9rHiWMgSjCx1/pS2dRA567XC+ptWvX79+/fqny0OPp2tGLONylRMAAPpd76UVZtqut4zKVaMGAFD9Dc9W9JldPkPf8KTIp0jTk7xp56oB+VMe/ai24M9bwLUar63mu3nqw7GbQwuIuQpMU1qkVAmUJY3bpCb4bx0yldpAvmBRtlAXcZOorvrysb7OzX19JNJ+1daFMD0NCUworawRFmd0S9vIG/37B8hof++w7p696uQrH5y4M0whemaz/WUJylzXdekGOSUePPp3sP8qfuCNOS3SX8i5I5cLq8K2FXbk3bbQ60Frn8vVkBiRerrWGh8+kLnYcs63raHpJ/UAAPnb3lOSt87LLLQPHv+sLO9twyI2uajeNPBPEGqgDOWvy+Dn0hupv8yUl1/eNtYEKLtoZ2ERTMYW51xftmfpOZsyqI7y+YJty5yoZhpn7rVYa3JKFneeULnWWa2aQZXtDYuOnG0aJBSQs+aIsURLX1NeXHlcs+KGaovEFeQ+X2TJVoTgvIIDEki82VK0zFadRkVkGCHnwcfpA9jujaRLEVx88bJxH3r2pSc8L/XDQaplEycWIABAYe0jzr3YM4UFenuZ3kSzqGLOZk2S3bdgcNexMxenAA69/MaWBAAafX7Jz4CcdfpMXvJutuTtiZ9uB6h6epuOaY1zz61RS/RcQxHH9BEL2iozJo3+wgVyStse8uyYPWU25RQDBOL8/IBoFvWeb2tEINXMbXIq6mY+AElUeUy5IPFOVeU/QEjeBvMChYerAYAkJ4mPBXly7E8UHvRoJk5zdSZIdJG+jay+PiwCE04jEbI9jwCAU1B9ASLinsaFCQJAkk+K0CcSBIDcLz5SJxZXV1H8kvCnx/lEnKT+90mU4OlEeQ4hxElWOUp6lMvX3dJFs0EUTYScnmg+zIZ877XRkg/GDxvw2PjFXhA9LS90tAomiYi8a1G+k4WkRlMpPHyxEsHd9Mu+zNfm+gAkr1p7psTYvnqT+jncJCoK3Swse7VjF9uT8CRRRWlx7qZ1ezNfE2VbzuSfnyCEOImCg7y3fG8xqssPfQy2nvYistFKR7NotK2wWvEgp+7QqZaAyiBiNkPm9uYAMHyN5FjdC+XJY9VZ6yv2KahISQuFRK9Kr+R0wUV75HRbN0G+2is5/wFNKCeEtPUeJa9xSfs+A/u1P9kLemFZ5a890D4TTG2ujbbhgZztvFY5c03WOVK5p/zpLwDI6NQ+Sr61jqmjtLmXB0QTzRWI7PF5CkdHZC4wL7vLv9XhKK5HdpPq7ueOjCIQ+BSjlu3mTKv/YW6WK2T7P/cio7TrYltIzgh+ZlOS4vSbu0aNena4Vy1eFyIApK08+hhNXXUL6tLv5Fq9Y7Ely6xgE5wz+qF8PenM/rleZAuVkySCDJI/f7Dyf9eyufWLNFLxYZEUGd14acAaeGJHQgCQuS+2s++HcXAvN5pozkCe6rjKFrDtltKADoucbrxTOGuMj6ouJ6suxDIXi8yLQrkCuVvaNvq6XBaINFblnI7t1++B3ZZyIrKAln3KOc/MyRw5ldNQUaf9erUUGe0vDygeaBoe1USEnM4/51r9Z14XYQYRDDqy6adu1MtBdiCjW1o/Ydkd7O7bVSiZGaUzLppvSbr62iey6LaVYInTLRd+7PdfdMFPgeQ4o9OkFuKCyMsvegXZtVTIvvX0KDsmZ3snP6jmOaNr20XvwLKhEBWBU1d5SgszCzlywanCPc73Wgh/S55md6/sP/4FrGBZ+b/ERjT5So53ecIXcrCydevZvjpZ36ldeQ4PkKjYNOzU+3Zk1YMskiKnqb2PNp9uKBrY5LNHU3EFApnrLmvVxXzHccvgZh+5bu6vVmUBztxt1z20VfcsH375mpBVI1J6t7y3+O+IJ1azWcipx6vjd/9mIZHRL37TtbbsKXE3pbzD5nUhTB+rlk/01RnfN0E4jrhhf09D30gLxROGhUfNOeO5bRve9e7OjNeeOf86bXLu7ZGXb1r4xoAWjQb94ka+XhfMDqep1LIOpz2+JOO19LG/dlmd5gcZTbmvNbv+tUyj3vNu1yZP7v6depDotU83uXd+WsfPFj560sPlYatG5HRHFxFaMCE/F2IBrYYk85MOAUCk2juEQJIFSfuoyypcDiSRn+cQQHQrlCohTl5eghBAmlKNWRJ5+QkCgLSC+n39BPQ8AQDASRYkCSDSirS6n6T1nMTJz0sQQJ5KcZKXn3AAkLkpsxSdZH6SEEBOxem2JyJyN6XKECG4PxFx8vISDgBy16WYKRrJbIScQjR/KHdTPJFIOA4hRzWod2jVxL6ydauWusio3X5AhZ8kgthMM+Uv+yIktcBxEomE49RqdEKtIrJn86rFO8WBfiZLx0kkHYfUb3R09Wr7yn5d9lMK9aN+o/zMwjLoibJBlnIDnr0gJJFMJEjhGUfXqOWUlPz6dSnnVKFny99rCKLJyxiWUuApvQ0FLF6QUzFBoTn3cRbQ7ZiwrmDEAdOYCTkV7+/6XgFDEDoRv6+FJ78/igcU1RDFJXPiHJEgBybMqMxMkFHxt3Xp1iFF5Ma7eaGCWxIhp4BEsERQKRqejZyIPiM/wQZHjpw6CcdZvUYwDoicRb8/ZyOJwJFzowYiJLXwhJwlnMSWrZ8QECpJxtVOCcg4ZwnHWbESSIZhVKnq5WcWlsG1LJvgN6UQgScSDptHgAh6nHHl8ostf2QuOgDySpEXwyKt8Q+hQWsX4hBCANDHJknY/60KRT0QxwHiTya9UbvCQ4hDCAT4+gnYSsxxCAG09S7QeBFOk5QaTQkTIpr0ogS3JMrkrBYNpt/PDJXTsQbLUGFgSojIHpEjZqGM85FEab+SUxUHZE0cQmR5C36MCOB4HFsZNsrPKCwDjtdwQoQWHBFC5DGDTs+Wv9ceZRGLyvOXgq9tB7PgpbD72/JWg810xOZrpxFBIYscLETDIpphdhkqIzgJi5FlhvZQIJk/ffF1gkBYO2U2sQLjKolIurzt/GT+PMrGsFE6Qe1IC42QmmTusfoIhlWX1mL8yLa5xvgzQK4T/zCI5of8rxn+nxOMESNGjBgxYsSIESNGjBgxYsSIESNGjBgxYsSIESNGjBg+/D9ytN00UFj3+QAAAABJRU5ErkJggg=="
              height={65}
              preserveAspectRatio="xMidYMid meet"
            />
          </g>
        </mask>
      </g>
    </g>
  </svg>            <span className="font-light text-sm hidden md:block text-zinc-300">
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
        <div className="container mx-auto px-4 py-0 flex flex-col items-center mt-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-center">
            {t('home.title')}
          </h1>
          <p className="text-lg md:text-xl mb-8 text-center max-w-2xl text-zinc-300">
            {t('home.subtitle')}
          </p>

          {/* Search Bar */}
          <div className="relative w-full max-w-2xl">
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