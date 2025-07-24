import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ProfileReferrals({ session: propSession }) {
  const [session, setSession] = useState(propSession || null);
  const [profile, setProfile] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [bankDetails, setBankDetails] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchData() {
      let userSession = session;
      if (!userSession) {
        const { data } = await supabase.auth.getSession();
        userSession = data.session;
        setSession(userSession);
      }
      if (!userSession) {
        window.location.href = '/login';
        return;
      }
      // Fetch profile
      const { data: profileData } = await supabase
        .from('users')
        .select('id, email, full_name, created_at, bank_details')
        .eq('id', userSession.user.id)
        .single();
      setProfile(profileData);
      setBankDetails(profileData?.bank_details || '');
      // Fetch referrals
      const { count } = await supabase
        .from('referrals')
        .select('id', { count: 'exact', head: true })
        .eq('referrer_id', userSession.user.id);
      setReferrals(count || 0);
      setLoading(false);
    }
    fetchData();
  }, [session]);

  const handleBankSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    const { error } = await supabase
      .from('users')
      .update({ bank_details: bankDetails })
      .eq('id', session.user.id);
    setSaving(false);
    if (!error) setSuccess('Bank details saved!');
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!session) return null;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold text-purple-700 mb-4">My Profile</h1>
      {profile ? (
        <div className="mb-8">
          <p><span className="font-semibold">Name:</span> {profile.full_name || 'N/A'}</p>
          <p><span className="font-semibold">Email:</span> {profile.email}</p>
          <p><span className="font-semibold">Joined:</span> {new Date(profile.created_at).toLocaleDateString()}</p>
        </div>
      ) : (
        <p>No profile data found.</p>
      )}

      <h2 className="text-xl font-bold text-purple-700 mb-2">My Referrals</h2>
      <p className="mb-4">Total referrals: <span className="font-semibold">{referrals}</span></p>

      <h2 className="text-xl font-bold text-purple-700 mb-2">Bank Details for Payouts</h2>
      <form onSubmit={handleBankSave} className="mb-4">
        <input
          type="text"
          className="w-full px-4 py-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Enter your bank details"
          value={bankDetails}
          onChange={e => setBankDetails(e.target.value)}
        />
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        {success && <p className="text-green-600 mt-2">{success}</p>}
      </form>
    </div>
  )
}