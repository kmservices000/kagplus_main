import { Link } from 'react-router-dom';
import TopNav from '../components/TopNav';
import { learnerLanguages } from '../data/languages';
import { useLanguage } from '../context/LanguageContext';

const HomePage = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="page home-page">
      <TopNav />
      <main className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Remote Education: Access &amp; Progress</p>
          <h1>
            Welcome back,
            <span>Kayla</span>
          </h1>
          <p className="hero-subtitle">Ready to study and play?</p>
          <div className="hero-actions">
            <Link className="primary-btn" to="/english">
              Yes
            </Link>
          </div>
            <div className="language-selector">
              <p className="language-label">Choose a language</p>
              <div className="language-pills">
                {learnerLanguages.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`language-pill ${language.id === option.id ? 'active' : ''}`}
                    onClick={() => setLanguage(option)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="language-selected">Currently previewing: {language.label}</p>
            </div>
          </div>
        </main>
    </div>
  );
};

export default HomePage;
