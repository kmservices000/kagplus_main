import { Link } from 'react-router-dom';

const ModuleCard = ({ module, deadline }) => (
  <Link
    to={`/english/modules/${module.id}`}
    className="module-card"
    style={{ backgroundColor: module.color }}
  >
    <p className="module-label">{module.label}</p>
    <p className="module-title">{module.title}</p>
    <p className="module-description">{module.description}</p>
    {deadline ? (
      <p className="module-deadline">
        Due <span>{new Date(deadline).toLocaleDateString()}</span>
      </p>
    ) : (
      <p className="module-deadline pending">No deadline set</p>
    )}
    <span className="module-link">Open module →</span>
  </Link>
);

export default ModuleCard;
