"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Users,
  Wifi,
  Car,
  Coffee,
  Star,
  Calendar,
  Filter,
  Search,
  Tv,
  Wind,
  Utensils,
  Waves,
  TreePine,
  Bath,
  Bed,
  Mountain
} from "lucide-react";
import Header from "../../components/Header";
import { accommodationAPI } from "../../lib/api";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";

interface Room {
  _id: string;
  roomNumber: string;
  roomType: "AC" | "Non-AC";
  pricePerNight: number;
  capacity: number;
  amenities: string[];
  description?: string;
  images: string[];
  isAvailable: boolean;
}

// Static room data
const staticRooms: Room[] = [
  {
    _id: "1",
    roomNumber: "101",
    roomType: "AC",
    pricePerNight: 3500,
    capacity: 2,
    amenities: ["WiFi", "AC", "TV", "Private Bathroom", "Coffee/Tea", "Balcony"],
    description: "Spacious AC room with stunning ocean views and modern amenities. Perfect for couples seeking comfort and tranquility.",
    images: ["https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3"],
    isAvailable: true
  },
  {
    _id: "2",
    roomNumber: "102",
    roomType: "AC",
    pricePerNight: 4200,
    capacity: 3,
    amenities: ["WiFi", "AC", "TV", "Private Bathroom", "Coffee/Tea", "Sea View", "Mini Fridge"],
    description: "Deluxe AC room with panoramic sea views and premium amenities. Ideal for small families or groups of friends.",
    images: ["https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3"],
    isAvailable: true
  },
  {
    _id: "3",
    roomNumber: "103",
    roomType: "Non-AC",
    pricePerNight: 2200,
    capacity: 2,
    amenities: ["WiFi", "Fan", "Private Bathroom", "Coffee/Tea", "Garden View"],
    description: "Cozy non-AC room surrounded by lush gardens. Experience natural ventilation and eco-friendly accommodation.",
    images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3"],
    isAvailable: true
  },
  {
    _id: "4",
    roomNumber: "104",
    roomType: "AC",
    pricePerNight: 5000,
    capacity: 4,
    amenities: ["WiFi", "AC", "TV", "Private Bathroom", "Coffee/Tea", "Sea View", "Mini Fridge", "Sitting Area"],
    description: "Premium family suite with separate sitting area and breathtaking coastal views. Perfect for families or groups.",
    images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3"],
    isAvailable: true
  },
  {
    _id: "5",
    roomNumber: "201",
    roomType: "AC",
    pricePerNight: 3800,
    capacity: 2,
    amenities: ["WiFi", "AC", "TV", "Private Bathroom", "Coffee/Tea", "Balcony", "Ocean View"],
    description: "Second floor AC room with private balcony overlooking the Arabian Sea. Wake up to the sound of waves.",
    images: ["https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3"],
    isAvailable: true
  },
  {
    _id: "6",
    roomNumber: "202",
    roomType: "Non-AC",
    pricePerNight: 1800,
    capacity: 1,
    amenities: ["WiFi", "Fan", "Private Bathroom", "Coffee/Tea"],
    description: "Single occupancy non-AC room perfect for solo travelers seeking budget-friendly accommodation with comfort.",
    images: ["https://images.unsplash.com/photo-1595576508898-0ad5c879a061?ixlib=rb-4.0.3"],
    isAvailable: true
  },
  {
    _id: "7",
    roomNumber: "203",
    roomType: "AC",
    pricePerNight: 6500,
    capacity: 4,
    amenities: ["WiFi", "AC", "TV", "Private Bathroom", "Coffee/Tea", "Sea View", "Mini Fridge", "Kitchenette", "Living Room"],
    description: "Luxury villa-style suite with kitchenette and separate living area. Ultimate comfort for extended stays or special occasions.",
    images: ["https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3"],
    isAvailable: true
  },
  {
    _id: "8",
    roomNumber: "301",
    roomType: "Non-AC",
    pricePerNight: 2800,
    capacity: 3,
    amenities: ["WiFi", "Fan", "Private Bathroom", "Coffee/Tea", "Terrace", "Mountain View"],
    description: "Top floor non-AC room with private terrace and mountain views. Perfect for yoga practitioners and nature lovers.",
    images: ["https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3"],
    isAvailable: true
  }
];

