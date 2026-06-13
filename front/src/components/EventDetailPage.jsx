import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, User, ArrowLeft, ShieldAlert, CheckCircle, Award, Sparkles, Target, Users, LayoutList, BookOpen, ExternalLink } from "lucide-react";
import EventRegistrationModal from "./EventRegistrationModal";

export default function EventDetailPage({ event, onBack }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!event) return null;

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

  const renderIcon = (name) => {
    switch (name) {
      case "Target": return <Target className="w-7 h-7 text-[#00a6a6] group-hover:text-white transition-colors duration-300" />;
      case "Users": return <Users className="w-7 h-7 text-[#00a6a6] group-hover:text-white transition-colors duration-300" />;
      case "BookOpen": return <BookOpen className="w-7 h-7 text-[#00a6a6] group-hover:text-white transition-colors duration-300" />;
      case "Award": return <Award className="w-7 h-7 text-[#00a6a6] group-hover:text-white transition-colors duration-300" />;
      case "CheckCircle": return <CheckCircle className="w-7 h-7 text-[#00a6a6] group-hover:text-white transition-colors duration-300" />;
      case "Sparkles": return <Sparkles className="w-7 h-7 text-[#00a6a6] group-hover:text-white transition-colors duration-300" />;
      default: return <Target className="w-7 h-7 text-[#00a6a6] group-hover:text-white transition-colors duration-300" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full bg-[#f2f9ff]/40 min-h-screen text-left"
    >
      {/* HEADER NAVIGATION */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-[#00a6a6] hover:text-[#002b5b] bg-white hover:bg-[#e8f4f8] border border-solid border-[#e8f4f8] px-4 py-2.5 rounded-full font-bold text-sm transition-all duration-300 cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </button>
      </div>

      {/* FULL-WIDTH HERO */}
      <div className="relative w-full overflow-hidden bg-[#002b5b] py-16 md:py-24 px-4 mb-10 shadow-lg">
        {/* Blurred Image Background */}
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-2xl scale-110 opacity-20 pointer-events-none"
          style={{ backgroundImage: `url(${event.image})` }}
        />
        {/* Navy/Blue Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#002b5b] via-[#002b5b]/95 to-[#00a6a6]/30 mix-blend-multiply pointer-events-none" />

        {/* Hero Content Grid */}
        <div className="relative max-w-7xl mx-auto z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-3xl w-full">
            {/* Badges Row */}
            <div className="flex gap-2 flex-wrap mb-6">
              <span className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest bg-[#00a6a6]/20 border border-solid border-[#00a6a6]/50 text-white rounded-full shadow-[0_0_12px_rgba(0,166,166,0.3)] backdrop-blur-sm">
                {event.type}
              </span>
              {isUpcoming && (
                <span className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 border border-solid border-emerald-500/50 text-emerald-300 rounded-full backdrop-blur-sm">
                  Upcoming
                </span>
              )}
              {isCompleted && (
                <span className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest bg-slate-500/20 border border-solid border-slate-500/50 text-slate-300 rounded-full backdrop-blur-sm">
                  Completed
                </span>
              )}
              {isFeatured && (
                <span className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/20 border border-solid border-amber-500/50 text-amber-300 rounded-full backdrop-blur-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" /> Featured
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mt-0 mb-6 drop-shadow-sm">
              {event.title}
            </h1>

            {/* INFO BOXES GRID */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              {/* Date Box */}
              <div className="group bg-white/10 backdrop-blur-md border border-solid border-white/20 rounded-2xl p-4 shadow-lg hover:bg-white/15 hover:-translate-y-1 transition-all duration-300 text-left">
                <Calendar className="w-6 h-6 text-[#38b6ff] mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider m-0 leading-none">Date</p>
                <p className="text-sm font-extrabold text-white m-0 mt-1.5 leading-tight truncate drop-shadow-sm">{formattedDate}</p>
              </div>

              {/* Time Box */}
              <div className="group bg-white/10 backdrop-blur-md border border-solid border-white/20 rounded-2xl p-4 shadow-lg hover:bg-white/15 hover:-translate-y-1 transition-all duration-300 text-left">
                <Clock className="w-6 h-6 text-[#38b6ff] mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider m-0 leading-none">Time</p>
                <p className="text-sm font-extrabold text-white m-0 mt-1.5 leading-tight truncate drop-shadow-sm">{formattedTime}</p>
              </div>

              {/* Venue Box */}
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-white/10 backdrop-blur-md border border-solid border-white/20 rounded-2xl p-4 shadow-lg hover:bg-white/15 hover:-translate-y-1 transition-all duration-300 text-left cursor-pointer block no-underline"
              >
                <div className="flex items-start justify-between">
                  <MapPin className="w-6 h-6 text-[#38b6ff] mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 group-hover:text-[#38b6ff] flex items-center gap-1 transition-colors">
                    View Map <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider m-0 leading-none">Venue</p>
                <p className="text-sm font-extrabold text-white m-0 mt-1.5 leading-tight truncate drop-shadow-sm">{event.venue}</p>
              </a>

              {/* Speaker Box */}
              <div className="group bg-white/10 backdrop-blur-md border border-solid border-white/20 rounded-2xl p-4 shadow-lg hover:bg-white/15 hover:-translate-y-1 transition-all duration-300 text-left">
                <User className="w-6 h-6 text-[#38b6ff] mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider m-0 leading-none">Speaker</p>
                <p className="text-sm font-extrabold text-white m-0 mt-1.5 leading-tight truncate drop-shadow-sm">
                  {event.speakers && event.speakers.length > 1 
                    ? "Multiple Speakers" 
                    : event.speakers && event.speakers.length === 1
                    ? event.speakers[0].name
                    : event.speaker || "TBA"}
                </p>
              </div>
            </div>
          </div>

          {/* Right Side Main Image */}
          {event.image && (
            <div className="w-full md:w-1/3 lg:w-2/5 mt-8 md:mt-0">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-solid border-white/20 flex items-center justify-center">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* LEFT/CENTER COLUMN: Details & Info Cards */}
          <div className="lg:col-span-2 space-y-10">



            {/* EVENT DETAILS */}
            <div className="group bg-white border border-solid border-slate-100 rounded-3xl p-6 md:p-8 shadow-md hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#e8f4f8] to-transparent rounded-bl-full opacity-60 pointer-events-none" />
              <h2 className="text-xl md:text-2xl font-bold text-[#012a4a] pb-4 border-b border-solid border-slate-100 mt-0 mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-[#00a6a6]" />
                About the Event
              </h2>
              <div className="text-slate-700 text-sm md:text-base leading-relaxed whitespace-pre-line mt-0 mb-0 relative z-10 font-medium">
                {event.details || event.description || "No detailed description has been published yet. Join us for an insightful session where industry experts will share their knowledge."}
              </div>
            </div>

            {/* KEY TAKEAWAYS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {event.keyTakeaways && event.keyTakeaways.length > 0 ? (
                event.keyTakeaways.map((takeaway) => (
                  <div key={takeaway.id} className="bg-white border border-solid border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
                    <div className="w-14 h-14 bg-[#f2f9ff] group-hover:bg-[#00a6a6] rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300">
                      {renderIcon(takeaway.icon)}
                    </div>
                    <h3 className="text-lg font-bold text-[#012a4a] mt-0 mb-3">{takeaway.title}</h3>
                    <p className="text-sm text-slate-600 m-0 leading-relaxed font-medium">
                      {takeaway.description}
                    </p>
                  </div>
                ))
              ) : (
                <>
                  <div className="bg-white border border-solid border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
                    <div className="w-14 h-14 bg-[#f2f9ff] group-hover:bg-[#00a6a6] rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300">
                      <Target className="w-7 h-7 text-[#00a6a6] group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="text-lg font-bold text-[#012a4a] mt-0 mb-3">Actionable Insights</h3>
                    <p className="text-sm text-slate-600 m-0 leading-relaxed font-medium">
                      Gain practical strategies, deep industry knowledge, and fresh perspectives that you can immediately apply to your valuation practice.
                    </p>
                  </div>
                  <div className="bg-white border border-solid border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
                    <div className="w-14 h-14 bg-[#f2f9ff] group-hover:bg-[#00a6a6] rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300">
                      <Users className="w-7 h-7 text-[#00a6a6] group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="text-lg font-bold text-[#012a4a] mt-0 mb-3">Elite Networking</h3>
                    <p className="text-sm text-slate-600 m-0 leading-relaxed font-medium">
                      Connect with industry leaders, experienced practitioners, and policymakers in the Indian valuation sector to expand your professional network.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* AGENDA HIGHLIGHTS */}
            <div className="bg-white border border-solid border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <h2 className="text-xl md:text-2xl font-bold text-[#012a4a] pb-4 border-b border-solid border-slate-100 mt-0 mb-8 flex items-center gap-2">
                <LayoutList className="w-6 h-6 text-[#00a6a6]" />
                Schedule Highlights
              </h2>
              
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#00a6a6] before:via-[#00a6a6]/30 before:to-transparent">
                
                {event.scheduleHighlights && event.scheduleHighlights.length > 0 ? (
                  event.scheduleHighlights.map((schedule) => (
                    <div key={schedule.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#00a6a6] shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ml-0 mr-4 md:mx-auto">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-5 rounded-2xl border border-solid border-slate-100 bg-[#f8fbff] shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-[#012a4a] text-base m-0">{schedule.title}</h4>
                          <span className="text-xs font-bold text-[#00a6a6] bg-white px-2.5 py-1 rounded-full shadow-sm border border-slate-100">{schedule.time}</span>
                        </div>
                        <p className="text-sm text-slate-600 m-0 font-medium">{schedule.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    {/* Timeline Item 1 */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#00a6a6] shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ml-0 mr-4 md:mx-auto">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-5 rounded-2xl border border-solid border-slate-100 bg-[#f8fbff] shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-[#012a4a] text-base m-0">Registration & Welcome</h4>
                          <span className="text-xs font-bold text-[#00a6a6] bg-white px-2.5 py-1 rounded-full shadow-sm border border-slate-100">10:00 AM</span>
                        </div>
                        <p className="text-sm text-slate-600 m-0 font-medium">Check-in, collect your badges, and enjoy morning refreshments.</p>
                      </div>
                    </div>

                    {/* Timeline Item 2 */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#00a6a6] shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ml-0 mr-4 md:mx-auto">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-5 rounded-2xl border border-solid border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-[#012a4a] text-base m-0">Keynote Address</h4>
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">11:00 AM</span>
                        </div>
                        <p className="text-sm text-slate-600 m-0 font-medium">Opening insights on the future of the valuation profession.</p>
                      </div>
                    </div>

                    {/* Timeline Item 3 */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-300 shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ml-0 mr-4 md:mx-auto" />
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-5 rounded-2xl border border-solid border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-[#012a4a] text-base m-0">Technical Sessions</h4>
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">02:00 PM</span>
                        </div>
                        <p className="text-sm text-slate-600 m-0 font-medium">Deep dive into recent regulatory updates and case studies.</p>
                      </div>
                    </div>
                  </>
                )}

              </div>
            </div>

            {/* SPEAKER PROFILE BLOCK */}
            {event.speakers && event.speakers.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-xl md:text-2xl font-bold text-[#012a4a] pb-4 border-b border-solid border-slate-100 mt-0 mb-6 flex items-center gap-2">
                  <Award className="w-6 h-6 text-[#00a6a6]" />
                  Featured Speakers
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {event.speakers.map((spk) => (
                    <div key={spk.id} className="group bg-white border border-solid border-slate-100 rounded-3xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 relative overflow-hidden flex flex-col items-center sm:items-start sm:flex-row gap-5 text-center sm:text-left">
                      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#f2f9ff] to-transparent rounded-br-full opacity-60 pointer-events-none" />
                      {spk.avatar ? (
                        <div className="relative shrink-0 z-10">
                          <img
                            src={spk.avatar}
                            alt={spk.name}
                            className="relative w-20 h-20 rounded-full border-4 border-solid border-white object-cover shadow-lg bg-white"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#e8f4f8] to-[#f2f9ff] flex items-center justify-center border-4 border-solid border-white shadow-lg shrink-0 z-10">
                          <User className="w-8 h-8 text-[#00a6a6]" />
                        </div>
                      )}
                      <div className="flex-1 z-10">
                        <h3 className="text-lg md:text-xl font-black text-[#012a4a] mt-0 mb-1">
                          {spk.name}
                        </h3>
                        <p className="text-xs font-bold text-[#00a6a6] uppercase tracking-wider m-0 mb-2 bg-[#e8f4f8] inline-block px-2.5 py-1 rounded-full border border-[#00a6a6]/20">
                          {spk.role || "Expert Speaker"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : event.speaker ? (
              <div className="group bg-white border border-solid border-slate-100 rounded-3xl p-6 md:p-8 shadow-md hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-[#f2f9ff] to-transparent rounded-br-full opacity-60 pointer-events-none" />
                <h2 className="text-xl md:text-2xl font-bold text-[#012a4a] pb-4 border-b border-solid border-slate-100 mt-0 mb-6 flex items-center gap-2">
                  <Award className="w-6 h-6 text-[#00a6a6]" />
                  Featured Speaker
                </h2>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left relative z-10">
                  {event.speakerAvatar ? (
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 bg-[#00a6a6] rounded-full blur-md opacity-40 animate-pulse"></div>
                      <img
                        src={event.speakerAvatar}
                        alt={event.speaker}
                        className="relative w-24 h-24 rounded-full border-4 border-solid border-white object-cover shadow-lg bg-white"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#e8f4f8] to-[#f2f9ff] flex items-center justify-center border-4 border-solid border-white shadow-lg shrink-0">
                      <User className="w-10 h-10 text-[#00a6a6]" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-black text-[#012a4a] mt-0 mb-1">
                      {event.speaker}
                    </h3>
                    <p className="text-sm font-bold text-[#00a6a6] uppercase tracking-wider m-0 mb-3 bg-[#e8f4f8] inline-block px-3 py-1 rounded-full border border-[#00a6a6]/20">
                      {event.speakerRole || event.speakerTitle || "Expert Speaker"}
                    </p>
                    <p className="text-slate-600 text-sm leading-relaxed m-0 font-medium">
                      An experienced practitioner and recognized leader in the Indian valuation sector, delivering specialized knowledge and practical case updates to the COV network.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

          </div>

          {/* RIGHT COLUMN: Glassmorphism Registration Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6 z-10">

              {/* Glassmorphic Registration Card */}
              <div className="relative rounded-3xl p-6 bg-white/75 backdrop-blur-md border border-solid border-[#00a6a6]/30 shadow-xl overflow-hidden">
                {/* Decorative teal radial gradient glow */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#00a6a6]/10 rounded-full blur-2xl pointer-events-none" />

                {/* Card Title */}
                <h3 className="text-base font-bold text-[#012a4a] uppercase tracking-wider m-0 mb-4 pb-2 border-b border-solid border-slate-100">
                  Registration Desk
                </h3>

                {/* Member Fee Display */}
                <div className="mb-6">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider m-0 leading-none">Member Pass Fee</p>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl md:text-4xl font-black text-[#002b5b] tracking-tight">
                      {event.fee || (event.registrationFee ? `Rs ${event.registrationFee}` : "Free")}
                    </span>
                    {event.registrationFee && event.registrationFee !== "0" && (
                      <span className="text-xs font-semibold text-slate-400">INR</span>
                    )}
                  </div>
                </div>

                {/* Status Badges Row */}
                <div className="space-y-3 mb-6 text-sm">
                  {/* Registration open/closed badge */}
                  <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-100">
                    <span className="text-slate-500 text-xs">Registration status</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${event.registrationOpen
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                      {event.registrationOpen ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" /> Open
                        </>
                      ) : (
                        "Closed"
                      )}
                    </span>
                  </div>

                  {/* Payment required badge */}
                  <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-100">
                    <span className="text-slate-500 text-xs">Payment Required</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${event.paymentRequired
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                      {event.paymentRequired ? (
                        <>
                          <ShieldAlert className="w-3.5 h-3.5" /> Required
                        </>
                      ) : (
                        "Not Required"
                      )}
                    </span>
                  </div>

                  {/* Attendance Mode */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-500 text-xs">Attendance Mode</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#f2f9ff] text-[#002b5b] border border-solid border-[#e8f4f8]">
                      {event.mode || "In-person"}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                {event.registrationOpen ? (
                  <motion.button
                    onClick={() => setIsModalOpen(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-[#00a6a6] hover:bg-[#008c8c] text-white py-3.5 px-6 rounded-xl font-bold tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 border-none cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Register Now</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </motion.button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-slate-200 text-slate-400 py-3.5 px-6 rounded-xl font-bold tracking-wide border-none cursor-not-allowed text-center"
                  >
                    Registrations Closed
                  </button>
                )}

                {/* Subtext info */}
                <p className="text-[10px] text-slate-400 text-center leading-normal mt-4 mb-0">
                  {event.paymentRequired
                    ? "Registrations are subject to verification and fee payment. Please ensure your membership is active."
                    : "Admission is free for registered COV members. Registration is mandatory for attendance certificate."}
                </p>
              </div>

              {/* Back to Events Side Card */}
              <div className="bg-[#002b5b] rounded-2xl p-5 text-white shadow-md">
                <h4 className="text-sm font-bold text-[#38b6ff] uppercase tracking-wider mt-0 mb-2">
                  Need Assistance?
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed m-0 mb-3">
                  Have questions about payment, receipt generation, or continuing professional education (CPE) credits?
                </p>
                <a
                  href="/contact"
                  className="text-xs text-white hover:text-[#38b6ff] font-bold underline transition-colors"
                >
                  Contact COV Helpdesk
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <EventRegistrationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        event={event} 
      />
    </motion.div>
  );
}
