import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { memberAPI, slotAPI, seatAPI } from '../../api/services';
import { formatTime } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Spinner from '../ui/Spinner';
import { CheckCircle2, AlertCircle, Armchair, Clock, User, Phone, MapPin } from 'lucide-react';

const MemberForm = ({ member, onSuccess, onCancel }) => {
  const [slots, setSlots] = useState([]);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availabilityStatus, setAvailabilityStatus] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: member ? {
      fullName: member.fullName,
      phone: member.phone,
      guardianPhone: member.guardianPhone || '',
      address: member.address || '',
      notes: member.notes || '',
      status: member.status || 'active',
      joiningDate: member.joiningDate ? new Date(member.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    } : {
      status: 'active',
      joiningDate: new Date().toISOString().split('T')[0],
    }
  });

  const watchedSeatId = watch('seatId');
  const watchedSlotId = watch('slotId');

  useEffect(() => {
    slotAPI.getAll().then(res => {
      const activeSlots = res.data.slots.filter(s => s.isActive);
      setSlots(activeSlots);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (watchedSlotId) {
      const slot = slots.find(s => s._id === watchedSlotId);
      setSelectedSlot(slot || null);
      setValue('seatId', '');
      setAvailabilityStatus(null);

      seatAPI.getAvailable(watchedSlotId)
        .then(res => setAvailableSeats(res.data.seats))
        .catch(() => setAvailableSeats([]));
    } else {
      setSelectedSlot(null);
      setAvailableSeats([]);
      setAvailabilityStatus(null);
    }
  }, [watchedSlotId, slots, setValue]);

  useEffect(() => {
    if (watchedSeatId && watchedSlotId && !member) {
      checkAvailability(watchedSeatId, watchedSlotId);
    }
  }, [watchedSeatId, watchedSlotId]);

  const checkAvailability = async (seatId, slotId) => {
    if (!seatId || !slotId) return;
    setCheckingAvailability(true);
    try {
      const res = await seatAPI.checkAvailability(seatId, slotId);
      setAvailabilityStatus(res.data);
    } catch (err) {
      setAvailabilityStatus(null);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const onSubmit = async (data) => {
    if (!member && availabilityStatus && !availabilityStatus.available) {
      toast.error('Seat is not available for this slot.');
      return;
    }

    setLoading(true);
    try {
      if (member) {
        await memberAPI.update(member._id, data);
        toast.success('Member details updated.');
      } else {
        await memberAPI.create(data);
        toast.success('Member enrolled successfully.');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-fade-in">
      {/* Personal Information */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Personal Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name *</label>
            <input
              className={`input ${errors.fullName ? 'border-rose-400 focus:ring-rose-400' : ''}`}
              placeholder="e.g. John Doe"
              {...register('fullName', { required: 'Name is required' })}
            />
            {errors.fullName && <p className="text-rose-500 text-xs mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="label">Phone Number *</label>
            <input
              className={`input ${errors.phone ? 'border-rose-400 focus:ring-rose-400' : ''}`}
              placeholder="10-digit mobile number"
              {...register('phone', { required: 'Phone is required' })}
            />
            {errors.phone && <p className="text-rose-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="label">Guardian Contact</label>
            <input
              className="input"
              placeholder="Parent / Guardian phone"
              {...register('guardianPhone')}
            />
          </div>

          <div>
            <label className="label">Enrollment / Joining Date</label>
            <input type="date" className="input" {...register('joiningDate')} />
          </div>
        </div>

        <div>
          <label className="label">Residential Address</label>
          <input className="input" placeholder="House/Hostel, Area, City" {...register('address')} />
        </div>
      </div>

      {/* Seat & Shift Allocation for new members */}
      {!member && (
        <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-surface-850/80 border border-slate-200/70 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Armchair size={16} className="text-primary-600 dark:text-primary-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Seat & Shift Assignment
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Select Shift / Slot *</label>
              <select
                className={`input ${errors.slotId ? 'border-rose-400' : ''}`}
                {...register('slotId', { required: 'Slot is required' })}
              >
                <option value="">Choose study shift</option>
                {slots.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({formatTime(s.startTime)} – {formatTime(s.endTime)}) — ₹{s.monthlyFee}/mo
                  </option>
                ))}
              </select>
              {errors.slotId && <p className="text-rose-500 text-xs mt-1">{errors.slotId.message}</p>}
            </div>

            <div>
              <label className="label">Select Desk / Seat *</label>
              <select
                className={`input ${errors.seatId ? 'border-rose-400' : ''}`}
                {...register('seatId', { required: 'Seat is required' })}
                disabled={!watchedSlotId || availableSeats.length === 0}
              >
                <option value="">
                  {watchedSlotId ? (availableSeats.length > 0 ? 'Choose desk' : 'No seats free') : 'Select shift first'}
                </option>
                {availableSeats.map(s => (
                  <option key={s._id} value={s._id}>{s.seatNumber}</option>
                ))}
              </select>
              {errors.seatId && <p className="text-rose-500 text-xs mt-1">{errors.seatId.message}</p>}
            </div>
          </div>

          {checkingAvailability && (
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <Spinner size="sm" /> <span>Checking desk allocation status...</span>
            </div>
          )}

          {availabilityStatus && !checkingAvailability && (
            <div className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2.5 rounded-xl border ${
              availabilityStatus.available
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60'
            }`}>
              {availabilityStatus.available ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              <span>{availabilityStatus.message}</span>
            </div>
          )}

          {selectedSlot && (
            <div className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-surface-900 px-3.5 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <span>Standard fee for this slot:</span>
              <strong className="text-primary-600 dark:text-primary-400 font-extrabold text-sm">
                ₹{selectedSlot.monthlyFee} / month
              </strong>
            </div>
          )}
        </div>
      )}

      {/* Account Status & Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Account Status</label>
          <select className="input" {...register('status')}>
            <option value="active">Active (Enrolled)</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label className="label">Additional Notes</label>
          <input className="input" placeholder="ID proof, exam target, special remarks..." {...register('notes')} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" className="border-t-white" />
              <span>Saving...</span>
            </>
          ) : member ? (
            'Save Changes'
          ) : (
            'Enroll Member'
          )}
        </button>
      </div>
    </form>
  );
};

export default MemberForm;
