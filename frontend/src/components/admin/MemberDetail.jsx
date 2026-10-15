import { useEffect, useState } from 'react';
import { memberAPI, feeAPI } from '../../api/services';
import { PageLoader } from '../ui/Spinner';
import { formatDate, formatCurrency, getPaymentBadge, getPaymentLabel, formatTime } from '../../utils/helpers';
import { Phone, MapPin, Calendar, Armchair, Clock, IndianRupee, FileText, CheckCircle2, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const FeeStatusBadge = ({ mode }) => (
  <span className={getPaymentBadge(mode)}>{getPaymentLabel(mode)}</span>
);

const MemberDetail = ({ memberId, onRefresh }) => {
  const [member, setMember] = useState(null);
  const [feeHistory, setFeeHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingFee, setUpdatingFee] = useState(null);

  const fetchData = async () => {
    try {
      const res = await memberAPI.getOne(memberId);
      setMember(res.data.member);
      setFeeHistory(res.data.feeHistory);
    } catch (err) {
      toast.error('Failed to load member details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [memberId]);

  const handleFeeUpdate = async (feeId, paymentMode) => {
    setUpdatingFee(feeId);
    try {
      await feeAPI.updateStatus(feeId, { paymentMode, paymentDate: new Date() });
      toast.success('Payment status updated.');
      fetchData();
      onRefresh?.();
    } catch (err) {
      toast.error('Failed to update payment.');
    } finally {
      setUpdatingFee(null);
    }
  };

  if (loading) return <PageLoader message="Loading member details..." />;
  if (!member) return <div className="text-slate-400 text-center py-8">Member profile not found.</div>;

  const alloc = member.seatAllocation;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 via-primary-50/20 to-slate-50 dark:from-surface-850 dark:via-surface-800 dark:to-surface-850 border border-slate-200/70 dark:border-slate-800 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white text-xl font-black shrink-0 shadow-glow-sm shadow-primary-500/30">
          {member.fullName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-display">
              {member.fullName}
            </h2>
            <span className={member.status === 'active' ? 'badge-green' : 'badge-gray'}>
              {member.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Enrolled since {formatDate(member.joiningDate)}
          </p>
        </div>
      </div>

      {/* Info Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoCard icon={Phone} label="Primary Contact" value={member.phone} />
        {member.guardianPhone && (
          <InfoCard icon={Phone} label="Guardian Contact" value={member.guardianPhone} />
        )}
        <InfoCard icon={Calendar} label="Next Fee Due Date" value={formatDate(member.feeDueDate)} />
        <InfoCard icon={IndianRupee} label="Monthly Rate" value={formatCurrency(member.monthlyFeeSnapshot)} />
        {alloc && (
          <>
            <InfoCard icon={Armchair} label="Assigned Desk" value={alloc.seat?.seatNumber} />
            <InfoCard
              icon={Clock}
              label="Allocated Shift"
              value={`${alloc.slot?.name} (${formatTime(alloc.slot?.startTime)} – ${formatTime(alloc.slot?.endTime)})`}
            />
          </>
        )}
        {member.address && (
          <InfoCard icon={MapPin} label="Address" value={member.address} className="sm:col-span-2" />
        )}
        {member.notes && (
          <InfoCard icon={FileText} label="Notes" value={member.notes} className="sm:col-span-2" />
        )}
      </div>

      {/* Fee History Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Payment & Cycle History
          </h3>
          <span className="text-xs text-slate-400 font-medium">{feeHistory.length} record(s)</span>
        </div>

        {feeHistory.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-50/70 dark:bg-surface-850/70 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-400">
            No fee history records recorded yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {feeHistory.map(fee => (
              <div
                key={fee._id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-surface-850 border border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {fee.month}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Due: {formatDate(fee.dueDate)}
                    {fee.paymentDate && ` • Paid: ${formatDate(fee.paymentDate)}`}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white font-display">
                    {formatCurrency(fee.amount)}
                  </span>

                  {fee.paymentMode === 'pending' ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleFeeUpdate(fee._id, 'upi')}
                        disabled={updatingFee === fee._id}
                        className="text-xs font-bold px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border border-primary-200/70 dark:border-primary-800/60 hover:bg-primary-100 transition-colors disabled:opacity-50"
                      >
                        UPI
                      </button>
                      <button
                        onClick={() => handleFeeUpdate(fee._id, 'cash')}
                        disabled={updatingFee === fee._id}
                        className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                      >
                        Cash
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <FeeStatusBadge mode={fee.paymentMode} />
                      <button
                        onClick={() => handleFeeUpdate(fee._id, 'pending')}
                        disabled={updatingFee === fee._id}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Revert payment"
                      >
                        <RotateCcw size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const InfoCard = ({ icon: Icon, label, value, className = '' }) => (
  <div className={`p-3.5 rounded-xl bg-slate-50/70 dark:bg-surface-850/70 border border-slate-200/60 dark:border-slate-800 flex items-start gap-3 ${className}`}>
    <div className="w-8 h-8 rounded-lg bg-white dark:bg-surface-800 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
      <Icon size={15} className="text-primary-600 dark:text-primary-400" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">
        {value || '—'}
      </p>
    </div>
  </div>
);

export default MemberDetail;
