import React, { useState, useEffect } from 'react';
import { Calendar, Download, Upload, Plus, Trash2, Check } from 'lucide-react';


export default function TimetableTracker() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Morning Exercise', time: '6:00 AM' },
    { id: 2, title: 'Study Session', time: '9:00 AM' },
    { id: 3, title: 'Lunch Break', time: '1:00 PM' },
    { id: 4, title: 'Project Work', time: '3:00 PM' },
    { id: 5, title: 'Evening Walk', time: '6:00 PM' },
  ]);
  
  const [progress, setProgress] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTask, setNewTask] = useState({ title: '', time: '' });
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
    if (newTask.title && newTask.time) {
      setTasks([...tasks, { id: Date.now(), ...newTask }]);
      setNewTask({ title: '', time: '' });
      setShowAddTask(false);
    }
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
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="input-field"
              />
              <input
                type="time"
                value={newTask.time}
                onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                className="input-field"
              />
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