const RoomsPage = () => {
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const [filters, setFilters] = useState({
    roomType: "all",
    priceRange: "all",
    capacity: "all",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Dynamic accommodations (admin-managed)
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [loadingAccommodations, setLoadingAccommodations] = useState(true);

  useEffect(() => {
    const fetchAccommodations = async () => {
      try {
        const response = await accommodationAPI.getAllAccommodations();
        if (response.data?.success) {
          setAccommodations(response.data.data.accommodations || []);
        } else if (response.data?.data?.accommodations) {
          // Some endpoints return without success flag
          setAccommodations(response.data.data.accommodations);
        }
      } catch (err) {
        console.error("Failed to fetch accommodations:", err);
      } finally {
        setLoadingAccommodations(false);
      }
    };
    fetchAccommodations();
  }, []);

  const filteredRooms = staticRooms.filter((room) => {
    const matchesSearch =
      room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filters.roomType === "all" || room.roomType === filters.roomType;

    const matchesPrice =
      filters.priceRange === "all" ||
      (filters.priceRange === "budget" && room.pricePerNight < 2000) ||
      (filters.priceRange === "mid" &&
        room.pricePerNight >= 2000 &&
        room.pricePerNight < 4000) ||
      (filters.priceRange === "luxury" && room.pricePerNight >= 4000);

    const matchesCapacity =
      filters.capacity === "all" ||
      parseInt(filters.capacity) === room.capacity;

    return (
      matchesSearch &&
      matchesType &&
      matchesPrice &&
      matchesCapacity &&
      room.isAvailable
    );
  });

  const handleBookRoom = (room: Room) => {
    // Store selected room in localStorage for potential future use
    localStorage.setItem(
      "selectedRoom",
      JSON.stringify({
        roomId: room._id,
        roomType: room.roomType,
        pricePerNight: room.pricePerNight,
        capacity: room.capacity,
        roomNumber: room.roomNumber,
      })
    );

    // Redirect to external booking system
    window.open('https://live.ipms247.com/booking/book-rooms-kshetraretreatvarkala', '_blank');
  };

  const RoomCard = ({ room }: { room: Room }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Room Image */}
      <div className="h-64 bg-gray-200 relative">
        {room.images.length > 0 ? (
          <img
            src={room.images[0]}
            alt={`Room ${room.roomNumber}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Car className="w-12 h-12 mx-auto mb-2" />
              <p>No Image Available</p>
            </div>
          </div>
        )}

        <div className="absolute top-4 right-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              room.roomType === "AC"
                ? "bg-blue-100 text-blue-800"
                : "bg-orange-100 text-orange-800"
            }`}
          >
            {room.roomType}
          </span>
        </div>
      </div>

      {/* Room Details */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              Room {room.roomNumber}
            </h3>
            <div className="flex items-center text-gray-600 text-sm">
              <Users className="w-4 h-4 mr-1" />
              Up to {room.capacity} guests
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              ₹{room.pricePerNight.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">per night</div>
          </div>
        </div>

        {room.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {room.description}
          </p>
        )}

        {/* Amenities */}
        {room.amenities.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {room.amenities.slice(0, 4).map((amenity, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded flex items-center gap-1"
                >
                  {getAmenityIcon(amenity)}
                  {amenity}
                </span>
              ))}
              {room.amenities.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  +{room.amenities.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4 fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">4.8 (127 reviews)</span>
        </div>

        {/* Book Button */}
        <button
          onClick={() => handleBookRoom(room)}
          className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Book Now
        </button>
      </div>
    </motion.div>
  );

  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes("wifi")) return <Wifi className="w-3 h-3" />;
    if (lowerAmenity.includes("ac")) return <Wind className="w-3 h-3" />;
    if (lowerAmenity.includes("tv")) return <Tv className="w-3 h-3" />;
    if (lowerAmenity.includes("bathroom")) return <Bath className="w-3 h-3" />;
    if (lowerAmenity.includes("coffee") || lowerAmenity.includes("tea")) return <Coffee className="w-3 h-3" />;
    if (lowerAmenity.includes("balcony") || lowerAmenity.includes("terrace")) return <Mountain className="w-3 h-3" />;
    if (lowerAmenity.includes("view")) return <Waves className="w-3 h-3" />;
    if (lowerAmenity.includes("fridge")) return <Utensils className="w-3 h-3" />;
    if (lowerAmenity.includes("fan")) return <Wind className="w-3 h-3" />;
    if (lowerAmenity.includes("garden")) return <TreePine className="w-3 h-3" />;
    if (lowerAmenity.includes("sitting") || lowerAmenity.includes("living")) return <Bed className="w-3 h-3" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Hero Section - Rooms */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background Image with Parallax */}
        <motion.div
          className="absolute inset-0"
          style={{ y }}
        >
          <img
            src="/images/hotel.jpg"
            alt="Kshetra Rooms"
            className="w-full h-[120%] object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center">
          <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px]">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="max-w-2xl text-white"
            >
              {/* Main Heading */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="block font-annie-telescope">EXPERIENCE COMFORT</span>
                <span className="block text-5xl md:text-6xl lg:text-7xl font-water-brush italic mt-4">
                  in <span className="text-[#B23092]">Every Corner</span>
                </span>
              </h1>

              {/* Description */}
              <p className="text-white/90 font-urbanist max-w-xl leading-relaxed mb-8">
                Indulge in comfort and charm — from our grand King Rooms to the cozy Queen stays,
                every space is thoughtfully designed to make your experience memorable, peaceful,
                and perfectly tailored to your style.
              </p>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const list = document.getElementById('rooms-list');
                  if (list) list.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 bg-[#B23092] hover:bg-[#9a2578] text-white px-6 py-3 rounded-full font-urbanist font-semibold"
              >
                Start Your Booking
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px] py-8" id="rooms-list"
      style={{backgroundImage: 'url(https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/frame1.png?updatedAt=1762760253595)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}
      >
        {/* NOTE: Old static filter + listing commented out as per request */}
     

        {/* Dynamic room-type sections (admin-managed) */}
        <div className="space-y-16">
          {loadingAccommodations && (
            <div className="text-center py-20">
              <div className="inline-block w-10 h-10 border-4 border-[#B23092] border-t-transparent rounded-full animate-spin" />
              <p className="text-white/70 mt-4 font-urbanist">Loading room types...</p>
            </div>
          )}

          {!loadingAccommodations && accommodations.map((acc, idx) => (
            <section key={acc._id || idx} className="bg-transparent rounded-3xl p-6 sm:p-8 "
            style={{backgroundImage: 'url(https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/frame1.png?updatedAt=1762760253595)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}
            >
              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="text-xs tracking-widest text-white/70 font-urbanist uppercase mb-2">{acc.name?.toUpperCase()} ROOMS</div>
                <h3 className="text-3xl sm:text-4xl font-bold text-white">
                  <span className="font-annie-telescope">Luxury and space</span>{' '}
                  <span className="font-water-brush text-[#B23092]">redefined</span>
                </h3>
                <p className="text-white/80 mt-4 max-w-3xl mx-auto font-urbanist text-sm sm:text-base">
                  {acc.description || "Step into a world where royal comfort meets sophistication. Thoughtfully designed with plush bedding, premium interiors, and a warm ambience."}
                </p>
                <button
                  onClick={() => {
                    const url = acc.externalLink || "https://live.ipms247.com/booking/book-rooms-kshetraretreatvarkala";
                    window.open(url, "_blank");
                  }}
                  className="mt-5 inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#B23092] text-white font-urbanist font-semibold hover:bg-[#9a2578] transition-colors"
                >
                  Book Now
                </button>
              </div>

              {/* Main Image */}
              <div className="rounded-2xl overflow-hidden bg-transparent relative">
                {/* Main Image */}
                <img
                  src={(acc.images && acc.images[0]) || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2048&q=60"}
                  alt={acc.name}
                  className="w-full h-[380px] sm:h-[460px] md:h-[500px] lg:h-[550px] object-cover"
                />
                {/* Text Overlays on Bottom Left */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 sm:p-6 md:p-8">
                  <div className="text-white text-xs sm:text-sm md:text-base font-urbanist flex flex-wrap gap-x-6 gap-y-2">
                    <span>- PREMIUM INTERIORS</span>
                    <span>- LARGE BED</span>
                    <span>- BALCONY VIEW</span>
                    <span>- WI-FI</span>
                  </div>
                </div>
              </div>

              {/* Thumbnails */}
              <div className="mt-6 grid sm:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
                {(acc.images && acc.images.slice(1, 4).length > 0 ? acc.images.slice(1, 4) : [
                  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=60",
                  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=60",
                  "https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&w=1200&q=60",
                ]).map((img: string, i: number) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-white/10 bg-white/5 aspect-square">
                    <img src={img} alt={`${acc.name} ${i+2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </section>
          ))}

          {!loadingAccommodations && accommodations.length === 0 && (
            <div className="text-center py-20">
              <p className="text-white/70 font-urbanist">No room types available yet.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RoomsPage;
