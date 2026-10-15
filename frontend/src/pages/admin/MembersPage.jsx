import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, User, Phone, Armchair, Edit, Trash2, Eye, X, Filter, RotateCcw, Calendar, CheckCircle2 } from 'lucide-react';
import { memberAPI, slotAPI } from '../../api/services';
import { PageLoader } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatDate, formatCurrency, getPaymentBadge, getPaymentLabel } from '../../utils/helpers';
import toast from 'react-hot-toast';
import MemberForm from '../../components/admin/MemberForm';
import MemberDetail from '../../components/admin/MemberDetail';

const MembersPage = () => {
  const [members, setMembers] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSlot, setFilterSlot] = useState('');
  const [filterFee, setFilterFee] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [viewingMember, setViewingMember] = useState(null);
  const [deletingMember, setDeletingMember] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setShowForm(true);
      setSearchParams({});
    }
  }, []);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      if (filterSlot) params.slot = filterSlot;
      if (filterFee) params.feeStatus = filterFee;
      const res = await memberAPI.getAll(params);
      const uniqueMembers = Array.from(new Map(res.data.members.map(member => [member._id, member])).values());
      setMembers(uniqueMembers);
    } catch (err) {
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, filterSlot, filterFee]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  useEffect(() => {
    slotAPI.getAll().then(res => setSlots(res.data.slots)).catch(() => {});
  }, []);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await memberAPI.delete(deletingMember._id);
      toast.success('Member deleted.');
      setDeletingMember(null);
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingMember(null);
    fetchMembers();
  };

  const hasActiveFilters = Boolean(search || filterStatus || filterSlot || filterFee);

  const resetFilters = () => {
    setSearch('');
    setFilterStatus('');
    setFilterSlot('');
    setFilterFee('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Member Directory</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {members.length} registered member{members.length !== 1 ? 's' : ''} enrolled in your library
          </p>
        </div>
        <button
          className="btn-primary self-start sm:self-auto"
          onClick={() => { setEditingMember(null); setShowForm(true); }}
        >
          <Plus size={16} />
          <span>Enroll New Member</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search by name, phone, seat..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Account Statuses</option>
            <option value="active">Active Members</option>
            <option value="inactive">Inactive Members</option>
          </select>
          <select className="input" value={filterSlot} onChange={e => setFilterSlot(e.target.value)}>
            <option value="">All Study Shifts</option>
            {slots.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <select className="input" value={filterFee} onChange={e => setFilterFee(e.target.value)}>
            <option value="">All Payment Statuses</option>
            <option value="pending">Pending Payment</option>
            <option value="upi">Paid (UPI)</option>
            <option value="cash">Paid (Cash)</option>
          </select>
        </div>

        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Filtering active results</span>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline font-semibold"
            >
              <RotateCcw size={12} />
              <span>Reset filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Members Table */}
      {loading ? (
        <PageLoader message="Loading member directory..." />
      ) : members.length === 0 ? (
        <EmptyState
          icon={User}
          title="No members match your criteria"
          description="Try clearing search filters or enroll your first student member."
          action={
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={16} /> Enroll Member
            </button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100/70 dark:bg-surface-850 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs font-bold border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Member Name</th>
                  <th className="px-4 py-3.5">Phone</th>
                  <th className="px-4 py-3.5 hidden md:table-cell">Desk & Shift</th>
                  <th className="px-4 py-3.5 hidden lg:table-cell">Fee Due Date</th>
                  <th className="px-4 py-3.5">Fee Status</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {members.map(member => (
                  <tr
                    key={member._id}
                    className="hover:bg-slate-50/80 dark:hover:bg-surface-800/60 transition-colors group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white text-xs font-extrabold shrink-0 shadow-sm">
                          {member.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {member.fullName}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">
                            Joined {formatDate(member.joiningDate)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-medium">
                      {member.phone}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      {member.seatAllocation ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-surface-800 text-slate-800 dark:text-slate-200 text-xs">
                            {member.seatAllocation.seat?.seatNumber}
                          </span>
                          <span className="text-slate-400 text-xs">•</span>
                          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                            {member.seatAllocation.slot?.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 text-xs hidden lg:table-cell font-medium">
                      {formatDate(member.feeDueDate)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={getPaymentBadge(member.currentFeeStatus)}>
                        {getPaymentLabel(member.currentFeeStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={member.status === 'active' ? 'badge-green' : 'badge-gray'}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingMember(member)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors"
                          title="View Profile & Payments"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => { setEditingMember(member); setShowForm(true); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                          title="Edit Member"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeletingMember(member)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete Member"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Member Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingMember(null); }}
        title={editingMember ? 'Edit Member Profile' : 'Enroll New Member'}
        size="lg"
      >
        <MemberForm
          member={editingMember}
          onSuccess={handleFormSuccess}
          onCancel={() => { setShowForm(false); setEditingMember(null); }}
        />
      </Modal>

      {/* Member Details & History Modal */}
      {viewingMember && (
        <Modal
          isOpen={Boolean(viewingMember)}
          onClose={() => setViewingMember(null)}
          title="Member Card & Fee Records"
          size="lg"
        >
          <MemberDetail memberId={viewingMember._id} onRefresh={fetchMembers} />
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingMember)}
        onClose={() => setDeletingMember(null)}
        onConfirm={handleDelete}
        title="Remove Member"
        message={`Are you sure you want to permanently delete "${deletingMember?.fullName}"? Their assigned seat will be released immediately.`}
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default MembersPage;
