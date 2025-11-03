"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  Calendar,
  Users,
  Star,
  Hotel,
  Activity,
  Car,
  Bike,
  Camera,
  Waves,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Wifi,
  Coffee,
  Car as CarIcon,
  Utensils,
  Flower2,
  TreePine,
  Mountain,
  Sunset,
  MapPin,
  Phone,
  Mail,
  Clock,
  Award,
  Heart,
  Shield,
  CheckCircle2,
  Bath,
  Bed,
  AirVent,
  Tv,
  Plane,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { accommodationAPI } from "../lib/api";

interface Accommodation {
  _id: string;
  name: string;
  description: string;
  price: string;
  colorTheme: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal' | 'pink' | 'indigo';
  iconType: 'bed' | 'users' | 'hotel' | 'home' | 'building';
  images: string[];
  externalLink: string;
  isActive: boolean;
  displayOrder: number;
}

export default function Home() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [hoveredRoomType, setHoveredRoomType] = useState<string | null>(null);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  // Room type images
  const roomImages = {
    king: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520637836862-4d197d17c881?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    queen: [
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540518614846-7eded47d24e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    dormitory: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1595814432314-90095f342694?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    default: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
  };

  const mainServices = [
    {
      title: "Room Booking",
      category: "Accommodation",
      description:
        "Book your perfect stay at Kshetra Retreat Resort with our comfortable AC and Non-AC rooms, featuring modern amenities and serene views of Kerala's natural beauty.",
      features: [
        "AC & Non-AC Rooms Available",
        "Modern Amenities & Comfort",
        "Scenic Views of Kerala",
        "24/7 Room Service",
        "Free WiFi & Hot Water",
      ],
      price: "Starting from ₹2,500/night",
      image:
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      icon: Hotel,
      onClick: () =>
        window.open(
          "https://live.ipms247.com/booking/book-rooms-kshetraretreatvarkala",
          "_blank"
        ),
      color: "from-blue-600 to-blue-800",
    },
    {
      title: "Airport Transport",
      category: "Transportation",
      description:
        "Seamless airport pickup and drop services with professional drivers, flight tracking, and comfortable vehicles. Choose your terminal, add flight details, and enjoy hassle-free transfers.",
      features: [
        "Professional Airport Transfers",
        "Flight Delay Monitoring",
        "Terminal Selection (T1/T2/T3)",
        "Meet & Greet Service",
        "24/7 Support Available",
      ],
      price: "From ₹1,500/transfer",
      image:
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      icon: Car,
      onClick: () => router.push("/airport-transport"),
      color: "from-purple-600 to-indigo-800",
    },
    {
      title: "Yoga Sessions",
      category: "Wellness",
      description:
        "Transform your life through authentic yoga practice with our certified instructors. Join our 200hr & 300hr teacher training programs or daily yoga sessions.",
      features: [
        "200hr & 300hr Teacher Training",
        "Daily Morning & Evening Sessions",
        "Certified International Instructors",
        "Beach-side Yoga Practice",
        "Meditation & Pranayama",
      ],
      price: "From ₹1,500/session",
      image:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      icon: Activity,
      onClick: () => router.push("/yoga"),
      color: "from-orange-500 to-pink-600",
    },
    {
      title: "Adventure Services",
      category: "Activities",
      description:
        "Enhance your stay with our curated selection of services including bike rentals, surfing lessons, and local sightseeing tours for an unforgettable Kerala experience.",
      features: [
        "Bike Rentals for Exploration",
        "Professional Surfing Lessons",
        "Local Sightseeing Tours",
        "Cultural Experience Packages",
        "Adventure Activity Packages",
      ],
      price: "From ₹500/service",
      image:
        "https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      icon: Camera,
      onClick: () => router.push("/services"),
      color: "from-green-500 to-teal-600",
    },
  ];

  const testimonials = [
    {
      text: "Kshetra Retreat provided the perfect blend of relaxation and adventure. The yoga sessions were transformative!",
      author: "Sarah Johnson",
      location: "California, USA",
      rating: 5,
    },
    {
      text: "The room booking process was seamless and the accommodations exceeded our expectations. Beautiful location!",
      author: "Raj Patel",
      location: "Mumbai, India",
      rating: 5,
    },
    {
      text: "Amazing services! The surfing lessons were incredible and the bike rentals made exploring Kerala so easy.",
      author: "Maria Santos",
      location: "São Paulo, Brazil",
      rating: 5,
    },
  ];

  // Fetch accommodations on component mount
  useEffect(() => {
    const fetchAccommodations = async () => {
      try {
        const response = await accommodationAPI.getAllAccommodations();
        if (response.data.success) {
          setAccommodations(response.data.data.accommodations);
        }
      } catch (error) {
        console.error('Failed to fetch accommodations:', error);
      }
    };

    fetchAccommodations();
  }, []);

  // Carousel auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % mainServices.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Testimonials auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % mainServices.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + mainServices.length) % mainServices.length
    );
  };

  // Helper function to get icon component
  const getIconComponent = (iconType: string) => {
    const iconMap: { [key: string]: any } = {
      bed: Bed,
      users: Users,
      hotel: Hotel,
      home: Hotel, // Using Hotel as fallback
      building: Hotel, // Using Hotel as fallback
    };
    return iconMap[iconType] || Hotel;
  };

  // Helper function to get color theme classes
  const getColorThemeClasses = (theme: string) => {
    const themeClasses: { [key: string]: string } = {
      blue: 'bg-blue-500/20 shadow-lg shadow-blue-500/25',
      green: 'bg-green-500/20 shadow-lg shadow-green-500/25',
      purple: 'bg-purple-500/20 shadow-lg shadow-purple-500/25',
      orange: 'bg-orange-500/20 shadow-lg shadow-orange-500/25',
      red: 'bg-red-500/20 shadow-lg shadow-red-500/25',
      teal: 'bg-teal-500/20 shadow-lg shadow-teal-500/25',
      pink: 'bg-pink-500/20 shadow-lg shadow-pink-500/25',
      indigo: 'bg-indigo-500/20 shadow-lg shadow-indigo-500/25',
    };
    return themeClasses[theme] || themeClasses.blue;
  };

  // Helper function to get color theme icon classes
  const getColorThemeIconClasses = (theme: string) => {
    const themeClasses: { [key: string]: string } = {
      blue: 'bg-blue-500/20 text-blue-400',
      green: 'bg-green-500/20 text-green-400',
      purple: 'bg-purple-500/20 text-purple-400',
      orange: 'bg-orange-500/20 text-orange-400',
      red: 'bg-red-500/20 text-red-400',
      teal: 'bg-teal-500/20 text-teal-400',
      pink: 'bg-pink-500/20 text-pink-400',
      indigo: 'bg-indigo-500/20 text-indigo-400',
    };
    return themeClasses[theme] || themeClasses.blue;
  };

  // Helper function to get text color classes
  const getTextColorClasses = (theme: string) => {
    const themeClasses: { [key: string]: string } = {
      blue: 'text-blue-400',
      green: 'text-green-400',
      purple: 'text-purple-400',
      orange: 'text-orange-400',
      red: 'text-red-400',
      teal: 'text-teal-400',
      pink: 'text-pink-400',
      indigo: 'text-indigo-400',
    };
    return themeClasses[theme] || themeClasses.blue;
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section - Tropical Night Theme */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://ik.imagekit.io/8xufknozx/hero.png?updatedAt=1762180200710"
            alt="Kshetra Retreat Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="max-w-3xl"
            >
              {/* Main Heading */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
                <span className="block uppercase tracking-wider mb-2 font-annie-telescope">BOOK ROOMS & SERVICES</span>
                <span className="block text-6xl md:text-7xl lg:text-8xl font-water-brush italic mt-4">
                  All In <span className="text-pink-500">One</span> Place
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg md:text-xl text-white/90 mb-12 max-w-xl leading-relaxed font-annie-telescope">
                Find the perfect stay and trusted services in seconds. Browse rooms, book instantly, and get reliable help at your fingertips.
              </p>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  window.open(
                    "https://live.ipms247.com/booking/book-rooms-kshetraretreatvarkala",
                    "_blank"
                  )
                }
                className="bg-pink-500 hover:bg-pink-600 text-white font-semibold text-lg px-10 py-4 rounded-2xl transition-all duration-300 shadow-lg font-urbanist"
              >
                Start Your Booking
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Kerala's Spirit Section */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/hero2.png"
            alt="Where Kerala's Spirit Meets Coastal Serenity"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
              {/* Left Side - Text Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="text-white"
              >
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight font-water-brush">
                  Where Kerala's Spirit
                </h1>
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight font-water-brush">
                  <span className="text-white">Meets</span> <span className="text-pink-500">Coastal Serenity</span>
                </h2>

                <div className="space-y-6 text-lg md:text-xl leading-relaxed font-urbanist text-white/90">
                  <p>
                    Welcome to Kshetra Retreat, a boutique hideaway perched near the iconic North Cliff of Varkala Beach — Kerala's best-kept coastal secret. More than just a stay, Kshetra is a soulful experience crafted around nature, tradition, wellness, and exploration.
                  </p>
                  
                  <p>
                    Here, your journey through Kerala begins at your doorstep. Step out to five stunning beaches within minutes, sail through tranquil backwaters and houseboats of Kollam just 20 km away, or trek through the misty Western Ghats and Ponmudi tea gardens about 50 km from us. From Kathakali's birthplace in Kottarakara (25 km) to the Raja Ravi Varma Palace (19 km) and royal palaces of Trivandrum (25 km) — every essence of Kerala lies within a short journey.
                  </p>
                  
                  <p>
                    At Kshetra, we bring this all together — boutique comfort, heartfelt hospitality, and the unmatched advantage of staying in the true cross-section of Kerala tourism.
                  </p>
                </div>
              </motion.div>

            
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-extralight text-white mb-6">
              What Our Guests Say
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Real experiences from travelers who found their perfect retreat
            </p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <motion.div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentTestimonial * 100}%)`,
                }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8 }}
                      className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 text-center text-white"
                    >
                      <div className="flex justify-center mb-6">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-8 h-8 fill-yellow-400 text-yellow-400 mx-1"
                          />
                        ))}
                      </div>

                      <blockquote className="text-2xl md:text-3xl font-light mb-8 leading-relaxed italic">
                        "{testimonial.text}"
                      </blockquote>

                      <div className="text-xl font-semibold mb-2">
                        {testimonial.author}
                      </div>
                      <div className="text-lg opacity-80">
                        {testimonial.location}
                      </div>
                    </motion.div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Testimonial Indicators */}
            <div className="flex justify-center mt-8 gap-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial
                      ? "bg-white w-8"
                      : "bg-white/50 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Room Booking Section with Parallax */}
      <section className="relative py-32 overflow-hidden">
        {/* Parallax Background */}
        <motion.div
          style={{
            y: useTransform(scrollYProgress, [0.3, 0.7], ["0%", "-20%"]),
          }}
          className="absolute inset-0 z-0"
        >
          <div
            className="w-full h-[120%] bg-cover bg-center bg-fixed"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
            }}
          />
        </motion.div>

        <div className="absolute inset-0 bg-black/60 z-10" />

        <div className="relative z-20 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center text-white mb-16"
          >
            <h2 className="text-6xl md:text-7xl font-extralight mb-6">
              Luxury{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Accommodation
              </span>
            </h2>
            <p className="text-2xl md:text-3xl opacity-90 max-w-4xl mx-auto leading-relaxed">
              Choose from our carefully designed rooms that blend traditional
              Kerala architecture with modern luxury
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Room Details */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8">
                <h3 className="text-4xl font-bold text-white mb-6 flex items-center gap-3">
                  <Hotel className="w-10 h-10 text-blue-400" />
                  Our Luxury Accommodations
                </h3>

                <div className="space-y-6">
                  {accommodations.map((accommodation, index) => {
                    const IconComponent = getIconComponent(accommodation.iconType);

                    return (
                      <motion.div
                        key={accommodation._id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        onMouseEnter={() => setHoveredRoomType(accommodation._id)}
                        onMouseLeave={() => setHoveredRoomType(null)}
                        onClick={() =>
                          window.open(
                            accommodation.externalLink,
                            "_blank"
                          )
                        }
                        className={`flex items-center gap-4 text-white cursor-pointer p-4 rounded-lg transition-all duration-300 ${
                          hoveredRoomType === accommodation._id
                            ? getColorThemeClasses(accommodation.colorTheme)
                            : "hover:bg-white/10"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorThemeIconClasses(accommodation.colorTheme)}`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold">{accommodation.name}</h4>
                          <p className="text-white/80">
                            {accommodation.description}
                          </p>
                          <p className={`font-semibold mt-1 ${getTextColorClasses(accommodation.colorTheme)}`}>
                            {accommodation.price}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                      </motion.div>
                    );
                  })}

                  {accommodations.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-white/60">Loading accommodations...</p>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-8">
                  {[
                    { icon: AirVent, text: "Air Conditioning" },
                    { icon: Wifi, text: "Free WiFi" },
                    { icon: Tv, text: "Smart TV" },
                    { icon: Bath, text: "Private Bathroom" },
                    { icon: Coffee, text: "Tea/Coffee Maker" },
                    { icon: Shield, text: "24/7 Security" },
                  ].map((amenity, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: idx * 0.1 }}
                      className="flex items-center gap-3 text-white/90"
                    >
                      <amenity.icon className="w-5 h-5 text-blue-400" />
                      <span>{amenity.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  window.open(
                    "https://live.ipms247.com/booking/book-rooms-kshetraretreatvarkala",
                    "_blank"
                  )
                }
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-6 px-8 rounded-2xl text-xl font-bold shadow-2xl flex items-center justify-center gap-3 group"
              >
                <Hotel className="w-6 h-6" />
                Book Your Perfect Room Now
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </motion.button>
            </motion.div>

            {/* Accommodation Images Gallery */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              {/* Accommodation Type Indicator */}
              <div className="mb-4 text-center">
                <p className="text-white/60 text-sm">
                  {hoveredRoomType
                    ? `Viewing ${accommodations.find(acc => acc._id === hoveredRoomType)?.name || 'Accommodation'} Images`
                    : "Hover over accommodations to see images"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {hoveredRoomType && accommodations.find(acc => acc._id === hoveredRoomType)?.images.length ? (
                  accommodations.find(acc => acc._id === hoveredRoomType)!.images.map((image, idx) => {
                    const accommodation = accommodations.find(acc => acc._id === hoveredRoomType)!;
                    const IconComponent = getIconComponent(accommodation.iconType);

                    return (
                      <motion.div
                        key={`${hoveredRoomType}-${idx}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.4, delay: idx * 0.1 }}
                        whileHover={{ scale: 1.05, y: -10 }}
                        className="relative overflow-hidden rounded-2xl group"
                      >
                        <img
                          src={image}
                          alt={`${accommodation.name} ${idx + 1}`}
                          className="w-full h-48 object-cover transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                        {/* Image overlay with accommodation type label */}
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 bg-${accommodation.colorTheme}-500/80 text-white`}>
                            <IconComponent className="w-3 h-3" />
                            <span>{accommodation.name}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  // Default images when no accommodation is hovered
                  roomImages.default.map((image, idx) => (
                    <motion.div
                      key={`default-${idx}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                      whileHover={{ scale: 1.05, y: -10 }}
                      className="relative overflow-hidden rounded-2xl group"
                    >
                      <img
                        src={image}
                        alt={`Accommodation ${idx + 1}`}
                        className="w-full h-48 object-cover transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white/80">
                          <Hotel className="w-3 h-3" />
                          <span>Our Accommodations</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Hover instruction */}
              {!hoveredRoomType && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="bg-black/60 backdrop-blur-sm rounded-2xl px-6 py-4 text-center">
                    <p className="text-white text-lg font-semibold mb-2">
                      Interactive Accommodation Gallery
                    </p>
                    <p className="text-white/80 text-sm">
                      Hover over accommodations on the left to see specific images
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Comprehensive Yoga Section with Parallax */}
      <section className="relative py-32 overflow-hidden">
        {/* Parallax Background */}
        <motion.div
          style={{
            y: useTransform(scrollYProgress, [0.4, 0.8], ["0%", "-30%"]),
          }}
          className="absolute inset-0 z-0"
        >
          <div
            className="w-full h-[130%] bg-cover bg-center bg-fixed"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
            }}
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-r from-orange-900/70 via-pink-900/70 to-purple-900/70 z-10" />

        <div className="relative z-20 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center text-white mb-20"
          >
            <h2 className="text-6xl md:text-7xl font-extralight mb-6">
              Yoga &{" "}
              <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                Wellness
              </span>
            </h2>
            <p className="text-2xl md:text-3xl opacity-90 max-w-4xl mx-auto leading-relaxed">
              Transform your body, mind, and soul with authentic yoga practices
              in the birthplace of Ayurveda
            </p>
          </motion.div>

          {/* Enhanced Yoga & Wellness Section */}
          <div className="max-w-6xl mx-auto">
            {/* Main Hero Card */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 mb-12 text-center"
            >
              <div className="mb-8">
                <div className="w-24 h-24 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Activity className="w-12 h-12 text-orange-400" />
                </div>
                <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Transform Your Life Through Yoga
                </h3>
                <p className="text-xl md:text-2xl text-white/80 leading-relaxed max-w-4xl mx-auto">
                  Experience authentic yoga practices in the birthplace of
                  Ayurveda. Our comprehensive programs blend traditional wisdom
                  with modern teaching methods in the serene setting of Varkala
                  Beach.
                </p>
              </div>

              {/* Key Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-3xl font-bold text-orange-400 mb-1">
                    200+
                  </div>
                  <div className="text-white/70 text-sm">Students Trained</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-3xl font-bold text-pink-400 mb-1">
                    15+
                  </div>
                  <div className="text-white/70 text-sm">Years Experience</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-3xl font-bold text-blue-400 mb-1">
                    5+
                  </div>
                  <div className="text-white/70 text-sm">Expert Teachers</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-3xl font-bold text-green-400 mb-1">
                    24/7
                  </div>
                  <div className="text-white/70 text-sm">Support</div>
                </div>
              </div>
            </motion.div>

            {/* Why Choose Us */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-12"
            >
              <h4 className="text-2xl font-bold text-white text-center mb-8">
                Benefits of Yoga at Kshetra
              </h4>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-orange-400" />
                  </div>
                  <h5 className="text-white font-semibold mb-2">
                    Physical Wellness
                  </h5>
                  <p className="text-white/70 text-sm">
                    Improve flexibility, strength, posture, and overall physical
                    health through guided practice
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-blue-400" />
                  </div>
                  <h5 className="text-white font-semibold mb-2">
                    Mental Clarity
                  </h5>
                  <p className="text-white/70 text-sm">
                    Reduce stress, enhance focus, and achieve mental peace
                    through meditation and mindfulness
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-green-400" />
                  </div>
                  <h5 className="text-white font-semibold mb-2">
                    Spiritual Growth
                  </h5>
                  <p className="text-white/70 text-sm">
                    Connect with your inner self and discover deeper meaning
                    through ancient wisdom and practices
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/yoga")}
                className="group bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white py-6 px-12 rounded-2xl text-2xl font-bold shadow-2xl flex items-center justify-center gap-4 mx-auto transition-all duration-300"
              >
                <Activity className="w-8 h-8" />
                Explore Yoga Programs
                <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
              </motion.button>

              <p className="text-white/60 text-sm mt-4">
                Discover all our yoga offerings, schedules, and book your
                perfect session
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Resort Food & Dining Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Parallax Background */}
        <motion.div
          style={{ y: useTransform(scrollYProgress, [0.6, 1], ["0%", "-25%"]) }}
          className="absolute inset-0 z-0"
        >
          <div
            className="w-full h-[125%] bg-cover bg-center bg-fixed"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
            }}
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 via-yellow-900/80 to-orange-900/80 z-10" />

        <div className="relative z-20 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center text-white mb-20"
          >
            <h2 className="text-6xl md:text-7xl font-extralight mb-6">
              Culinary{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Experience
              </span>
            </h2>
            <p className="text-2xl md:text-3xl opacity-90 max-w-4xl mx-auto leading-relaxed">
              Savor authentic Kerala cuisine prepared with organic ingredients
              and traditional recipes
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Food Details */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8">
                <h3 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
                  <Utensils className="w-10 h-10 text-yellow-400" />
                  Our Restaurant
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-yellow-300 mb-3">
                      Traditional Kerala Cuisine
                    </h4>
                    {[
                      "Fish Curry & Rice - ₹350",
                      "Appam & Stew - ₹280",
                      "Kerala Breakfast - ₹250",
                      "Thali Meals - ₹320",
                    ].map((dish, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                        className="flex items-center gap-3 text-white/90"
                      >
                        <CheckCircle2 className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm">{dish}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-orange-300 mb-3">
                      International Menu
                    </h4>
                    {[
                      "Continental Breakfast - ₹450",
                      "Italian Pasta - ₹380",
                      "Healthy Salads - ₹250",
                      "Fresh Juices - ₹120",
                    ].map((dish, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                        className="flex items-center gap-3 text-white/90"
                      >
                        <CheckCircle2 className="w-4 h-4 text-orange-400" />
                        <span className="text-sm">{dish}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 p-6 bg-white/10 rounded-2xl">
                  <h4 className="text-2xl font-bold text-white mb-4">
                    Special Dining Experiences
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 p-4 rounded-xl">
                      <h5 className="font-semibold text-yellow-300 mb-2">
                        Sunset Beach Dinner
                      </h5>
                      <p className="text-white/80 text-sm mb-2">
                        Romantic candlelight dining by the beach
                      </p>
                      <p className="text-yellow-300 font-bold">
                        ₹2,500 per couple
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-green-600/20 to-teal-600/20 p-4 rounded-xl">
                      <h5 className="font-semibold text-green-300 mb-2">
                        Cooking Classes
                      </h5>
                      <p className="text-white/80 text-sm mb-2">
                        Learn traditional Kerala recipes
                      </p>
                      <p className="text-green-300 font-bold">
                        ₹1,800 per person
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/services')}
                className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white py-6 px-8 rounded-2xl text-xl font-bold shadow-2xl flex items-center justify-center gap-3 group"
              >
                <Utensils className="w-6 h-6" />
                Explore Dining Options
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </motion.button> */}
            </motion.div>

            {/* Food Images */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                {[
                  "https://images.unsplash.com/photo-1596797038530-2c107229654b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                ].map((image, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    whileHover={{ scale: 1.05, y: -10 }}
                    className="relative overflow-hidden rounded-2xl"
                  >
                    <img
                      src={image}
                      alt={`Food ${idx + 1}`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Resort Amenities Section */}
      <section className="py-32 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center text-white mb-20"
          >
            <h2 className="text-6xl md:text-7xl font-extralight mb-6">
              Resort{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Amenities
              </span>
            </h2>
            <p className="text-2xl opacity-90 max-w-3xl mx-auto">
              Everything you need for a perfect retreat experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Wifi,
                title: "High-Speed WiFi",
                desc: "Stay connected throughout your stay",
              },
              {
                icon: CarIcon,
                title: "Free Parking",
                desc: "Secure parking for all guests",
              },
              {
                icon: Coffee,
                title: "24/7 Room Service",
                desc: "Round-the-clock dining service",
              },
              {
                icon: Flower2,
                title: "Spa & Wellness",
                desc: "Rejuvenate with Ayurvedic treatments",
              },
              {
                icon: Activity,
                title: "Yoga Shala",
                desc: "Dedicated yoga and meditation space",
              },
              {
                icon: Mountain,
                title: "Beach Access",
                desc: "Direct access to Varkala Beach",
              },
              {
                icon: Shield,
                title: "24/7 Security",
                desc: "Safe and secure environment",
              },
              {
                icon: Phone,
                title: "Concierge Service",
                desc: "Personal assistance for all needs",
              },
            ].map((amenity, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                whileHover={{ y: -10 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center text-white hover:bg-white/20 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <amenity.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{amenity.title}</h3>
                <p className="text-white/80 text-sm">{amenity.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
