import { useProgress } from '../context/ProgressContext';
import { modules } from '../data/modules';

const ProgressTracker = () => {
  const { moduleProgress } = useProgress();
  const progressMap = moduleProgress.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});
  return (
    <div className="progress-tracker">
      <p className="tracker-header">Progress Tracker</p>
      <div className="tracker-body">
        {modules.map((module) => {
          const progress = progressMap[module.id] || { percent: 0 };
          return (
            <div key={module.id} className="tracker-row">
              <div className="tracker-label">
                <span>{module.label}</span>
                <span>{progress.percent}%</span>
              </div>
              <div className="tracker-bar">
                <div
                  className="tracker-fill"
                  style={{
                    width: `${progress.percent}%`,
                    backgroundColor: module.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTracker;
