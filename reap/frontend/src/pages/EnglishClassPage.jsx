import { Link } from 'react-router-dom';
import TopNav from '../components/TopNav';
import ModuleCard from '../components/ModuleCard';
import ProgressTracker from '../components/ProgressTracker';
import { modules } from '../data/modules';
import { useProgress } from '../context/ProgressContext';

const EnglishClassPage = () => {
  const { moduleProgress } = useProgress();
  const progressMap = moduleProgress.reduce((acc, moduleItem) => {
    acc[moduleItem.id] = moduleItem;
    return acc;
  }, {});

  return (
    <div className="page english-page">
      <TopNav />
      <section className="english-header">
        <div className="english-grid">
          <div>
            <h2 className="english-title">
              Academic English Writing <span>class</span>
            </h2>
            <div className="modules-grid">
              {modules.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  deadline={progressMap[module.id]?.deadline}
                />
              ))}
            </div>
            <div className="offline-cta">
              <div>
                <p className="cta-eyebrow">Offline Mode</p>
                <p className="cta-title">Need the SD card build?</p>
                <p className="cta-copy">Launch the Phaser-powered REAP English games without internet.</p>
              </div>
              <Link className="primary-btn ghost" to="/play">
                Open /play
              </Link>
            </div>
          </div>
          <ProgressTracker />
        </div>
      </section>
    </div>
  );
};

export default EnglishClassPage;
