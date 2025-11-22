import TopNav from '../components/TopNav';
import { useProgress } from '../context/ProgressContext';
import { modules } from '../data/modules';

const mockStudents = [
  { id: 'kayla', name: 'Kayla Santos' },
  { id: 'miguel', name: 'Miguel Cruz' },
  { id: 'hana', name: 'Hana Reyes' },
  { id: 'liam', name: 'Liam Flores' },
];

const TeacherDashboard = () => {
  const { moduleProgress, mistakes, setModuleDeadline } = useProgress();
  const progressMap = moduleProgress.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

  const mistakeSummary = mistakes.reduce((acc, mistake) => {
    const key = mistake.topicCode;
    if (!acc[key]) {
      acc[key] = {
        topicCode: mistake.topicCode,
        topicTitle: mistake.topicTitle,
        count: 0,
        lastQuestion: '',
        lastTimestamp: '',
      };
    }
    acc[key].count += 1;
    if (!acc[key].lastTimestamp || acc[key].lastTimestamp < mistake.timestamp) {
      acc[key].lastTimestamp = mistake.timestamp;
      acc[key].lastQuestion = mistake.questionText;
    }
    return acc;
  }, {});
  const mistakeList = Object.values(mistakeSummary).sort((a, b) => b.count - a.count);

  return (
    <div className="page teacher-page">
      <TopNav />
      <section className="teacher-hero">
        <div>
          <p className="lesson-breadcrumb">Teacher dashboard</p>
          <h2>Class Progress Monitor</h2>
          <p>Track every learner’s mastery, module completion, and tricky questions at a glance.</p>
        </div>
      </section>

      <section className="teacher-section">
        <h3>Students</h3>
        <div className="student-list">
          {mockStudents.map((student) => (
            <div key={student.id} className="student-card">
              <div>
                <p className="student-name">{student.name}</p>
                <p className="student-detail">Grade 7 • REAP Alpha Batch</p>
              </div>
              <div className="student-progress">
                {modules.map((module) => {
                  const progress = progressMap[module.id] || { percent: 0 };
                  return (
                    <div key={`${student.id}-${module.id}`} className="student-progress-row">
                      <span>{module.label}</span>
                      <div className="tracker-bar">
                        <div className="tracker-fill" style={{ width: `${progress.percent}%`, backgroundColor: module.color }} />
                      </div>
                      <span>{progress.percent}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="teacher-section">
        <h3>Module Progress Overview</h3>
        <div className="modules-grid">
          {modules.map((module) => {
            const data = progressMap[module.id] || {
              percent: 0,
              completed: 0,
              total: module.lessons.length,
            };
            return (
              <div key={module.id} className="teacher-module-card">
                <p className="module-label">{module.label}</p>
                <p className="module-title">{module.title}</p>
                <p className="module-description">{module.description}</p>
                <label className="deadline-label">
                  Deadline
                  <input
                    type="date"
                    value={data.deadline || ''}
                    onChange={(event) => setModuleDeadline(module.id, event.target.value)}
                  />
                </label>
                <div className="teacher-progress-row">
                  <div className="tracker-bar">
                    <div
                      className="tracker-fill"
                      style={{ width: `${data.percent}%`, backgroundColor: module.color }}
                    />
                  </div>
                  <span>
                    {data.completed}/{data.total}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="teacher-section">
        <h3>Struggle Spots</h3>
        {mistakeList.length === 0 ? (
          <p className="completion-hint">Great job! No mistakes have been logged yet.</p>
        ) : (
          <div className="mistake-table">
            <div className="mistake-row header">
              <span>Topic</span>
              <span>Mistakes logged</span>
              <span>Most recent question</span>
              <span>Last seen</span>
            </div>
            {mistakeList.slice(0, 8).map((entry) => (
              <div className="mistake-row" key={entry.topicCode}>
                <span>
                  {entry.topicCode} — {entry.topicTitle}
                </span>
                <span className="wrong">{entry.count}×</span>
                <span>{entry.lastQuestion}</span>
                <span>{new Date(entry.lastTimestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default TeacherDashboard;
