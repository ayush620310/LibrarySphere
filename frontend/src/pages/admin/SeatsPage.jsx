import { useEffect, useState } from 'react';
import { Plus, Trash2, Eye, Armchair, CheckCircle, XCircle, Search, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import { seatAPI, slotAPI } from '../../api/services';
import { PageLoader } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatTime, getPaymentBadge, getPaymentLabel } from '../../utils/helpers';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const AddSeatForm = ({ onSuccess, onCancel }) => {
  const [mode, setMode] = useState('single');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { prefix: 'Seat ', from: 1 } });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (mode === 'single') {
        await seatAPI.create({ seatNumber: data.seatNumber });
        toast.success('Seat created successfully.');
      } else {
        await seatAPI.createBulk({ from: Number(data.from), to: Number(data.to), prefix: data.prefix });
        toast.success('Seats generated successfully.');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create seat(s).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Segmented Mode Selector */}
      <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-surface-850 border border-slate-200/60 dark:border-slate-800">
        <button
          type="button"
          className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            mode === 'single'
              ? 'bg-white dark:bg-surface-900 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
          onClick={() => setMode('single')}
        >
          Single Desk
        </button>
        <button
          type="button"
          className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            mode === 'bulk'
              ? 'bg-white dark:bg-surface-900 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
          onClick={() => setMode('bulk')}
        >
          Bulk Number Generator
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {mode === 'single' ? (
          <div>
            <label className="label">Desk Name / Number *</label>
            <input
              className={`input ${errors.seatNumber ? 'border-rose-400 focus:ring-rose-400' : ''}`}
              placeholder="e.g. Desk 01, Seat A-12"
              {...register('seatNumber', { required: 'Seat number is required' })}
            />
            {errors.seatNumber && <p className="text-rose-500 text-xs mt-1">{errors.seatNumber.message}</p>}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="label">Naming Prefix</label>
              <input className="input" placeholder="e.g. Seat " {...register('prefix')} />
              <p className="text-xs text-slate-400 mt-1">Example: "Seat " creates "Seat 1", "Seat 2"...</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Start Number *</label>
                <input
                  type="number"
                  min="1"
                  className={`input ${errors.from ? 'border-rose-400' : ''}`}
                  {...register('from', { required: true, min: 1 })}
                />
              </div>
              <div>
                <label className="label">End Number *</label>
                <input
                  type="number"
                  min="1"
                  className={`input ${errors.to ? 'border-rose-400' : ''}`}
                  {...register('to', { required: true, min: 1 })}
                />
              </div>
            </div>
            <div className="p-3 rounded-xl bg-primary-50/70 dark:bg-primary-950/40 border border-primary-200/60 dark:border-primary-900/40 text-xs text-primary-700 dark:text-primary-300">
              Bulk generator allows up to 200 seats in one action.
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Processing...' : mode === 'single' ? 'Add Seat' : 'Generate Desks'}
          </button>
        </div>
      </form>
    </div>
  );
};

