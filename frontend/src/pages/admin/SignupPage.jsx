import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { BookOpen, Eye, EyeOff, UserPlus, Library, Clock, Phone, MapPin, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';

const SignupPage = () => {
  const { signup } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const is24Hours = watch('is24Hours');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await signup({
        name: data.name,
        email: data.email,
        password: data.password,
        library: {
          name: data.libraryName,
          address: data.address,
          contactNumber: data.contactNumber,
          whatsappNumber: data.whatsappNumber,
          openingTime: data.openingTime,
          closingTime: data.closingTime,
          is24Hours: data.is24Hours || false,
        },
      });
      toast.success('Account created successfully');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-950 flex items-center justify-center p-4 py-12 relative overflow-hidden font-sans">
      {/* Ambient gradient orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-primary-500/10 dark:bg-primary-500/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-[120px] pointer-events-none" />

      {/* Theme Toggle in Top Right */}
      <div className="absolute top-5 right-5 flex items-center gap-1 bg-white/90 dark:bg-surface-900/90 backdrop-blur-md rounded-2xl p-1.5 border border-slate-200/80 dark:border-slate-800 shadow-sm z-20">
        {[{ v: 'light', Icon: Sun }, { v: 'dark', Icon: Moon }, { v: 'system', Icon: Monitor }].map(({ v, Icon }) => (
          <button
            key={v}
            onClick={() => setTheme(v)}
            className={`p-2 rounded-xl transition-all ${
              theme === v
                ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
            title={`Switch to ${v}`}
          >
            <Icon size={15} />
          </button>
        ))}
      </div>

      <div className="w-full max-w-2xl relative z-10 animate-slide-up">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-3xl bg-gradient-to-tr from-primary-600 via-indigo-600 to-primary-500 items-center justify-center mb-4 shadow-glow text-white">
            <BookOpen size={30} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white font-display tracking-tight">
            Register Your Library
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-medium">
            Create an owner administrator account and launch your study hall workspace
          </p>
        </div>

        {/* Signup Form Card */}
        <div className="card p-7 sm:p-9 shadow-xl border border-slate-200/90 dark:border-slate-800">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Owner Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Administrator Profile
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input
                    type="text"
                    className={`input ${errors.name ? 'border-rose-400 focus:ring-rose-400' : ''}`}
                    placeholder="e.g. Jane Doe"
                    {...register('name', { required: 'Name is required' })}
                  />
                  {errors.name && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="label">Admin Email Address *</label>
                  <input
                    type="email"
                    className={`input ${errors.email ? 'border-rose-400 focus:ring-rose-400' : ''}`}
                    placeholder="owner@mylibrary.com"
                    {...register('email', { required: 'Email is required' })}
                  />
                  {errors.email && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <label className="label">Set Master Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`input pr-11 ${errors.password ? 'border-rose-400 focus:ring-rose-400' : ''}`}
                    placeholder="Minimum 6 characters"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' },
                    })}
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.password.message}</p>}
              </div>
            </div>

            {/* Step 2: Library Profile */}
            <div className="space-y-4 pt-5 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Library & Business Details
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Library / Study Hall Name *</label>
                  <input
                    type="text"
                    className={`input ${errors.libraryName ? 'border-rose-400 focus:ring-rose-400' : ''}`}
                    placeholder="e.g. Apex Reading Room"
                    {...register('libraryName', { required: 'Library name is required' })}
                  />
                  {errors.libraryName && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.libraryName.message}</p>}
                </div>

                <div>
                  <label className="label">Contact Phone Number</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="+91 XXXXX XXXXX"
                    {...register('contactNumber')}
                  />
                </div>
              </div>

              <div>
                <label className="label">Physical Address</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Street, Landmark, City"
                  {...register('address')}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">WhatsApp Number (For booking inquiries)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="+91 XXXXX XXXXX"
                    {...register('whatsappNumber')}
                  />
                </div>

                <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-surface-850 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <input type="checkbox" id="is24Hours" className="w-4 h-4 rounded accent-primary-600 cursor-pointer" {...register('is24Hours')} />
                  <label htmlFor="is24Hours" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Open 24/7 Round the Clock
                  </label>
                </div>
              </div>

              {!is24Hours && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Daily Opening Time</label>
                    <input type="time" className="input" {...register('openingTime')} />
                  </div>
                  <div>
                    <label className="label">Daily Closing Time</label>
                    <input type="time" className="input" {...register('closingTime')} />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-3 text-sm font-bold shadow-glow-sm"
            >
              <UserPlus size={16} />
              <span>{loading ? 'Registering workspace...' : 'Register Library & Open Dashboard'}</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already have an owner account?{' '}
              <button
                type="button"
                onClick={() => navigate('/admin/login')}
                className="text-primary-600 dark:text-primary-400 font-bold hover:underline"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
