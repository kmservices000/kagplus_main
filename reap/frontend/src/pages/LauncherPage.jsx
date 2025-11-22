import { useNavigate } from 'react-router-dom';
import launcherPoster from '../assets/app_launcher.png';

const LauncherPage = () => {
  const navigate = useNavigate();

  return (
    <div className="launcher-shell">
      <button
        type="button"
        className="app-launcher-button"
        onClick={() => navigate('/home')}
        aria-label="Open REAP"
      >
        <img src={launcherPoster} alt="REAP launcher button" />
      </button>
      <p className="launcher-hint">Tap to open REAP</p>
    </div>
  );
};

export default LauncherPage;
