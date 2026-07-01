// src/app/dashboard/exam/ExamSetupClient.tsx
'use client'
import { useState, useEffect, useCallback } from 'react'

interface Cert {
  id: string
  code: string
  name: string
  icon: string
  color: string
  _count: { questions: number }
}

interface Question {
  id: string
  domain: string
  type: 'single' | 'multi'
  difficulty: string
  text: string
  choices: string[]
  correctAnswers: number[]
  explanation: string
  examQuestionId: string
  order: number
}

interface ExamSession {
  id: string
  questions: Question[]
  timeLimitSec: number | null
}

export default function ExamSetupClient({ certifications }: { certifications: Cert[] }) {
  const [phase, setPhase] = useState<'setup' | 'exam' | 'result'>('setup')
  const [session, setSession] = useState<ExamSession | null>(null)
  const [selectedCert, setSelectedCert] = useState(certifications[0]?.id ?? '')
  const [numQuestions, setNumQuestions] = useState(10)
  const [mode, setMode] = useState<'practice' | 'exam'>('practice')
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')

  // Exam state
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number[]>>({})
  const [submitted, setSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [results, setResults] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  // Timer
  useEffect(() => {
    if (phase !== 'exam' || !session?.timeLimitSec || submitted) return
    setTimeLeft(session.timeLimitSec)
  }, [phase, session, submitted])

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || phase !== 'exam') return
    const t = setInterval(() => setTimeLeft(s => (s !== null && s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [timeLeft, phase])

  async function startExam() {
    setStarting(true)
    setError('')
    try {
      const res = await fetch('/api/exams/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificationId: selectedCert, numQuestions, mode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur')
      setSession(data)
      setIdx(0)
      setAnswers({})
      setSubmitted(false)
      setResults(null)
      setPhase('exam')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setStarting(false)
    }
  }

  async function finishExam() {
    if (!session) return
    setSubmitting(true)
    const answersArr = session.questions.map((q, i) => ({
      examQuestionId: q.examQuestionId,
      userAnswer: answers[i] ?? [],
    }))
    try {
      const res = await fetch(`/api/exams/${session.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersArr, timeSpentSec: session.timeLimitSec ? session.timeLimitSec - (timeLeft ?? 0) : null }),
      })
      const data = await res.json()
      setResults(data)
      setPhase('result')
    } finally {
      setSubmitting(false)
    }
  }

  function pick(ci: number) {
    if (!session) return
    const q = session.questions[idx]
    if (q.type === 'multi') {
      setAnswers(a => {
        const prev = a[idx] ?? []
        const next = prev.includes(ci) ? prev.filter(x => x !== ci) : [...prev, ci]
        return { ...a, [idx]: next }
      })
    } else {
      setAnswers(a => ({ ...a, [idx]: [ci] }))
    }
    if (mode === 'practice') setSubmitted(false)
  }

  function checkAnswer() {
    setSubmitted(true)
  }

  function nextQuestion() {
    setSubmitted(false)
    setIdx(i => i + 1)
  }

  // ===================== SETUP SCREEN =====================
  if (phase === 'setup') {
    const cert = certifications.find(c => c.id === selectedCert)
    const maxQ = cert?._count.questions ?? 10
    return (
      <div style={{ padding: '20px 24px', maxWidth: 580 }}>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Lancer un examen blanc</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>
          Configurez votre session de révision
        </div>

        {error && (
          <div style={{ background: '#FCEBEB', border: '0.5px solid #A32D2D', borderRadius: 6, padding: '8px 12px', fontSize: 12, color: '#A32D2D', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '20px' }}>
          {/* Certification */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
              Certification
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {certifications.map(c => (
                <button key={c.id} onClick={() => setSelectedCert(c.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    borderRadius: 8, border: '0.5px solid ' + (selectedCert === c.id ? c.color : 'var(--border)'),
                    background: selectedCert === c.id ? c.color + '10' : 'transparent',
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s',
                  }}>
                  <span style={{ fontSize: 18 }}>{c.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: selectedCert === c.id ? c.color : 'var(--text-primary)' }}>{c.code}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c._count.questions} questions disponibles</div>
                  </div>
                  {selectedCert === c.id && <span style={{ marginLeft: 'auto', color: c.color, fontSize: 14 }}>✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Nombre de questions */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
              Nombre de questions
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[10, 20, 30, Math.min(50, maxQ)].filter((v, i, a) => a.indexOf(v) === i && v <= maxQ).map(n => (
                <button key={n} onClick={() => setNumQuestions(n)}
                  style={{
                    flex: 1, padding: '8px', borderRadius: 7,
                    border: '0.5px solid ' + (numQuestions === n ? '#185FA5' : 'var(--border)'),
                    background: numQuestions === n ? '#E6F1FB' : 'transparent',
                    color: numQuestions === n ? '#0C447C' : 'var(--text-secondary)',
                    fontWeight: numQuestions === n ? 600 : 400, fontSize: 13,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Mode */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
              Mode
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { val: 'practice', label: 'Révision', desc: 'Feedback immédiat après chaque réponse', icon: '📖' },
                { val: 'exam', label: 'Examen', desc: 'Chronomètre, résultats à la fin uniquement', icon: '⏱' },
              ].map(m => (
                <button key={m.val} onClick={() => setMode(m.val as any)}
                  style={{
                    padding: '12px', borderRadius: 8, textAlign: 'left',
                    border: '0.5px solid ' + (mode === m.val ? '#185FA5' : 'var(--border)'),
                    background: mode === m.val ? '#E6F1FB' : 'transparent',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{m.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: mode === m.val ? '#0C447C' : 'var(--text-primary)' }}>{m.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button onClick={startExam} disabled={starting}
            style={{
              width: '100%', padding: '10px', borderRadius: 8,
              background: starting ? 'var(--border)' : '#185FA5',
              color: '#fff', border: 'none', cursor: starting ? 'not-allowed' : 'pointer',
              fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
            }}>
            {starting ? 'Préparation...' : `▶ Démarrer (${numQuestions} questions)`}
          </button>
        </div>
      </div>
    )
  }

  // ===================== RESULT SCREEN =====================
  if (phase === 'result' && results) {
    const { score, passed, correctCount, totalQuestions, domainStats, sessionId } = results
    return (
      <div style={{ padding: '24px', maxWidth: 680 }}>
        <div style={{ textAlign: 'center', padding: '28px 0 20px' }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>{passed ? '🎉' : '📚'}</div>
          <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>{passed ? 'Examen réussi !' : 'Continuez vos révisions'}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{score}% de bonnes réponses • Seuil : 70%</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { v: score + '%', l: 'Score final', color: passed ? '#0F6E56' : '#A32D2D' },
            { v: `${correctCount}/${totalQuestions}`, l: 'Bonnes réponses', color: '#185FA5' },
            { v: passed ? '✅' : '❌', l: passed ? 'Certification' : 'À repasser', color: passed ? '#3B6D11' : '#A32D2D' },
          ].map(m => (
            <div key={m.l} style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: m.color }}>{m.v}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.l}</div>
            </div>
          ))}
        </div>

        {/* Performance par domaine */}
        {domainStats && domainStats.length > 0 && (
          <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ padding: '10px 16px', borderBottom: '0.5px solid var(--border)', fontSize: 12, fontWeight: 600 }}>Performance par domaine</div>
            {domainStats.map((d: any) => (
              <div key={d.domain} style={{ padding: '10px 16px', borderBottom: '0.5px solid var(--border)', display: 'grid', gridTemplateColumns: '150px 1fr 40px 60px', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 500 }}>{d.domain}</span>
                <div style={{ height: 5, background: 'var(--surface-1)', borderRadius: 3 }}>
                  <div style={{ height: '100%', borderRadius: 3, background: d.score >= 75 ? '#3B6D11' : d.score >= 60 ? '#185FA5' : '#A32D2D', width: d.score + '%' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: d.score >= 75 ? '#3B6D11' : d.score >= 60 ? '#185FA5' : '#A32D2D' }}>{d.score}%</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>{d.total} q.</span>
              </div>
            ))}
          </div>
        )}

        {/* Révision réponses (mode practice) */}
        {results.questionsReview && (
          <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ padding: '10px 16px', borderBottom: '0.5px solid var(--border)', fontSize: 12, fontWeight: 600 }}>Révision des réponses</div>
            {results.questionsReview.map((q: any, i: number) => (
              <div key={i} style={{ padding: '10px 16px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: q.isCorrect ? '#EAF3DE' : '#FCEBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11 }}>
                  {q.isCorrect ? '✓' : '✗'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>Q{i + 1}. {q.text.slice(0, 70)}…</div>
                  {!q.isCorrect && <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{q.explanation.slice(0, 120)}…</div>}
                </div>
                <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 10, flexShrink: 0, background: q.difficulty === 'Difficile' ? '#FCEBEB' : q.difficulty === 'Intermédiaire' ? '#E6F1FB' : '#EAF3DE', color: q.difficulty === 'Difficile' ? '#A32D2D' : q.difficulty === 'Intermédiaire' ? '#0C447C' : '#3B6D11' }}>
                  {q.difficulty}
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setPhase('setup')}
            style={{ flex: 1, padding: '9px', borderRadius: 7, background: 'var(--surface-1)', color: 'var(--text-primary)', border: '0.5px solid var(--border)', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'inherit' }}>
            Reconfigurer
          </button>
          <button onClick={() => { setPhase('setup'); setTimeout(startExam, 100) }}
            style={{ flex: 1, padding: '9px', borderRadius: 7, background: '#185FA5', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'inherit' }}>
            Recommencer
          </button>
        </div>
      </div>
    )
  }

  // ===================== EXAM SCREEN =====================
  if (!session) return null
  const q = session.questions[idx]
  const total = session.questions.length
  const answered = Object.keys(answers).length
  const ans = answers[idx] ?? []
  const hasAns = ans.length > 0

  function isCorrect() {
    const sorted = [...ans].sort()
    const correctSorted = [...q.correctAnswers].sort()
    return JSON.stringify(sorted) === JSON.stringify(correctSorted)
  }

  const mm = timeLeft !== null ? Math.floor(timeLeft / 60).toString().padStart(2, '0') : '--'
  const ss = timeLeft !== null ? (timeLeft % 60).toString().padStart(2, '0') : '--'

  return (
    <div style={{ padding: '20px 24px', maxWidth: 780 }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setPhase('setup')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'inherit', padding: 0 }}>
            ✕ Quitter
          </button>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Question {idx + 1}/{total}</span>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#E6F1FB', color: '#0C447C', fontWeight: 500 }}>{q.domain}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {timeLeft !== null && (
            <span style={{ fontSize: 12, color: timeLeft < 60 ? '#A32D2D' : 'var(--text-secondary)', fontWeight: timeLeft < 60 ? 600 : 400 }}>
              ⏱ {mm}:{ss}
            </span>
          )}
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{answered}/{total} répondues</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'var(--surface-1)', borderRadius: 2, marginBottom: 18 }}>
        <div style={{ height: '100%', borderRadius: 2, background: '#185FA5', width: ((idx + 1) / total * 100) + '%', transition: 'width 0.3s' }} />
      </div>

      {/* Question card */}
      <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '18px 20px', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 10, background: q.difficulty === 'Difficile' ? '#FCEBEB' : q.difficulty === 'Intermédiaire' ? '#E6F1FB' : '#EAF3DE', color: q.difficulty === 'Difficile' ? '#A32D2D' : q.difficulty === 'Intermédiaire' ? '#0C447C' : '#3B6D11' }}>
            {q.difficulty}
          </span>
          {q.type === 'multi' && <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 10, background: '#FAEEDA', color: '#BA7517' }}>Choix multiples</span>}
        </div>
        <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.5, marginBottom: 16 }}>{q.text}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {q.choices.map((ch, ci) => {
            const sel = ans.includes(ci)
            const corr = q.correctAnswers.includes(ci)
            let bg = 'var(--surface-2)', bc = 'var(--border)', tc = 'var(--text-primary)'
            if (submitted) {
              if (corr) { bg = '#EAF3DE'; bc = '#3B6D11'; tc = '#3B6D11' }
              else if (sel && !corr) { bg = '#FCEBEB'; bc = '#A32D2D'; tc = '#A32D2D' }
            } else if (sel) { bg = '#E6F1FB'; bc = '#185FA5' }
            return (
              <button key={ci} onClick={() => pick(ci)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px',
                  borderRadius: 6, border: '0.5px solid ' + bc, background: bg,
                  cursor: submitted ? 'default' : 'pointer', textAlign: 'left',
                  fontFamily: 'inherit', transition: 'all 0.1s',
                }}>
                <div style={{
                  width: 18, height: 18, borderRadius: q.type === 'multi' ? 3 : '50%',
                  border: '1.5px solid ' + (sel ? '#185FA5' : 'var(--border)'), flexShrink: 0, marginTop: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: sel ? '#185FA5' : 'transparent',
                }}>
                  {sel && <span style={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>{q.type === 'multi' ? '✓' : '●'}</span>}
                </div>
                <span style={{ fontSize: 13, lineHeight: 1.5, color: tc, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{ch}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Feedback (practice mode) */}
      {submitted && mode === 'practice' && (
        <div style={{
          background: isCorrect() ? '#EAF3DE' : '#FCEBEB',
          border: '0.5px solid ' + (isCorrect() ? '#3B6D11' : '#A32D2D'),
          borderRadius: 10, padding: '14px 16px', marginBottom: 12,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: isCorrect() ? '#3B6D11' : '#A32D2D', marginBottom: 6 }}>
            {isCorrect() ? '✓ Bonne réponse !' : '✗ Réponse incorrecte'}
          </div>
          <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text-primary)' }}>{q.explanation}</p>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => { setIdx(i => Math.max(0, i - 1)); setSubmitted(false) }}
          disabled={idx === 0}
          style={{ padding: '8px 14px', borderRadius: 6, border: '0.5px solid var(--border)', background: 'transparent', cursor: idx === 0 ? 'not-allowed' : 'pointer', fontSize: 12, color: 'var(--text-secondary)', opacity: idx === 0 ? 0.4 : 1, fontFamily: 'inherit' }}>
          ← Précédent
        </button>
        <div style={{ flex: 1 }} />
        {mode === 'practice' && !submitted && hasAns && (
          <button onClick={checkAnswer}
            style={{ padding: '8px 14px', borderRadius: 6, border: '0.5px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 12, color: '#185FA5', fontFamily: 'inherit' }}>
            Valider
          </button>
        )}
        {idx < total - 1 ? (
          <button onClick={() => { setIdx(i => i + 1); setSubmitted(false) }}
            style={{ padding: '8px 14px', borderRadius: 6, background: '#185FA5', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: 'inherit' }}>
            Suivant →
          </button>
        ) : (
          <button onClick={finishExam} disabled={submitting}
            style={{ padding: '8px 16px', borderRadius: 6, background: '#3B6D11', color: '#fff', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
            {submitting ? 'Calcul...' : '✓ Terminer l\'examen'}
          </button>
        )}
      </div>
    </div>
  )
}
