import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { authAPI } from '../../api/services';
import { useAuth } from '../../contexts/AuthContext';
import { KeyRound, User, ExternalLink, ShieldCheck, Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { admin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authAPI.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed successfully!');
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      <div>
        <h1 className="page-title">Account & Security</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your administrator profile credentials and access settings
        </p>
      </div>

      {/* Admin Profile Overview */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shrink-0 shadow-glow shadow-primary-500/20">
            {admin?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white font-display">
                {admin?.name}
              </h2>
              <span className="badge-green">Verified Owner</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {admin?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <KeyRound size={18} className="text-primary-600 dark:text-primary-400" />
          <h2 className="section-title">Change Password</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                className={`input pr-10 ${errors.currentPassword ? 'border-rose-400 focus:ring-rose-400' : ''}`}
                placeholder="Enter current password"
                {...register('currentPassword', { required: 'Current password is required' })}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.currentPassword && <p className="text-rose-500 text-xs mt-1">{errors.currentPassword.message}</p>}
          </div>

          <div>
            <label className="label">New Password (Min 6 Characters)</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                className={`input pr-10 ${errors.newPassword ? 'border-rose-400 focus:ring-rose-400' : ''}`}
                placeholder="At least 6 characters"
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 6, message: 'Minimum 6 characters' },
                })}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.newPassword && <p className="text-rose-500 text-xs mt-1">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label className="label">Confirm New Password</label>
            <input
              type="password"
              className={`input ${errors.confirmPassword ? 'border-rose-400 focus:ring-rose-400' : ''}`}
              placeholder="Repeat your new password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (v) => v === newPassword || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && <p className="text-rose-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" className="border-t-white" />
                  <span>Updating password...</span>
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Public Site Card */}
      <div className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="section-title mb-1">Public Library Portal</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
            Your library's public page is live and accessible by students and visitors to explore shift pricing, check free desks, and contact you via WhatsApp.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary self-start sm:self-auto shrink-0"
        >
          <ExternalLink size={15} />
          <span>Launch Public Page</span>
        </a>
      </div>
    </div>
  );
};

export default SettingsPage;
