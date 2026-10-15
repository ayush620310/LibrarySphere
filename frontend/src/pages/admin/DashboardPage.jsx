import { useEffect, useState } from 'react';
import {
  Users, Armchair, IndianRupee, AlertCircle, Clock,
  TrendingUp, UserPlus, ChevronRight, CheckCircle, Search,
  ArrowUpDown, Sparkles, Plus, Calendar, Bell
} from 'lucide-react';
import { dashboardAPI } from '../../api/services';
import { PageLoader } from '../../components/ui/Spinner';
import StatCard from '../../components/ui/StatCard';
import Modal from '../../components/ui/Modal';
import { formatCurrency, formatTime } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slotDetails, setSlotDetails] = useState(null);
  const [slotDetailLoading, setSlotDetailLoading] = useState(false);
  const [slotSearch, setSlotSearch] = useState('');
  const [slotSortField, setSlotSortField] = useState('seatNumber');
  const [slotSortOrder, setSlotSortOrder] = useState('asc');
  const navigate = useNavigate();

  useEffect(() => {
    dashboardAPI.get()
      .then(res => setData(res.data.dashboard))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const compareSeatNumbers = (a, b) => {
    const aNum = Number(a.replace(/\D/g, '')) || 0;
    const bNum = Number(b.replace(/\D/g, '')) || 0;
    if (aNum !== bNum) return aNum - bNum;
    return a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true });
  };

  const openSlotDetails = async (slotId) => {
    setSlotDetailLoading(true);
    setSlotDetails(null);
    setSlotSearch('');
    setSlotSortField('seatNumber');
    setSlotSortOrder('asc');
    try {
      const res = await dashboardAPI.getSlotDetails(slotId);
      setSlotDetails(res.data.slotDetails);
    } catch (err) {
      toast.error('Failed to load slot details.');
    } finally {
      setSlotDetailLoading(false);
    }
  };

  const closeSlotDetails = () => {
    setSlotDetails(null);
  };

  if (loading) return <PageLoader message="Loading dashboard metrics..." />;
  if (!data) return (
    <div className="card p-12 text-center max-w-lg mx-auto">
      <AlertCircle size={36} className="text-rose-500 mx-auto mb-3 opacity-80" />
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Failed to load dashboard</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5">Could not fetch your library metrics.</p>
      <button onClick={() => window.location.reload()} className="btn-secondary mx-auto">
        Retry
      </button>
    </div>
  );

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-950 via-slate-900 to-primary-900 text-white p-6 sm:p-8 shadow-xl border border-primary-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 border border-primary-400/30 text-primary-300 text-xs font-semibold">
              <Sparkles size={13} className="text-primary-300" />
              <span>Library Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white">
              {greeting}, Owner
            </h1>
            <p className="text-sm text-slate-300 max-w-xl font-medium">
              Today is {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}. Here is the real-time status of your seats and revenue.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => navigate('/admin/members?action=add')}
              className="btn-primary"
            >
              <UserPlus size={16} />
              <span>Enroll Member</span>
            </button>
            <button
              onClick={() => navigate('/admin/seats')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs md:text-sm font-semibold backdrop-blur-md transition-all border border-white/10 flex items-center gap-2"
            >
              <Armchair size={16} />
              <span>Manage Seats</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative glow orb */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Primary KPI Metrics */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="section-title">Overview Stats</h2>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Live indicators</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Members"
            value={data.totalMembers}
            icon={Users}
            color="blue"
            subtitle={`${data.activeMembers} active accounts`}
            onClick={() => navigate('/admin/members')}
          />
          <StatCard
            label="Total Seats"
            value={data.totalSeats}
            icon={Armchair}
            color="slate"
            subtitle={`${data.availableSeats} unallocated`}
            onClick={() => navigate('/admin/seats')}
          />
          <StatCard
            label="Collected Today"
            value={formatCurrency(data.feeCollectedToday)}
            icon={IndianRupee}
            color="green"
            subtitle="Today's payments"
            onClick={() => navigate('/admin/fees?filter=today')}
          />
          <StatCard
            label="New Admissions"
            value={data.newAdmissionsToday}
            icon={UserPlus}
            color="purple"
            subtitle="Registered today"
            onClick={() => navigate('/admin/members')}
          />
        </div>
      </div>

      {/* Critical Fee Alerts */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="section-title">Payment Attention</h2>
          <span className="text-xs font-semibold text-slate-400">Action items</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            className="card p-5 border-l-4 border-l-rose-500 cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 transition-all group"
            onClick={() => navigate('/admin/fees?filter=overdue')}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Overdue Fees
                  </p>
                </div>
                <p className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 font-display mt-2">
                  {data.overdueFeesCount}
                </p>
                <p className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-1 group-hover:text-rose-600 transition-colors">
                  <span>View overdue members</span>
                  <ChevronRight size={13} />
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200/60 dark:border-rose-900/40">
                <AlertCircle size={22} />
              </div>
            </div>
          </div>

          <div
            className="card p-5 border-l-4 border-l-amber-500 cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 transition-all group"
            onClick={() => navigate('/admin/fees?filter=duetoday')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Due Today
                </p>
                <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-display mt-2">
                  {data.dueTodayCount}
                </p>
                <p className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-1 group-hover:text-amber-600 transition-colors">
                  <span>Follow up with members</span>
                  <ChevronRight size={13} />
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/60 dark:border-amber-900/40">
                <Clock size={22} />
              </div>
            </div>
          </div>

          <div
            className="card p-5 border-l-4 border-l-primary-500 cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 transition-all group"
            onClick={() => navigate('/admin/fees?filter=duetomorrow')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Due Tomorrow
                </p>
                <p className="text-3xl font-extrabold text-primary-600 dark:text-primary-400 font-display mt-2">
                  {data.dueTomorrowCount}
                </p>
                <p className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-1 group-hover:text-primary-600 transition-colors">
                  <span>Upcoming collection</span>
                  <ChevronRight size={13} />
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 border border-primary-200/60 dark:border-primary-900/40">
                <Calendar size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slot Occupancy Matrix */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-title">Shift & Slot Occupancy</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click any shift card to view member assignments and seat lists
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/slots')}
            className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
          >
            <span>Manage Shifts</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {data.slotStats.map((s) => (
            <button
              key={s.slot._id}
              type="button"
              onClick={() => openSlotDetails(s.slot._id)}
              className="card group p-5 text-left hover:border-primary-500/40 dark:hover:border-primary-500/40 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base font-display group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {s.slot.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    <Clock size={12} className="text-slate-400" />
                    <span>{formatTime(s.slot.startTime)} – {formatTime(s.slot.endTime)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-surface-800 text-slate-700 dark:text-slate-300">
                    {s.occupancyPercent}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-surface-800 rounded-full h-2.5 mb-3.5 overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-primary-500 to-indigo-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(s.occupancyPercent, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-600 dark:text-slate-400">
                  <strong className="text-slate-900 dark:text-white font-bold">{s.occupied}</strong> / {s.total} Seats Occupied
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-900/40">
                  {s.available} Available
                </span>
              </div>

              {s.availableSeatNumbers.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    Available Desks:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {s.availableSeatNumbers.slice(0, 7).map((n) => (
                      <span
                        key={n}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60"
                      >
                        {n}
                      </span>
                    ))}
                    {s.availableSeatNumbers.length > 7 && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-surface-800 text-slate-500">
                        +{s.availableSeatNumbers.length - 7} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </button>
          ))}

          {data.slotStats.length === 0 && (
            <div className="card p-12 col-span-full text-center">
              <Clock size={36} className="text-slate-400 mx-auto mb-2 opacity-60" />
              <p className="text-base font-bold text-slate-800 dark:text-slate-200 font-display">No active shifts found</p>
              <p className="text-sm text-slate-500 mt-1 mb-4">Set up morning, evening, or full-day study shifts.</p>
              <button className="btn-primary mx-auto" onClick={() => navigate('/admin/slots')}>
                <Plus size={16} /> Create Shifts
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Slot Details Drilldown Modal */}
      <Modal
        isOpen={Boolean(slotDetails)}
        onClose={closeSlotDetails}
        title={slotDetails ? `${slotDetails.slot.name} Assignment Details` : 'Slot Details'}
        size="lg"
      >
        {slotDetailLoading ? (
          <PageLoader message="Loading shift details..." />
        ) : slotDetails ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-surface-850 border border-slate-200/60 dark:border-slate-800">
                <p className="text-[11px] font-bold uppercase text-slate-400">Total Desks</p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 font-display">
                  {slotDetails.summary.totalSeats}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-surface-850 border border-slate-200/60 dark:border-slate-800">
                <p className="text-[11px] font-bold uppercase text-slate-400">Occupied</p>
                <p className="text-xl font-extrabold text-primary-600 dark:text-primary-400 mt-1 font-display">
                  {slotDetails.summary.occupiedSeats}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-surface-850 border border-slate-200/60 dark:border-slate-800">
                <p className="text-[11px] font-bold uppercase text-slate-400">Available</p>
                <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 font-display">
                  {slotDetails.summary.availableSeats}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-surface-850 border border-slate-200/60 dark:border-slate-800">
                <p className="text-[11px] font-bold uppercase text-slate-400">Occupancy</p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 font-display">
                  {slotDetails.summary.occupancyPercent}%
                </p>
              </div>
            </div>

            {/* Available Seats Pill Cluster */}
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-surface-850/80 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Available Desk Numbers
                </h4>
                <span className="text-xs text-emerald-600 font-semibold">
                  {slotDetails.summary.availableSeatNumbers.length} ready to allocate
                </span>
              </div>
              <div className="max-h-32 overflow-y-auto flex flex-wrap gap-1.5 pt-1">
                {slotDetails.summary.availableSeatNumbers.length > 0 ? (
                  slotDetails.summary.availableSeatNumbers.map((seat) => (
                    <span
                      key={seat}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                    >
                      {seat}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">All seats are booked for this shift.</p>
                )}
              </div>
            </div>

            {/* Member Search & Filters in Modal */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={slotSearch}
                    onChange={(e) => setSlotSearch(e.target.value)}
                    placeholder="Search by student name, desk number, or phone..."
                    className="input pl-9"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={slotSortField}
                    onChange={(e) => setSlotSortField(e.target.value)}
                    className="input !w-auto text-xs py-2"
                  >
                    <option value="seatNumber">Sort: Desk</option>
                    <option value="fullName">Sort: Name</option>
                    <option value="feeStatus">Sort: Fee</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setSlotSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                    className="btn-secondary !py-2 text-xs"
                    title="Toggle Sort Order"
                  >
                    <ArrowUpDown size={14} />
                    <span>{slotSortOrder === 'asc' ? 'Asc' : 'Desc'}</span>
                  </button>
                </div>
              </div>

              {/* Assigned Members Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="min-w-full text-xs text-left">
                  <thead className="bg-slate-100/80 dark:bg-surface-850 uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                    <tr>
                      <th className="px-4 py-3">Desk</th>
                      <th className="px-4 py-3">Member</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">Fee Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {slotDetails.assignedMembers
                      .filter((member) => {
                        const query = slotSearch.toLowerCase();
                        return (
                          member.fullName.toLowerCase().includes(query) ||
                          member.phone.toLowerCase().includes(query) ||
                          member.seatNumber.toLowerCase().includes(query)
                        );
                      })
                      .sort((a, b) => {
                        if (slotSortField === 'seatNumber') {
                          return compareSeatNumbers(a.seatNumber, b.seatNumber) * (slotSortOrder === 'asc' ? 1 : -1);
                        }
                        if (slotSortField === 'fullName') {
                          return a.fullName.localeCompare(b.fullName, undefined, { sensitivity: 'base' }) * (slotSortOrder === 'asc' ? 1 : -1);
                        }
                        return a.feeStatus.localeCompare(b.feeStatus, undefined, { sensitivity: 'base' }) * (slotSortOrder === 'asc' ? 1 : -1);
                      })
                      .map((member) => (
                        <tr key={member.memberId} className="hover:bg-slate-50/80 dark:hover:bg-surface-800/50 transition-colors">
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-surface-800">
                              {member.seatNumber}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                            {member.fullName}
                          </td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">
                            {member.phone}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                member.feeStatus === 'paid'
                                  ? 'badge-green'
                                  : member.feeStatus === 'pending'
                                  ? 'badge-yellow'
                                  : 'badge-gray'
                              }`}
                            >
                              {member.feeStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {slotDetails.assignedMembers.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No members are assigned to this shift yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500">Slot details are unavailable.</div>
        )}
      </Modal>

      {/* Quick Launch Cards */}
      <div>
        <h2 className="section-title mb-3">Quick Navigation</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {[
            { label: 'Enroll Member', path: '/admin/members?action=add', icon: UserPlus, color: 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 border-primary-200/60 dark:border-primary-900/40' },
            { label: 'Seat Inventory', path: '/admin/seats', icon: Armchair, color: 'text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-surface-850 border-slate-200/70 dark:border-slate-800' },
            { label: 'Fee Overdues', path: '/admin/fees', icon: IndianRupee, color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-900/40' },
            { label: 'Post Notice', path: '/admin/notices?action=add', icon: Bell, color: 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200/60 dark:border-purple-900/40' },
          ].map(({ label, path, icon: Icon, color }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`p-4 rounded-2xl border text-sm font-bold flex items-center justify-between transition-all hover:shadow-card-hover hover:-translate-y-0.5 active:scale-[0.98] ${color}`}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={18} />
                <span>{label}</span>
              </div>
              <ChevronRight size={15} className="opacity-60" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
