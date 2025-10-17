"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Crown, Phone, Mail, Shield } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Yoga", href: "/yoga" },
    { name: "Airport Transport", href: "/airport-transport" },
    { name: "Adventure Sports", href: "/services" },
    { name: "Track Booking", href: "/track-booking" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            {/* <div className="bg-gradient-to-r p-2 rounded-lg shadow-lg"> */}
              <img src={"https://ik.imagekit.io/8xufknozx/logo_new1.png?updatedAt=1760692215408"} className="w-12 h-12" />
            {/* </div> */}
            {/* <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">KSHETRA</h1>
              <p className="text-sm text-gray-600 font-light tracking-wider">
                RETREAT
              </p>
            </div> */}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`font-medium transition-all duration-200 relative group cursor-pointer ${
                    isActive
                      ? 'text-orange-500'
                      : 'text-gray-700 hover:text-orange-500'
                  }`}
                >
                  {item.name}
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-orange-500 transition-all duration-300 ${
                    isActive
                      ? 'w-full'
                      : 'w-0 group-hover:w-full'
                  }`}></span>
                </Link>
              );
            })}
          </nav>

          {/* Spacer for balance */}
          <div className="hidden md:block w-32"></div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-gray-900"
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
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg">
          <nav className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`font-medium py-2 transition-all duration-200 cursor-pointer ${
                      isActive
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