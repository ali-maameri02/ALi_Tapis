// src/components/Layout.tsx
import { Header } from './Landing/Header';
import { Outlet } from 'react-router-dom';

export const RootLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-black via-black to-zinc-900 text-white">
      <Header />
      <main className="pt-5"> {/* Adjust padding to account for fixed header */}
        <Outlet /> {/* This renders the matched route */}
      </main>
    </div>
  );
};