import { Link } from 'react-router-dom';
import TopNav from '../components/TopNav';

const CelebrationPage = () => (
  <div className="page celebration-page">
    <TopNav />
    <main className="celebration-panel">
      <h1>
        <span>Great</span> job on finishing five lessons
      </h1>
      <p className="celebration-detail">Games are enabled for 15 minutes.</p>
      <p className="celebration-detail">
        If you wish to have longer game time, continue to finish 5 more lessons.
      </p>
      <div className="celebration-actions">
        <Link to="/" className="ghost-btn">
          Exit
        </Link>
        <Link to="/english" className="primary-btn">
          Continue
        </Link>
      </div>
    </main>
  </div>
);

export default CelebrationPage;
