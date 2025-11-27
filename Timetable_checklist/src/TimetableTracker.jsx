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
    a.download = `timetable-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
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
        } catch (err) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const completedToday = tasks.filter(t => progress[selectedDate]?.[t.id]).length;
  const progressPercent = tasks.length > 0 ? (completedToday / tasks.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-amber-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Daily Planner
          </h1>
          <p className="text-amber-700" style={{ fontFamily: 'Georgia, serif' }}>
            Track your daily routine with style
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-amber-50/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 border-2 border-amber-200">
          {/* Date Picker & Actions */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            <div className="flex items-center gap-3 bg-white/60 rounded-2xl px-4 py-3 shadow-md border border-amber-200">
              <Calendar className="text-amber-700" size={20} />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none outline-none text-amber-900 font-semibold"
                style={{ fontFamily: 'Georgia, serif' }}
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={exportData}
                className="bg-amber-600 hover:bg-amber-700 text-white rounded-2xl px-4 py-2 flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                <Download size={18} />
                Export
              </button>
              <label className="bg-rose-600 hover:bg-rose-700 text-white rounded-2xl px-4 py-2 flex items-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
                style={{ fontFamily: 'Georgia, serif' }}>
                <Upload size={18} />
                Import
                <input type="file" accept=".json" onChange={importData} className="hidden" />
              </label>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-amber-900 font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
                Today's Progress
              </span>
              <span className="text-amber-700 font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
                {completedToday} / {tasks.length}
              </span>
            </div>
            <div className="h-4 bg-amber-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-3 mb-6">
            {tasks.map(task => (
              <div
                key={task.id}
                className={`bg-white/70 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4 border-2 transition-all hover:shadow-lg ${
                  progress[selectedDate]?.[task.id]
                    ? 'border-green-400 bg-green-50/50'
                    : 'border-amber-200 hover:border-amber-300'
                }`}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    progress[selectedDate]?.[task.id]
                      ? 'bg-green-500 border-green-500'
                      : 'border-amber-400 hover:border-amber-500'
                  }`}
                >
                  {progress[selectedDate]?.[task.id] && (
                    <Check size={18} className="text-white" strokeWidth={3} />
                  )}
                </button>
                
                <div className="flex-1">
                  <h3
                    className={`font-semibold text-lg ${
                      progress[selectedDate]?.[task.id]
                        ? 'line-through text-gray-500'
                        : 'text-amber-900'
                    }`}
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    {task.title}
                  </h3>
                  <p className="text-amber-700 text-sm" style={{ fontFamily: 'Georgia, serif' }}>
                    {task.time}
                  </p>
                </div>
                
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-rose-500 hover:text-rose-700 transition-colors p-2 rounded-full hover:bg-rose-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Add Task Button */}
          {!showAddTask ? (
            <button
              onClick={() => setShowAddTask(true)}
              className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white rounded-2xl py-3 flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg font-semibold"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              <Plus size={20} />
              Add New Task
            </button>
          ) : (
            <div className="bg-white/70 rounded-2xl p-4 border-2 border-amber-300">
              <input
                type="text"
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full bg-white/80 border-2 border-amber-200 rounded-xl px-4 py-2 mb-3 outline-none focus:border-amber-400 transition-colors"
                style={{ fontFamily: 'Georgia, serif' }}
              />
              <input
                type="time"
                value={newTask.time}
                onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                className="w-full bg-white/80 border-2 border-amber-200 rounded-xl px-4 py-2 mb-3 outline-none focus:border-amber-400 transition-colors"
                style={{ fontFamily: 'Georgia, serif' }}
              />
              <div className="flex gap-2">
                <button
                  onClick={addTask}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl py-2 transition-colors font-semibold"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddTask(false)}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white rounded-xl py-2 transition-colors font-semibold"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-center text-amber-700 mt-6 text-sm" style={{ fontFamily: 'Georgia, serif' }}>
          💡 Your progress is saved automatically. Export to backup your data!
        </p>
      </div>
    </div>
  );
}