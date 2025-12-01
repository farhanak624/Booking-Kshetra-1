"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

const stayLinks = [
  { label: "Rooms & Suites", href: "/rooms" },
  { label: "Book Your Stay", href: "https://live.ipms247.com/booking/book-rooms-kshetraretreatvarkala" },
  // { label: "Photo Gallery", href: "/gallery" },
];

const experienceLinks = [
  // { label: "Spa & Wellness", href: "/spa" },
  { label: "Yoga Sessions", href: "/yoga" },
  { label: "Dining & Cuisine", href: "/dining" },
  { label: "Adventure Sports", href: "/adventure" },
  { label: "Rent a Vehicle", href: "/services" },
  { label: "Airport Transfers", href: "/airport-transport" },

];

const supportLinks = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "FAQs", href: "/faqs" },
];

export default function Footer() {
  return (
    <footer className="bg-[#090515] text-white border-t border-white/10">
      <div className="container mx-auto px-4 py-16 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-6">
            <Link href="/" className="inline-flex flex-col gap-4">
              <img
                src="https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/logo_new.png"
                alt="Kshetra Retreat Logo"
                className="w-36"
              />
            </Link>
            <div className="space-y-2">
              <p className="text-sm text-white/70 font-annie-telescope tracking-wider uppercase">
                Where modern comfort
              </p>
              <p className="text-xl text-[#E24AA8] font-water-brush leading-none">
                meets soulful wellness
              </p>
            </div>
            <div className="flex items-center gap-4">
              {[
                { icon: Twitter, label: "Twitter" },
                { icon: Facebook, label: "Facebook" },
                { icon: Instagram, label: "Instagram" },
              ].map((item) => (
                <a
                  key={item.label}
                  href="#"
                  aria-label={item.label}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-[#E24AA8] hover:text-white transition-all duration-300"
                >
                  <item.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-annie-telescope uppercase tracking-[0.2em] text-white mb-6">
              Stay
            </h4>
            <ul className="space-y-3">
              {stayLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-urbanist text-white/70 hover:text-[#E24AA8] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-annie-telescope uppercase tracking-[0.2em] text-white mb-6">
              Experience
            </h4>
            <ul className="space-y-3">
              {experienceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-urbanist text-white/70 hover:text-[#E24AA8] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-annie-telescope uppercase tracking-[0.2em] text-white mb-6">
              Support
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-urbanist text-white/70 hover:text-[#E24AA8] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-annie-telescope uppercase tracking-[0.2em] text-white">
              Contact
            </h4>
            <ul className="space-y-4 font-urbanist text-sm text-white/80">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#E24AA8] mt-1 flex-shrink-0" />
                <span>Varkala, Kerala</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#E24AA8] flex-shrink-0" />
                <a href="mailto:booking@kshetraretreat.com" className="hover:text-[#E24AA8] transition-colors">
                  booking@kshetraretreat.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#E24AA8] flex-shrink-0" />
                <a href="tel:+919447082345" className="hover:text-[#E24AA8] transition-colors">
                  +91 9447082345
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#070312]">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-xs md:text-sm text-white/50 font-urbanist tracking-wide">
            © 2025 Kshetra Retreat. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
