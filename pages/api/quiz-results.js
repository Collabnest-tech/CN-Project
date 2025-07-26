import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { moduleId, score, totalQuestions, passed } = req.body
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Save quiz results
    const { error } = await supabase
      .from('quiz_results')
      .upsert({
        user_id: session.user.id,
        module_id: moduleId,
        score,
        total_questions: totalQuestions,
        passed,
        completed_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,module_id'
      })

    if (error) throw error

    // Update user progress
    await supabase
      .from('user_progress')
      .upsert({
        user_id: session.user.id,
        module_id: moduleId,
        completed: passed,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,module_id'
      })

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error saving quiz results:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}