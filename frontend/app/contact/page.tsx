'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Star,
  Instagram,
  Facebook,
  Twitter,
  X,
  Plus,
  ChevronDown
} from 'lucide-react'
import Header from '../../components/Header'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
    }, 1500)
  }

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqs = [
    {
      question: "What is the cancellation policy?",
      answer: "Free cancellation up to 24 hours before check-in. After that, one night's stay will be charged. For yoga programs and other services, please refer to the specific terms and conditions."
    },
    {
      question: "Do you provide airport transfers?",
      answer: "Yes, we offer pickup and drop services from Kochi and Trivandrum airports at ₹1,500 per trip. You can book this service during your reservation or contact us directly."
    },
    {
      question: "Are meals included in the room booking?",
      answer: "We offer various meal plans. Basic room bookings include breakfast. Lunch and dinner can be added as per your preference. Please check with our team for current packages and pricing."
    },
    {
      question: "What yoga programs do you offer?",
      answer: "We offer 200hr and 300hr yoga teacher training programs, daily yoga sessions, and personalized instruction. All programs are led by certified instructors and include accommodation options."
    }
  ]

  return (
    <div className="min-h-screen ">
      <Header />

      {/* Hero Section with Background */}
      <section className="relative min-h-screen overflow-hidden py-32">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/Kshetra/contact.png"
            alt="Contact Hero"
            className="w-full h-full object-cover"
          />
          {/* <div className="absolute inset-0 bg-black/40"></div> */}
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center">
          <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px] w-full">
            {/* Hero Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                <span className="block uppercase tracking-wider mb-2 font-annie-telescope">
                  WE'D LOVE TO HEAR
                </span>
                <span className="block text-5xl md:text-6xl lg:text-7xl font-water-brush italic mt-4">
                  From <span className="text-[#B23092]">You</span>
                </span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed font-urbanist mt-6">
                Whether you have a question about bookings, room or general requests— our team is here to help you anytime.
              </p>
            </motion.div>

            {/* Two Column Layout - Contact Info and Form */}
            <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
              {/* Left Panel - Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/20 p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-4 font-annie-telescope">Contact Information</h2>
                <p className="text-white/80 mb-8 font-urbanist leading-relaxed">
                  Located in the serene coastal town of Varkala, Kshetra Retreat Resort offers you a perfect blend of spirituality, adventure and relaxation.
                </p>

                {/* Contact Details Grid - 2x2 */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Address */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                    <div className="w-10 h-10 bg-purple-500/30 rounded-lg flex items-center justify-center mb-3">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-white font-semibold mb-2 font-annie-telescope">Address</h3>
                    <p className="text-white/80 text-sm font-urbanist leading-relaxed">
                      85, North Cliff, Varkala, Kerala, 695141, India
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                    <div className="w-10 h-10 bg-green-500/30 rounded-lg flex items-center justify-center mb-3">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-white font-semibold mb-2 font-annie-telescope">Phone</h3>
                    <p className="text-white/80 text-sm font-urbanist">
                      +91 98470 12345<br />
                      +91 94470 67890
                    </p>
                  </div>

                  {/* Email */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 break-words overflow-hidden">
                    <div className="w-10 h-10 bg-orange-500/30 rounded-lg flex items-center justify-center mb-3">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-white font-semibold mb-2 font-annie-telescope">Email</h3>
                    <p className="text-white/80 text-sm font-urbanist break-all">
                      <span className="block break-words">info@kshetraretreat.com</span>
                      <span className="block break-words">bookings@kshetraretreat.com</span>
                    </p>
                  </div>

                  {/* Opening Hours */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                    <div className="w-10 h-10 bg-blue-500/30 rounded-lg flex items-center justify-center mb-3">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-white font-semibold mb-2 font-annie-telescope">Opening Hours</h3>
                    <p className="text-white/80 text-sm font-urbanist">
                      Reception: 24/7<br />
                      Check-in: 2:00 PM<br />
                      Check-out: 11:00 AM
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Right Panel - Send us a Message */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/20 p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-2 font-annie-telescope">Send us a Message</h2>
                <p className="text-white/80 mb-6 font-urbanist">We'll get back to you within 24 hours</p>

                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-[#B23092]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-[#B23092]" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2 font-annie-telescope">Message Sent!</h3>
                    <p className="text-white/80 font-urbanist">Thank you for contacting us. We'll respond within 24 hours.</p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-4 text-[#B23092] hover:text-[#9a2578] font-medium font-urbanist"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2 font-urbanist">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-[#B23092] focus:border-[#B23092] outline-none font-urbanist"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2 font-urbanist">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-[#B23092] focus:border-[#B23092] outline-none font-urbanist"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2 font-urbanist">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-[#B23092] focus:border-[#B23092] outline-none font-urbanist"
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2 font-urbanist">
                          Subject *
                        </label>
                        <div className="relative">
                          <select
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-[#B23092] focus:border-[#B23092] outline-none appearance-none font-urbanist"
                          >
                            <option value="" className="bg-gray-800">Select a subject</option>
                            <option value="booking" className="bg-gray-800">Room Booking</option>
                            <option value="yoga" className="bg-gray-800">Yoga Programs</option>
                            <option value="services" className="bg-gray-800">Additional Services</option>
                            <option value="group" className="bg-gray-800">Group Booking</option>
                            <option value="general" className="bg-gray-800">General Inquiry</option>
                            <option value="feedback" className="bg-gray-800">Feedback</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2 font-urbanist">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-[#B23092] focus:border-[#B23092] outline-none resize-none font-urbanist"
                        placeholder="Please describe your inquiry or requirements..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-6 py-3 bg-[#B23092] hover:bg-[#9a2578] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-urbanist"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative bg-black py-20">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              <span className="block uppercase tracking-wider mb-2 font-annie-telescope">
                FREQUENTLY ASKED
              </span>
              <span className="block text-5xl md:text-6xl lg:text-7xl font-water-brush italic mt-4">
                <span className="text-[#B23092]">Questions</span>
              </span>
            </h2>
          </motion.div>

          {/* FAQ Accordion */}
          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-white font-semibold font-urbanist">
                    {index + 1}. {faq.question}
                  </span>
                  {openFaq === index ? (
                    <X className="w-5 h-5 text-white flex-shrink-0" />
                  ) : (
                    <Plus className="w-5 h-5 text-white flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-4"
                  >
                    <p className="text-white/80 text-sm leading-relaxed font-urbanist">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
