import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IndianRupee, AlertCircle, Clock, CheckCircle, Filter, Calendar, CheckCircle2 } from 'lucide-react';
import { feeAPI } from '../../api/services';
import { PageLoader } from '../../components/ui/Spinner';
import { formatDate, formatCurrency, getPaymentBadge, getPaymentLabel } from '../../utils/helpers';
import toast from 'react-hot-toast';

const FeesPage = () => {
  const [searchParams] = useSearchParams();
  const [pendingData, setPendingData] = useState(null);
  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(() => searchParams.get('filter') || 'overdue');
  const [updatingFee, setUpdatingFee] = useState(null);

  const fetchData = async () => {
    try {
      const [pending, today] = await Promise.all([
        feeAPI.getPendingSummary(),
        feeAPI.getTodaySummary(),
      ]);
      setPendingData(pending.data.summary);
      setTodayData(today.data.summary);
    } catch (err) {
      toast.error('Failed to load fee data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleFeeUpdate = async (feeId, paymentMode) => {
    setUpdatingFee(feeId);
    try {
      await feeAPI.updateStatus(feeId, { paymentMode, paymentDate: new Date() });
      toast.success('Payment updated.');
      fetchData();
    } catch (err) {
      toast.error('Failed to update payment.');
    } finally {
      setUpdatingFee(null);
    }
  };

  if (loading) return <PageLoader message="Loading fee records & collection summaries..." />;

  const tabs = [
    { id: 'overdue', label: 'Overdue Payments', count: pendingData?.totalOverdue, badgeBg: 'bg-rose-500 text-white' },
    { id: 'duetoday', label: 'Due Today', count: pendingData?.dueToday, badgeBg: 'bg-amber-500 text-white' },
    { id: 'duetomorrow', label: 'Due Tomorrow', count: pendingData?.dueTomorrow, badgeBg: 'bg-primary-500 text-white' },
    { id: 'today', label: "Today's Collections", count: todayData?.count, badgeBg: 'bg-emerald-500 text-white' },
  ];

  const currentFees = () => {
    switch (activeTab) {
      case 'overdue': return pendingData?.overdueFees || [];
      case 'duetoday': return pendingData?.dueTodayFees || [];
      case 'duetomorrow': return pendingData?.dueTomorrowFees || [];
      case 'today': return todayData?.fees || [];
      default: return [];
    }
  };

  const fees = currentFees();

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div>
        <h1 className="page-title">Fee Management & Billing</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor recurring dues, collect monthly fees, and track daily cash & UPI collections
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 border-l-4 border-l-rose-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overdue Dues</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 font-display mt-1">
            {pendingData?.totalOverdue || 0}
          </p>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            {formatCurrency(pendingData?.overdueAmount || 0)} pending
          </p>
        </div>

        <div className="card p-5 border-l-4 border-l-amber-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Due Today</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-display mt-1">
            {pendingData?.dueToday || 0}
          </p>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Due today</p>
        </div>

        <div className="card p-5 border-l-4 border-l-primary-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Due Tomorrow</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-primary-600 dark:text-primary-400 font-display mt-1">
            {pendingData?.dueTomorrow || 0}
          </p>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Next 24h followups</p>
        </div>

        <div className="card p-5 border-l-4 border-l-emerald-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Collected Today</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-display mt-1">
            {formatCurrency(todayData?.totalCollected || 0)}
          </p>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            {todayData?.count || 0} transaction(s) recorded
          </p>
        </div>
      </div>

      {/* Tabs Container */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-slate-200/80 dark:border-slate-800 overflow-x-auto px-3 pt-2 bg-slate-50/50 dark:bg-surface-850/50 gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400 bg-white dark:bg-surface-900 rounded-t-xl shadow-sm'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`text-[11px] px-2 py-0.2 rounded-full font-bold ${
                  activeTab === tab.id
                    ? 'bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300'
                    : 'bg-slate-200/80 dark:bg-surface-800 text-slate-600 dark:text-slate-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-5">
          {fees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center mb-3">
                <CheckCircle2 size={26} className="text-emerald-500" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-display">
                All Settled!
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                No fee records found in this category at the moment.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="bg-slate-100/70 dark:bg-surface-850 uppercase tracking-wider text-xs font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5">Student Member</th>
                    <th className="px-4 py-3.5">Contact</th>
                    <th className="px-4 py-3.5 hidden lg:table-cell">Desk</th>
                    <th className="px-4 py-3.5 hidden xl:table-cell">Shift</th>
                    <th className="px-4 py-3.5">Last Payment</th>
                    <th className="px-4 py-3.5">Fee Due Date</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Monthly Fee</th>
                    <th className="px-4 py-3.5 text-right">Collect Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {fees.map(fee => (
                    <tr
                      key={fee._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-surface-800/50 transition-colors"
                    >
                      <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                        {fee.member?.fullName}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-medium">
                        {fee.member?.phone}
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-surface-800 font-semibold text-xs">
                          {fee.member?.seatAllocation?.seat?.seatNumber || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden xl:table-cell text-slate-500 font-medium">
                        {fee.member?.seatAllocation?.slot?.name || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs">
                        {fee.lastPaymentDate ? formatDate(fee.lastPaymentDate) : 'Initial enrollment'}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300 text-xs">
                        {formatDate(fee.dueDate)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={getPaymentBadge(fee.paymentMode)}>
                          {getPaymentLabel(fee.paymentMode)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-extrabold text-slate-900 dark:text-white font-display">
                        {formatCurrency(fee.amount)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {activeTab !== 'today' ? (
                          <div className="flex flex-wrap justify-end gap-1.5">
                            <button
                              onClick={() => handleFeeUpdate(fee._id, 'upi')}
                              disabled={updatingFee === fee._id}
                              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border border-primary-200/70 dark:border-primary-800/60 hover:bg-primary-100 transition-colors disabled:opacity-50"
                            >
                              Receive UPI
                            </button>
                            <button
                              onClick={() => handleFeeUpdate(fee._id, 'cash')}
                              disabled={updatingFee === fee._id}
                              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                            >
                              Receive Cash
                            </button>
                          </div>
                        ) : (
                          <span className={getPaymentBadge(fee.paymentMode)}>
                            {getPaymentLabel(fee.paymentMode)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeesPage;
