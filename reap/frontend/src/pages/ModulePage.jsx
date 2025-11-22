import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import TopNav from '../components/TopNav';
import { getModuleById, getStageDecks } from '../data/modules';

const ModulePage = () => {
  const { moduleId } = useParams();
  const moduleData = useMemo(() => getModuleById(moduleId), [moduleId]);
  const decks = useMemo(() => getStageDecks(moduleData), [moduleData]);
  const navigate = useNavigate();

  if (!moduleData) {
    return (
      <div className="page lesson-page">
        <TopNav />
        <div className="lesson-not-found">
          <p>Module not found.</p>
          <button type="button" className="primary-btn" onClick={() => navigate('/english')}>
            Back to Academic English Writing class
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page lesson-page">
      <TopNav />
      <section className="lesson-header">
        <div>
          <p className="lesson-breadcrumb">Academic English Writing class / {moduleData.label}</p>
          <h2>{moduleData.title}</h2>
          <p>{moduleData.description}</p>
        </div>
        <button type="button" className="ghost-btn" onClick={() => navigate('/english')}>
          Back to modules
        </button>
      </section>
      <section className="stage-decks stage-decks--wide">
        {decks.length ? (
          decks.map((deck) => (
            <Link
              key={deck.slug}
              to={`/english/modules/${moduleId}/stages/${deck.slug}`}
              className="deck-card"
            >
              <p className="deck-code">{deck.code}</p>
              <p className="deck-title">{deck.title}</p>
              <p className="deck-count">
                {deck.lessons.length} lesson{deck.lessons.length !== 1 ? 's' : ''}
              </p>
            </Link>
          ))
        ) : (
          <div className="lesson-not-found">
            <p>No lesson groupings available yet.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ModulePage;
