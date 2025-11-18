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
import Link from "next/link";

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
  const [currentWellnessSlide, setCurrentWellnessSlide] = useState(0);
  const [currentMainServiceSlide, setCurrentMainServiceSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [hoveredRoomType, setHoveredRoomType] = useState<string | null>(null);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const wellnessSlides = [
    {
      id: "wellness-soul",
      heading: "Wellness That",
      highlight: "Touches the Soul",
      description:
        "Find inner balance with daily yoga sessions, guided meditation, and Ayurveda therapies designed to heal body and mind. Whether you're here for a rejuvenating break or a certified yoga teacher training, Kshetra's serene setting and experienced instructors make it effortless to reconnect with yourself.",
      background:
        "https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/crbg1.png?updatedAt=1762755561353",
      cardImage:
        "https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/cr1.png?updatedAt=1762755559262",
      cardAlt: "Sunrise yoga above misty mountains",
      visualImage:
        "https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/carausel1.png",
      visualAlt: "Meditating monk at sunrise over lotus pond",
      ctaLabel: "Explore Now",
      ctaLink: "/yoga",
      highlightColor: "#B23092",
      metaLabel: "WELLNESS & EXPERIENCES HIGHLIGHT",
    },
    {
      id: "ayurveda-calm",
      heading: "Adventure Awaits",
      highlight: "Beyond the Waves",
      description:
        "Step out of your room and into adventure. Learn to surf the rolling Arabian Sea, kayak through serene lagoons, paraglide above dramatic cliffs, or trek through lush forest trails. Our team curates unforgettable experiences — from sunrise beach walks to sunset houseboat cruises — so you make the most of every moment in Varkala. ",
      background:
        "https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/crbg2.png?updatedAt=1762758524024",
      cardImage:
        "https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/cr4.png?updatedAt=1762758519609",
      cardAlt: "Ayurvedic massage setup with herbal oils",
      visualImage:
        "https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/carausel2.png",
      visualAlt: "Therapist preparing ayurvedic treatment",
      ctaLabel: "Explore Now",
      ctaLink: "/services",
      highlightColor: "#F472B6",
      metaLabel: "CULINARY PREVIEW",
    },
    {
      id: "mindful-retreats",
      heading: "Taste Kerala’s Flavours at  ",
      highlight: "Our Courtyard Restaurant",
      description:
        "Savour Kerala’s heritage and global cuisines in our open-air courtyard restaurant. From traditional Kerala sadhya and seafood grills to fresh juices and international favourites, our kitchen celebrates seasonal produce and local flavours, creating meals that are as memorable as the sunsets.",
      background:
        "https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/crbg4.png?updatedAt=1762758521798",
      cardImage:
        "https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/cr3.png?updatedAt=1762758519740",
      cardAlt: "Guests meditating beneath palm trees at dusk",
      visualImage:
        "https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/carausel3.png",
      visualAlt: "Glasshouse wellness pavilion under palm trees",
      ctaLabel: "Explore Now",
      highlightColor: "#F97316",
      ctaLink: "/services",
      metaLabel: "NEARBY ATTRACTIONS SNAPSHOT",
    },
    {
      id: "detox-journeys",
      heading: "Explore More,",
      highlight: "Every Day",
      description:
        "Varkala’s unique location makes day trips effortless. Visit Ponmudi tea estates, marvel at Trivandrum’s palaces, explore the Thenmala eco-forest, or watch a Kathakali performance in its birthplace — all while returning to the comfort of your seaside retreat by nightfall.",
      background:
        "https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/crbg3.png?updatedAt=1762758524100",
      cardImage:
        "https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/cr2.png?updatedAt=1762758520155",
      cardAlt: "Sattvic meal setup with fresh ingredients",
      visualImage:
        "https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/carausel4.png",
      visualAlt: "Guest enjoying detox herbal infusion in garden",
      ctaLabel: "Explore Now",
      highlightColor: "#22D3EE",
      ctaLink: "/yoga",
      metaLabel: "YOGA & WELLNESS HIGHLIGHT",
    },
  ];

  const activeWellnessSlide = wellnessSlides[currentWellnessSlide];

  const comfortAmenities = [
    {
      title: "High-Speed WiFi",
      description: "Stay connected throughout your stay.",
      image:
        "https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/setup1.png",
    },
    {
      title: "Free Parking",
      description: "Secure parking for all guests.",
      image:
        "https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/Kshetra/Group%2035.png?updatedAt=1762766839424",
    },
    {
      title: "24/7 Room Service",
      description: "Round-the-clock dining service.",
      image:
        "https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/Kshetra/Group%2036.png?updatedAt=1762766839364",
    },
    {
      title: "Spa & Wellness",
      description: "Rejuvenate with Ayurvedic treatments.",
      image:
        "https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/Kshetra/Group%2037.png?updatedAt=1762766839423",
    },
    {
      title: "Yoga Shala",
      description: "Dedicated yoga and meditation space.",
      image:
        "https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/Kshetra/Group%2039.png?updatedAt=1762766839543",
    },
    {
      title: "Beach Access",
      description: "Direct access to Varkala Beach.",
      image:
        "https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/Kshetra/Group%2040.png?updatedAt=1762766839538",
    },
    {
      title: "24/7 Security",
      description: "Safe and secure environment.",
      image:
        "https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/Kshetra/Group%2041.png?updatedAt=1762766839517",
    },
    {
      title: "Concierge Service",
      description: "Personal assistance for all needs.",
      image:
        "https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/Kshetra/Group%2042.png?updatedAt=1762766839444",
    },
  ];

  const handleWellnessPrev = () => {
    setCurrentWellnessSlide((prev) =>
      prev === 0 ? wellnessSlides.length - 1 : prev - 1
    );
  };

  const handleWellnessNext = () => {
    setCurrentWellnessSlide((prev) =>
      prev === wellnessSlides.length - 1 ? 0 : prev + 1
    );
  };

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
      setCurrentMainServiceSlide(
        (prev) => (prev + 1) % mainServices.length
      );
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
    setCurrentMainServiceSlide((prev) => (prev + 1) % mainServices.length);
  };

  const prevSlide = () => {
    setCurrentMainServiceSlide(
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
          <div className="container mx-auto px-4 md:px-[100px]">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="max-w-3xl"
            >
              {/* Main Heading */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
                <span className="block uppercase tracking-wider mb-2 font-annie-telescope">
                  BOOK ROOMS & SERVICES
                </span>
                <span className="block text-6xl md:text-7xl lg:text-8xl font-water-brush italic mt-4">
                  All In <span className="text-[#B23092]">One</span> Place
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg md:text-xl text-white/90 mb-12 max-w-xl leading-relaxed font-annie-telescope">
                Find the perfect stay and trusted services in seconds. Browse
                rooms, book instantly, and get reliable help at your fingertips.
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
                className="bg-[#B23092] hover:bg-[#B23092]/80 text-white font-semibold text-lg px-10 py-4 rounded-full transition-all duration-300 shadow-lg font-urbanist"
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
          <div className="container mx-auto px-4 md:px-[100px]">
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
                  <span className="text-white">Meets</span>{" "}
                  <span className="text-[#B23092]">Coastal Serenity</span>
                </h2>

                <div className="space-y-6 text-lg md:text-xl leading-relaxed font-urbanist text-white/90">
                  <p>
                    Welcome to Kshetra Retreat, a boutique hideaway perched near
                    the iconic North Cliff of Varkala Beach — Kerala's best-kept
                    coastal secret. More than just a stay, Kshetra is a soulful
                    experience crafted around nature, tradition, wellness, and
                    exploration.
                  </p>

                  <p>
                    Here, your journey through Kerala begins at your doorstep.
                    Step out to five stunning beaches within minutes, sail
                    through tranquil backwaters and houseboats of Kollam just 20
                    km away, or trek through the misty Western Ghats and Ponmudi
                    tea gardens about 50 km from us. From Kathakali's birthplace
                    in Kottarakara (25 km) to the Raja Ravi Varma Palace (19 km)
                    and royal palaces of Trivandrum (25 km) — every essence of
                    Kerala lies within a short journey.
                  </p>

                  <p>
                    At Kshetra, we bring this all together — boutique comfort,
                    heartfelt hospitality, and the unmatched advantage of
                    staying in the true cross-section of Kerala tourism.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Varkala Section */}
      <section className="relative min-h-screen py-20 overflow-hidden bg-black">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/varkala.png?updatedAt=1762242897187"
            alt="Why Varkala - Kerala in One Place"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-end">
          <div className="container mx-auto px-4 md:px-[100px] pb-20">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="text-white"
              >
                <h2 className="text-4xl font-annie-telescope md:text-7xl lg:text-8xl font-bold mb-4 leading-tight">
                  Why <span className="text-[#B23092]">Varkala</span>?
                </h2>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-8 font-annie-telescope">
                  It's Kerala in One Place
                </h3>
                <p className="text-xl md:text-2xl leading-relaxed font-urbanist text-white/90 max-w-3xl mx-auto">
                  Varkala is more than a beach town — it's Kerala in miniature.
                  In an average 25 km radius, you can experience every element
                  that makes Kerala world-famous.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Attractions Grid Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4 md:px-[100px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Beaches */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-2xl overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="bg-[#B23092] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Just 4 km near
                </span>
              </div>
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Beaches"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2 font-urbanist">
                  Beaches
                </h3>
                <p className="text-sm text-white/90 font-urbanist">
                  Varkala Beach, Odayam, Edava, Kappil, and Chilakoor are all
                  within 5 km.
                </p>
              </div>
            </motion.div>

            {/* Card 2: Backwaters & Houseboats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative rounded-2xl overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="bg-[#B23092] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Just 20 km near
                </span>
              </div>
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1583212292454-1fe6229603b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Backwaters & Houseboats"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2 font-urbanist">
                  Backwaters & Houseboats (Kollam)
                </h3>
                <p className="text-sm text-white/90 font-urbanist">
                  Glide through palm-lined canals just 20 km away.
                </p>
              </div>
            </motion.div>

            {/* Card 3: Adventure & Surfing */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative rounded-2xl overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="bg-[#B23092] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Just 4 km near
                </span>
              </div>
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Adventure & Surfing"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2 font-urbanist">
                  Adventure & Surfing
                </h3>
                <p className="text-sm text-white/90 font-urbanist">
                  Surf the Arabian Sea, kayak the Varkala backwaters, or
                  paraglide from the cliffs — all steps from Kshetra.
                </p>
              </div>
            </motion.div>

            {/* Card 4: Jatayu Earth Center */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative rounded-2xl overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="bg-[#B23092] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Just 25 km near
                </span>
              </div>
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Jatayu Earth Center"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2 font-urbanist">
                  Jatayu Earth Center
                </h3>
                <p className="text-sm text-white/90 font-urbanist">
                  Explore the world's largest bird sculpture and zip-line
                  through nature 25 km away.
                </p>
              </div>
            </motion.div>

            {/* Card 5: Ponmudi Hills & Tea Gardens */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative rounded-2xl overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-[#B23092] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Just 50 km near
                </span>
              </div>
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Ponmudi Hills & Tea Gardens"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2 font-urbanist">
                  Ponmudi Hills & Tea Gardens
                </h3>
                <p className="text-sm text-white/90 font-urbanist">
                  A scenic 2-hour drive (50 km) through winding ghats and lush
                  estates.
                </p>
              </div>
            </motion.div>

            {/* Card 6: Thenmala Forest Trails */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="relative rounded-2xl overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="bg-[#B23092] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Just 4 km near
                </span>
              </div>
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Thenmala Forest Trails"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2 font-urbanist">
                  Thenmala Forest Trails
                </h3>
                <p className="text-sm text-white/90 font-urbanist">
                  Trek through biodiversity hotspots of the Western Ghats.
                </p>
              </div>
            </motion.div>

            {/* Card 7: Kathakali's Birthplace */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="relative rounded-2xl overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-[#B23092] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Just 25 km near
                </span>
              </div>
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Kathakali's Birthplace"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2 font-urbanist">
                  Kathakali's Birthplace (Kottarakara)
                </h3>
                <p className="text-sm text-white/90 font-urbanist">
                  Witness Kerala's classical art where it began, just 25 km
                  away.
                </p>
              </div>
            </motion.div>

            {/* Card 8: Raja Ravi Varma Palace */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="relative rounded-2xl overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-[#B23092] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Just 19 km near
                </span>
              </div>
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Raja Ravi Varma Palace"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2 font-urbanist">
                  Raja Ravi Varma Palace & Museum
                </h3>
                <p className="text-sm text-white/90 font-urbanist">
                  Step into the legacy of India's greatest painter (19 km).
                </p>
              </div>
            </motion.div>

            {/* Card 9: Trivandrum Palaces */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="relative rounded-2xl overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Just 25 km near
                </span>
              </div>
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Trivandrum Palaces"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2 font-urbanist">
                  Trivandrum Palaces & Heritage Sites
                </h3>
                <p className="text-sm text-white/90 font-urbanist">
                  A royal journey within 25 km.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Wellness Section */}
      <section
        className="relative min-h-[70vh] overflow-visible bg-gradient-to-r from-purple-900 via-purple-800 to-orange-900"
        style={{
          backgroundImage: `linear-gradient(115deg, rgba(12, 6, 24, 0.88), rgba(32, 16, 40, 0.65)), url('${activeWellnessSlide.background}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Decorative patterns */}
        <div className="absolute bottom-0 left-0 w-64 h-64 opacity-20">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <path
              d="M50,150 Q100,100 150,150 T250,150"
              stroke="white"
              strokeWidth="2"
              fill="none"
              opacity="0.3"
            />
            <path
              d="M30,170 Q100,120 170,170 T310,170"
              stroke="white"
              strokeWidth="2"
              fill="none"
              opacity="0.2"
            />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-64 h-64 opacity-20">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <path
              d="M50,150 Q100,100 150,150 T250,150"
              stroke="white"
              strokeWidth="2"
              fill="none"
              opacity="0.3"
            />
            <path
              d="M30,170 Q100,120 170,170 T310,170"
              stroke="white"
              strokeWidth="2"
              fill="none"
              opacity="0.2"
            />
          </svg>
        </div>

        {/* Explore Now Button */}
        <div className="absolute top-7 right-8 z-20">
          <Link href={activeWellnessSlide.ctaLink}>
          <button className="bg-[#B23092] text-white px-6 py-3 rounded-lg font-urbanist font-semibold hover:bg-[#9a2779] transition-colors duration-200">
              {activeWellnessSlide.ctaLabel}
            </button>
          </Link>
        </div>

        <div className="container mx-auto px-4 md:px-[100px] py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[420px]">
            {/* Left Side - Text Content */}
            <motion.div
              key={`${activeWellnessSlide.id}-content`}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="text-white space-y-6"
            >
              <div>
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 font-annie-telescope">
                  {activeWellnessSlide.heading}
                </h2>
                <h3
                  className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 font-water-brush"
                  style={{ color: activeWellnessSlide.highlightColor }}
                >
                  {activeWellnessSlide.highlight}
                </h3>
              </div>

              <p className="text-lg md:text-xl leading-relaxed font-urbanist text-white/90 max-w-2xl">
                {activeWellnessSlide.description}
              </p>

              {/* Embedded Yoga Image */}
              <div className="mt-8 rounded-2xl overflow-hidden max-w-md lg:translate-y-12 shadow-xl">
                <img
                  src={activeWellnessSlide.cardImage}
                  alt={activeWellnessSlide.cardAlt}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>


          </div>

          {/* Bottom Navigation */}
          <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 z-20 flex items-center gap-4 sm:gap-6">
            <button
              onClick={handleWellnessPrev}
              className="flex flex-col items-center gap-2 group"
              aria-label="View previous wellness slide"
            >
              <div className="w-12 h-12 rounded-full bg-[#B23092] flex items-center justify-center hover:bg-[#9a2779] transition-colors duration-200">
                <svg
                  width="20"
                  height="13"
                  viewBox="0 0 20 13"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M6.17785 0L0 6.25L6.17785 12.5L7.07768 11.5897L2.43694 6.89383H20V5.60521H2.43606L7.07768 0.911165L6.17785 0Z"
                    fill="white"
                  />
                </svg>
              </div>
              <span className="text-white text-xs font-urbanist">PREVIOUS</span>
            </button>

            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                {wellnessSlides.map((slide, index) => {
                  const isActive = index === currentWellnessSlide;
                  return (
                    <button
                      key={slide.id}
                      onClick={() => setCurrentWellnessSlide(index)}
                      aria-label={`Go to ${slide.heading} slide`}
                      className={`rounded-full transition-all duration-300 ${
                        isActive
                          ? "w-4 h-4 bg-white shadow-lg"
                          : "w-2.5 h-2.5 bg-white/50 hover:bg-white/80"
                      }`}
                    />
                  );
                })}
              </div>
              <span className="text-white/70 text-xs font-urbanist tracking-wide uppercase">
                {activeWellnessSlide.metaLabel}
              </span>
            </div>

            <button
              onClick={handleWellnessNext}
              className="flex flex-col items-center gap-2 group"
              aria-label="View next wellness slide"
            >
              <div className="w-12 h-12 rounded-full bg-[#B23092] flex items-center justify-center hover:bg-[#9a2779] transition-colors duration-200">
                <svg
                  width="20"
                  height="13"
                  viewBox="0 0 20 13"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M13.8221 0L20 6.25L13.8221 12.5L12.9223 11.5897L17.5631 6.89383H0V5.60521H17.5639L12.9223 0.911165L13.8221 0Z"
                    fill="white"
                  />
                </svg>
              </div>
              <span className="text-white text-xs font-urbanist">NEXT</span>
            </button>
          </div>
        </div>
      </section>

      {/* Comfort Amenities Section */}
      <section
        className="relative py-24 lg:py-28 text-white bg-black"
        style={{
          backgroundImage:
            "url('https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/meetscoastal.png?updatedAt=1762759854675')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto px-4 md:px-[100px]">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl lg:text-5xl font-annie-telescope tracking-wide text-white"
            >
              Where Comfort
            </motion.h2>
            <motion.h3
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-water-brush text-[#E24AA8] mt-2"
            >
              Meets Coastal Luxury
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-base md:text-lg text-white/85 font-urbanist leading-relaxed"
            >
              From high-speed WiFi and personalized concierge services to serene
              yoga spaces and rejuvenating Ayurvedic therapies — every detail at
              Kshetra is designed to balance luxury, comfort, and cultural
              harmony for a truly unforgettable stay.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {comfortAmenities.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="relative rounded-2xl overflow-hidden group shadow-lg shadow-black/40"
              >
                <div className="aspect-[5/5]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h4 className="text-xl font-annie-telescope mb-2">
                    {item.title}
                  </h4>
                  <p className="text-sm text-white/85 font-urbanist">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Guest Reviews Section */}
      <section
        className="relative py-24 lg:py-32 text-white bg-black"
        style={{
          backgroundImage:
            "url('https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/frame1.png')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto px-4 md:px-[100px]">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl lg:text-5xl font-annie-telescope tracking-wide"
            >
              Hear from Those
            </motion.h2>
            <motion.h3
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-water-brush text-[#F15BAC] mt-3"
            >
              Who’ve Stayed with Us
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-base md:text-lg text-white/80 font-urbanist leading-relaxed"
            >
              Our guests are at the heart of Kshetra. Discover the genuine experiences of
              travellers who found comfort, care, and connection in our coastal retreat.
            </motion.p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => {
              // const isHighlight = index === 1;
              return (
                <motion.div
                  key={testimonial.author}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`relative rounded-3xl p-8 border backdrop-blur-md transition-all duration-300 ${
                    // isHighlight
                       "bg-black/70 border-pink-300/40 shadow-2xl hover:shadow-pink-500/30 scale-[1.04]"
                      // : "bg-black/60 border-white/10 shadow-lg hover:shadow-black/40"
                  }`}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-white/40">
                      <img
                        src={`https://i.pravatar.cc/150?img=${index + 21}`}
                        alt={testimonial.author}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold font-urbanist">
                        {testimonial.author}
                      </h4>
                      <p className="text-sm text-white/70">{testimonial.location}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1 text-[#F56EB3]">
                      {[...Array(testimonial.rating)].map((_, starIndex) => (
                        <Star key={starIndex} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-white/85 text-base md:text-lg leading-relaxed font-urbanist">
                    “{testimonial.text}”
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {false && (
        <>
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

        <div className="relative z-20 container mx-auto px-4 md:px-[100px]">
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
                    const IconComponent = getIconComponent(
                      accommodation.iconType
                    );

                    return (
                      <motion.div
                        key={accommodation._id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        onMouseEnter={() =>
                          setHoveredRoomType(accommodation._id)
                        }
                        onMouseLeave={() => setHoveredRoomType(null)}
                        onClick={() =>
                          window.open(accommodation.externalLink, "_blank")
                        }
                        className={`flex items-center gap-4 text-white cursor-pointer p-4 rounded-lg transition-all duration-300 ${
                          hoveredRoomType === accommodation._id
                            ? getColorThemeClasses(accommodation.colorTheme)
                            : "hover:bg-white/10"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorThemeIconClasses(
                            accommodation.colorTheme
                          )}`}
                        >
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold">
                            {accommodation.name}
                          </h4>
                          <p className="text-white/80">
                            {accommodation.description}
                          </p>
                          <p
                            className={`font-semibold mt-1 ${getTextColorClasses(
                              accommodation.colorTheme
                            )}`}
                          >
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
                    ? `Viewing ${
                        accommodations.find(
                          (acc) => acc._id === hoveredRoomType
                        )?.name || "Accommodation"
                      } Images`
                    : "Hover over accommodations to see images"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {hoveredRoomType &&
                accommodations.find((acc) => acc._id === hoveredRoomType)
                  ?.images.length
                  ? accommodations
                      .find((acc) => acc._id === hoveredRoomType)!
                      .images.map((image, idx) => {
                        const accommodation = accommodations.find(
                          (acc) => acc._id === hoveredRoomType
                        )!;
                        const IconComponent = getIconComponent(
                          accommodation.iconType
                        );

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
                              <div
                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 bg-${accommodation.colorTheme}-500/80 text-white`}
                              >
                                <IconComponent className="w-3 h-3" />
                                <span>{accommodation.name}</span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                  : // Default images when no accommodation is hovered
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
                    ))}
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
                      Hover over accommodations on the left to see specific
                      images
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

        <div className="relative z-20 container mx-auto px-4 md:px-[100px]">
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

        <div className="relative z-20 container mx-auto px-4 md:px-[100px]">
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
        <div className="container mx-auto px-4 md:px-[100px]">
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
        </>
      )}

      <Footer />
    </div>
  );
}
