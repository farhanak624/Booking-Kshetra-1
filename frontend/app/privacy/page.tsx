'use client'

import { motion } from 'framer-motion'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function PrivacyPolicyPage() {
  const privacySections = [
    {
      title: "Personal Data We Collect",
      content: [
        "We may collect the following categories of personal data when you use our website, services, walk-in booking, check-in time and staying:",
        "  • Contact details (name, phone number, email address)",
        "  • Coming from and proceeding to locations",
        "  • Booking and transaction details",
        "  • Government ID (for check-in as required by Indian law)",
        "  • Preferences (dietary, room type, wellness program choices)",
        "  • Device and browsing data (IP address, cookies, analytics)"
      ]
    },
    {
      title: "Purpose of Data Collection",
      content: [
        "We collect and process personal data for:",
        "  • Providing accommodation and related services",
        "  • Booking confirmation, payment processing, and communication",
        "  • Legal compliance with government and tourism regulations",
        "  • Marketing, offers, and newsletters",
        "  • Security, analytics, and service improvement"
      ]
    },
    {
      title: "Consent and User Rights",
      content: [
        "By submitting your data, you provide explicit, free, specific, and informed consent as per the Digital Personal Data Protection Act, 2023.",
        "You have the right to access, correct, update, or request deletion of your data after staying.",
        "You may withdraw your consent at any time after checkout by contacting us at booking@kshetraretreat.com.",
        "Upon withdrawal, we may be unable to provide certain services."
      ]
    },
    {
      title: "Data Storage and Retention",
      content: [
        "Your data is stored securely on servers located within India or jurisdictions compliant with Indian data transfer norms (as per third party server companies).",
        "We retain data only as long as necessary for the purpose it was collected or as required by law."
      ]
    },
    {
      title: "Data Sharing and Disclosure",
      content: [
        "We do not sell your personal data.",
        "Data may be shared with service partners (payment gateways, booking platforms, email service providers) strictly for service delivery.",
        "We may disclose data if required by law, court order, or government authority."
      ]
    },
    {
      title: "Security Measures",
      content: [
        "We implement reasonable technical and organisational safeguards including encryption, access controls, and regular audits to protect your data from unauthorised access, loss, or misuse."
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
              Privacy Policy
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

      {/* Privacy Content */}
      <section className="py-12 sm:py-16 md:py-20 bg-black">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px] max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8 space-y-3"
          >
            <h2 className="text-2xl sm:text-3xl font-annie-telescope text-white">
              Data Collection and Use (DPDP Act Compliance)
            </h2>
            <p className="text-white/90 text-base sm:text-lg font-urbanist leading-relaxed">
              Welcome to Kshetra Retreat. We are committed to protecting your privacy and ensuring the security of your personal data in accordance with the Digital Personal Data Protection Act, 2023 (DPDP Act). This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our website and services.
            </p>
          </motion.div>

          <div className="space-y-8 sm:space-y-10">
            {privacySections.map((section, index) => (
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
                    
                    if (isSubBulletPoint || isBulletPoint) {
                      return (
                        <div key={itemIndex} className={`flex items-start gap-3 text-white/80 text-base sm:text-lg font-urbanist leading-relaxed ${isSubBulletPoint ? 'ml-4 sm:ml-6' : ''}`}>
                          <span className="text-[#B23092] mt-1.5 flex-shrink-0">•</span>
                          <span>{item.replace(/^[\s•]+/, '')}</span>
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

          {/* Cookies Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 sm:mt-10 space-y-4"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-annie-telescope text-white">
              7. Cookies and Tracking Technologies
            </h2>
            <p className="text-white/80 text-base sm:text-lg font-urbanist leading-relaxed">
              Our website uses cookies and similar technologies to enhance user experience and improve our services. By using our website, you consent to the use of cookies. You can manage or disable cookies through your browser settings.
            </p>
          </motion.div>

          {/* Third-Party Links Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-8 sm:mt-10 space-y-4"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-annie-telescope text-white">
              8. Third-Party Links
            </h2>
            <p className="text-white/80 text-base sm:text-lg font-urbanist leading-relaxed">
              Our website may contain links to external websites. We are not responsible for their content or privacy practices. Use them at your own discretion.
            </p>
          </motion.div>

          {/* Updates Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-8 sm:mt-10 space-y-4"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-annie-telescope text-white">
              9. Updates to Privacy Policy
            </h2>
            <p className="text-white/80 text-base sm:text-lg font-urbanist leading-relaxed">
              We reserve the right to modify or update this Privacy Policy at any time without prior notice. The updated policy will be posted on this page with a revised "Effective Date." We encourage you to review this page periodically to stay informed about how we protect your information.
            </p>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="mt-12 sm:mt-16 space-y-4"
          >
            <h3 className="text-2xl sm:text-3xl font-annie-telescope text-white">
              Contact Us for Privacy Concerns
            </h3>
            <p className="text-white/90 text-base sm:text-lg font-urbanist">
              For queries, concerns, data-related requests, or to exercise your rights under the DPDP Act, please contact:
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

