import { useState, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'

const START_DATE = new Date('2025-09-02')

function getDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isSameDay(date1, date2) {
  return getDateString(date1) === getDateString(date2)
}

function addMonths(date, months) {
  const newDate = new Date(date)
  newDate.setMonth(newDate.getMonth() + months)
  return newDate
}

const defaultSubjects = [
  { id: 'T1', name: 'Theory 1', type: 'Theory', color: '#70a0ff' },
  { id: 'T2', name: 'Theory 2', type: 'Theory', color: '#70a0ff' },
  { id: 'T3', name: 'Theory 3', type: 'Theory', color: '#70a0ff' },
  { id: 'T4', name: 'Theory 4', type: 'Theory', color: '#70a0ff' },
  { id: 'T5', name: 'Theory 5', type: 'Theory', color: '#70a0ff' },
  { id: 'P1', name: 'Practical 1', type: 'Practical', color: '#50d890' },
  { id: 'P2', name: 'Practical 2', type: 'Practical', color: '#50d890' },
  { id: 'P3', name: 'Practical 3', type: 'Practical', color: '#50d890' },
  { id: 'P4', name: 'Practical 4', type: 'Practical', color: '#50d890' },
  { id: 'P5', name: 'Practical 5', type: 'Practical', color: '#50d890' }
]

export default function App() {
  const [subjects, setSubjects] = useLocalStorage('subjects', defaultSubjects)
  const [data, setData] = useLocalStorage('dayData', {})
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - (firstDay.getDay() + 6) % 7)
    
    const days = []
    const current = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }, [currentMonth])

  const getDayData = (date) => {
    const key = getDateString(date)
    return data[key] || {
      attendance: {},
      meals: {
        breakfast: { status: 'na', notes: '' },
        lunch: { status: 'na', notes: '' },
        dinner: { status: 'na', notes: '' }
      },
      dayNotes: ''
    }
  }

  const updateDayData = (date, updates) => {
    const key = getDateString(date)
    const current = getDayData(date)
    setData(prev => ({
      ...prev,
      [key]: { ...current, ...updates }
    }))
  }

  const updateAttendance = (subjectId, status) => {
    const current = getDayData(selectedDate)
    updateDayData(selectedDate, {
      attendance: { ...current.attendance, [subjectId]: status }
    })
  }

  const updateMeal = (meal, status) => {
    const current = getDayData(selectedDate)
    updateDayData(selectedDate, {
      meals: {
        ...current.meals,
        [meal]: { ...current.meals[meal], status }
      }
    })
  }

  const updateMealNotes = (meal, notes) => {
    const current = getDayData(selectedDate)
    updateDayData(selectedDate, {
      meals: {
        ...current.meals,
        [meal]: { ...current.meals[meal], notes }
      }
    })
  }

  const updateSubject = (id, field, value) => {
    setSubjects(prev => prev.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ))
  }

  const resetAll = () => {
    if (window.confirm('Reset all data?')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  const selectedData = getDayData(selectedDate)
  const today = new Date()
  
  return (
    <div className="app">
      <div className="header">
        <div className="h1">College Planner</div>
        <div className="toolbar">
          <button className="btn" onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}>
            ← Prev
          </button>
          <div className="badge">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          <button className="btn" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            Next →
          </button>
          <button className="btn" onClick={() => {
            setCurrentMonth(new Date())
            setSelectedDate(new Date())
          }}>
            Today
          </button>
          <button className="btn" onClick={resetAll}>Reset</button>
        </div>
      </div>

      <div className="grid">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">Calendar</div>
            <div className="small">Days before Sept 2, 2025 are locked</div>
          </div>
          <div className="calendar">
            <div className="calendar-head">
              <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div>
              <div>Fri</div><div>Sat</div><div>Sun</div>
            </div>
            <div className="calendar-grid">
              {calendarDays.map((date, i) => {
                const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
                const isToday = isSameDay(date, today)
                const isSelected = isSameDay(date, selectedDate)
                const isLocked = date < START_DATE
                const dayData = getDayData(date)
                
                return (
                  <button
                    key={i}
                    className={`day ${isToday ? 'today' : ''} ${isLocked ? 'disabled' : ''}`}
                    style={{
                      opacity: isCurrentMonth ? 1 : 0.4,
                      outline: isSelected ? '2px solid var(--ring)' : 'none'
                    }}
                    onClick={() => !isLocked && setSelectedDate(new Date(date))}
                  >
                    <div className="day-num">{date.getDate()}</div>
                    <div className="indicators">
                      <div className="meal-dots">
                        <div className={`meal-dot ${dayData.meals.breakfast.status === 'yes' ? 'meal-yes' : dayData.meals.breakfast.status === 'no' ? 'meal-no' : ''}`} />
                        <div className={`meal-dot ${dayData.meals.lunch.status === 'yes' ? 'meal-yes' : dayData.meals.lunch.status === 'no' ? 'meal-no' : ''}`} />
                        <div className={`meal-dot ${dayData.meals.dinner.status === 'yes' ? 'meal-yes' : dayData.meals.dinner.status === 'no' ? 'meal-no' : ''}`} />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="sidebar">
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>
            <div className="panel-body">
              <div className="section-title">Attendance</div>
              {subjects.map(subject => {
                const status = selectedData.attendance[subject.id] || 'not'
                return (
                  <div key={subject.id} className="row">
                    <div className="badge">
                      <span style={{ 
                        width: 10, 
                        height: 10, 
                        backgroundColor: subject.color, 
                        borderRadius: 3,
                        display: 'inline-block',
                        marginRight: 8
                      }} />
                      {subject.name}
                    </div>
                    <div className="toggle-3">
                      <button 
                        className="btn"
                        style={{ 
                          backgroundColor: status === 'present' ? 'rgba(53,199,89,0.2)' : undefined,
                          borderColor: status === 'present' ? '#35c759' : 'transparent'
                        }}
                        onClick={() => updateAttendance(subject.id, 'present')}
                      >
                        Present
                      </button>
                      <button 
                        className="btn"
                        style={{ 
                          backgroundColor: status === 'absent' ? 'rgba(255,77,77,0.2)' : undefined,
                          borderColor: status === 'absent' ? '#ff4d4d' : 'transparent'
                        }}
                        onClick={() => updateAttendance(subject.id, 'absent')}
                      >
                        Absent
                      </button>
                      <button 
                        className="btn"
                        style={{ 
                          backgroundColor: status === 'not' ? 'rgba(140,140,140,0.2)' : undefined,
                          borderColor: status === 'not' ? '#8c8c8c' : 'transparent'
                        }}
                        onClick={() => updateAttendance(subject.id, 'not')}
                      >
                        Not Scheduled
                      </button>
                    </div>
                  </div>
                )
              })}

              <div className="section-title" style={{ marginTop: 16 }}>Meals</div>
              {['breakfast', 'lunch', 'dinner'].map(meal => {
                const mealData = selectedData.meals[meal]
                return (
                  <div key={meal} style={{ marginBottom: 12 }}>
                    <div className="row">
                      <div className="badge" style={{ textTransform: 'capitalize' }}>
                        {meal}
                      </div>
                      <div className="toggle-3">
                        <button 
                          className="btn"
                          style={{ 
                            backgroundColor: mealData.status === 'yes' ? 'rgba(53,199,89,0.2)' : undefined,
                            borderColor: mealData.status === 'yes' ? '#35c759' : 'transparent'
                          }}
                          onClick={() => updateMeal(meal, 'yes')}
                        >
                          ✓
                        </button>
                        <button 
                          className="btn"
                          style={{ 
                            backgroundColor: mealData.status === 'no' ? 'rgba(255,77,77,0.2)' : undefined,
                            borderColor: mealData.status === 'no' ? '#ff4d4d' : 'transparent'
                          }}
                          onClick={() => updateMeal(meal, 'no')}
                        >
                          ✗
                        </button>
                        <button 
                          className="btn"
                          style={{ 
                            backgroundColor: mealData.status === 'na' ? 'rgba(140,140,140,0.2)' : undefined,
                            borderColor: mealData.status === 'na' ? '#8c8c8c' : 'transparent'
                          }}
                          onClick={() => updateMeal(meal, 'na')}
                        >
                          N/A
                        </button>
                      </div>
                    </div>
                    <textarea
                      className="input input-note"
                      placeholder="Notes (extras, outside food, etc.)"
                      value={mealData.notes}
                      onChange={(e) => updateMealNotes(meal, e.target.value)}
                    />
                  </div>
                )
              })}

              <div className="section-title" style={{ marginTop: 16 }}>Day Notes</div>
              <textarea
                className="input input-note"
                placeholder="Optional notes"
                value={selectedData.dayNotes}
                onChange={(e) => updateDayData(selectedDate, { dayNotes: e.target.value })}
              />
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">Edit Subjects</div>
            </div>
            <div className="panel-body">
              {subjects.map(subject => (
                <div key={subject.id} className="subject-item">
                  <input
                    className="input"
                    value={subject.name}
                    onChange={(e) => updateSubject(subject.id, 'name', e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select
                      className="select"
                      value={subject.type}
                      onChange={(e) => updateSubject(subject.id, 'type', e.target.value)}
                    >
                      <option>Theory</option>
                      <option>Practical</option>
                    </select>
                    <input
                      type="color"
                      value={subject.color}
                      onChange={(e) => updateSubject(subject.id, 'color', e.target.value)}
                      style={{ width: 40, height: 40, border: 'none', borderRadius: 4 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
