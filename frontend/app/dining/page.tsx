"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, Utensils } from "lucide-react";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function DiningPage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background Image with Parallax */}
        <motion.div
          className="absolute inset-0"
          style={{ y }}
        >
          <img
            src="https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/Kshetra/hotel.png?updatedAt=1763030443251"
            alt="Dining - Coming Soon"
            className="w-full h-[120%] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-orange-900/60 via-amber-900/50 to-yellow-800/60"></div>
        </motion.div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center">
          <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px] pt-32 sm:pt-36 md:pt-40 lg:pt-44">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="max-w-4xl mx-auto text-center"
            >
              {/* Coming Soon Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-8"
              >
                <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full text-sm md:text-base font-semibold shadow-2xl">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  Coming Soon
                </span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight"
              >
                <span className="block uppercase tracking-wider mb-2 text-sm sm:text-base md:text-lg font-annie-telescope">
                  A Culinary Experience
                </span>
                <span className="block text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-water-brush italic mt-4">
                  Like No <span className="text-orange-300">Other</span>
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed font-urbanist"
              >
                We&apos;re preparing an extraordinary dining experience that celebrates local flavors and international cuisine. Get ready to savor authentic Kerala dishes and delightful culinary creations that will tantalize your taste buds.
              </motion.p>

              {/* Decorative Elements */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex justify-center items-center gap-4 mb-12"
              >
                <Utensils className="w-8 h-8 text-orange-300 animate-pulse" />
                <Utensils className="w-10 h-10 text-amber-300 animate-pulse" style={{ animationDelay: "0.2s" }} />
                <Utensils className="w-8 h-8 text-orange-300 animate-pulse" style={{ animationDelay: "0.4s" }} />
              </motion.div>

              {/* Call to Action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Link
                  href="/rooms"
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-200 font-urbanist"
                >
                  Explore Our Rooms
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-orange-600 transform hover:scale-105 transition-all duration-200 font-urbanist"
                >
                  Contact Us
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

