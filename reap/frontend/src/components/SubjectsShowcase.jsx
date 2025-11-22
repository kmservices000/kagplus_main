import { subjectList } from '../data/modules';

const KidsIllustration = () => (
  <svg
    className="kids-illustration"
    viewBox="0 0 300 180"
    role="img"
    aria-labelledby="kidsTitle"
  >
    <title id="kidsTitle">Two happy learners waving flags</title>
    <defs>
      <linearGradient id="sky" x1="0%" x2="0%" y1="0%" y2="100%">
        <stop offset="0%" stopColor="#ffeef3" />
        <stop offset="100%" stopColor="#fef7f4" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="300" height="180" fill="url(#sky)" rx="20" />
    <g className="cloud">
      <ellipse cx="60" cy="40" rx="32" ry="18" fill="#ffd9c8" opacity="0.7" />
      <ellipse cx="95" cy="42" rx="26" ry="15" fill="#ffe9de" opacity="0.8" />
      <ellipse cx="77" cy="32" rx="28" ry="15" fill="#ffe4cf" />
    </g>
    <g className="cloud" transform="translate(150, -10)">
      <ellipse cx="60" cy="40" rx="32" ry="18" fill="#ffd9c8" opacity="0.7" />
      <ellipse cx="95" cy="42" rx="26" ry="15" fill="#ffe9de" opacity="0.8" />
      <ellipse cx="77" cy="32" rx="28" ry="15" fill="#ffe4cf" />
    </g>
    <g stroke="#2f2f2f" strokeWidth="2" fill="none" opacity="0.8">
      <path d="M20 70 Q30 60 40 70" />
      <path d="M50 72 Q60 60 70 72" />
      <path d="M80 68 Q90 60 100 68" />
      <path d="M110 74 Q120 60 130 74" />
      <path d="M140 70 Q150 60 160 70" />
      <path d="M170 66 Q180 60 190 66" />
      <path d="M200 72 Q210 60 220 72" />
    </g>
    <rect x="0" y="120" width="300" height="60" fill="#99db70" />
    <rect x="0" y="140" width="300" height="40" fill="#6bb54a" />
    <g transform="translate(60 65)">
      <circle cx="0" cy="0" r="20" fill="#f8c6b6" />
      <rect x="-15" y="20" width="30" height="50" fill="#e55252" rx="10" />
      <rect x="-5" y="70" width="10" height="25" fill="#40210f" />
      <rect x="-18" y="70" width="10" height="25" fill="#40210f" />
      <rect x="-15" y="25" width="30" height="10" fill="#ffd9c8" />
      <circle cx="-8" cy="-5" r="2" fill="#222" />
      <circle cx="8" cy="-5" r="2" fill="#222" />
      <path d="M-7 8 Q0 12 7 8" stroke="#c0392b" strokeWidth="1.5" fill="none" />
      <path d="M-25 10 L-15 20 L-5 12 Z" fill="#0050a4" />
      <rect x="-25" y="5" width="15" height="10" fill="#ed1c24" />
      <rect x="-25" y="5" width="4.5" height="10" fill="#fff" />
      <rect x="-25" y="5" width="1.5" height="10" fill="#fed700" />
      <rect x="-23" y="15" width="2" height="15" fill="#8c4b2b" />
    </g>
    <g transform="translate(180 65)">
      <circle cx="0" cy="0" r="20" fill="#f8c6b6" />
      <rect x="-18" y="20" width="36" height="50" fill="#f4f4f4" rx="8" />
      <rect x="-12" y="20" width="24" height="6" fill="#1f5673" />
      <rect x="-8" y="70" width="10" height="25" fill="#40210f" />
      <rect x="5" y="70" width="10" height="25" fill="#40210f" />
      <circle cx="-7" cy="-5" r="2" fill="#222" />
      <circle cx="7" cy="-5" r="2" fill="#222" />
      <path d="M-6 9 Q0 13 6 9" stroke="#c0392b" strokeWidth="1.5" fill="none" />
      <path d="M20 12 L10 22 L0 14 Z" fill="#0050a4" />
      <rect x="5" y="7" width="15" height="10" fill="#ed1c24" />
      <rect x="5" y="7" width="4.5" height="10" fill="#fff" />
      <rect x="5" y="7" width="1.5" height="10" fill="#fed700" />
      <rect x="17" y="17" width="2" height="15" fill="#8c4b2b" />
    </g>
  </svg>
);

const SubjectsShowcase = () => (
  <section className="subjects-showcase">
    <div className="showcase-illustration">
      <KidsIllustration />
    </div>
    <div className="showcase-subjects">
      {subjectList.map((subject) => (
        <div key={subject.name} className="subject-line">
          <span style={{ color: subject.color }}>{subject.name}</span>
          <p>{subject.description}</p>
        </div>
      ))}
    </div>
  </section>
);

export default SubjectsShowcase;
