"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: "Kshetra", href: "/rooms" },
    { name: "Airport Transport", href: "/airport-transport" },
    { name: "Rent a Vehicle", href: "/services" },
    { name: "Adventure Sports", href: "/adventure" },
    { name: "Contact", href: "/contact" },
  ];

  // Check if we're on the home page, yoga page, or payment pages to determine if navbar should be transparent
  const isHomePage = pathname === '/';
  const isYogaPage = pathname === '/yoga';
  const isPaymentPage = pathname?.includes('/yoga/booking/payment') || pathname?.includes('/booking/payment');
  const isAirportTransportPage = pathname === '/airport-transport';
  const isAirportTransportPaymentPage = pathname === '/airport-transport/payment';
  const isServicesPage = pathname === '/services';
  const isServicesPaymentPage = pathname === '/services/booking/payment';
  const isServicesDetailsPage = pathname === '/services/booking/details';
  const isServicesSuccessPage = pathname === '/services/booking/success';
  const isContactPage = pathname === '/contact';
  const isRoomsPage = pathname === '/rooms';
  const isAdventurePage = pathname === '/adventure';
  const isTransparentPage = isHomePage || isYogaPage || isPaymentPage || isAirportTransportPage || isAirportTransportPaymentPage || isServicesPage || isServicesPaymentPage || isServicesDetailsPage || isServicesSuccessPage || isContactPage || isRoomsPage || isAdventurePage;
  return (
    <header 
      className={`transition-all duration-300 ${isTransparentPage ? 'absolute top-0 left-0 right-0 z-50 bg-transparent' : 'sticky top-0 z-50 bg-black backdrop-blur-md shadow-sm'}`}
      style={isTransparentPage ? { backgroundColor: 'transparent', background: 'transparent' } : {}}
    >

      {/* Main header */}
      <div className="container mx-auto px-4 md:px-[100px] py-4">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 z-10 relative">
            <img src={"https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/logo_new.png"} className="w-24 h-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center">
            <div className="flex items-center gap-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`font-monomaniac-one transition-all duration-200 relative group cursor-pointer whitespace-nowrap text-md ${
                      isTransparentPage
                        ? 'text-gray-300 hover:text-white'
                        : isActive ? 'text-[#B23092]' : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Pinkrooms Section */}
          <div className="hidden lg:flex items-center gap-2">
            <img 
              src="https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/pinkroom.png?updatedAt=1762181371803" 
              alt="Kshetra Pinkrooms"
              className="w-28 h-12 object-contain"
            />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`lg:hidden p-2 transition-colors z-10 relative ml-auto ${isTransparentPage ? 'text-white hover:text-pink-500' : 'text-gray-700 hover:text-gray-900'}`}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className={`lg:hidden border-t backdrop-blur-md shadow-lg ${isTransparentPage ? 'bg-purple-900/95 border-purple-700' : 'bg-white/95 border-gray-200'}`}>
          <nav className="container mx-auto px-4 md:px-[100px] py-4">
            <div className="flex flex-col gap-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`font-monomaniac-one font-medium py-2 transition-all duration-200 cursor-pointer ${
                      isTransparentPage
                        ? isActive
                          ? 'text-pink-500 border-l-2 border-pink-500 pl-4'
                          : 'text-white hover:text-pink-500 hover:border-l-2 hover:border-pink-500 hover:pl-4'
                        : isActive
                        ? 'text-orange-500 border-l-2 border-orange-500 pl-4'
                        : 'text-gray-700 hover:text-orange-500 hover:border-l-2 hover:border-orange-500 hover:pl-4'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}