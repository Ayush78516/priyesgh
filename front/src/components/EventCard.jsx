import React from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowRight, Award } from "lucide-react";

export default function EventCard({ event, onSelect, compact = false }) {
  const isUpcoming = event.status === "upcoming";
  const isCompleted = event.status === "completed";
  const isFeatured = event.featured;

  // Format Date Helper
  const formattedDate = event.date || (event.startDate ? new Date(event.startDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }) : "TBA");

  // Format Time Helper
  const formattedTime = event.time || (event.startTime ? `${event.startTime} - ${event.endTime || ""}` : "TBA");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -8 }}
      onClick={() => onSelect && onSelect(event)}
      className={`group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-solid border-[#022b5b]/8 hover:border-[#00a6a6]/40 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer ${
        compact ? "h-full" : ""
      }`}
    >
      {/* CARD IMAGE CONTAINER */}
      <div className={`relative overflow-hidden w-full ${compact ? "h-48" : "h-56"} bg-[#e8f4f8]`}>
        {/* Full-bleed Image with optional grayscale for completed events */}
        <img
          src={event.image || "https://placehold.co/800x450/002b5b/ffffff?text=COV+Event"}
          alt={event.title}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
            isCompleted ? "grayscale contrast-125" : ""
          }`}
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#012a4a]/90 via-[#012a4a]/40 to-transparent" />

        {/* Floating Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {/* Status Badge */}
          {isUpcoming && (
            <span className="px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-white bg-[#00a6a6] rounded-full shadow-[0_0_12px_rgba(0,166,166,0.6)]">
              Upcoming
            </span>
          )}
          {isCompleted && (
            <span className="px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-white bg-[#002b5b]/80 rounded-full">
              Completed
            </span>
          )}
          {/* Featured Badge */}
          {isFeatured && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#012a4a] bg-amber-400 border border-amber-300 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]">
              <Award className="w-3.5 h-3.5 text-[#012a4a]" /> Featured
            </span>
          )}
        </div>

        {/* Diagonal "Completed" Ribbon */}
        {isCompleted && (
          <div className="absolute top-0 right-0 w-28 h-28 overflow-hidden pointer-events-none z-10">
            <div className="absolute top-6 -right-8 w-36 py-1 text-center bg-[#012a4a] text-white text-xs font-extrabold uppercase tracking-widest rotate-45 shadow-sm">
              Completed
            </div>
          </div>
        )}

        {/* Speaker Circular Avatar pinned to bottom-left corner of image */}
        {event.speakerAvatar && (
          <div className="absolute bottom-3 left-4 flex items-center gap-2.5 z-10">
            <div className="relative">
              <img
                src={event.speakerAvatar}
                alt={event.speaker || "Speaker"}
                className="w-10 h-10 rounded-full border-2 border-solid border-[#00a6a6] bg-white object-cover shadow-lg"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-solid border-white rounded-full shadow-sm"></span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-200 uppercase tracking-wider m-0 leading-none drop-shadow-md">Speaker</p>
              <p className="text-sm font-bold text-white m-0 mt-0.5 leading-tight drop-shadow-md">{event.speaker}</p>
            </div>
          </div>
        )}

        {/* Event Title Overlaid at bottom of image (if not compact, otherwise title goes below) */}
        {!compact && (
          <div className="absolute bottom-3 right-4 left-36 z-10 text-right">
            <span className="px-2.5 py-1 text-xs font-extrabold tracking-wider bg-white/20 backdrop-blur-md border border-solid border-white/30 text-white rounded shadow-md uppercase">
              {event.type}
            </span>
          </div>
        )}
      </div>

      {/* CARD CONTENT */}
      <div className="p-6 flex flex-col flex-grow text-left relative">
        {/* Title & Tags */}
        <div className="mb-3">
          <div className="flex gap-2 flex-wrap mb-2">
            {event.tags && event.tags.slice(0, compact ? 2 : 3).map((tag, idx) => (
              <span
                key={idx}
                className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                  tag === "FEATURED"
                    ? "bg-amber-100 text-amber-800"
                    : tag === "PAYMENT REQUIRED"
                    ? "bg-rose-100 text-rose-800"
                    : "bg-[#f2f9ff] text-[#002b5b]"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
          <h3 className="text-xl font-bold text-[#012a4a] leading-snug hover:text-[#00a6a6] transition-colors duration-300 mt-1 mb-0 line-clamp-2">
            {event.title}
          </h3>
        </div>

        {/* Metadata: Date and Venue */}
        <div className="flex flex-col gap-2.5 text-slate-500 text-sm mb-5 mt-auto">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-[#00a6a6] shrink-0" />
            <span className="font-medium">{formattedDate} • {formattedTime}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-[#00a6a6] shrink-0" />
            <span className="font-medium truncate">{event.venue}</span>
          </div>
        </div>



        {/* Footer Details: Price and CTA */}
        <div className="flex items-center justify-between border-t border-solid border-slate-100 pt-3.5 mt-auto">
          <div className="text-left">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider m-0 leading-none">Member Fee</p>
            <p className="text-base font-extrabold text-[#012a4a] m-0 mt-1">{event.fee || (event.registrationFee ? `Rs ${event.registrationFee}` : "Free")}</p>
          </div>
          <div className="flex items-center text-[#00a6a6] font-bold text-sm gap-1.5 group-hover:gap-2.5 transition-all duration-300">
            <span>Details</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

      </div>
    </motion.div>
  );
}
