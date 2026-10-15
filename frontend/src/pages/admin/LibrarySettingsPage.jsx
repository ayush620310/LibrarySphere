import { useEffect, useState, useRef } from 'react';
import { libraryAPI } from '../../api/services';
import { PageLoader } from '../../components/ui/Spinner';
import { Upload, X, Plus, Trash2, Library, Save, CheckCircle2, Clock, MapPin, QrCode, Image as ImageIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const ImageUpload = ({ label, value, onUpload, accept = 'image/*', uploading }) => (
  <div>
    <label className="label">{label}</label>
    {value ? (
      <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-surface-850 shadow-sm group">
        <img src={value} alt={label} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
          <label className="cursor-pointer bg-white/90 text-slate-800 dark:bg-surface-900/90 dark:text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg hover:bg-white transition-all">
            Change Photo
            <input type="file" accept={accept} className="sr-only" onChange={onUpload} disabled={uploading} />
          </label>
        </div>
      </div>
    ) : (
      <label className={`flex flex-col items-center justify-center w-full h-36 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 cursor-pointer hover:border-primary-500 hover:bg-primary-50/20 dark:hover:bg-primary-950/20 transition-all bg-slate-50/60 dark:bg-surface-850/60 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <div className="w-10 h-10 rounded-xl bg-white dark:bg-surface-800 flex items-center justify-center text-slate-400 mb-2 shadow-sm border border-slate-200/60 dark:border-slate-700/60">
          <Upload size={18} />
        </div>
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
          {uploading ? 'Uploading to cloud...' : 'Click to upload image'}
        </span>
        <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WebP up to 5MB</span>
        <input type="file" accept={accept} className="sr-only" onChange={onUpload} disabled={uploading} />
      </label>
    )}
  </div>
);

const LibrarySettingsPage = () => {
  const [library, setLibrary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({});
  const [facilities, setFacilities] = useState([]);
  const [rules, setRules] = useState([]);
  const [newFacility, setNewFacility] = useState('');
  const [newRule, setNewRule] = useState('');

  const { register, handleSubmit, reset, watch } = useForm();
  const is24Hours = watch('is24Hours');

  const fetchLibrary = async () => {
    try {
      const res = await libraryAPI.get();
      const lib = res.data.library;
      setLibrary(lib);
      setFacilities(lib.facilities || []);
      setRules(lib.rules || []);
      reset({
        name: lib.name, about: lib.about, address: lib.address,
        googleMapsLink: lib.googleMapsLink, contactNumber: lib.contactNumber,
        whatsappNumber: lib.whatsappNumber, openingTime: lib.openingTime,
        closingTime: lib.closingTime, is24Hours: lib.is24Hours, upiId: lib.upiId,
      });
    } catch (err) {
      toast.error('Failed to load library settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLibrary(); }, []);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await libraryAPI.update({ ...data, facilities, rules });
      toast.success('Library settings saved.');
      fetchLibrary();
    } catch (err) {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = (type) => async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(u => ({ ...u, [type]: true }));
    try {
      const formData = new FormData();
      const apiCall = {
        logo: () => { formData.append('logo', file); return libraryAPI.uploadLogo(formData); },
        banner: () => { formData.append('banner', file); return libraryAPI.uploadBanner(formData); },
        upiQr: () => { formData.append('upiQr', file); return libraryAPI.uploadUpiQr(formData); },
        gallery: () => { formData.append('image', file); return libraryAPI.uploadGallery(formData); },
      };
      await apiCall[type]();
      toast.success('Image uploaded.');
      fetchLibrary();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(u => ({ ...u, [type]: false }));
    }
  };

  const handleDeleteGallery = async (url) => {
    try {
      await libraryAPI.deleteGalleryImage(url);
      toast.success('Image removed.');
      fetchLibrary();
    } catch (err) {
      toast.error('Failed to remove image.');
    }
  };

  if (loading) return <PageLoader message="Loading library profile..." />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Library Profile & Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Customize your library branding, photo gallery, facilities, and contact details
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Brand Info */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Library size={18} className="text-primary-600 dark:text-primary-400" />
            <h2 className="section-title">Brand Information</h2>
          </div>
          <div>
            <label className="label">Library Title / Business Name *</label>
            <input className="input" placeholder="e.g. Apex Reading Room & Study Space" {...register('name', { required: true })} />
          </div>
          <div>
            <label className="label">About Library (Public Description)</label>
            <textarea
              rows={4}
              className="input resize-none"
              placeholder="Introduce your study space, atmosphere, air conditioning, silent environment..."
              {...register('about')}
            />
          </div>
        </div>

        {/* Media Assets */}
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <ImageIcon size={18} className="text-primary-600 dark:text-primary-400" />
            <h2 className="section-title">Visual Branding & Photos</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ImageUpload label="Library Logo" value={library?.logo} onUpload={handleUpload('logo')} uploading={uploading.logo} />
            <ImageUpload label="Hero Cover Banner" value={library?.coverBanner} onUpload={handleUpload('banner')} uploading={uploading.banner} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label !mb-0">Photo Gallery (Up to 5 Photos)</label>
              <span className="text-xs text-slate-400">{library?.gallery?.length || 0}/5 photos uploaded</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(library?.gallery || []).map((img, idx) => (
                <div key={idx} className="relative h-28 rounded-2xl overflow-hidden group border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <img src={img} alt={`Gallery ${idx + 1}`} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  <button
                    type="button"
                    onClick={() => handleDeleteGallery(img)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-xl bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    title="Remove photo"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {(library?.gallery?.length || 0) < 5 && (
                <label className="h-28 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 cursor-pointer hover:border-primary-500 hover:bg-primary-50/20 transition-all bg-slate-50/60 dark:bg-surface-850/60">
                  <Plus size={20} className="text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {uploading.gallery ? 'Uploading...' : 'Add Photo'}
                  </span>
                  <input type="file" accept="image/*" className="sr-only" onChange={handleUpload('gallery')} disabled={uploading.gallery} />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Contact & Location */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={18} className="text-primary-600 dark:text-primary-400" />
            <h2 className="section-title">Location & Contact Details</h2>
          </div>

          <div>
            <label className="label">Physical Address</label>
            <textarea rows={2} className="input resize-none" placeholder="Building name, landmark, road, city..." {...register('address')} />
          </div>

          <div>
            <label className="label">Google Maps Link</label>
            <input className="input" placeholder="https://maps.app.goo.gl/..." {...register('googleMapsLink')} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Direct Call Contact Number</label>
              <input className="input" placeholder="+91 XXXXX XXXXX" {...register('contactNumber')} />
            </div>
            <div>
              <label className="label">WhatsApp Number (For booking inquiries)</label>
              <input className="input" placeholder="+91 XXXXX XXXXX" {...register('whatsappNumber')} />
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={18} className="text-primary-600 dark:text-primary-400" />
            <h2 className="section-title">Operating Hours</h2>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-surface-850 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <input type="checkbox" id="is24Hours" className="w-4 h-4 rounded accent-primary-600 cursor-pointer" {...register('is24Hours')} />
            <label htmlFor="is24Hours" className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              Open 24/7 (Enables continuous night study shifts)
            </label>
          </div>

          {!is24Hours && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Morning Opening Time</label>
                <input type="time" className="input" {...register('openingTime')} />
              </div>
              <div>
                <label className="label">Night Closing Time</label>
                <input type="time" className="input" {...register('closingTime')} />
              </div>
            </div>
          )}
        </div>

        {/* Facilities Manager */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="section-title">Amenities & Facilities</h2>
            <span className="text-xs text-slate-400">{facilities.length} amenities added</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {facilities.map((f, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 rounded-xl text-xs font-bold border border-primary-200/70 dark:border-primary-800/60 shadow-xs">
                <CheckCircle2 size={13} className="text-primary-600 dark:text-primary-400" />
                <span>{f}</span>
                <button
                  type="button"
                  onClick={() => setFacilities(prev => prev.filter((_, j) => j !== i))}
                  className="hover:text-rose-500 transition-colors ml-1"
                >
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              className="input"
              placeholder="Add facility (e.g. High-Speed WiFi, Air Conditioned, Purified RO Water, CCTV Surveillance)"
              value={newFacility}
              onChange={e => setNewFacility(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (newFacility.trim()) {
                    setFacilities(p => [...p, newFacility.trim()]);
                    setNewFacility('');
                  }
                }
              }}
            />
            <button
              type="button"
              className="btn-secondary shrink-0"
              onClick={() => {
                if (newFacility.trim()) {
                  setFacilities(p => [...p, newFacility.trim()]);
                  setNewFacility('');
                }
              }}
            >
              <Plus size={16} />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Rules Manager */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="section-title">Study Hall Rules & Conduct</h2>
            <span className="text-xs text-slate-400">{rules.length} rule(s)</span>
          </div>

          <div className="space-y-2">
            {rules.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-surface-850 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs sm:text-sm">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  <strong className="text-primary-600 mr-2 font-display">{i + 1}.</strong> {r}
                </span>
                <button
                  type="button"
                  onClick={() => setRules(prev => prev.filter((_, j) => j !== i))}
                  className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              className="input"
              placeholder="Add rule (e.g. Maintain pin-drop silence in hall, Keep phones on silent mode)"
              value={newRule}
              onChange={e => setNewRule(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (newRule.trim()) {
                    setRules(p => [...p, newRule.trim()]);
                    setNewRule('');
                  }
                }
              }}
            />
            <button
              type="button"
              className="btn-secondary shrink-0"
              onClick={() => {
                if (newRule.trim()) {
                  setRules(p => [...p, newRule.trim()]);
                  setNewRule('');
                }
              }}
            >
              <Plus size={16} />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* UPI Payments */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <QrCode size={18} className="text-primary-600 dark:text-primary-400" />
            <h2 className="section-title">Digital Payments (UPI)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Library UPI ID</label>
              <input className="input" placeholder="libraryname@okhdfcbank" {...register('upiId')} />
              <p className="text-xs text-slate-400 mt-1">Displayed on the public website for digital fees</p>
            </div>
            <ImageUpload label="Payment QR Code Image" value={library?.upiQr} onUpload={handleUpload('upiQr')} uploading={uploading.upiQr} />
          </div>
        </div>

        {/* Form Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="submit" className="btn-primary px-7 py-3 text-sm" disabled={saving}>
            <Save size={16} />
            <span>{saving ? 'Saving changes...' : 'Save Library Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default LibrarySettingsPage;
