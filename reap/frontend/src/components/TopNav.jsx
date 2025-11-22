import { Link } from 'react-router-dom';

const TopNav = () => (
  <header className="top-nav">
    <Link to="/home" className="brand">
      <span className="brand-name">REAP</span>
      <span className="brand-tagline">Remote Education: Access &amp; Progress</span>
    </Link>
    <div className="nav-actions">
      <Link className="user-pill ghost" to="/teacher">
        Teacher Login
      </Link>
      <Link className="user-pill" to="/english">
        Student Login
      </Link>
    </div>
  </header>
);

export default TopNav;
