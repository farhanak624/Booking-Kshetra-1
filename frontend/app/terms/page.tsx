'use client'

import { motion } from 'framer-motion'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export default function TermsAndConditionsPage() {
  const sections = [
    {
      title: "General Information",
      content: [
        "By accessing or using our website/app, you agree to comply with and be bound by the following Terms and Conditions. Please read them carefully before making a booking."
      ]
    },
    {
      title: "Booking Policy",
      content: [
        "All bookings are subject to room availability and confirmation.",
        "A valid ID proof must be presented at the time of check-in.",
        "Guests must be at least 18 years old to make a booking.",
        "Early check-in or late check-out is subject to availability and may incur additional charges."
      ]
    },
    {
      title: "Payment Policy",
      content: [
        "Full or partial payment may be required to confirm a booking.",
        "We accept online payments via debit/credit cards, UPI, or bank transfers.",
        "All prices are inclusive of applicable taxes unless otherwise stated."
      ]
    },
    {
      title: "Cancellation & Refund Policy",
      content: [
        "Cancellations made 48 hours before check-in are eligible for a full refund.",
        "Cancellations made within 48 hours of check-in are non-refundable.",
        "No-shows will be charged 100% of the booking amount.",
        "Refunds (if applicable) will be processed within 7-10 working days."
      ]
    },
    {
      title: "Guest Responsibilities",
      content: [
        "Guests are expected to maintain decorum and respect property rules.",
        "Any damage to property or amenities will be charged to the guest.",
        "Smoking is not permitted in non-smoking rooms or public areas.",
        "Illegal activities are strictly prohibited within the premises."
      ]
    },
    {
      title: "Hotel Rights",
      content: [
        "The management reserves the right to cancel or refuse any booking if necessary.",
        "Room rates and policies may change without prior notice.",
        "In case of unforeseen circumstances, alternate arrangements will be provided wherever possible."
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-20 md:py-24 lg:py-20 ">
        <div className="absolute inset-0 bg-gradient-to-b from-[#B23092]/10 to-transparent"></div>
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px] relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mt-10"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-annie-telescope text-white mb-4 uppercase tracking-wide">
              Terms and Conditions
            </h1>
            <p className="text-white/80 text-sm sm:text-base md:text-lg font-urbanist">
              Please read these terms carefully before making a booking
            </p>
          </motion.div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-12 sm:py-16 md:py-20 bg-black">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px] max-w-4xl">
          <div className="space-y-6 sm:space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 sm:p-8 hover:bg-white/10 transition-colors"
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-annie-telescope text-white mb-4 sm:mb-6 flex items-center gap-3">
                  <span className="text-[#B23092] font-bold">{index + 1}.</span>
                  <span>{section.title}</span>
                </h2>
                <ul className="space-y-3 sm:space-y-4">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3 text-white/80 text-sm sm:text-base font-urbanist leading-relaxed">
                      <span className="text-[#B23092] mt-1.5 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-12 sm:mt-16 text-center"
          >
            <div className="bg-[#B23092]/20 border border-[#B23092]/30 rounded-xl p-6 sm:p-8">
              <p className="text-white/90 text-sm sm:text-base font-urbanist">
                For any questions or clarifications regarding these terms and conditions, please contact us at{' '}
                <a href="mailto:info@kshetraretreat.com" className="text-[#B23092] hover:text-[#E24AA8] underline font-semibold">
                  info@kshetraretreat.com
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

