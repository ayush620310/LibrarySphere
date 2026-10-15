import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { BookOpen, Eye, EyeOff, LogIn, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient decorative gradient meshes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-primary-500/10 dark:bg-primary-500/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-[120px] pointer-events-none" />

      {/* Theme Switcher in Top Right */}
      <div className="absolute top-5 right-5 flex items-center gap-1 bg-white/90 dark:bg-surface-900/90 backdrop-blur-md rounded-2xl p-1.5 border border-slate-200/80 dark:border-slate-800 shadow-sm z-20">
        {[
          { v: 'light', Icon: Sun },
          { v: 'dark', Icon: Moon },
          { v: 'system', Icon: Monitor },
        ].map(({ v, Icon }) => (
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

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Brand Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-3xl bg-gradient-to-tr from-primary-600 via-indigo-600 to-primary-500 items-center justify-center mb-4 shadow-glow text-white">
            <BookOpen size={30} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white font-display tracking-tight">
            LibraryOS
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-medium">
            Next-gen library & study hall seat management
          </p>
        </div>

        {/* Login Card */}
        <div className="card p-7 sm:p-9 shadow-xl border border-slate-200/90 dark:border-slate-800">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Admin Email Address</label>
              <input
                type="email"
                className={`input ${errors.email ? 'border-rose-400 focus:ring-rose-400' : ''}`}
                placeholder="admin@library.com"
                {...register('email', { required: 'Email address is required' })}
              />
              {errors.email && (
                <p className="text-rose-500 text-xs mt-1.5 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label !mb-0">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`input pr-11 ${errors.password ? 'border-rose-400 focus:ring-rose-400' : ''}`}
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Password is required',
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
              {errors.password && (
                <p className="text-rose-500 text-xs mt-1.5 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-3 text-sm font-bold shadow-glow-sm"
            >
              <LogIn size={16} />
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              New library owner?{' '}
              <button
                type="button"
                onClick={() => navigate('/admin/signup')}
                className="text-primary-600 dark:text-primary-400 font-bold hover:underline"
              >
                Create library account
              </button>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors"
          >
            ← Back to Public Library Directory
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
