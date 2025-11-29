"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Users,
  Clock,
  Calendar,
  Star,
  Award,
  Heart,
  Sunrise,
  Sunset,
  MapPin,
  CheckCircle,
  User,
  Globe,
  DollarSign,
  BookOpen,
  Activity,
  ArrowRight,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useRouter } from "next/navigation";
import { yogaAPI } from "../../lib/api";

interface YogaSession {
  _id: string;
  type: "200hr" | "300hr";
  batchName: string;
  startDate: string;
  endDate: string;
  capacity: number;
  bookedSeats: number;
  price: number;
  instructor: {
    _id: string;
    name: string;
    bio: string;
    profileImage?: string;
  };
  schedule: {
    days: string[];
    time: string;
  };
  isActive: boolean;
  description?: string;
  prerequisites: string[];
  availableSeats?: number;
}

interface Teacher {
  _id: string;
  name: string;
  bio: string;
  specializations: string[];
  experience: number;
  certifications: string[];
  email: string;
  phone?: string;
  profileImage?: string;
  isActive: boolean;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    website?: string;
  };
}

export default function YogaPage() {
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const [yogaSessions, setYogaSessions] = useState<YogaSession[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<YogaSession | null>(
    null
  );
  const [selectedDailySession, setSelectedDailySession] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [dailySessions, setDailySessions] = useState<any[]>([]);

  useEffect(() => {
    fetchYogaSessions();
    fetchTeachers();
    fetchDailySessions();
  }, []);

  const fetchYogaSessions = async () => {
    try {
      const response = await yogaAPI.getAllSessions({ upcoming: "true" });
      if (response.data.success) {
        setYogaSessions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching yoga sessions:", error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await yogaAPI.getAllTeachers();
      if (response.data.success) {
        setTeachers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailySessions = async () => {
    try {
      const response = await yogaAPI.getAllDailySessions();
      if (response.data.success) {
        setDailySessions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching daily sessions:", error);
    }
  };

  const handleBookSession = (session: YogaSession) => {
    console.log("Booking session:", session._id);
    // Store session data in localStorage and redirect directly to payment page
    const sessionData: {
      id: string;
      name: string;
      type: 'program';
      price: number;
      duration: string;
      description: string;
      instructor: string;
      startDate: string;
      endDate: string;
    } = {
      id: session._id,
      name: session.batchName,
      type: 'program',
      price: session.price,
      duration: `${Math.ceil((new Date(session.endDate).getTime() - new Date(session.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`,
      description: session.description || 'Comprehensive yoga teacher training program',
      instructor: session.instructor.name,
      startDate: session.startDate,
      endDate: session.endDate
    };
    
    const bookingData = {
      session: sessionData,
      user: {
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        experience: 'beginner' as 'beginner' | 'intermediate' | 'advanced'
      },
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('yogaBookingData', JSON.stringify(bookingData));
    router.push('/yoga/booking/payment');
  };

  const handleDailySessionBooking = () => {
    if (!selectedDailySession) {
      alert("Please select a session time");
      return;
    }
    if (!selectedDate) {
      alert("Please select a date");
      return;
    }

    // Validate selected date is not in the past
    const selectedDateObj = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDateObj < today) {
      alert("Please select a future date. Past dates are not allowed.");
      return;
    }

    // Check if date is too far in the future (optional - limit to 3 months)
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    if (selectedDateObj > maxDate) {
      alert("Bookings are only available up to 3 months in advance. Please select an earlier date.");
      return;
    }

    // Create session data for daily sessions
    const isRegular = selectedDailySession.includes('regular');
    const timeSlots = isRegular
      ? {
          'regular-730': '7:30 AM - 9:00 AM',
          'regular-900': '9:00 AM - 10:30 AM',
          'regular-400': '4:00 PM - 5:30 PM'
        }
      : {
          'therapy-1100': '11:00 AM - 12:30 PM',
          'therapy-530': '5:30 PM - 7:00 PM'
        };

    const sessionData: {
      id: string;
      name: string;
      type: 'daily_regular' | 'daily_therapy';
      price: number;
      duration: string;
      description: string;
      schedule: string;
      instructor: string;
    } = {
      id: selectedDailySession,
      name: isRegular ? 'Regular Yoga Session' : 'Yoga Therapy Session',
      type: isRegular ? 'daily_regular' : 'daily_therapy',
      price: isRegular ? 500 : 1500,
      duration: '1.5 hours',
      description: isRegular
        ? 'Traditional Hatha Yoga, Pranayama (Breathing), Meditation Practice - Perfect for all levels'
        : 'Personalized therapy approach, Healing-focused practices, One-on-one guidance, Therapeutic techniques',
      schedule: timeSlots[selectedDailySession as keyof typeof timeSlots] || 'Selected time slot',
      instructor: isRegular ? 'Daily Session Instructor' : 'Therapy Session Instructor'
    };

    const bookingData = {
      session: sessionData,
      user: {
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        experience: 'beginner' as const
      },
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('yogaBookingData', JSON.stringify(bookingData));
    router.push('/yoga/booking/payment');
  };

  const handleExternalBooking = () => {
    console.log("External booking button clicked");
    // Redirect to our internal booking system (for general booking)
    router.push("/yoga/booking/details");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const SessionCard = ({ session }: { session: YogaSession }) => {
    const duration = Math.ceil(
      (new Date(session.endDate).getTime() -
        new Date(session.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
      >
        <div className="h-64 bg-gradient-to-br from-orange-400 to-pink-500 relative">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-4 left-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                session.type === "200hr"
                  ? "bg-green-100 text-green-800"
                  : "bg-purple-100 text-purple-800"
              }`}
            >
              {session.type} Training
            </span>
          </div>
          <div className="absolute bottom-4 left-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4" />
              <span>{duration} days</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>
                {session.capacity - session.bookedSeats}/{session.capacity}{" "}
                available
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {session.batchName}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {session.description ||
              `${session.type} Yoga Teacher Training program with comprehensive curriculum covering asanas, pranayama, meditation, and teaching methodology.`}
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Instructor: {session.instructor.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {formatDate(session.startDate)} - {formatDate(session.endDate)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {session.schedule.days.join(", ")} at {session.schedule.time}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">
                ₹{session.price.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">per person</div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedSession(session)}
                className="px-4 py-2 border border-orange-600 text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-colors"
              >
                View Details
              </button>
              <button
                onClick={() => handleBookSession(session)}
                className="px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                disabled={session.bookedSeats >= session.capacity}
              >
                {session.bookedSeats >= session.capacity ? "Full" : "Book Now"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

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
            src="https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/yoga.png"
            alt="Yoga & Wellness at Kshetra"
            className="w-full h-[120%] object-cover"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </motion.div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center">
          <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px] mt-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="max-w-3xl"
            >
              {/* Main Heading */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight mt-12">
                <span className="block uppercase tracking-wider mb-2 font-annie-telescope">
                  WE OFFER MORE THAN YOGA
                </span>
                <span className="block text-6xl md:text-7xl lg:text-8xl font-water-brush italic mt-4" style={{ color: '#B23092' }}>
                  We Offer Renewal.
                </span>
              </h1>

              {/* Description */}
              <div className="text-lg md:text-xl text-white/90 mb-12 max-w-xl leading-relaxed font-urbanist space-y-2">
                <p>
                  At Kshetra, yoga is a journey of strength, serenity, and self-discovery.
                </p>
                <p>
                  Each session is designed to align your body, refresh your mind,
                </p>
                <p>
                  and help you live with balance and grace every single day.
                </p>
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const element = document.getElementById("programs-section");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-[#B23092] hover:bg-[#9a2578] text-white font-semibold text-lg px-10 py-4 rounded-full transition-all duration-300 shadow-lg font-urbanist flex items-center gap-3"
              >
                View Programs
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Kshetra Section */}
      <section 
        className="relative py-32 overflow-hidden min-h-screen bg-black"
        style={{
          backgroundImage: "url('https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/frame1.png?updatedAt=1762760253595')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50 z-0"></div>
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Why Choose{" "}
              <span className="font-water-brush text-[#B23092] text-6xl md:text-7xl">
                Kshetra
              </span>
            </h2>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto font-urbanist">
              Experience a smarter, smoother, and more rewarding way to manage your franchise operations
            </p>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Certified Instructors Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 overflow-hidden group"
            >
              {/* Background Image */}
              <div className="absolute inset-0 opacity-20">
                <img
                  src="https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/yogabg.png"
                  alt="Certified Instructors"
                  className="w-full h-full object-cover blur-sm"
                />
              </div>
              
              {/* Icon */}
              <div className="relative z-10 w-16 h-16 bg-[#B23092]/30 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Award className="w-8 h-8 text-[#B23092]" />
              </div>
              
              {/* Content */}
              <div className="relative z-10 text-center">
                <h3 className="text-2xl font-bold text-white mb-4 font-annie-telescope">
                  Certified Instructors
                </h3>
                <p className="text-white/80 text-sm leading-relaxed font-urbanist">
                  Learn from experienced internationally certified yoga teachers with deep knowledge of traditional practices
                </p>
              </div>
            </motion.div>

            {/* Perfect Location Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 overflow-hidden group"
            >
              {/* Background Image */}
              <div className="absolute inset-0 opacity-20">
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Perfect Location"
                  className="w-full h-full object-cover blur-sm"
                />
              </div>
              
              {/* Icon */}
              <div className="relative z-10 w-16 h-16 bg-[#B23092]/30 rounded-full flex items-center justify-center mb-6 mx-auto">
                <MapPin className="w-8 h-8 text-[#B23092]" />
              </div>
              
              {/* Content */}
              <div className="relative z-10 text-center">
                <h3 className="text-2xl font-bold text-white mb-4 font-annie-telescope">
                  Perfect Location
                </h3>
                <p className="text-white/80 text-sm leading-relaxed font-urbanist">
                  Practice yoga steps away from Varkala Beach, surrounded by the natural beauty and spiritual energy of Kerala
                </p>
              </div>
            </motion.div>

            {/* Holistic Approach Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 overflow-hidden group"
            >
              {/* Background Image */}
              <div className="absolute inset-0 opacity-20">
                <img
                  src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Holistic Approach"
                  className="w-full h-full object-cover blur-sm"
                />
              </div>
              
              {/* Icon */}
              <div className="relative z-10 w-16 h-16 bg-[#B23092]/30 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Activity className="w-8 h-8 text-[#B23092]" />
              </div>
              
              {/* Content */}
              <div className="relative z-10 text-center">
                <h3 className="text-2xl font-bold text-white mb-4 font-annie-telescope">
                  Holistic Approach
                </h3>
                <p className="text-white/80 text-sm leading-relaxed font-urbanist">
                  Our programs integrate asanas, pranayama, meditation, philosophy, and Ayurvedic principles for complete wellness
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section
        id="programs-section"
        className="relative py-32 overflow-hidden bg-black"
      >
        {/* Frame1 Background - Base layer (extends from previous section) */}
        <div 
          className="absolute inset-0 z-[1]"
          style={{
            backgroundImage: `url('https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/yogabg.png')`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
          }}
        ></div>
        
        {/* Yoga Background - Top layer with transparency */}
        <div 
          className="absolute inset-0 z-[2] opacity-70"
          style={{
            backgroundImage: `url('https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/yogabg.png')`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
          }}
        ></div>
        
        {/* Dark Overlay for readability */}
        <div className="absolute inset-0 bg-black/40 z-[3]"></div>
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm uppercase tracking-wider text-white/60 mb-4 font-urbanist">
              YOGA PROGRAMS
            </p>
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-4">
              <span className="font-water-brush text-white">Transform Through Practice,</span>
            </h2>
            <h2 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="font-water-brush text-[#B23092]">Teach Through Purpose</span>
            </h2>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto font-urbanist leading-relaxed">
              Deepen your understanding of yoga, strengthen your inner discipline, and become a guide who inspires others on their journey of wellness and balance
            </p>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-[#B23092]/30 border-t-[#B23092] rounded-full"
              />
            </div>
          )}

          {/* Dynamic Programs from API */}
          {!loading && yogaSessions.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {yogaSessions.map((session, index) => {
                const programImage =
                  session.type === "200hr"
                    ? "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                    : "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";

                return (
                  <motion.div
                    key={session._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/10"
                  >
                    {/* Program Image */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={programImage}
                        alt={session.batchName}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                      {/* Available Seats Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1.5 bg-[#B23092] text-white rounded-full text-xs font-semibold font-urbanist">
                          {session.availableSeats || session.capacity - session.bookedSeats} Seats Available
                        </span>
                      </div>

                      {/* Rating */}
                      <div className="absolute top-4 right-4">
                        <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-white text-sm font-urbanist">4.5</span>
                        </div>
                      </div>

                      {/* Program Title */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white mb-1 font-annie-telescope line-clamp-2">
                          {session.batchName}
                        </h3>
                      </div>
                    </div>

                    {/* Program Content */}
                    <div className="p-6 bg-white/5">
                      {/* Dates and Info */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-white/80 text-sm font-urbanist">
                          <Calendar className="w-4 h-4 text-[#B23092]" />
                          <span>
                            {new Date(session.startDate).toLocaleDateString(
                              "en-GB",
                              { day: "2-digit", month: "short" }
                            )}{" "}
                            -{" "}
                            {new Date(session.endDate).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-white/80 text-sm font-urbanist">
                          <Users className="w-4 h-4 text-[#B23092]" />
                          <span>Max {session.capacity} students</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => setSelectedSession(session)}
                          className="flex-1 px-4 py-2.5 border-2 border-[#B23092] text-[#B23092] rounded-lg hover:bg-[#B23092]/10 transition-all duration-300 text-sm font-semibold font-urbanist"
                        >
                          View Details
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleBookSession(session)}
                          className="flex-1 px-4 py-2.5 bg-[#B23092] text-white rounded-lg hover:bg-[#9a2578] transition-all duration-300 text-sm font-semibold font-urbanist shadow-lg"
                        >
                          Enroll Now
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            !loading && (
              /* No Programs Available */
              <div className="text-center py-20">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="max-w-md mx-auto"
                >
                  <div className="w-24 h-24 bg-[#B23092]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Activity className="w-12 h-12 text-[#B23092]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 font-annie-telescope">
                    No Programs Available
                  </h3>
                  <p className="text-white/80 mb-8 font-urbanist">
                    Check back soon for upcoming yoga teacher training programs
                    and workshops.
                  </p>
                  <button
                    onClick={() => router.push("/contact")}
                    className="px-6 py-3 bg-[#B23092] text-white rounded-xl font-semibold hover:bg-[#9a2578] transition-all duration-300 shadow-lg font-urbanist"
                  >
                    Contact Us for Updates
                  </button>
                </motion.div>
              </div>
            )
          )}
        </div>
      </section>

      {/* Daily Yoga Sessions Section */}
      <section
        id="daily-sessions-section"
        className="py-20 bg-black"
      >
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px]">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Side - Book Your Session */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white/5 backdrop-blur-sm border border-[#B23092]/20 rounded-3xl p-8"
            >
              <div className="mb-8">
                <h3 className="text-3xl font-bold text-white mb-4 font-annie-telescope">
                  Book Your Session
                </h3>
                <p className="text-white/80 font-urbanist">
                  Select your preferred date and time slot
                </p>
              </div>

              <div className="space-y-6">
                {/* Date Selection */}
                <div>
                  <label className="block text-white font-semibold mb-4 font-urbanist">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    max={new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split("T")[0]}
                    className="w-full p-4 rounded-xl bg-white/10 border border-[#B23092]/30 text-white placeholder-gray-400 focus:border-[#B23092] focus:outline-none focus:ring-2 focus:ring-[#B23092]/20 font-urbanist"
                  />
                </div>

                {/* Time Selection */}
                <div>
                  <label className="block text-white font-semibold mb-4 font-urbanist">
                    Select Session Type & Time
                  </label>
                  <select
                    value={selectedDailySession}
                    onChange={(e) => setSelectedDailySession(e.target.value)}
                    className="w-full p-4 rounded-xl bg-white/10 border border-[#B23092]/30 text-white focus:border-[#B23092] focus:outline-none focus:ring-2 focus:ring-[#B23092]/20 font-urbanist"
                  >
                    <option value="" className="bg-black">
                      Choose a session...
                    </option>
                    {dailySessions.map((session) => (
                      <optgroup
                        key={session._id}
                        label={`${session.name} - ₹${session.price.toLocaleString()}`}
                        className="bg-black"
                      >
                        {session.timeSlots?.filter((slot: any) => slot.isActive).map((slot: any, idx: number) => {
                          const timeFormatted = slot.time.length === 5 ? slot.time : `0${slot.time}`;
                          const [hours, minutes] = timeFormatted.split(':');
                          const hour12 = parseInt(hours) > 12 ? parseInt(hours) - 12 : parseInt(hours);
                          const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
                          const displayTime = `${hour12 === 0 ? 12 : hour12}:${minutes} ${ampm}`;
                          const endHour = parseInt(hours) + Math.floor(session.duration / 60);
                          const endMinutes = parseInt(minutes) + (session.duration % 60);
                          const endHour12 = endHour > 12 ? endHour - 12 : endHour;
                          const endAmpm = endHour >= 12 ? 'PM' : 'AM';
                          const endDisplayTime = `${endHour12 === 0 ? 12 : endHour12}:${endMinutes.toString().padStart(2, '0')} ${endAmpm}`;

                          return (
                            <option
                              key={idx}
                              value={`${session.type}-${slot.time.replace(':', '')}`}
                              className="bg-black"
                            >
                              {displayTime} - {endDisplayTime}
                            </option>
                          );
                        })}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDailySessionBooking}
                  className="w-full bg-[#B23092] hover:bg-[#9a2578] text-white px-6 py-4 rounded-xl text-lg font-bold shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed font-urbanist transition-all duration-300"
                  disabled={!selectedDate || !selectedDailySession}
                >
                  <Calendar className="w-5 h-5" />
                  Book Your Yoga Session
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-white/60 text-sm font-urbanist">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Booking confirmation will be sent via email
                </p>
              </div>
            </motion.div>

            {/* Right Side - Yoga Therapy Sessions */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="mb-8">
                <h3 className="text-3xl font-bold text-white mb-4 font-annie-telescope">
                  Yoga Therapy Sessions
                </h3>
                <p className="text-white/80 font-urbanist">
                  Choose from our available session types
                </p>
              </div>

              {/* Dynamic Session Types */}
              <div className="space-y-6">
                {dailySessions.map((session, index) => {
                  return (
                    <motion.div
                      key={session._id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* Top Section - Image */}
                      <div className="h-48 bg-gray-900 relative overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                          alt={session.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      </div>

                      {/* Bottom Section - Text and Details */}
                      <div className="bg-black/90 p-5">
                        {/* Title and Duration */}
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="text-xl font-bold text-white font-annie-telescope flex-1">
                            {session.name}
                          </h4>
                          <span className="text-sm text-white/80 font-urbanist ml-2 whitespace-nowrap">
                            {session.duration} minute session
                          </span>
                        </div>

                        {/* Session Times */}
                        <div className="flex items-start gap-3 mb-4">
                          <Clock className="w-5 h-5 text-[#B23092] mt-0.5 flex-shrink-0" />
                          <div className="space-y-1.5 flex-1">
                            {session.timeSlots?.filter((slot: any) => slot.isActive).slice(0, 2).map((slot: any, idx: number) => {
                              const timeFormatted = slot.time.length === 5 ? slot.time : `0${slot.time}`;
                              const [hours, minutes] = timeFormatted.split(':');
                              const hour12 = parseInt(hours) > 12 ? parseInt(hours) - 12 : parseInt(hours);
                              const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
                              const displayTime = `${hour12 === 0 ? 12 : hour12}:${minutes} ${ampm}`;
                              const endHour = parseInt(hours) + Math.floor(session.duration / 60);
                              const endMinutes = parseInt(minutes) + (session.duration % 60);
                              const endHour12 = endHour > 12 ? endHour - 12 : endHour;
                              const endAmpm = endHour >= 12 ? 'PM' : 'AM';
                              const endDisplayTime = `${endHour12 === 0 ? 12 : endHour12}:${endMinutes.toString().padStart(2, '0')} ${endAmpm}`;

                              return (
                                <div key={idx} className="text-white font-urbanist text-sm">
                                  {displayTime} - {endDisplayTime}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Features List */}
                        {session.features && session.features.length > 0 && (
                          <div className="space-y-2 mb-4">
                            {session.features.slice(0, 4).map((feature: string, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 text-white/80 font-urbanist text-sm"
                              >
                                <span className="text-[#B23092] mt-1.5">•</span>
                                <span className="flex-1">{feature}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Price */}
                        <div className="pt-3 border-t border-white/10">
                          <p className="text-[#B23092] font-bold text-lg font-annie-telescope">
                            ₹{session.price.toLocaleString()} per session
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* Instructors Section */}
      {teachers.length > 0 && (
        <section className="relative py-32 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/meetteaherbg.png?updatedAt=1762973554357"
              alt="Meet Our Teachers Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px]">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
                Meet Our{" "}
                <span className="font-water-brush text-[#B23092] text-6xl md:text-7xl">
                  Teachers
                </span>
              </h2>
              <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto font-urbanist leading-relaxed">
                From your first stretch to deep mastery, our teachers are here to support your growth every step of the way.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.slice(0, 6).map((teacher, index) => (
                <motion.div
                  key={teacher._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-black/70 backdrop-blur-sm border border-white/30 rounded-xl overflow-hidden shadow-xl hover:shadow-[#B23092]/20 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Teacher Image */}
                  <div className="h-48 bg-gray-900 relative overflow-hidden">
                    {teacher.profileImage ? (
                      <img
                        src={teacher.profileImage}
                        alt={teacher.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#B23092]/20 to-black/50">
                        <div className="w-20 h-20 bg-[#B23092]/30 rounded-full flex items-center justify-center border-2 border-[#B23092]/50">
                          <span className="text-3xl font-bold text-[#B23092]">
                            {teacher.name[0]}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Teacher Info */}
                  <div className="p-4">
                    {/* Name and Authorization */}
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-white font-annie-telescope flex-1">
                        {teacher.name}
                      </h3>
                      {teacher.certifications.length > 0 && (
                        <span className="text-xs text-[#B23092] font-semibold font-urbanist ml-2 text-right">
                          {teacher.certifications[0]}
                        </span>
                      )}
                    </div>

                    {/* Tags/Pills */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="px-2.5 py-1 bg-[#B23092] text-white text-xs font-semibold rounded-full font-urbanist">
                        {teacher.experience} years experience
                      </span>
                      {teacher.specializations && teacher.specializations.length > 0 && (
                        <span className="px-2.5 py-1 bg-[#B23092] text-white text-xs font-semibold rounded-full font-urbanist">
                          {teacher.specializations[0]}
                        </span>
                      )}
                    </div>

                    {/* Biography */}
                    <p className="text-white/70 text-xs leading-relaxed font-urbanist line-clamp-3">
                      {teacher.bio}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {/* <section className="py-16 bg-gradient-to-r from-orange-600 to-pink-600">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px] text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-light mb-4">
              Start Your Yoga Journey Today
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Whether you're a complete beginner or experienced practitioner, we
              have the perfect program for you
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleExternalBooking}
                className="px-8 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Book Now
              </button>
              <button
                onClick={() => router.push("/contact")}
                className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-orange-600 transition-colors"
              >
                Contact Us
              </button>
            </div>
          </motion.div>
        </div>
      </section> */}

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black border border-[#B23092]/30 rounded-xl max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white font-annie-telescope">
                  {selectedSession.batchName}
                </h2>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="text-white/60 hover:text-[#B23092] transition-colors text-2xl leading-none"
                >
                  ✕
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 font-annie-telescope">
                    Program Details
                  </h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#B23092]" />
                      <span className="text-white/80 font-urbanist">
                        {selectedSession.type} Training Program
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#B23092]" />
                      <span className="text-white/80 font-urbanist">
                        {formatDate(selectedSession.startDate)} -{" "}
                        {formatDate(selectedSession.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#B23092]" />
                      <span className="text-white/80 font-urbanist">
                        {selectedSession.schedule.days.join(", ")} at{" "}
                        {selectedSession.schedule.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#B23092]" />
                      <span className="text-white/80 font-urbanist">
                        {selectedSession.capacity - selectedSession.bookedSeats}{" "}
                        spots available (out of {selectedSession.capacity})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#B23092]" />
                      <span className="text-white/80 font-urbanist">
                        Instructor: {selectedSession.instructor.name}
                      </span>
                    </div>
                  </div>

                  {selectedSession.description && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-3 font-annie-telescope">
                        Description
                      </h3>
                      <p className="text-white/80 font-urbanist leading-relaxed">
                        {selectedSession.description}
                      </p>
                    </div>
                  )}

                  {selectedSession.prerequisites.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 font-annie-telescope">
                        Prerequisites
                      </h3>
                      <ul className="space-y-2">
                        {selectedSession.prerequisites.map((prereq, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-[#B23092]" />
                            <span className="text-white/80 font-urbanist">{prereq}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <div className="bg-white/5 border border-[#B23092]/20 p-6 rounded-lg backdrop-blur-sm">
                    <div className="text-3xl font-bold text-[#B23092] mb-2 font-annie-telescope">
                      ₹{selectedSession.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-white/60 mb-6 font-urbanist">
                      {selectedSession.type} •{" "}
                      {Math.ceil(
                        (new Date(selectedSession.endDate).getTime() -
                          new Date(selectedSession.startDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      days
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between">
                        <span className="text-white/80 font-urbanist">Available spots:</span>
                        <span className="font-semibold text-white">
                          {selectedSession.capacity -
                            selectedSession.bookedSeats}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80 font-urbanist">Total capacity:</span>
                        <span className="font-semibold text-white">
                          {selectedSession.capacity}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBookSession(selectedSession)}
                      className="w-full px-4 py-3 bg-[#B23092] text-white font-semibold rounded-lg hover:bg-[#9a2578] transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed font-urbanist shadow-lg"
                      disabled={
                        selectedSession.bookedSeats >= selectedSession.capacity
                      }
                    >
                      {selectedSession.bookedSeats >= selectedSession.capacity
                        ? "Fully Booked"
                        : "Book This Program"}
                    </button>
                  </div>

                  {selectedSession.instructor.bio && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-white mb-3 font-annie-telescope">
                        About Your Instructor
                      </h3>
                      <p className="text-white/80 text-sm font-urbanist leading-relaxed">
                        {selectedSession.instructor.bio}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}
