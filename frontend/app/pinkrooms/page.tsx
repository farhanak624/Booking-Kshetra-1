"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, Heart } from "lucide-react";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function PinkroomsPage() {
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
            alt="Pinkrooms - Coming Soon"
            className="w-full h-[120%] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-pink-900/60 via-purple-900/50 to-pink-800/60"></div>
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
              {/* Pinkrooms Logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-8"
              >
                <img
                  src="https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/pinkroom.png"
                  alt="Pinkrooms"
                  className="mx-auto w-64 md:w-80 lg:w-96 h-auto drop-shadow-2xl"
                />
              </motion.div>

              {/* Coming Soon Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-8"
              >
                <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full text-sm md:text-base font-semibold shadow-2xl">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  Coming Soon
                </span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight"
              >
                <span className="block uppercase tracking-wider mb-2 text-sm sm:text-base md:text-lg font-annie-telescope">
                  Something Extraordinary
                </span>
                <span className="block text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-water-brush italic mt-4">
                  is on the <span className="text-pink-300">Way</span>
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed font-urbanist"
              >
                We&apos;re crafting an extraordinary experience that will redefine luxury and comfort. Stay tuned for something truly special that will make your stay unforgettable.
              </motion.p>

              {/* Decorative Elements */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex justify-center items-center gap-4 mb-12"
              >
                <Heart className="w-8 h-8 text-pink-300 animate-pulse" />
                <Heart className="w-10 h-10 text-purple-300 animate-pulse" style={{ animationDelay: "0.2s" }} />
                <Heart className="w-8 h-8 text-pink-300 animate-pulse" style={{ animationDelay: "0.4s" }} />
              </motion.div>

              {/* Call to Action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Link
                  href="/rooms"
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-200 font-urbanist"
                >
                  Explore Our Rooms
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-pink-600 transform hover:scale-105 transition-all duration-200 font-urbanist"
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

