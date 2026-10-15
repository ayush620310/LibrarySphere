import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { publicAPI } from '../../api/services';
import { PageLoader } from '../../components/ui/Spinner';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Phone, MapPin, Clock, Wifi, MessageCircle, QrCode, Bell,
  ChevronRight, BookOpen, CheckCircle, Info, Star, Sun, Moon,
  Monitor, ExternalLink, ShieldCheck, ArrowRight, Copy, Check
} from 'lucide-react';
import { formatTime, formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

const PublicPage = () => {
  const { id: libraryId } = useParams();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [libraries, setLibraries] = useState([]);
  const [library, setLibrary] = useState(null);
  const [librarySummaries, setLibrarySummaries] = useState({});
  const [notices, setNotices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [seats, setSeats] = useState([]);
  const [availableSeatsBySlot, setAvailableSeatsBySlot] = useState({});
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const fetchLibraries = async () => {
    setLoading(true);
    try {
      const res = await publicAPI.getAllLibraries();
      const libs = res.data.libraries || [];
      setLibraries(libs);

      const summaries = await Promise.all(libs.map(async (lib) => {
        try {
          const [seatsRes, slotsRes] = await Promise.all([
            publicAPI.getSeats(lib._id),
            publicAPI.getSlots(lib._id),
          ]);

          const activeSlots = (slotsRes.data.slots || []).filter(s => s.isActive);
          const minSlotFee = activeSlots.length ? Math.min(...activeSlots.map(s => s.monthlyFee || 0)) : null;

          return [lib._id, {
            totalSeats: seatsRes.data.seats?.length || 0,
            activeSlotsCount: activeSlots.length,
            minSlotFee,
          }];
        } catch (error) {
          return [lib._id, { totalSeats: 0, activeSlotsCount: 0, minSlotFee: null }];
        }
      }));

      setLibrarySummaries(Object.fromEntries(summaries));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLibraryDetail = async (id) => {
    setDetailLoading(true);
    try {
      const [libRes, noticesRes, slotsRes, seatsRes] = await Promise.all([
        publicAPI.getLibraryById(id),
        publicAPI.getNotices(id),
        publicAPI.getSlots(id),
        publicAPI.getSeats(id),
      ]);

      setLibrary(libRes.data.library);
      setNotices(noticesRes.data.notices || []);
      const activeSlots = (slotsRes.data.slots || []).filter(s => s.isActive);
      setSlots(activeSlots);
      setSeats(seatsRes.data.seats || []);
    } catch (error) {
      console.error(error);
      setLibrary(null);
      setNotices([]);
      setSlots([]);
      setSeats([]);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraries();
  }, []);

  useEffect(() => {
    if (libraryId) {
      fetchLibraryDetail(libraryId);
    } else {
      setLibrary(null);
      setNotices([]);
      setSlots([]);
      setSeats([]);
      setAvailableSeatsBySlot({});
    }
  }, [libraryId]);

  useEffect(() => {
    if (!slots.length || !libraryId) return;
    setAvailabilityLoading(true);
    Promise.all(slots.map(slot =>
      publicAPI.getAvailableSeats(slot._id, libraryId)
        .then(res => ({ slotId: slot._id, seats: res.data.seats }))
        .catch(() => ({ slotId: slot._id, seats: [] }))
    ))
      .then(results => {
        const map = {};
        results.forEach(item => { map[item.slotId] = item.seats; });
        setAvailableSeatsBySlot(map);
      })
      .finally(() => setAvailabilityLoading(false));
  }, [slots, libraryId]);

  const copyUpiId = (upiId) => {
    if (!upiId) return;
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    toast.success('UPI ID copied to clipboard');
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  if (loading && !libraryId) return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-950 flex items-center justify-center font-sans">
      <PageLoader message="Discovering study spaces..." />
    </div>
  );

  if (libraryId && detailLoading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-950 flex items-center justify-center font-sans">
      <PageLoader message="Loading library profile..." />
    </div>
  );

  if (!libraryId && !libraries.length) return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-950 flex items-center justify-center px-4 py-20 font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-primary-500/10 blur-[120px] pointer-events-none" />
      <div className="max-w-xl w-full rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-surface-900/90 p-8 sm:p-12 shadow-2xl text-center relative z-10 backdrop-blur-md">
        <div className="inline-flex items-center justify-center mb-6 w-16 h-16 rounded-3xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white mx-auto shadow-glow">
          <BookOpen size={30} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-display tracking-tight mb-3">
          Welcome to LibraryOS
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm sm:text-base leading-relaxed">
          The all-in-one software for study hall and library owners. Register your study space, organize shifts, manage student admissions, and collect monthly dues effortlessly.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onClick={() => navigate('/admin/signup')} className="btn-primary w-full sm:w-auto min-w-[170px] py-3 text-sm font-bold shadow-glow-sm">
            Owner Registration
          </button>
          <button onClick={() => navigate('/admin/login')} className="btn-secondary w-full sm:w-auto min-w-[170px] py-3 text-sm font-bold">
            Owner Portal Login
          </button>
        </div>
      </div>
    </div>
  );

  if (libraryId && !library) return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-950 flex flex-col items-center justify-center text-slate-500 gap-4 p-4 font-sans">
      <p className="text-base font-bold text-slate-800 dark:text-slate-200">Library profile not found.</p>
      <button onClick={() => navigate('/')} className="btn-secondary">
        Return to Directory
      </button>
    </div>
  );

  const totalSeats = seats.length;
  const getAvailableSeats = (slotId) => {
    const availableNums = availableSeatsBySlot[slotId] || [];
    return {
      available: availableNums.length,
      availableNums: availableNums.map(s => s.seatNumber),
    };
  };

  // Directory View (When no libraryId specified)
  if (!libraryId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-surface-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-primary-500 selection:text-white">
        {/* Navigation Bar */}
        <nav className="sticky top-0 z-40 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 via-indigo-600 to-primary-500 flex items-center justify-center text-white shadow-glow-sm shadow-primary-500/20">
                <BookOpen size={20} />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 dark:text-white font-display text-base tracking-tight">
                  LibraryOS
                </span>
                <span className="hidden sm:inline-block text-[11px] text-slate-400 dark:text-slate-500 ml-2 font-medium">
                  Public Directory
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => navigate('/admin/login')}
                className="btn-secondary text-xs sm:text-sm !py-2"
              >
                Owner Login
              </button>
              <button
                onClick={() => navigate('/admin/signup')}
                className="btn-primary text-xs sm:text-sm !py-2"
              >
                Owner Signup
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12 animate-fade-in">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-primary-950 to-slate-900 text-white p-8 sm:p-12 shadow-2xl border border-primary-500/20">
            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 border border-primary-400/30 text-primary-300 text-xs font-semibold">
                <Star size={13} className="text-amber-400" />
                <span>Verified Study Halls & Libraries</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight leading-tight">
                Find Peaceful Desks & Quiet Study Spaces Near You.
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                Browse shift timings, compare monthly fees, inspect live available seat counts, and register directly with library owners.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/admin/signup')}
                  className="btn-primary py-3 px-6 text-sm font-bold shadow-glow"
                >
                  List Your Library
                </button>
                <button
                  onClick={() => navigate('/admin/login')}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold backdrop-blur-md transition-all border border-white/10"
                >
                  Owner Portal
                </button>
              </div>
            </div>

            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/15 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Directory Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                  Featured Libraries & Study Centers
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Click any study space card to view facilities, hourly shifts, and free desk numbers
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-surface-800 text-slate-600 dark:text-slate-300">
                {libraries.length} location{libraries.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {libraries.map(lib => {
                const summary = librarySummaries[lib._id] || {};
                return (
                  <button
                    key={lib._id}
                    type="button"
                    onClick={() => navigate(`/library/${lib._id}`)}
                    className="card group p-6 text-left hover:border-primary-500/40 dark:hover:border-primary-500/40 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-display group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {lib.name}
                          </h3>
                          {lib.address && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                              <MapPin size={12} className="text-primary-500 shrink-0" />
                              <span className="line-clamp-1">{lib.address}</span>
                            </p>
                          )}
                        </div>

                        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-surface-800 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700/60 overflow-hidden shadow-sm">
                          {lib.logo ? (
                            <img src={lib.logo} alt={lib.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                          ) : (
                            <BookOpen size={24} className="text-primary-600 dark:text-primary-400" />
                          )}
                        </div>
                      </div>

                      {/* Summary Metrics */}
                      <div className="grid grid-cols-3 gap-2 mt-5 text-center">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-surface-850 border border-slate-200/50 dark:border-slate-800">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Desks</p>
                          <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5 font-display">
                            {summary.totalSeats ?? '—'}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-surface-850 border border-slate-200/50 dark:border-slate-800">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Shifts</p>
                          <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5 font-display">
                            {summary.activeSlotsCount ?? '—'}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-surface-850 border border-slate-200/50 dark:border-slate-800">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">From</p>
                          <p className="text-base font-extrabold text-primary-600 dark:text-primary-400 mt-0.5 font-display">
                            {summary.minSlotFee !== null ? formatCurrency(summary.minSlotFee) : '—'}
                          </p>
                        </div>
                      </div>

                      {lib.facilities?.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {lib.facilities.slice(0, 3).map((facility, index) => (
                            <span
                              key={index}
                              className="text-[11px] font-semibold bg-slate-100 dark:bg-surface-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-md"
                            >
                              {facility}
                            </span>
                          ))}
                          {lib.facilities.length > 3 && (
                            <span className="text-[11px] font-semibold text-slate-400 self-center">
                              +{lib.facilities.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-primary-600 dark:text-primary-400">
                      <span>Explore shifts & available desks</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Global Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-4 text-center mt-20">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Powered by LibraryOS — Intelligent Library & Seat Management System
          </p>
          <div className="mt-2 flex items-center justify-center gap-4 text-xs font-semibold text-slate-400">
            <button onClick={() => navigate('/admin/login')} className="hover:text-primary-600">Admin Login</button>
            <span>•</span>
            <button onClick={() => navigate('/admin/signup')} className="hover:text-primary-600">Owner Signup</button>
          </div>
        </footer>
      </div>
    );
  }

  // Single Library Full View
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-primary-500 selection:text-white">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary !py-1.5 text-xs font-bold"
            >
              ← All Libraries
            </button>
            <div className="flex items-center gap-2.5">
              {library.logo ? (
                <img src={library.logo} alt="Logo" loading="lazy" decoding="async" className="w-8 h-8 rounded-xl object-cover shadow-sm" />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center text-white">
                  <BookOpen size={16} />
                </div>
              )}
              <span className="font-extrabold text-slate-900 dark:text-white font-display text-sm sm:text-base">
                {library.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {library.whatsappNumber && (
              <a
                href={`https://wa.me/${library.whatsappNumber.replace(/\D/g, '')}?text=Hello!%20I%20would%20like%20to%20inquire%20about%20seat%20availability%20at%20${encodeURIComponent(library.name)}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-[0.98]"
              >
                <MessageCircle size={15} />
                <span className="hidden sm:inline">WhatsApp Inquiries</span>
                <span className="sm:hidden">Chat</span>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero / Cover Banner */}
      {library.coverBanner ? (
        <div className="relative h-64 sm:h-96 overflow-hidden">
          <img
            src={library.coverBanner}
            alt="Library Cover"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute bottom-8 left-0 right-0 text-center px-4">
            <h1 className="text-3xl sm:text-5xl font-black text-white font-display drop-shadow-md">
              {library.name}
            </h1>
            {library.address && (
              <p className="text-slate-200 text-xs sm:text-sm mt-2 flex items-center justify-center gap-1.5 font-medium">
                <MapPin size={14} className="text-primary-400" />
                <span>{library.address}</span>
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-primary-950 to-slate-900 py-16 sm:py-24 px-4 text-center text-white border-b border-primary-500/20">
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight mb-2">
            {library.name}
          </h1>
          {library.address && (
            <p className="text-slate-300 text-xs sm:text-sm flex items-center justify-center gap-1.5 font-medium">
              <MapPin size={14} className="text-primary-400" />
              <span>{library.address}</span>
            </p>
          )}
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/15 rounded-full blur-3xl pointer-events-none" />
        </div>
      )}

      {/* Content Container */}
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-12 animate-fade-in">
        {/* Active Notices Section */}
        {notices.length > 0 && (
          <section className="space-y-3">
            <SectionTitle icon={Bell} title="Important Notice Board" />
            <div className="space-y-3">
              {notices.map(notice => (
                <div
                  key={notice._id}
                  className="p-5 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30"
                >
                  <p className="font-extrabold text-amber-900 dark:text-amber-300 text-base font-display">
                    {notice.title}
                  </p>
                  <p className="text-xs sm:text-sm text-amber-800/90 dark:text-amber-400 mt-1.5 whitespace-pre-wrap leading-relaxed">
                    {notice.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* About Section */}
        {library.about && (
          <section className="space-y-3">
            <SectionTitle icon={Info} title="About the Space" />
            <div className="card p-6">
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {library.about}
              </p>
            </div>
          </section>
        )}

        {/* Study Shifts & Desk Availability */}
        {slots.length > 0 && (
          <section className="space-y-4">
            <SectionTitle icon={Clock} title="Shift Timings & Available Desks" />
            <div className="grid gap-4 sm:grid-cols-2">
              {slots.map(slot => {
                const { available, availableNums } = getAvailableSeats(slot._id);
                return (
                  <div key={slot._id} className="card p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-lg font-display">
                          {slot.name}
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                          <Clock size={13} className="text-primary-500" />
                          <span>{formatTime(slot.startTime)} – {formatTime(slot.endTime)}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-primary-600 dark:text-primary-400 font-display">
                          {formatCurrency(slot.monthlyFee)}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium">/ month</p>
                      </div>
                    </div>

                    <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-xs font-bold mb-2">
                        <span className="text-slate-500">Free Desks:</span>
                        <span className={available > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}>
                          {available} of {totalSeats} Free
                        </span>
                      </div>

                      {availableNums.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {availableNums.slice(0, 10).map(n => (
                            <span
                              key={n}
                              className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                            >
                              {n}
                            </span>
                          ))}
                          {availableNums.length > 10 && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-surface-800 text-slate-500">
                              +{availableNums.length - 10} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-rose-500 font-medium mt-1">
                          All seats booked for this shift
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Photo Gallery with Lazy Loading */}
        {library.gallery?.length > 0 && (
          <section className="space-y-4">
            <SectionTitle icon={Star} title="Study Space Gallery" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {library.gallery.map((img, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm aspect-video">
                  <img
                    src={img}
                    alt={`Photo ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Amenities & Facilities */}
        {library.facilities?.length > 0 && (
          <section className="space-y-4">
            <SectionTitle icon={CheckCircle} title="Facilities & Amenities" />
            <div className="flex flex-wrap gap-2.5">
              {library.facilities.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-surface-850 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold border border-slate-200/70 dark:border-slate-800 shadow-sm"
                >
                  <CheckCircle size={15} className="text-primary-600 dark:text-primary-400" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Rules Section */}
        {library.rules?.length > 0 && (
          <section className="space-y-4">
            <SectionTitle icon={Info} title="Library Rules & Guidelines" />
            <div className="space-y-2.5">
              {library.rules.map((rule, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3.5 p-4 rounded-2xl bg-white dark:bg-surface-850 border border-slate-200/70 dark:border-slate-800 text-xs sm:text-sm"
                >
                  <span className="w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {rule}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Operating Hours & Direct Contact */}
        <section className="grid sm:grid-cols-2 gap-5">
          <div className="card p-6 space-y-2">
            <h3 className="font-extrabold text-slate-900 dark:text-white mb-2 flex items-center gap-2 font-display text-base">
              <Clock size={18} className="text-primary-600 dark:text-primary-400" />
              <span>Library Hours</span>
            </h3>
            {library.is24Hours ? (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                <Sun size={18} />
                <span>Open 24/7 (Day & Night shifts available)</span>
              </div>
            ) : (
              <p className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                Daily: {formatTime(library.openingTime)} – {formatTime(library.closingTime)}
              </p>
            )}
          </div>

          <div className="card p-6 space-y-2">
            <h3 className="font-extrabold text-slate-900 dark:text-white mb-2 flex items-center gap-2 font-display text-base">
              <Phone size={18} className="text-primary-600 dark:text-primary-400" />
              <span>Contact Management</span>
            </h3>
            <div className="space-y-2">
              {library.contactNumber && (
                <a
                  href={`tel:${library.contactNumber}`}
                  className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 hover:text-primary-600 font-semibold transition-colors"
                >
                  <Phone size={14} className="text-primary-500" />
                  <span>{library.contactNumber}</span>
                </a>
              )}
              {library.whatsappNumber && (
                <a
                  href={`https://wa.me/${library.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-semibold transition-colors"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp: {library.whatsappNumber}</span>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* UPI Payments & QR Code */}
        {(library.upiId || library.upiQr) && (
          <section className="space-y-4">
            <SectionTitle icon={QrCode} title="Fee Payment via UPI" />
            <div className="card p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              {library.upiQr && (
                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm shrink-0">
                  <img
                    src={library.upiQr}
                    alt="UPI QR Code"
                    loading="lazy"
                    decoding="async"
                    className="w-44 h-44 object-contain rounded-xl"
                  />
                </div>
              )}
              <div className="space-y-3 text-center sm:text-left">
                {library.upiId && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Official UPI ID</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                      <span className="text-lg font-black text-slate-900 dark:text-white font-display">
                        {library.upiId}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyUpiId(library.upiId)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-surface-800 text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors"
                        title="Copy UPI ID"
                      >
                        {copiedUpi ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                )}
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
                  Pay through GPay, PhonePe, Paytm, or any UPI app. Send the payment screenshot to WhatsApp for immediate confirmation.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Google Maps Location */}
        {library.googleMapsLink && (
          <section className="space-y-4">
            <SectionTitle icon={MapPin} title="Visit Study Center" />
            <div className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {library.address || 'Click below to view the exact location in Google Maps.'}
                </p>
                <p className="text-xs text-slate-400 mt-1">Get driving directions directly to our doors</p>
              </div>
              <a
                href={library.googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary self-start sm:self-auto shrink-0 py-3"
              >
                <MapPin size={16} />
                <span>Open in Google Maps</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-20 py-10 px-4 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} {library.name}. All rights reserved.
        </p>
        <div className="mt-2 flex items-center justify-center gap-3 text-xs text-slate-400">
          <button onClick={() => navigate('/admin/login')} className="hover:text-primary-600">
            Owner Portal Login
          </button>
          <span>•</span>
          <button onClick={() => navigate('/')} className="hover:text-primary-600">
            All Libraries
          </button>
        </div>
      </footer>
    </div>
  );
};

const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-500/15 to-indigo-500/15 border border-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
      <Icon size={18} />
    </div>
    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
      {title}
    </h2>
  </div>
);

export default PublicPage;
