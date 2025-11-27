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
    { name: "Yoga", href: "/yoga" },
    { name: "Airport Transfers", href: "/airport-transport" },
    { name: "Rent a Vehicle", href: "/services" },
    { name: "Adventure Sports", href: "/adventure" },
    { name: "Contact", href: "/contact" },
  ];

  // Check if we're on the home page, yoga page, or payment pages to determine if navbar should be transparent
  const isHomePage = pathname === "/";
  const isYogaPage = pathname === "/yoga";
  const isPaymentPage =
    pathname?.includes("/yoga/booking/payment") ||
    pathname?.includes("/booking/payment");
  const isAirportTransportPage = pathname === "/airport-transport";
  const isAirportTransportPaymentPage =
    pathname === "/airport-transport/payment";
  const isServicesPage = pathname === "/services";
  const isServicesPaymentPage = pathname === "/services/booking/payment";
  const isServicesDetailsPage = pathname === "/services/booking/details";
  const isServicesSuccessPage = pathname === "/services/booking/success";
  const isContactPage = pathname === "/contact";
  const isRoomsPage = pathname === "/rooms";
  const isAdventurePage = pathname === "/adventure";
  const isTermsPage = pathname === "/terms";
  const isTransparentPage =
    isHomePage ||
    isYogaPage ||
    isPaymentPage ||
    isAirportTransportPage ||
    isAirportTransportPaymentPage ||
    isServicesPage ||
    isServicesPaymentPage ||
    isServicesDetailsPage ||
    isServicesSuccessPage ||
    isContactPage ||
    isRoomsPage ||
    isAdventurePage ||
    isTermsPage;
  return (
    <header
      className={`transition-all duration-300 ${
        isTransparentPage
          ? "absolute top-0 left-0 right-0 z-50 bg-black/20 "
          : "sticky top-0 z-50 bg-black/30  shadow-sm"
      }`}
    >
      {/* Main header */}
      <div className="container mx-auto px-4 sm:px-6 md:px-2 lg:px-4 xl:px-[100px] 2xl:px-[120px] py-4">
        <div className="flex items-center gap-4 lg:gap-5 xl:gap-6 2xl:gap-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 z-10 relative flex-shrink-0"
          >
            <img
              src={
                "https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/logo_new.png"
              }
              className="w-32 md:w-32 lg:w-32 xl:w-36 2xl:w-40 h-auto transition-all"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center flex-1 min-w-0 justify-center">
            <div className="flex items-center gap-3 lg:gap-4 xl:gap-6 2xl:gap-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`font-monomaniac-one transition-all duration-200 relative group cursor-pointer whitespace-nowrap text-base lg:text-lg xl:text-lg ${
                      isTransparentPage
                        ? "text-gray-300 hover:text-white"
                        : isActive
                        ? "text-[#B23092]"
                        : "text-gray-700 hover:text-gray-900"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}

              {/* Pinkrooms Section - moved inside nav */}
              <div className="flex items-center gap-2 cursor-pointer flex-shrink-0 ml-4">
                <img
                  src="https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/pinkroom.png"
                  alt="Kshetra Pinkrooms"
                  className="w-32 md:w-36 lg:w-56 xl:w-64 2xl:w-72 h-auto object-contain"
                />
              </div>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`lg:hidden p-2 transition-colors z-10 relative ml-auto ${
              isTransparentPage
                ? "text-white hover:text-pink-500"
                : "text-gray-700 hover:text-gray-900"
            }`}
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
        <div
          className={`lg:hidden border-t backdrop-blur-md shadow-lg ${
            isTransparentPage
              ? "bg-purple-900/95 border-purple-700"
              : "bg-white/95 border-gray-200"
          }`}
        >
          <nav className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px] py-4">
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
                          ? "text-pink-500 border-l-2 border-pink-500 pl-4"
                          : "text-white hover:text-pink-500 hover:border-l-2 hover:border-pink-500 hover:pl-4"
                        : isActive
                        ? "text-orange-500 border-l-2 border-orange-500 pl-4"
                        : "text-gray-700 hover:text-orange-500 hover:border-l-2 hover:border-orange-500 hover:pl-4"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}

              {/* Pinkrooms Section for Mobile */}
              <div className="flex items-center justify-center pt-4 border-t border-gray-300/20">
                <img
                  src="https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/pinkroom.png"
                  alt="Kshetra Pinkrooms"
                  className="w-40 h-auto object-contain cursor-pointer"
                />
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
