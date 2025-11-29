import React, { useState, useEffect } from 'react';
import { Calendar, Download, Upload, Plus, Trash2, Check } from 'lucide-react';


export default function TimetableTracker() {
const [tasks, setTasks] = useState([
  { id: 1, title: 'College', time: '9:00 AM - 5:00 PM' },
  { id: 2, title: 'Evening Breakfast & Rest', time: '5:00 PM - 6:00 PM' },
  { id: 3, title: 'Movie / Youtube / Family Chill Time', time: '6:00 PM - 6:30 PM' },
  { id: 4, title: 'Internship Work', time: '6:30 PM - 7:30 PM' },
  { id: 5, title: 'Academics', time: '7:30 PM - 8:30 PM' },
  { id: 6, title: 'Movie / Instagram / Family Chill Time', time: '8:30 PM - 8:45 PM' },
  { id: 7, title: 'Programming Language Practice', time: '8:45 PM - 9:45 PM' },
  { id: 8, title: 'Movie / Instagram / Family Chill Time', time: '9:45 PM - 10:10 PM' },
  { id: 9, title: 'Project Work', time: '10:10 PM - 11:10 PM' },
  { id: 10, title: 'Video Editing / Recording Completion', time: '11:10 PM - 11:30 PM' },
  { id: 11, title: 'Movie / Instagram / Family Chill Time', time: '11:30 PM - 11:45 PM' },
  { id: 12, title: 'Content Creation Support', time: '11:45 PM - 12:30 AM' },
  { id: 13, title: 'GSoC Preparation', time: '12:30 AM - 2:30 AM' },
]);

  
  const [progress, setProgress] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTask, setNewTask] = useState({ title: '', startTime: '', endTime: '' });
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('timetable-data');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.tasks) setTasks(data.tasks);
        if (data.progress) setProgress(data.progress);
      } catch (err) {
        console.error('Failed to load saved data:', err);
      }
    }
  }, []);

  // Save data to localStorage whenever tasks or progress changes
  useEffect(() => {
    localStorage.setItem('timetable-data', JSON.stringify({ tasks, progress }));
  }, [tasks, progress]);

  const toggleTask = (taskId) => {
    setProgress(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        [taskId]: !prev[selectedDate]?.[taskId]
      }
    }));
  };

  const addTask = () => {
    if (!newTask.title) return;

    // Build a readable time string from start/end inputs
    const formatTime = (t) => {
      if (!t) return '';
      const [hh, mm] = t.split(':').map(Number);
      const period = hh >= 12 ? 'PM' : 'AM';
      const hour = ((hh + 11) % 12) + 1;
      return `${hour}:${mm.toString().padStart(2, '0')} ${period}`;
    };

    let timeLabel = '';
    if (newTask.startTime && newTask.endTime) {
      timeLabel = `${formatTime(newTask.startTime)} - ${formatTime(newTask.endTime)}`;
    } else if (newTask.startTime) {
      timeLabel = formatTime(newTask.startTime);
    } else if (newTask.endTime) {
      timeLabel = formatTime(newTask.endTime);
    }

    setTasks([...tasks, { id: Date.now(), title: newTask.title, time: timeLabel }]);
    setNewTask({ title: '', startTime: '', endTime: '' });
    setShowAddTask(false);
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    const newProgress = { ...progress };
    Object.keys(newProgress).forEach(date => {
      delete newProgress[date][taskId];
    });
    setProgress(newProgress);
  };

  const exportData = () => {
    const data = { tasks, progress };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timetable-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.tasks) setTasks(data.tasks);
          if (data.progress) setProgress(data.progress);
          alert('Data imported successfully!');
        } catch (err) {
          alert('Invalid file format. Please select a valid backup file.');
        }
      };
      reader.readAsText(file);
    }
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  const completedToday = tasks.filter(t => progress[selectedDate]?.[t.id]).length;
  const progressPercent = tasks.length > 0 ? (completedToday / tasks.length) * 100 : 0;

  return (
    <div className="app-container">
      <div className="content-wrapper">
        {/* Header */}
        <div className="header">
          <h1 className="main-title">Daily Planner</h1>
          <p className="subtitle">Track your daily routine with style</p>
        </div>

        {/* Main Card */}
        <div className="main-card">
          {/* Date Picker & Actions */}
          <div className="controls-section">
            <div className="date-picker-wrapper">
              <Calendar className="calendar-icon" size={20} />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="date-input"
              />
            </div>
            
            <div className="button-group">
              <button onClick={exportData} className="btn btn-export">
                <Download size={18} />
                Export
              </button>
              <label className="btn btn-import">
                <Upload size={18} />
                Import
                <input type="file" accept=".json" onChange={importData} className="file-input" />
              </label>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-section">
            <div className="progress-header">
              <span className="progress-label">Today's Progress</span>
              <span className="progress-count">{completedToday} / {tasks.length}</span>
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Tasks List */}
          <div className="tasks-list">
            {tasks.map(task => (
              <div
                key={task.id}
                className={`task-item ${progress[selectedDate]?.[task.id] ? 'completed' : ''}`}
                draggable
                onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; setDraggedTaskId(task.id); }}
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedTaskId == null || draggedTaskId === task.id) return;
                  const fromIndex = tasks.findIndex(t => t.id === draggedTaskId);
                  const toIndex = tasks.findIndex(t => t.id === task.id);
                  if (fromIndex === -1 || toIndex === -1) return;
                  const updated = [...tasks];
                  const [moved] = updated.splice(fromIndex, 1);
                  updated.splice(toIndex, 0, moved);
                  setTasks(updated);
                  setDraggedTaskId(null);
                }}
                onDragEnd={() => setDraggedTaskId(null)}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className="checkbox"
                >
                  {progress[selectedDate]?.[task.id] && (
                    <Check size={18} className="check-icon" strokeWidth={3} />
                  )}
                </button>
                
                <div className="task-content">
                  <h3 className="task-title">
                    {task.title}
                  </h3>
                  <p className="task-time">{task.time}</p>
                </div>
                
                <button
                  onClick={() => deleteTask(task.id)}
                  className="delete-btn"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Add Task Button */}
          {!showAddTask ? (
            <button onClick={() => setShowAddTask(true)} className="btn btn-add-task">
              <Plus size={20} />
              Add New Task
            </button>
          ) : (
            <div className="add-task-form">
              <input
                type="text"
                placeholder="Task title (e.g., Study Algorithms)"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="input-field"
              />
              <div className="time-row">
                <input
                  type="time"
                  value={newTask.startTime}
                  onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
                  className="input-field"
                  aria-label="Start time"
                  title="Start time"
                />
                <span className="time-sep">—</span>
                <input
                  type="time"
                  value={newTask.endTime}
                  onChange={(e) => setNewTask({ ...newTask, endTime: e.target.value })}
                  className="input-field"
                  aria-label="End time"
                  title="End time"
                />
              </div>
              <div className="form-actions">
                <button onClick={addTask} className="btn btn-confirm">
                  Add
                </button>
                <button onClick={() => setShowAddTask(false)} className="btn btn-cancel">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <p className="footer-note">
          💡 Your progress is saved automatically. Export to backup your data!
        </p>
      </div>
    </div>
  );
}