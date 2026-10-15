import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Clock, ToggleLeft, ToggleRight, CheckCircle2, IndianRupee, Sparkles } from 'lucide-react';
import { slotAPI } from '../../api/services';
import { PageLoader } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatTime, formatCurrency } from '../../utils/helpers';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const SlotForm = ({ slot, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: slot || { isActive: true, monthlyFee: '' },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (slot) {
        await slotAPI.update(slot._id, { ...data, monthlyFee: Number(data.monthlyFee) });
        toast.success('Study shift updated.');
      } else {
        await slotAPI.create({ ...data, monthlyFee: Number(data.monthlyFee) });
        toast.success('Study shift created.');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save slot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-fade-in">
      <div>
        <label className="label">Shift Name *</label>
        <input
          className={`input ${errors.name ? 'border-rose-400 focus:ring-rose-400' : ''}`}
          placeholder="e.g. Morning Shift, Full Day, Night Owl"
          {...register('name', { required: 'Slot name is required' })}
        />
        {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Start Time *</label>
          <input
            type="time"
            className={`input ${errors.startTime ? 'border-rose-400' : ''}`}
            {...register('startTime', { required: 'Start time is required' })}
          />
          {errors.startTime && <p className="text-rose-500 text-xs mt-1">{errors.startTime.message}</p>}
        </div>
        <div>
          <label className="label">End Time *</label>
          <input
            type="time"
            className={`input ${errors.endTime ? 'border-rose-400' : ''}`}
            {...register('endTime', { required: 'End time is required' })}
          />
          {errors.endTime && <p className="text-rose-500 text-xs mt-1">{errors.endTime.message}</p>}
        </div>
      </div>

      <div>
        <label className="label">Monthly Rate (₹) *</label>
        <div className="relative">
          <input
            type="number"
            min="1"
            className={`input ${errors.monthlyFee ? 'border-rose-400' : ''}`}
            placeholder="e.g. 700"
            {...register('monthlyFee', { required: 'Fee is required', min: { value: 1, message: 'Fee must be positive' } })}
          />
        </div>
        {errors.monthlyFee && <p className="text-rose-500 text-xs mt-1">{errors.monthlyFee.message}</p>}
      </div>

      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-surface-850 border border-slate-200/60 dark:border-slate-800">
        <input
          type="checkbox"
          id="isActive"
          className="w-4 h-4 rounded accent-primary-600"
          {...register('isActive')}
        />
        <label htmlFor="isActive" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
          Active (Visible on public booking & seat assignments)
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : slot ? 'Update Shift' : 'Create Shift'}
        </button>
      </div>
    </form>
  );
};

const SlotsPage = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [deletingSlot, setDeletingSlot] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchSlots = async () => {
    try {
      const res = await slotAPI.getAll();
      setSlots(res.data.slots);
    } catch (err) {
      toast.error('Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlots(); }, []);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await slotAPI.delete(deletingSlot._id);
      toast.success('Slot removed.');
      setDeletingSlot(null);
      fetchSlots();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete slot.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggle = async (slot) => {
    try {
      await slotAPI.update(slot._id, { isActive: !slot.isActive });
      toast.success(`Slot ${slot.isActive ? 'deactivated' : 'activated'}.`);
      fetchSlots();
    } catch (err) {
      toast.error('Failed to update slot.');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingSlot(null);
    fetchSlots();
  };

  if (loading) return <PageLoader message="Loading shifts & pricing..." />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Study Shifts & Pricing</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure hourly shifts, pricing rates, and public availability
          </p>
        </div>
        <button
          className="btn-primary self-start sm:self-auto"
          onClick={() => { setEditingSlot(null); setShowForm(true); }}
        >
          <Plus size={16} />
          <span>Add Study Shift</span>
        </button>
      </div>

      {slots.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No study shifts created"
          description="Create shifts like Morning (6 AM - 12 PM), Evening (4 PM - 10 PM), or Full Day."
          action={
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={16} /> Add Study Shift
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {slots.map(slot => (
            <div
              key={slot._id}
              className={`card p-5 relative overflow-hidden transition-all duration-200 hover:shadow-card-hover ${
                !slot.isActive ? 'opacity-65 border-dashed' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-lg font-display">
                      {slot.name}
                    </h3>
                    <span className={slot.isActive ? 'badge-green' : 'badge-gray'}>
                      {slot.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1.5 font-medium">
                    <Clock size={13} className="text-primary-600 dark:text-primary-400" />
                    <span>{formatTime(slot.startTime)} – {formatTime(slot.endTime)}</span>
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-extrabold text-primary-600 dark:text-primary-400 font-display">
                    {formatCurrency(slot.monthlyFee)}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">per month</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleToggle(slot)}
                  className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                    slot.isActive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {slot.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  <span>{slot.isActive ? 'Active Shift' : 'Inactive (Hidden)'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditingSlot(slot); setShowForm(true); }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors"
                    title="Edit shift"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => setDeletingSlot(slot)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete shift"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingSlot(null); }}
        title={editingSlot ? 'Edit Study Shift' : 'Create New Study Shift'}
      >
        <SlotForm
          slot={editingSlot}
          onSuccess={handleFormSuccess}
          onCancel={() => { setShowForm(false); setEditingSlot(null); }}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingSlot)}
        onClose={() => setDeletingSlot(null)}
        onConfirm={handleDelete}
        title="Delete Shift"
        message={`Delete "${deletingSlot?.name}"? Make sure no members are actively scheduled for this shift.`}
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default SlotsPage;
