import React, { useEffect, useState } from 'react';
import { User, Mail, Shield } from 'lucide-react';
import apiClient from '../api/client';

const Profile = ({ user: initialUser }) => {
  const [profile, setProfile] = useState(initialUser || null);
  const [loading, setLoading] = useState(!initialUser);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        setError('');
        setLoading(true);
        const { data } = await apiClient.get('/api/profile');
        if (isMounted) {
          setProfile(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.error || 'Unable to load profile information.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (!initialUser) {
      fetchProfile();
    }

    return () => {
      isMounted = false;
    };
  }, [initialUser]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Profile</h2>
            <p className="text-xs text-purple-200">
              View your authenticated account details.
            </p>
          </div>
        </div>
      </header>

      {loading && <p className="text-purple-200 text-sm">Loading profile...</p>}

      {error && (
        <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {profile && (
        <section className="grid gap-4 md:grid-cols-2">
          <div className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-2">
            <p className="text-xs text-purple-300 uppercase tracking-wide">
              Username
            </p>
            <p className="text-white font-medium">
              {profile.username || profile.email}
            </p>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-2">
            <p className="text-xs text-purple-300 uppercase tracking-wide flex items-center gap-1">
              <Mail className="w-3 h-3" />
              Email
            </p>
            <p className="text-white font-medium">{profile.email}</p>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-2">
            <p className="text-xs text-purple-300 uppercase tracking-wide">
              Role
            </p>
            <p className="inline-flex items-center gap-2 text-sm">
              <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-100">
                {profile.role || 'user'}
              </span>
            </p>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-2">
            <p className="text-xs text-purple-300 uppercase tracking-wide flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Security
            </p>
            <p className="text-xs text-purple-200">
              Your account is protected with JWT-based authentication provided by
              SVH Auth.
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

export default Profile;

