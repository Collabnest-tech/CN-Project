import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ProfileReferrals() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        window.location.href = '/login'
        return
      }
      setSession(session)
      // Fetch profile
      const { data: profileData } = await supabase.from('users').select('id, email, full_name, created_at').eq('id', session.user.id).single()
      setProfile(profileData)
      // Fetch referrals
      const { data: referralData } = await supabase.from('referrals').select('id, referred_email, created_at').eq('referrer_id', session.user.id)
      setReferrals(referralData || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="p-8 text-center">Loading...</div>
  if (!session) return null

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
      {referrals.length === 0 ? (
        <p>No referrals yet.</p>
      ) : (
        <ul className="list-disc pl-6">
          {referrals.map(ref => (
            <li key={ref.id}>
              {ref.referred_email} <span className="text-gray-500 text-sm">({new Date(ref.created_at).toLocaleDateString()})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}