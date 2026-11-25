import { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { useToast } from '../components/ui/Toast';

export default function ProfileSettingsPage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await authApi.updateProfile({ name: name.trim(), email: email.trim() });
      updateUser(res.user);
      showToast('Profile updated successfully.');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters.', 'error');
      return;
    }
    setSavingPassword(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      showToast('Password changed successfully.');
    } catch (err) {
      showToast(err.message || 'Failed to change password', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <DashboardLayout title="Profile Settings" subtitle="Manage your QR Studio account credentials">
      <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
        <form onSubmit={handleProfileSubmit} className="card space-y-4 p-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Account Information</h2>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Full Name
            </label>
            <input
              type="text"
              required
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <input
              type="email"
              required
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary">
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </form>

        <form onSubmit={handlePasswordSubmit} className="card space-y-4 p-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Security & Password</h2>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Current Password
            </label>
            <input
              type="password"
              required
              className="input-field"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              New Password (min. 8 characters)
            </label>
            <input
              type="password"
              required
              minLength={8}
              className="input-field"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={savingPassword} className="btn-secondary">
            {savingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
