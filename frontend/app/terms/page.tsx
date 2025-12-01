'use client'

import { motion } from 'framer-motion'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function TermsAndConditionsPage() {
  const sections = [
    {
      title: "General Information",
      content: [
        "Kshetra Retreat LLP operates a hospitality property located in Kshetra, Kshetra street, North cliff, Varkala, Kerala, offering accommodation, wellness programs, yoga retreats, vehicle hire & rentals and related services. Accessing or using this website signifies your agreement to these Terms. If you do not agree, please do not use this website.",
        "Brands/Units: (A) Private rooms (\"Kshetra Retreat\"); (B) PinkroomsTM (ladies-only dorm, 12 beds, ground-floor front-side for access and safety); (C) Mixed Dorm (6 beds)."
      ]
    },
    {
      title: "Eligibility",
      content: [
        "You must be 18 years or older to use our website and make bookings. By using our site, you confirm that you are an adult and legally allowed to enter into agreements under Indian law.",
        "If you are under 18, you should only use the site with the permission and supervision of a parent or legal guardian."
      ]
    },
    {
      title: "Booking and Payment Policy",
      content: [
        "All reservations are subject to availability and confirmation.",
        "Full or partial payment may be required to confirm a reservation depending on the rate plan selected.",
        "We accept payment via credit cards, debit cards, UPI, net banking, PCI DSS or other payment methods specified on our website.",
        "Prices are dynamic and may change without notice. However, the price confirmed at the time of booking payment done, will be applicable to your reservation.",
        "Advance Payment for Bookings via Booking.com and Other OTAs:",
        "  • For reservations made through Booking.com or similar online travel agents (OTAs), the entire booking amount is charged in advance at the time of reservation.",
        "  • The payment is processed through the secure payment gateway integrated with Booking.com, and the card details you provide on their platform are used to debit the total booking amount.",
        "  • This payment is collected and settled into our Indian business bank account through an authorized payment processing partner in compliance with Reserve Bank of India (RBI) and Payment Card Industry Data Security Standard (PCI DSS) regulations (pre-authorization debit).",
        "  • Advance payment ensures that your booking is guaranteed and confirmed instantly. Bookings without successful payment authorization will not be considered confirmed.",
        "  • In certain cases, Booking.com may temporarily pre-authorize (place a hold on) the booking amount on your credit or debit card before final settlement to verify card validity. This pre-authorization is automatically converted into a charge upon confirmation."
      ]
    },
    {
      title: "Cancellation and Refund Policy",
      content: [
        "Cancellations made 14 days before check-in are eligible for a full refund.",
        "Cancellations made between 14th and 3rd day before the stay date are eligible for 60% refund.",
        "Cancellations within 48 hours of stay date or no-shows may result in no refund.",
        "Refunds will be processed within 7–14 working days from the cancellation date; to the original payment method.",
        "DECEMBER 22 - JAN 5 EVERY YEAR room bookings on full amount in advance, Special events, retreats, or packages have non-refundable policies."
      ]
    },
    {
      title: "Check-In and Check-Out",
      content: [
        "Check-in time: 2PM (14:00 HRS) IST",
        "Check-out time: 11 AM IST",
        "Early check-in or late check-out is subject to availability and additional charges."
      ]
    },
    {
      title: "Guest Responsibilities and House Rules",
      content: [
        "Guests are required to maintain the peace, cleanliness, and decorum of the property and follow all house rules displayed on-site.",
        "Safety, Security & GM's Authority: CCTV in common areas. Guests must follow safety instructions. The General Manager (GM) has final authority on operations, safety, and administrative decisions in line with policy and law.",
        "Air-Conditioning & Energy Use: Keep windows/doors closed when AC is on. Misuse may incur extra charges or AC switch-off from the main source by the Hotel GM as per hotel policy.",
        "Any damage to property, misuse of facilities, or violation of these terms will result in charges to the guest.",
        "Illegal activities, including possession, use, or distribution of contraband or prohibited substances, are strictly forbidden and, if found; will be reported to the relevant authorities.",
        "Left/Lost found Property: Logged and stored for a limited period; shipping at guest's risk/expense.",
        "No-Smoking Policy:",
        "  • Smoking is strictly prohibited inside all guest rooms, bathrooms, indoor common areas, and the central courtyard, except in designated areas explicitly allotted by the General Manager.",
        "  • If cigarette smoke, tobacco residue, or any contraband substance smell is detected inside a room during checkout or inspection, a mandatory steam-cleaning and deodorization charge will be applied to cover the cost of deep cleaning mattresses, curtains, and furnishings.",
        "  • This charge is non-negotiable and will be added to the guest's final bill.",
        "Noise and Conduct Policy:",
        "  • Shouting, loud singing, or disruptive behaviour is not permitted anywhere on the property.",
        "  • Guests must observe Silent Hours from 10:00 PM to 7:00 AM, during which all noise levels must be kept minimal to ensure a peaceful environment for all residents.",
        "  • Failure to comply with this policy may result in penalties, removal from the property without refund, or denial of future bookings.",
        "Pet Policy:",
        "  • We understand that pets are part of many families; however, to maintain the cultural, hygiene, comfort, and wellness standards of our retreat — especially due to our yoga, wellness, and Ayurvedic treatment spaces — we are unable to accommodate pets on the property.",
        "  • Guests are kindly requested not to bring pets during their stay. This policy helps us ensure a safe, clean, and serene environment for all our guests.",
        "Waste Disposal & Clean-Stay Rewards:",
        "  • To keep Kshetra Retreat & Pinkrooms clean and eco-friendly, we provide clearly labelled bins: 1) Dry/Recyclable waste, 2) Food/Organic waste, and 3) Napkin/Sanitary waste (in Pinkrooms and private rooms).",
        "  • Guests are requested to sort waste into the correct bin and keep their area tidy. Our team may offer surprise rewards* (e.g., beverage vouchers, priority early check-in/late check-out, airport drop off, fee waivers, small merchandise) to guests who leave their area spotless, including after check-out.",
        "  • *Rewards are discretionary, subject to housekeeping verification and availability, non-cash, non-transferable, and cannot be guaranteed."
      ]
    },
    {
      title: "Intellectual Property",
      content: [
        "All content on this website, including text, images, logos, and trademarks, is the property of Kshetra Retreat. You may not reproduce, distribute, or modify any material without prior written consent."
      ]
    },
    {
      title: "Cookies and Tracking Technologies",
      content: [
        "Our website uses cookies and similar technologies to enhance user experience and improve our services. By using our website, you consent to the use of cookies. You can manage or disable cookies through your browser settings."
      ]
    },
    {
      title: "Third-Party Links",
      content: [
        "Our website may contain links to external websites. We are not responsible for their content or privacy practices. Use them at your own discretion."
      ]
    },
    {
      title: "Limitation of Liability",
      content: [
        "Kshetra Retreat shall not be liable for any direct, indirect, incidental, or consequential damages arising from:",
        "  • Use or inability to use our website or services",
        "  • Acts or omissions of third-party service providers",
        "  • Force majeure events beyond our control"
      ]
    },
    {
      title: "Indemnity",
      content: [
        "You agree to indemnify and hold harmless Kshetra Retreat, its owners, and staff from any claims, liabilities, or damages arising from your breach of these Terms or misuse of the website."
      ]
    },
    {
      title: "Governing Law and Jurisdiction",
      content: [
        "These Terms are governed by the laws of India. Any dispute shall be subject to the exclusive jurisdiction of the courts in Trivandrum, Kerala."
      ]
    },
    {
      title: "Updates to Terms",
      content: [
        "We reserve the right to modify or update these Terms at any time without prior notice. The updated Terms will be posted on this page with a revised \"Effective Date.\""
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-20 md:py-24 lg:py-20">
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
            <p className="text-white/80 text-sm sm:text-base md:text-lg font-urbanist mb-2">
              Effective Date: 01 NOV 25
            </p>
            <p className="text-white/70 text-xs sm:text-sm font-urbanist">
              Website: www.kshetraretreat.com
            </p>
            <p className="text-white/60 text-xs sm:text-sm font-urbanist mt-2">
              Owner: Kshetra Retreat LLP, Kshetra street, North cliff, Varkala, Kerala, India - 695141
            </p>
          </motion.div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-12 sm:py-16 md:py-20 bg-black">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px] max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <p className="text-white/90 text-base sm:text-lg font-urbanist leading-relaxed">
              Welcome to the official website of Kshetra Retreat ("we", "our", "us"). By accessing, browsing, or booking services through this website, you ("user", "guest", "you") agree to be bound by these Terms and Conditions ("Terms"). Please read them carefully before using our website or services.
            </p>
          </motion.div>

          <div className="space-y-8 sm:space-y-10">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="space-y-4"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-annie-telescope text-white">
                  {index + 1}. {section.title}
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  {section.content.map((item, itemIndex) => {
                    const isBulletPoint = item.trim().startsWith('•');
                    const isSubBulletPoint = item.trim().startsWith('  •');
                    const isNumbered = /^\d+\.\s/.test(item.trim());
                    
                    if (isSubBulletPoint || isBulletPoint) {
                      return (
                        <div key={itemIndex} className={`flex items-start gap-3 text-white/80 text-base sm:text-lg font-urbanist leading-relaxed ${isSubBulletPoint ? 'ml-4 sm:ml-6' : ''}`}>
                          <span className="text-[#B23092] mt-1.5 flex-shrink-0">•</span>
                          <span>{item.replace(/^[\s•]+/, '')}</span>
                        </div>
                      );
                    } else if (isNumbered) {
                      return (
                        <div key={itemIndex} className="flex items-start gap-3 text-white/80 text-base sm:text-lg font-urbanist leading-relaxed">
                          <span className="text-[#B23092] mt-1.5 flex-shrink-0 font-semibold">{item.match(/^\d+\./)?.[0]}</span>
                          <span>{item.replace(/^\d+\.\s*/, '')}</span>
                        </div>
                      );
                    } else {
                      return (
                        <p key={itemIndex} className="text-white/80 text-base sm:text-lg font-urbanist leading-relaxed">
                          {item}
                        </p>
                      );
                    }
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 1.4 }}
            className="mt-12 sm:mt-16 space-y-4"
          >
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-annie-telescope text-white">
              15. Contact Information
            </h3>
            <p className="text-white/90 text-base sm:text-lg font-urbanist">
              For queries, concerns, or data-related requests, please contact:
            </p>
            <div className="space-y-3 text-white/80 text-base sm:text-lg font-urbanist">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#B23092] mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">Kshetra Retreat LLP</p>
                  <p>Kshetra Street, North Cliff</p>
                  <p>Varkala, Kerala, India - 695141</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#B23092] flex-shrink-0" />
                <a href="mailto:booking@kshetraretreat.com" className="text-[#B23092] hover:text-[#E24AA8] underline">
                  booking@kshetraretreat.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#B23092] flex-shrink-0" />
                <a href="tel:+919447082345" className="text-[#B23092] hover:text-[#E24AA8] underline">
                  +91 9447082345
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
