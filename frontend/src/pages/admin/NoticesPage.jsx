import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Bell, Calendar, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { noticeAPI } from '../../api/services';
import { PageLoader } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatDate } from '../../utils/helpers';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const NoticeForm = ({ notice, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: notice ? {
      title: notice.title,
      description: notice.description,
      visibleFrom: notice.visibleFrom?.split('T')[0],
      visibleUntil: notice.visibleUntil?.split('T')[0],
    } : { visibleFrom: today, visibleUntil: nextMonth }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (notice) {
        await noticeAPI.update(notice._id, data);
        toast.success('Notice updated.');
      } else {
        await noticeAPI.create(data);
        toast.success('Notice published.');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save notice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-fade-in">
      <div>
        <label className="label">Announcement Title *</label>
        <input
          className={`input ${errors.title ? 'border-rose-400 focus:ring-rose-400' : ''}`}
          placeholder="e.g. Sunday Timings Extended, Holiday Announcement"
          {...register('title', { required: 'Title is required' })}
        />
        {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="label">Notice Content / Details *</label>
        <textarea
          rows={4}
          className={`input resize-none ${errors.description ? 'border-rose-400 focus:ring-rose-400' : ''}`}
          placeholder="Write the full message visible to students on the public website..."
          {...register('description', { required: 'Description is required' })}
        />
        {errors.description && <p className="text-rose-500 text-xs mt-1">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Display From *</label>
          <input
            type="date"
            className={`input ${errors.visibleFrom ? 'border-rose-400' : ''}`}
            {...register('visibleFrom', { required: 'Required' })}
          />
        </div>
        <div>
          <label className="label">Display Until *</label>
          <input
            type="date"
            className={`input ${errors.visibleUntil ? 'border-rose-400' : ''}`}
            {...register('visibleUntil', { required: 'Required' })}
          />
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-primary-50/70 dark:bg-primary-950/40 border border-primary-200/60 dark:border-primary-900/40 text-xs text-primary-700 dark:text-primary-300">
        This announcement will automatically appear and disappear from the public website based on the dates above.
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Publishing...' : notice ? 'Update Notice' : 'Publish Notice'}
        </button>
      </div>
    </form>
  );
};

const NoticesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [deletingNotice, setDeletingNotice] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setShowForm(true);
      setSearchParams({});
    }
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await noticeAPI.getAll();
      setNotices(res.data.notices);
    } catch (err) {
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await noticeAPI.delete(deletingNotice._id);
      toast.success('Notice deleted.');
      setDeletingNotice(null);
      fetchNotices();
    } catch (err) {
      toast.error('Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  const isActive = (notice) => {
    const now = new Date();
    return new Date(notice.visibleFrom) <= now && new Date(notice.visibleUntil) >= now;
  };

  if (loading) return <PageLoader message="Loading public notices..." />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Announcements & Notices</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Publish public bulletins, holiday schedules, and library updates
          </p>
        </div>
        <button
          className="btn-primary self-start sm:self-auto"
          onClick={() => { setEditingNotice(null); setShowForm(true); }}
        >
          <Plus size={16} />
          <span>Post New Notice</span>
        </button>
      </div>

      {notices.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notices published"
          description="Create public announcements for your students and study hall visitors."
          action={
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={16} /> Post First Notice
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {notices.map(notice => {
            const active = isActive(notice);
            return (
              <div
                key={notice._id}
                className={`card p-5 relative overflow-hidden transition-all duration-200 hover:shadow-card-hover ${
                  !active ? 'opacity-65 border-dashed' : 'border-l-4 border-l-primary-500'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base font-display">
                        {notice.title}
                      </h3>
                      <span className={active ? 'badge-green' : 'badge-gray'}>
                        {active ? 'Live on Website' : 'Expired / Scheduled'}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {notice.description}
                    </p>

                    <div className="flex items-center gap-4 mt-4 text-xs font-medium text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-primary-500" />
                        <span>Visible from: <strong className="text-slate-700 dark:text-slate-300">{formatDate(notice.visibleFrom)}</strong></span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} className="text-amber-500" />
                        <span>Until: <strong className="text-slate-700 dark:text-slate-300">{formatDate(notice.visibleUntil)}</strong></span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => { setEditingNotice(notice); setShowForm(true); }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors"
                      title="Edit notice"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setDeletingNotice(notice)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete notice"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingNotice(null); }}
        title={editingNotice ? 'Edit Announcement' : 'Post Announcement'}
      >
        <NoticeForm
          notice={editingNotice}
          onSuccess={() => { setShowForm(false); setEditingNotice(null); fetchNotices(); }}
          onCancel={() => { setShowForm(false); setEditingNotice(null); }}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingNotice)}
        onClose={() => setDeletingNotice(null)}
        onConfirm={handleDelete}
        title="Delete Notice"
        message={`Delete "${deletingNotice?.title}"? It will immediately stop appearing on your public website.`}
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default NoticesPage;