const SeatDetailModal = ({ seatId, onClose }) => {
  const [seat, setSeat] = useState(null);
  const [allSlots, setAllSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([seatAPI.getOne(seatId), slotAPI.getAll()])
      .then(([seatRes, slotRes]) => {
        setSeat(seatRes.data.seat);
        setAllSlots(slotRes.data.slots);
      })
      .catch(() => toast.error('Failed to load seat details'))
      .finally(() => setLoading(false));
  }, [seatId]);

  if (loading) return <PageLoader message="Inspecting desk shifts..." />;
  if (!seat) return null;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
          <Armchair size={22} />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-display">
            {seat.seatNumber}
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {seat.allocations.length} of {allSlots.length} shifts occupied
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Shift Availability</h4>
        {allSlots.map(slot => {
          const status = seat.slotAvailability?.find(item => item.slot._id.toString() === slot._id.toString());
          const available = status?.available ?? true;
          const conflicts = status?.conflicts || [];
          const allocation = seat.allocations.find(a => a.slot._id.toString() === slot._id.toString());

          return (
            <div
              key={slot._id}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors ${
                available
                  ? 'border-slate-200/60 dark:border-slate-800 bg-slate-50/70 dark:bg-surface-850'
                  : 'border-rose-200/70 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20'
              }`}
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{slot.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                </p>
              </div>

              {allocation ? (
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {allocation.member?.fullName}
                  </p>
                  <span className={`${getPaymentBadge(allocation.feeStatus || 'pending')} mt-1`}>
                    {getPaymentLabel(allocation.feeStatus || 'pending')}
                  </span>
                </div>
              ) : available ? (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                  <CheckCircle2 size={13} />
                  <span>Available</span>
                </div>
              ) : (
                <div className="flex flex-col items-end gap-0.5">
                  <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-bold">
                    <XCircle size={13} />
                    <span>Unavailable</span>
                  </div>
                  {conflicts.length > 0 && (
                    <p className="text-[10px] text-slate-400">Booked: {conflicts.join(', ')}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {allSlots.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-6">No study shifts configured yet.</p>
        )}
      </div>
    </div>
  );
};

const SeatsPage = () => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewingSeatId, setViewingSeatId] = useState(null);
  const [deletingSeat, setDeletingSeat] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchSeats = async () => {
    try {
      const res = await seatAPI.getAll();
      setSeats(res.data.seats);
    } catch (err) {
      toast.error('Failed to load seats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSeats(); }, []);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await seatAPI.delete(deletingSeat._id);
      toast.success('Seat deleted.');
      setDeletingSeat(null);
      fetchSeats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete seat.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = seats.filter(s =>
    s.seatNumber.toLowerCase().includes(search.toLowerCase())
  );

  const totalOccupied = seats.filter(s => s.allocations?.length > 0).length;

  if (loading) return <PageLoader message="Loading physical desks..." />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Seat Inventory</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {seats.length} total desks · {totalOccupied} occupied · {seats.length - totalOccupied} available
          </p>
        </div>
        <button className="btn-primary self-start sm:self-auto" onClick={() => setShowForm(true)}>
          <Plus size={16} />
          <span>Add Seats</span>
        </button>
      </div>

      {/* Search & Status Legend */}
      <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search by desk number (e.g. Seat 12)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-500" />
            <span>Partially / Fully Booked</span>
          </div>
        </div>
      </div>

      {/* Seat Cards Grid */}
      {seats.length === 0 ? (
        <EmptyState
          icon={Armchair}
          title="No library desks configured"
          description="Add physical seats to your study hall. Create them individually or generate numbered ranges in seconds."
          action={
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={16} /> Add Seats
            </button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Armchair}
          title="No seats found"
          description={`No desk numbers match "${search}".`}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {filtered.map(seat => {
            const hasAlloc = seat.allocations?.length > 0;
            return (
              <div
                key={seat._id}
                onClick={() => setViewingSeatId(seat._id)}
                className={`relative group p-3.5 rounded-2xl border text-center cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover ${
                  hasAlloc
                    ? 'bg-primary-50/40 dark:bg-primary-950/20 border-primary-200/80 dark:border-primary-900/60'
                    : 'bg-white dark:bg-surface-900 border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {/* Delete desk button on hover */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setDeletingSeat(seat); }}
                  className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                  title="Delete desk"
                >
                  <Trash2 size={13} />
                </button>

                <div
                  className={`w-11 h-11 rounded-2xl mx-auto mb-2.5 flex items-center justify-center transition-transform group-hover:scale-105 ${
                    hasAlloc
                      ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  <Armchair size={20} />
                </div>

                <p className="text-sm font-extrabold text-slate-900 dark:text-white font-display truncate">
                  {seat.seatNumber}
                </p>

                <p className={`text-[11px] font-bold mt-1 ${
                  hasAlloc ? 'text-primary-600 dark:text-primary-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {hasAlloc ? `${seat.allocations.length} shift(s)` : 'Free'}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Seat Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Configure Desks & Seats">
        <AddSeatForm
          onSuccess={() => { setShowForm(false); fetchSeats(); }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      {/* Seat Detail Modal */}
      <Modal
        isOpen={Boolean(viewingSeatId)}
        onClose={() => setViewingSeatId(null)}
        title="Desk Shift Details"
        size="md"
      >
        {viewingSeatId && <SeatDetailModal seatId={viewingSeatId} onClose={() => setViewingSeatId(null)} />}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingSeat)}
        onClose={() => setDeletingSeat(null)}
        onConfirm={handleDelete}
        title="Delete Desk"
        message={`Delete "${deletingSeat?.seatNumber}"? Any existing member seat allocations on this desk will be removed.`}
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default SeatsPage;
