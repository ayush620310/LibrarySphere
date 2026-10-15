import { AlertTriangle, Trash2 } from 'lucide-react';
import Modal from './Modal';
import Spinner from './Spinner';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  isLoading,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/60 flex items-center justify-center shrink-0">
        <AlertTriangle size={22} className="text-rose-600 dark:text-rose-400" />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>
      </div>
    </div>

    <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
      <button
        type="button"
        className="btn-secondary"
        onClick={onClose}
        disabled={isLoading}
      >
        Cancel
      </button>
      <button
        type="button"
        className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold text-xs md:text-sm px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-sm shadow-rose-500/20 active:scale-[0.98] disabled:opacity-50"
        onClick={onConfirm}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Spinner size="sm" className="border-t-white" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Trash2 size={15} />
            <span>{confirmText}</span>
          </>
        )}
      </button>
    </div>
  </Modal>
);

export default ConfirmDialog;
