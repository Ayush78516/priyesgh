import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCMS } from "../hooks/useCMS";
import {
  DEFAULT_EVENTS,
  parseEvents,
  splitEvents
} from "../data/events";
import EventCard from "../components/EventCard";
import EventDetailPage from "../components/EventDetailPage";
import {
  Search,
  Calendar,
  CheckCircle,
  HelpCircle,
  Award,
  Video,
  Users,
  Briefcase,
  Compass,
  ArrowRight
} from "lucide-react";

export default function Events() {
  const cms = useCMS();
  const navigate = useNavigate();
  const { eventId } = useParams();

  // Load events from CMS or fallback to default enriched mock data
  const rawEvents = cms("events_data", "");
  const parsedEvents = useMemo(() => parseEvents(rawEvents), [rawEvents]);
  const events = parsedEvents.length > 0 ? parsedEvents : DEFAULT_EVENTS;

  // View States
  const [activeEvent, setActiveEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const currentMonthStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const [activeMonthFilter, setActiveMonthFilter] = useState(currentMonthStr);

  // Extract unique months from all events
  const availableMonths = useMemo(() => {
    const monthSet = new Set();
    monthSet.add(currentMonthStr);
    events.forEach(e => {
      if (e.startDate) {
        const prefix = e.startDate.substring(0, 7); // "YYYY-MM"
        monthSet.add(prefix);
      }
    });
    
    const sorted = Array.from(monthSet).sort((a, b) => b.localeCompare(a));
    const monthNames = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    return sorted.map(ym => {
      const [y, m] = ym.split("-");
      const monthName = monthNames[parseInt(m, 10) - 1];
      return { id: ym, label: `${monthName} ${y}` };
    });
  }, [events]);

  // Synchronize view state with route parameters
  useEffect(() => {
    if (eventId) {
      const foundEvent = events.find(
        (e) => e.id === eventId || e.slug === eventId
      );
      if (foundEvent) {
        setActiveEvent(foundEvent);
      } else {
        setActiveEvent(null);
      }
    } else {
      setActiveEvent(null);
    }
  }, [eventId, events]);

  // Adjust Document Title
  useEffect(() => {
    document.title = activeEvent
      ? `${activeEvent.title} | Council Of Valuers (COV) India`
      : "Events Hub | Council Of Valuers (COV) India";
  }, [activeEvent]);

  // Handle Event Selection
  const handleSelectEvent = (event) => {
    setActiveEvent(event);
    if (navigate) {
      navigate(`/events/${event.slug || event.id}`);
    }
  };

  // Handle Return to List
  const handleBack = () => {
    setActiveEvent(null);
    if (navigate) {
      navigate("/events");
    }
  };

  // Filter Tabs Configuration
  const tabs = [
    { id: "All", label: "All Events" },
    { id: "Upcoming", label: "Upcoming" },
    { id: "Completed", label: "Completed" },
    { id: "Conference", label: "Conferences" },
    { id: "Webinar", label: "Webinars" },
    { id: "Meeting", label: "Meetings" }
  ];

  // Filtering Logic
  const filteredEvents = events.filter((event) => {
    // Tab Filter
    const matchesTab =
      activeTab === "All" ||
      (activeTab === "Upcoming" && event.status === "upcoming") ||
      (activeTab === "Completed" && event.status === "completed") ||
      (activeTab === "Conference" && event.type === "Conference") ||
      (activeTab === "Webinar" && event.type === "Webinar") ||
      (activeTab === "Meeting" && event.type === "Meeting");

    // Search Filter
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === "" ||
      event.title.toLowerCase().includes(query) ||
      event.venue.toLowerCase().includes(query) ||
      (event.speaker && event.speaker.toLowerCase().includes(query)) ||
      (event.summary && event.summary.toLowerCase().includes(query)) ||
      (event.tags && event.tags.some((t) => t.toLowerCase().includes(query)));

    // Month Filter
    const matchesMonth = activeMonthFilter === null || (event.startDate && event.startDate.startsWith(activeMonthFilter));

    return matchesTab && matchesSearch && matchesMonth;
  });

  // Split into grids
  const { upcoming, completed } = splitEvents(filteredEvents);

  // Detail View Rendering
  if (activeEvent) {
    return (
      <AnimatePresence mode="wait">
        <EventDetailPage
          key={activeEvent.id}
          event={activeEvent}
          onBack={handleBack}
        />
      </AnimatePresence>
    );
  }

  // Listing View Rendering
  return (
    <div className="w-full min-h-screen bg-[#f2f9ff]/30 pb-20 font-sans">
      {/* Injecting Local Styles for CSS Animated Navy to Teal Gradient and Search Input Override */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-gradient-bg {
          background: linear-gradient(-45deg, #002b5b, #012a4a, #00a6a6, #002b5b);
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
        }
        .events-search-input {
          background: transparent !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          color: white !important;
        }
        .events-search-input::placeholder {
          color: rgba(255, 255, 255, 0.6) !important;
        }
        .events-search-input:focus {
          outline: none !important;
          box-shadow: none !important;
          border-color: transparent !important;
        }
      `}} />

      {/* HERO BANNER SECTION */}
      <div className="animated-gradient-bg relative w-full text-center py-20 md:py-28 px-4 overflow-hidden shadow-xl mt-10 rounded-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        
        {/* Decorative Floating Circles */}
        <motion.div 
          animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }} 
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"
        />
        <motion.div 
          animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }} 
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 right-10 w-48 h-48 bg-[#00a6a6]/20 rounded-full blur-3xl pointer-events-none"
        />

        <div className="relative max-w-4xl mx-auto z-10 text-center flex flex-col items-center">
          <span className="px-4 py-1.5 text-xs font-black uppercase tracking-widest bg-[#00a6a6] border border-solid border-[#38b6ff]/40 text-white rounded-full shadow-md mb-4 flex items-center gap-1.5">
            <Compass className="w-4 h-4 animate-spin-slow" /> Continuing Professional Education
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mt-0 mb-4 drop-shadow-sm leading-tight">
            Events
          </h1>
          <p className="text-slate-100 text-sm md:text-lg max-w-2xl leading-relaxed mt-0 mb-8 font-medium">
            Elevate your professional standards, network with chartered valuers, and acquire CPD hours through our premium industry forums and conferences.
          </p>

          {/* Integrated Search Input */}
          <div className="relative w-full max-w-xl bg-white/10 backdrop-blur-lg border border-solid border-white/30 p-2.5 rounded-2xl flex items-center shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:bg-white/15 transition-all duration-300 group">
            <Search className="w-5 h-5 text-white/80 ml-3 shrink-0 group-focus-within:text-white transition-colors" />
            <input
              type="text"
              placeholder="Search events, speakers, venue, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full events-search-input bg-transparent border-none outline-none px-3 py-2 text-sm md:text-base font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="bg-white/20 hover:bg-white/30 text-white border-none cursor-pointer rounded-full px-3 py-1 text-xs font-bold transition-colors duration-300 mr-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-white border border-solid border-slate-100 shadow-sm rounded-2xl p-2.5 overflow-x-auto scrollbar-none">
          <div className="flex gap-2 min-w-max justify-start md:justify-center">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-5 py-3 rounded-xl text-xs md:text-sm font-bold border-none cursor-pointer transition-all duration-300 bg-transparent ${isActive ? "text-[#00a6a6] font-extrabold" : "text-slate-500 hover:text-[#012a4a]"
                    }`}
                >
                  <span className="relative z-10">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#00a6a6] rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* MONTHLY FILTER BAR */}
        {availableMonths.length > 0 && (
          <div className="mt-4 flex bg-white/60 backdrop-blur-md rounded-2xl p-2 shadow-inner border border-solid border-slate-200">
            <div className="flex overflow-x-auto scrollbar-none w-full gap-2">
              <button
                onClick={() => setActiveMonthFilter(null)}
                className={`px-5 py-2 text-sm font-bold rounded-xl border-none cursor-pointer transition-all duration-300 shrink-0 ${activeMonthFilter === null ? "bg-[#00a6a6] text-white shadow-md" : "bg-transparent text-slate-500 hover:bg-white hover:text-[#012a4a] hover:shadow-sm"}`}
              >
                All Months
              </button>
              {availableMonths.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMonthFilter(m.id)}
                  className={`px-5 py-2 text-sm font-bold rounded-xl border-none cursor-pointer transition-all duration-300 shrink-0 ${activeMonthFilter === m.id ? "bg-[#00a6a6] text-white shadow-md" : "bg-transparent text-slate-500 hover:bg-white hover:text-[#012a4a] hover:shadow-sm"}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* EVENTS GRIDS */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <AnimatePresence mode="wait">
          {filteredEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center"
            >
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[#012a4a] m-0 mb-2">No Events Found</h3>
              <p className="text-slate-500 text-sm m-0 max-w-md mx-auto leading-relaxed">
                We couldn't find any events matching "{searchQuery}" under the "{activeTab}" filter. Try adjusting your query or filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveTab("All");
                  setActiveMonthFilter(currentMonthStr);
                }}
                className="mt-5 bg-[#00a6a6] hover:bg-[#008c8c] text-white border-none cursor-pointer font-bold px-5 py-2.5 rounded-xl transition duration-300 shadow"
              >
                Reset Filters
              </button>
            </motion.div>
          ) : (
            <div className="space-y-12">

              {/* UPCOMING EVENTS SECTION */}
              {upcoming.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Divider */}
                  <div className="relative flex items-center py-6">
                    <div className="flex-grow border-t border-solid border-[#00a6a6]/25"></div>
                    <span className="flex-shrink mx-4 px-5 py-2.5 bg-[#e8f4f8] border border-solid border-[#00a6a6]/30 text-[#002b5b] rounded-full flex items-center gap-2 text-xs font-black uppercase tracking-wider shadow-sm">
                      <Calendar className="w-4 h-4 text-[#00a6a6]" />
                      Upcoming Seminars & Conferences ({upcoming.length})
                    </span>
                    <div className="flex-grow border-t border-solid border-[#00a6a6]/25"></div>
                  </div>

                  {/* 2-Column Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {upcoming.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onSelect={handleSelectEvent}
                        compact={false}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* COMPLETED EVENTS SECTION */}
              {completed.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Divider */}
                  <div className="relative flex items-center py-6">
                    <div className="flex-grow border-t border-solid border-[#00a6a6]/20"></div>
                    <span className="flex-shrink mx-4 px-5 py-2.5 bg-slate-50 border border-solid border-slate-200 text-slate-600 rounded-full flex items-center gap-2 text-xs font-black uppercase tracking-wider shadow-sm">
                      <CheckCircle className="w-4 h-4 text-slate-400" />
                      Completed Events Registry ({completed.length})
                    </span>
                    <div className="flex-grow border-t border-solid border-[#00a6a6]/20"></div>
                  </div>

                  {/* 3-Column Compact Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {completed.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onSelect={handleSelectEvent}
                        compact={true}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

            </div>
          )}
        </AnimatePresence>
      </div>

      {/* QUICK FOOTER PROMOTION */}
      <div className="max-w-7xl mx-auto px-4 mt-20">
        <div className="bg-gradient-to-r from-[#002b5b] to-[#012a4a] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-lg text-left">
          <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-[#00a6a6]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="max-w-2xl relative z-10">
            <span className="text-xs font-black uppercase tracking-widest text-[#38b6ff] bg-[#38b6ff]/10 px-3 py-1 rounded-full">
              Become a Speaker
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-4 mb-3">
              Share Your Knowledge with India's Valuers
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed m-0 mb-6">
              Are you an expert in valuation methodology, statutory updates, land acquisition policies, or digital forensic accounting? Contact our events committee to chair our next webinar or session.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#00a6a6] hover:bg-[#008c8c] text-white py-3.5 px-6 rounded-xl font-bold tracking-wide shadow-md hover:shadow-lg transition-all duration-300 text-sm no-underline"
            >
              <span>Submit Speaking Proposal</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
