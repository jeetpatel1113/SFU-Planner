import { useState } from 'react';
import { useCourseStore } from '../store/useCourseStore';
import { auth, logoutUser, deleteUserAccount } from '../services/firebase';
import { LogOut, Trash2, User, X, AlertTriangle } from 'lucide-react';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfile = ({ isOpen, onClose }: UserProfileProps) => {
  const { profile, resetProgress } = useCourseStore();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSignOut = async () => {
    try {
      await logoutUser();
      resetProgress();
      onClose();
    } catch (err) {
      console.error("Sign out error", err);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError('');
    try {
      await deleteUserAccount();
      resetProgress();
      onClose();
    } catch (err) {
      console.error("Delete account error", err);
      const e = err as { code?: string; message?: string };
      // Firebase sometimes requires recent authentication to delete an account.
      if (e.code === 'auth/requires-recent-login') {
        setError('For security reasons, please sign out and sign in again before deleting your account.');
      } else {
        setError(e.message || 'Failed to delete account.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-sm w-full relative overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <User size={18} className="text-indigo-400" />
            Account Settings
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
              <span className="text-2xl font-bold">{profile?.name?.charAt(0) || '?'}</span>
            </div>
            <h3 className="text-xl font-bold text-white">{profile?.name}</h3>
            <p className="text-sm text-slate-400">{profile?.major}</p>
            <p className="text-xs text-slate-500 mt-1">
              {auth.currentUser ? (
                <span className="text-emerald-400 flex items-center gap-1 justify-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Synced to Cloud
                </span>
              ) : (
                "Local Session (Not Saved)"
              )}
            </p>
          </div>

          <div className="space-y-3">
            {auth.currentUser ? (
              <button 
                onClick={handleSignOut}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                <LogOut size={16} className="text-slate-400" />
                Sign Out
              </button>
            ) : (
              <button 
                onClick={() => {
                  resetProgress();
                  onClose();
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                <LogOut size={16} className="text-slate-400" />
                Clear Local Data & Leave
              </button>
            )}

            {auth.currentUser && !showConfirmDelete && (
              <button 
                onClick={() => setShowConfirmDelete(true)}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium py-3 rounded-xl transition-all border border-red-500/20 flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Delete Account
              </button>
            )}
          </div>

          {showConfirmDelete && (
            <div className="p-4 bg-red-950/50 border border-red-900/50 rounded-xl mt-4">
              <h4 className="text-red-400 font-bold flex items-center gap-2 mb-2 text-sm">
                <AlertTriangle size={16} />
                Confirm Deletion
              </h4>
              <p className="text-xs text-red-300/80 mb-4">
                This will permanently delete your planner data from the cloud and remove your account. This action cannot be undone.
              </p>
              
              {error && (
                <p className="text-xs text-red-400 mb-3 bg-red-950 p-2 rounded">{error}</p>
              )}

              <div className="flex gap-2">
                <button 
                  onClick={() => setShowConfirmDelete(false)}
                  disabled={isDeleting}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium py-2 rounded-lg transition-all border border-slate-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 rounded-lg transition-all shadow-lg shadow-red-900/50 flex justify-center items-center"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
