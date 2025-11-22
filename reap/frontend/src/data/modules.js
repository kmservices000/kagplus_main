import lesson012Source from '@lessons/l_module_0.1.2.json';
import lesson021Source from '@lessons/l_module_0.2.1.json';
import lesson022Source from '@lessons/l_module_0.2.2.json';
import lesson023Source from '@lessons/l_module_0.2.3.json';
import lesson024Source from '@lessons/l_module_0.2.4.json';

const findLessonJsonById = (collection, moduleId) => {
  if (!Array.isArray(collection)) return null;
  return collection.find((entry) => entry?.module_id === moduleId) || null;
};

const splitDefinitionLines = (lines = []) =>
  lines
    .map((line) => {
      const trimmed = (line || '').trim();
      const match = trimmed.match(/^(.*?)\s*[–—-]\s*([\s\S]+)$/);
      if (!match) return null;
      const [, term, description] = match;
      return { term: term.trim(), description: description.trim() };
    })
    .filter(Boolean);

const sliceSectionLines = (lessonJson, marker) => {
  const paragraphs = lessonJson?.paragraphs || [];
  const startIndex = paragraphs.findIndex((line) => (line || '').trim().startsWith(marker));
  if (startIndex === -1) return [];
  const lines = [];
  for (let i = startIndex + 1; i < paragraphs.length; i += 1) {
    const value = (paragraphs[i] || '').trim();
    if (value.startsWith('⭐ ') || value.startsWith('🟩') || value.startsWith('🟧')) break;
    lines.push(value);
  }
  return lines;
};

const colorClassMap = {
  blue: 'mc-prep',
  green: 'mc-det',
  orange: 'mc-conj',
};

const markdownBoldToHtml = (value = '') =>
  value.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

const highlightSubject = (text = '') => `<span class="inv-subject">${text}</span>`;

const normalizeEnglishLine = (line = '') =>
  line.replace(/^\s*EN:\s*[•●▪‣·*‒–—-]?\s*/i, 'EN: ').trimStart();

const findEnglishParagraph = (lessonJson, startsWithValue) => {
  const normalizedPrefix = normalizeEnglishLine(startsWithValue);
  const paragraphs = lessonJson?.paragraphs || [];
  return (
    paragraphs.find((line) => normalizeEnglishLine(line).startsWith(normalizedPrefix)) || null
  );
};

const highlightPresentVerb = (text = '') =>
  text.replace(
    /\b(drinks|boils|leaves|likes|enjoys|needs|wants|receives|covers|carries|counts|reads|cooks|writes|arrives|rides|checks|knows|waits|plays|submits|shows|finds|keeps|packs|locks|buys|gives|chants|holds|sorts|wears|notes|creates|reviews|offers|follows|needs)\b/gi,
    (match) => {
      if (match.toLowerCase().endsWith('s')) {
        return `<span class="sp-verb-s">${match}</span>`;
      }
      return match;
    },
  );

const colorizeMeaningConnectors = (text = '') =>
  text.replace(/\*\*(.+?)\*\*\s*\((blue|green|orange)\)/gi, (_, word, color) => {
    const cls = colorClassMap[color.toLowerCase()] || '';
    return `<span class="mc-chip ${cls}">${word}</span>`;
  });

const buildEnglishMeaningConnectorsContent = (lessonJson) => {
  const lines = sliceSectionLines(lessonJson, 'ENGLISH');
  if (!lines.length) return null;
  const introLine =
    lines.find((line) => line.toLowerCase().includes('helper words')) || lines[0] || '';
  const legendLine = lines.find((line) => line.toLowerCase().includes('color legend')) || '';
  const intro = [introLine, legendLine].filter(Boolean).join(' ');
  const introHtml = colorizeMeaningConnectors(intro).replace('COLOR LEGEND:', 'COLOR LEGEND:<br />');
  const definitions = splitDefinitionLines(lines).map((entry) => ({
    ...entry,
    descriptionHtml: colorizeMeaningConnectors(entry.description),
  }));
  const closing = lines.find((line) => line.toLowerCase().includes('very simple')) || '';
  return { intro, introHtml, definitions, closing };
};

const buildLocalizedMeaningConnectorsContent = (lessonJson, marker) => {
  const lines = sliceSectionLines(lessonJson, marker);
  if (!lines.length) return null;
  const intro = lines[0] || '';
  const definitions = splitDefinitionLines(lines.slice(1)).map((entry) => ({
    ...entry,
    descriptionHtml: colorizeMeaningConnectors(entry.description),
  }));
  return { intro, definitions };
};

const parseExampleBlock = (block, id, label) => {
  if (!block) return null;
  const langMap = {
    CEB: 'cebuano',
    HIL: 'hiligaynon',
    ILO: 'ilokano',
    TAG: 'tagalog',
    KAP: 'kapampangan',
  };
  const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
  let sentence = '';
  const translations = {};
  const translationsHtml = {};
  lines.forEach((line) => {
    const [rawLang, ...rest] = line.split(':');
    const lang = (rawLang || '').trim().toUpperCase();
    const text = rest.join(':').trim();
    if (lang === 'EN') {
      sentence = text;
    } else if (langMap[lang]) {
      translations[langMap[lang]] = text;
      const htmlText = markdownBoldToHtml(colorizeMeaningConnectors(text));
      translationsHtml[langMap[lang]] = htmlText;
    }
  });
  return {
    id,
    label,
    sentence,
    sentenceHtml: colorizeMeaningConnectors(sentence),
    translations,
    translationsHtml,
  };
};

const meaningConnectorsLessonJson = findLessonJsonById(lesson012Source, '0.1.2');

const meaningExample1Label =
  meaningConnectorsLessonJson?.paragraphs?.find((line) => (line || '').includes('EXAMPLE 1')) ||
  'Example 1 — Preposition + movement';
const meaningExample2Label =
  meaningConnectorsLessonJson?.paragraphs?.find((line) => (line || '').includes('EXAMPLE 2')) ||
  'Example 2 — Determiner + conjunctions';

const meaningExample1 = parseExampleBlock(
  findEnglishParagraph(meaningConnectorsLessonJson, 'EN: The boat went'),
  '0.1.2-ex1',
  meaningExample1Label.replace('⭐ ', ''),
);

const meaningExample2 = parseExampleBlock(
  findEnglishParagraph(meaningConnectorsLessonJson, 'EN: **These**'),
  '0.1.2-ex2',
  meaningExample2Label.replace('⭐ ', ''),
);

const meaningConnectorsContent = {
  english: buildEnglishMeaningConnectorsContent(meaningConnectorsLessonJson),
  cebuano: buildLocalizedMeaningConnectorsContent(meaningConnectorsLessonJson, '⭐ CEBUANO'),
  hiligaynon: buildLocalizedMeaningConnectorsContent(meaningConnectorsLessonJson, '⭐ HILIGAYNON'),
  ilokano: buildLocalizedMeaningConnectorsContent(meaningConnectorsLessonJson, '⭐ ILOKANO'),
  tagalog: buildLocalizedMeaningConnectorsContent(meaningConnectorsLessonJson, '⭐ TAGALOG'),
  kapampangan: buildLocalizedMeaningConnectorsContent(
    meaningConnectorsLessonJson,
    '⭐ KAPAMPANGAN',
  ),
};

const meaningReadyMessage =
  meaningConnectorsLessonJson?.paragraphs?.find((line) => (line || '').startsWith('Ready?')) ||
  'Ready? Let’s try some questions! Choose the correct answer for each item.';

const meaningConnectorsExamples = [meaningExample1, meaningExample2].filter(Boolean);

const buildGenericContent = (lessonJson, marker, descriptionTransform) => {
  const lines = sliceSectionLines(lessonJson, marker);
  if (!lines.length) return null;
  const intro = lines[0] || '';
  const definitions = splitDefinitionLines(lines.slice(1)).map((entry) => ({
    ...entry,
    descriptionHtml: descriptionTransform
      ? descriptionTransform(entry.description)
      : entry.descriptionHtml,
  }));
  return { intro, definitions };
};

const buildBulletOnlyContent = (lessonJson, marker, descriptionTransform) => {
  const lines = sliceSectionLines(lessonJson, marker);
  if (!lines.length) return null;
  const definitions = splitDefinitionLines(lines).map((entry) => ({
    ...entry,
    descriptionHtml: descriptionTransform
      ? descriptionTransform(entry.description)
      : entry.descriptionHtml,
  }));
  return { intro: '', definitions };
};

const simplePresentLessonJson = findLessonJsonById(lesson021Source, '0.2.1');
const svaSingularPluralLessonJson = findLessonJsonById(lesson022Source, '0.2.2');
const svaSpecialSubjectsLessonJson = findLessonJsonById(lesson023Source, '0.2.3');
const invertedSentencesLessonJson = findLessonJsonById(lesson024Source, '0.2.4');

const simplePresentContent = {
  english: buildGenericContent(simplePresentLessonJson, 'ENGLISH', highlightPresentVerb),
  cebuano: buildGenericContent(simplePresentLessonJson, '⭐ CEBUANO'),
  hiligaynon: buildGenericContent(simplePresentLessonJson, '⭐ HILIGAYNON'),
  ilokano: buildGenericContent(simplePresentLessonJson, '⭐ ILOKANO'),
  tagalog: buildGenericContent(simplePresentLessonJson, '⭐ TAGALOG'),
  kapampangan: buildGenericContent(simplePresentLessonJson, '⭐ KAPAMPANGAN'),
};

const simplePresentExample1Label =
  simplePresentLessonJson?.paragraphs?.find((line) => (line || '').includes('EXAMPLE 1')) ||
  'Example 1 — Habit/Routine';
const simplePresentExample2Label =
  simplePresentLessonJson?.paragraphs?.find((line) => (line || '').includes('EXAMPLE 2')) ||
  'Example 2 — Schedule/Fact';

const simplePresentExample1 = parseExampleBlock(
  findEnglishParagraph(simplePresentLessonJson, 'EN: Ana drinks'),
  '0.2.1-ex1',
  simplePresentExample1Label.replace('⭐ ', ''),
);

const simplePresentExample2 = parseExampleBlock(
  findEnglishParagraph(simplePresentLessonJson, 'EN: The jeep leaves'),
  '0.2.1-ex2',
  simplePresentExample2Label.replace('⭐ ', ''),
);

if (simplePresentExample1) {
  const html = simplePresentExample1.sentenceHtml || simplePresentExample1.sentence;
  simplePresentExample1.sentenceHtml = highlightPresentVerb(html);
}

if (simplePresentExample2) {
  const html = simplePresentExample2.sentenceHtml || simplePresentExample2.sentence;
  simplePresentExample2.sentenceHtml = highlightPresentVerb(html);
}

const simplePresentReadyMessage =
  simplePresentLessonJson?.paragraphs?.find((line) => (line || '').startsWith('Ready?')) ||
  'Ready? Let’s try some questions! Choose Yes or No.';

const simplePresentExamples = [simplePresentExample1, simplePresentExample2].filter(Boolean);

const svaSingularPluralContent = {
  english: buildGenericContent(svaSingularPluralLessonJson, 'ENGLISH', highlightPresentVerb),
  cebuano: buildGenericContent(svaSingularPluralLessonJson, '⭐ CEBUANO'),
  hiligaynon: buildGenericContent(svaSingularPluralLessonJson, '⭐ HILIGAYNON'),
  ilokano: buildGenericContent(svaSingularPluralLessonJson, '⭐ ILOKANO'),
  tagalog: buildGenericContent(svaSingularPluralLessonJson, '⭐ TAGALOG'),
  kapampangan: buildGenericContent(svaSingularPluralLessonJson, '⭐ KAPAMPANGAN'),
};

const svaSingularPluralExample1 = parseExampleBlock(
  findEnglishParagraph(svaSingularPluralLessonJson, 'EN: The girl'),
  '0.2.2-ex1',
  'Example 1 — Singular vs plural',
);

const svaSingularPluralExample2 = parseExampleBlock(
  findEnglishParagraph(svaSingularPluralLessonJson, 'EN: Lola **cooks**'),
  '0.2.2-ex2',
  'Example 2 — Parallel with names',
);

if (svaSingularPluralExample1) {
  const html = svaSingularPluralExample1.sentenceHtml || svaSingularPluralExample1.sentence;
  svaSingularPluralExample1.sentenceHtml = highlightPresentVerb(html);
}
if (svaSingularPluralExample2) {
  const html = svaSingularPluralExample2.sentenceHtml || svaSingularPluralExample2.sentence;
  svaSingularPluralExample2.sentenceHtml = highlightPresentVerb(html);
}

const svaSingularPluralReadyMessage =
  svaSingularPluralLessonJson?.paragraphs?.find((line) => (line || '').startsWith('Ready?')) ||
  'Ready? Let’s try some questions! Choose the correct verb form.';

const svaSingularPluralExamples = [svaSingularPluralExample1, svaSingularPluralExample2].filter(
  Boolean,
);

const svaSpecialContent = {
  english: buildBulletOnlyContent(
    svaSpecialSubjectsLessonJson,
    'ENGLISH',
    highlightPresentVerb,
  ),
};

const invertedSentencesContent = {
  english: buildGenericContent(invertedSentencesLessonJson, 'ENGLISH'),
  cebuano: buildGenericContent(invertedSentencesLessonJson, '⭐ CEBUANO'),
  hiligaynon: buildGenericContent(invertedSentencesLessonJson, '⭐ HILIGAYNON'),
  ilokano: buildGenericContent(invertedSentencesLessonJson, '⭐ ILOKANO'),
  tagalog: buildGenericContent(invertedSentencesLessonJson, '⭐ TAGALOG'),
  kapampangan: buildGenericContent(invertedSentencesLessonJson, '⭐ KAPAMPANGAN'),
};

const invertedSentencesReadyMessage =
  invertedSentencesLessonJson?.paragraphs?.find((line) =>
    (line || '').startsWith('Ready?'),
  ) || 'Ready? Let’s try some questions! Choose the correct verb for each inverted sentence.';

const svaSpecialExample1 = parseExampleBlock(
  findEnglishParagraph(svaSpecialSubjectsLessonJson, 'EN: Everyone likes'),
  '0.2.3-ex1',
  'Example 1 — Everyone / Everybody',
);

const svaSpecialExample2 = parseExampleBlock(
  findEnglishParagraph(svaSpecialSubjectsLessonJson, 'EN: Each student'),
  '0.2.3-ex2',
  'Example 2 — Each',
);

const svaSpecialExample3 = parseExampleBlock(
  findEnglishParagraph(svaSpecialSubjectsLessonJson, 'EN: Many students'),
  '0.2.3-ex3',
  'Example 3 — Many',
);

[svaSpecialExample1, svaSpecialExample2, svaSpecialExample3].forEach((ex) => {
  if (ex) {
    const html = ex.sentenceHtml || ex.sentence;
    ex.sentenceHtml = highlightPresentVerb(html);
  }
});

const svaSpecialReadyMessage =
  svaSpecialSubjectsLessonJson?.paragraphs?.find((line) => (line || '').startsWith('Ready?')) ||
  'Ready? Let’s try some questions! Choose the correct verb form.';

const svaSpecialExamples = [svaSpecialExample1, svaSpecialExample2, svaSpecialExample3].filter(
  Boolean,
);

const invertedPatternExamples = [
  {
    id: '0.2.4-patA',
    label: 'Pattern A — “Here / There” + Verb + Subject',
    sentenceHtml: [
      '<strong>Structure:</strong><br />Here/There + verb + real subject',
      '<strong>What controls the verb?</strong><br />➡️ The noun AFTER the verb (not “here” or “there”)',
      '<strong>Examples:</strong>',
      `• There <span class="sp-verb-s">is</span> a ${highlightSubject('girl')} at the gate.<br />Subject = ${highlightSubject('girl')} (singular)`,
      `• There are two ${highlightSubject('boys')} outside.<br />Subject = ${highlightSubject('boys')} (plural)`,
      `• Here <span class="sp-verb-s">comes</span> the ${highlightSubject('teacher')}.<br />Subject = ${highlightSubject('teacher')} (singular)`,
      `• Here are your ${highlightSubject('papers')}.<br />Subject = ${highlightSubject('papers')} (plural)`,
      `• There <span class="sp-verb-s">goes</span> my ${highlightSubject('wallet')} again.<br />Subject = ${highlightSubject('wallet')} (singular)`,
      `• There remain several ${highlightSubject('tasks')}.<br />Subject = ${highlightSubject('tasks')} (plural)`,
    ].join('<br /><br />'),
  },
  {
    id: '0.2.4-patB',
    label: 'Pattern B — Question Form (Verb Before Subject)',
    sentenceHtml: [
      '<strong>Structure:</strong><br />Question word + verb + subject',
      '<strong>Where is the subject?</strong><br />➡️ After the verb.',
      '<strong>Examples:</strong>',
      `• Where are the ${highlightSubject('modules')}?<br />Subject = ${highlightSubject('modules')} → plural`,
      `• Where <span class="sp-verb-s">is</span> your ${highlightSubject('ID')}?<br />Subject = ${highlightSubject('ID')} → singular`,
      `• Are the ${highlightSubject('students')} ready?<br />Subject = ${highlightSubject('students')} → plural`,
      `• <span class="sp-verb-s">Is</span> the ${highlightSubject('classroom')} clean?<br />Subject = ${highlightSubject('classroom')} → singular`,
      `• Are your ${highlightSubject('parents')} coming?<br />Subject = ${highlightSubject('parents')} → plural`,
      `• <span class="sp-verb-s">Is</span> the ${highlightSubject('plan')} final?<br />Subject = ${highlightSubject('plan')} → singular`,
    ].join('<br /><br />'),
  },
  {
    id: '0.2.4-patC',
    label: 'Pattern C — Prepositional Opener + Verb + Subject',
    sentenceHtml: [
      '<strong>Structure:</strong><br />(Prepositional phrase) + verb + subject',
      '<strong>Examples:</strong>',
      `• On the table <span class="sp-verb-s">sits</span> a ${highlightSubject('notebook')}.<br />Subject = ${highlightSubject('notebook')} → singular`,
      `• In the classroom were three ${highlightSubject('computers')}.<br />Subject = ${highlightSubject('computers')} → plural`,
      `• Under the chair <span class="sp-verb-s">is</span> a ${highlightSubject('bag')}.<br />Subject = ${highlightSubject('bag')} → singular`,
      `• Behind the gym are the ${highlightSubject('banners')}.<br />Subject = ${highlightSubject('banners')} → plural`,
    ].join('<br /><br />'),
  },
  {
    id: '0.2.4-patD',
    label: 'Pattern D — “Here/There” Without a Real Subject (Warning)',
    sentenceHtml: [
      '<strong>Reminder:</strong><br />Sometimes “there” is just a placeholder, not the subject.',
      '<strong>Examples:</strong>',
      `• There <span class="sp-verb-s">is</span> no ${highlightSubject('problem')}.<br />Subject = ${highlightSubject('problem')}`,
      `• There are many ${highlightSubject('reasons')}.<br />Subject = ${highlightSubject('reasons')}`,
      `• There were several ${highlightSubject('announcements')}.<br />Subject = ${highlightSubject('announcements')}`,
    ].join('<br /><br />'),
  },
];

export const subjectProgress = [
  { subject: 'English', percent: 67, color: '#ff7d18' },
  { subject: 'Math', percent: 54, color: '#b277ff' },
  { subject: 'Science', percent: 61, color: '#7ec56c' },
  { subject: 'Filipino', percent: 48, color: '#ffaf49' },
];

export const subjectList = [
  {
    name: 'English',
    description: 'Literacy, grammar, and academic language essentials',
    color: '#ff7d18',
  },
  {
    name: 'Math',
    description: 'Numbers, logic, reasoning, and word problems',
    color: '#b277ff',
  },
  {
    name: 'Science',
    description: 'Experiments, observation, and curiosity',
    color: '#7ec56c',
  },
  {
    name: 'Filipino',
    description: 'Language mastery with local culture and stories',
    color: '#ffaf49',
  },
];

export const modules = [
  {
    id: '0',
    label: 'MODULE 0',
    shortLabel: 'Module 0',
    title: 'Foundational English Grammar (Basic Skills Refresher)',
    description:
      'A safety net for learners who missed core Grade 4–6 concepts. Students start by naming words, then move into tense control, SVA, and writing clarity.',
    color: '#febd6e',
    lessons: [
      {
        code: '0.1.1',
        stage: '0.1 — The Building Blocks (Must Be Learned First)',
        title: 'Parts of Speech (Core Set)',
        summary: 'Nouns • Pronouns • Verbs • Adjectives • Adverbs',
        highlights: [
          'Nouns – people, places, things, ideas',
          'Pronouns – words that replace nouns',
          'Verbs – action or state of being',
          'Adjectives – describe nouns',
          'Adverbs – describe verbs/adjectives/adverbs',
        ],
        why: 'Learners need to recognize each word type before tackling agreement or sentence building.',
        content: {
          english: {
            intro: 'Parts of speech are the basic kinds of words we use in sentences. Here are the 5 most important ones:',
            definitions: [
              { term: 'Noun', description: 'a person, place, thing, or idea (teacher, market, tricycle)' },
              { term: 'Pronoun', description: 'replaces a noun (he, she, they, it)' },
              { term: 'Verb', description: 'an action or state of being (run, eat, is)' },
              { term: 'Adjective', description: 'describes a noun (big, red, noisy)' },
              { term: 'Adverb', description: 'describes a verb, adjective, or another adverb (quickly, very, slowly)' },
            ],
            closing: 'Very simple.',
          },
          cebuano: {
            intro: 'Ang “parts of speech” mao ang nagkalain-laing klase sa pulong sa usa ka sentence.',
            definitions: [
              { term: 'Noun', description: 'tawo, lugar, butang, o idea' },
              { term: 'Pronoun', description: 'pulong nga mopuli sa noun' },
              { term: 'Verb', description: 'lihok o kahimtang' },
              { term: 'Adjective', description: 'naghulagway sa noun' },
              { term: 'Adverb', description: 'naghulagway sa verb/adjective/adverb' },
            ],
            closing: 'Hinumdumi: kini ang mga pulong nga pinakasayon masabtan una.',
          },
          hiligaynon: {
            intro: 'Ang “parts of speech” amo ang lain-lain nga klase sang tinaga sa pangungusap.',
            definitions: [
              { term: 'Noun', description: 'tawo, lugar, butang, ideya' },
              { term: 'Pronoun', description: 'pulong nga nagapuli sa noun' },
              { term: 'Verb', description: 'ginahimo ukon kahimtang' },
              { term: 'Adjective', description: 'nagadescribe sang noun' },
              { term: 'Adverb', description: 'nagadescribe sang verb/adjective/adverb' },
            ],
            closing: 'Simple kaayo.',
          },
          ilokano: {
            intro: 'Dagiti “parts of speech” ket dagiti nagduduma a kita ti sao iti pangungusap.',
            definitions: [
              { term: 'Noun', description: 'tao, lugar, banag, ideya' },
              { term: 'Pronoun', description: 'sao nga mangpuli iti noun' },
              { term: 'Verb', description: 'aramid wenno kasasaad' },
              { term: 'Adjective', description: 'mangiladawan iti noun' },
              { term: 'Adverb', description: 'mangiladawan iti verb/adjective/adverb' },
            ],
            closing: 'Nalaka unay nu masursuro dagitoy.',
          },
          tagalog: {
            intro: 'Ang “parts of speech” ay iba’t ibang uri ng salita sa pangungusap.',
            definitions: [
              { term: 'Pangngalan (Noun)', description: 'tao, lugar, bagay, ideya' },
              { term: 'Panghalip (Pronoun)', description: 'pumapalit sa pangngalan' },
              { term: 'Pandiwa (Verb)', description: 'kilos o galaw' },
              { term: 'Pang-uri (Adjective)', description: 'naglalarawan sa pangngalan' },
              { term: 'Pang-abay (Adverb)', description: 'naglalarawan sa pandiwa/pang-uri/pang-abay' },
            ],
            closing: 'Madali lang kapag naaalala ang limang ito.',
          },
          kapampangan: {
            intro: 'Ing “parts of speech” ila reng makasaup a klase ning salita king sentence.',
            definitions: [
              { term: 'Noun', description: 'tau, lugad, bagay, ideya' },
              { term: 'Pronoun', description: 'manyali king noun' },
              { term: 'Verb', description: 'gawan o kasasadyan' },
              { term: 'Adjective', description: 'mangalarawan king noun' },
              { term: 'Adverb', description: 'mangalarawan king verb/adjective/adverb' },
            ],
            closing: 'Simple la reng kayabe a pamanyabi.',
          },
        },
        flow: [
          {
            type: 'examples',
            title: 'Step 2 — Filipino-Localized Examples',
            examples: [
              {
                id: '0.1.1-ex1',
                label: 'Example 1 — Identifying Parts of Speech',
                sentence: 'Lola Mercy cooks sweet bibingka.',
                tagging: {
                  Noun: 'Lola Mercy, bibingka',
                  Verb: 'cooks',
                  Adjective: 'sweet',
                },
                translations: {
                  hiligaynon: 'Si Lola Mercy nagkaluto sang matam-is nga bibingka.',
                  cebuano: 'Si Lola Mercy nagluto ug tam-is nga bibingka.',
                  ilokano: 'Ni Lola Mercy ti agluto iti natalged nga bibingka.',
                  tagalog: 'Si Lola Mercy ay nagluluto ng matamis na bibingka.',
                  kapampangan: 'I Lola Mercy milutu yang matamis a bibingka.',
                },
              },
              {
                id: '0.1.1-ex2',
                label: 'Example 2 — Filipino Context Sentence',
                sentence: 'The noisy tricycle passed quickly.',
                tagging: {
                  Noun: 'tricycle',
                  Adjective: 'noisy',
                  Verb: 'passed',
                  Adverb: 'quickly',
                },
                translations: {
                  hiligaynon: 'Ang gahod nga traysikel naglabay dasig.',
                  cebuano: 'Ang saba nga traysikel miagi paspas.',
                  ilokano: 'Ti narugit a tricycle naglabas nalaka.',
                  tagalog: 'Ang maingay na traysikel ay dumaan nang mabilis.',
                  kapampangan: 'Ing makarakal a tricycle milabas mabilis.',
                },
              },
            ],
          },
          {
            type: 'ready',
            title: 'Step 3 — “Ready?” Screen',
            message: 'Ready? Let’s try some questions! Choose the correct answer for each item.',
          },
          {
            type: 'quiz',
            title: 'Step 4 — Test Items',
            note: 'English-only • Filipino names or contexts allowed • testing understanding of parts of speech',
            questionBank: {
              moduleId: '0.1.1',
              count: 5,
            },
          },
        ],
      },
      {
        code: '0.1.2',
        stage: '0.1 — The Building Blocks (Must Be Learned First)',
        title: 'Meaning Connectors (Secondary Set)',
        summary: 'Prepositions • Determiners • Conjunctions',
        highlights: [
          'Prepositions show place, time, or direction.',
          'Determiners point to distance and number (this/that, these/those).',
          'Conjunctions link ideas (coordinating, subordinating, correlative).',
        ],
        why: 'Meaning connectors make ideas flow. Without them, later modules like CALS fall apart.',
        content: meaningConnectorsContent,
        flow: [
          {
            type: 'examples',
            title: 'Step 2 — Filipino-Localized Examples',
            examples: meaningConnectorsExamples,
          },
          {
            type: 'ready',
            title: 'Step 3 — “Ready?” Screen',
            message: meaningReadyMessage,
          },
          {
            type: 'quiz',
            title: 'Step 4 — Test Items',
            note: 'English-only • Filipino names or contexts allowed • focus on prepositions, determiners (this/that/these/those), and conjunctions',
            questionBank: {
              moduleId: '0.1.2',
              count: 5,
            },
          },
        ],
      },
      {
        code: '0.1.quiz',
        stage: '0.1 — The Building Blocks (Must Be Learned First)',
        title: 'Checkpoint Quiz (0.1.1 + 0.1.2)',
        summary: 'Mixed review from Parts of Speech and Meaning Connectors',
        highlights: [
          '10 items pulled randomly from 0.1.1 and 0.1.2',
          'Need at least 8/10 to proceed',
          'Counts toward progress (required)',
        ],
        why: 'Ensures learners can spot parts of speech and meaning connectors before moving on.',
        content: {
          english: {
            intro: 'Take a 10-item checkpoint combining Parts of Speech (0.1.1) and Meaning Connectors (0.1.2).',
            definitions: [],
            closing: 'Score 8/10 or higher to continue.',
          },
        },
        flow: [
          {
            type: 'ready',
            title: 'Quiz Instructions',
            message: '10 mixed questions from 0.1.1 and 0.1.2. You need 8/10 to pass.',
          },
          {
            type: 'quiz',
            title: 'Checkpoint Quiz',
            note: 'English-only • randomized mix from 0.1.1 and 0.1.2 • need 8/10 to pass',
            questionBank: {
              moduleId: ['0.1.1', '0.1.2'],
              count: 10,
            },
          },
        ],
      },
      {
        code: '0.1.practice',
        stage: '0.1 — The Building Blocks (Must Be Learned First)',
        title: 'Practice Deck',
        summary: 'Optional practice quiz — randomized questions from mastered topics.',
        highlights: ['Randomized mix of questions', 'No tracking, just review'],
        optional: true,
        isPractice: true,
        content: {
          english: {
            intro:
              'Take an optional practice quiz. Questions are randomized from completed lessons so you can keep skills sharp.',
            definitions: [],
            closing: 'Your attempts here are not logged. Retake as often as you want.',
          },
        },
        flow: [
          {
            type: 'ready',
            title: 'Warm-up',
            message: 'Ready to review? These questions are optional and won’t affect your tracker.',
          },
          {
            type: 'quiz',
            title: 'Practice Test',
            note: '5 randomized questions per attempt • not recorded in progress tracker',
            questionBank: {
              moduleId: '0.1.1',
              count: 5,
            },
          },
        ],
      },
      {
        code: '0.2.1',
        stage: '0.2 — Simple Present Tense and Subject–Verb Agreement (SVA)',
        title: 'What is Simple Present Tense and when do we use it?',
        summary: 'Form, meaning, and everyday uses of simple present',
        highlights: [
          'State facts, habits, routines, and general truths.',
          'Form: base verb for most subjects; add -s for third person singular.',
        ],
        why: 'Learners already met verbs; now they apply them to the simplest tense.',
        content: simplePresentContent,
        flow: [
          {
            type: 'examples',
            title: 'Step 2 — Filipino-Localized Examples',
            examples: simplePresentExamples,
          },
          {
            type: 'ready',
            title: 'Step 3 — “Ready?” Screen',
            message: simplePresentReadyMessage,
          },
          {
            type: 'quiz',
            title: 'Step 4 — Test Items',
            note: 'English-only • Filipino names or contexts allowed • yes/no: is this sentence simple present?',
            questionBank: {
              moduleId: '0.2.1',
              count: 5,
            },
          },
        ],
      },
      {
        code: '0.2.2',
        stage: '0.2 — Simple Present Tense and Subject–Verb Agreement (SVA)',
        title: 'Singular/Plural Rules',
        summary: 'Core SVA patterns in simple present',
        highlights: [
          'Match singular subjects with -s verbs; plural subjects with base verbs.',
          'Contrast “Lola cooks” vs “The twins cook.”',
        ],
        why: 'Agreement is the main accuracy hurdle in simple present.',
        content: svaSingularPluralContent,
        flow: [
          {
            type: 'examples',
            title: 'Step 2 — Filipino-Localized Examples',
            examples: svaSingularPluralExamples,
          },
          {
            type: 'ready',
            title: 'Step 3 — “Ready?” Screen',
            message: svaSingularPluralReadyMessage,
          },
          {
            type: 'quiz',
            title: 'Step 4 — Test Items',
            note: 'English-only • choose the correct simple present verb form; distractors include -ed/-ing',
            questionBank: {
              moduleId: '0.2.2',
              count: 5,
            },
          },
        ],
      },
      {
        code: '0.2.3',
        stage: '0.2 — Simple Present Tense and Subject–Verb Agreement (SVA)',
        title: 'Special Subjects (everyone, each, many)',
        summary: 'Pronouns that confuse agreement',
        highlights: [
          'Everyone/each → singular verb; many → plural verb.',
        ],
        why: 'These pronouns frequently break agreement in student writing.',
        content: svaSpecialContent,
        flow: [
          {
            type: 'examples',
            title: 'Step 2 — Filipino-Localized Examples',
            examples: svaSpecialExamples,
          },
          {
            type: 'ready',
            title: 'Step 3 — “Ready?” Screen',
            message: svaSpecialReadyMessage,
          },
          {
            type: 'quiz',
            title: 'Step 4 — Test Items',
            note: 'English-only • everyone/each = singular verb; many = plural verb',
            questionBank: {
              moduleId: '0.2.3',
              count: 5,
            },
          },
        ],
      },
      {
        code: '0.2.4',
        stage: '0.2 — Simple Present Tense and Subject–Verb Agreement (SVA)',
        title: 'Inverted Sentences',
        summary: 'Finding the real subject after the verb or opener',
        highlights: [
          'Handle here/there openings and questions.',
          'Train learners to spot the noun that controls the verb.',
        ],
        why: 'Inversion hides the subject; students must still match the verb correctly.',
        content: invertedSentencesContent,
        flow: [
          {
            type: 'examples',
            title: 'Step 2 — Pattern Library',
            examples: invertedPatternExamples,
          },
          {
            type: 'ready',
            title: 'Step 3 — “Ready?” Screen',
            message: invertedSentencesReadyMessage,
          },
          {
            type: 'quiz',
            title: 'Step 4 — Test Items',
            note: 'English-only • choose the correct verb for inverted sentences (here/there, questions, prepositional openers)',
            questionBank: {
              moduleId: '0.2.4',
              count: 5,
            },
          },
        ],
      },
      {
        code: '0.2.5',
        stage: '0.2 — Simple Present Tense and Subject–Verb Agreement (SVA)',
        title: 'Compound Subjects',
        summary: 'Subjects joined by and/or/neither…nor/either…or',
        highlights: [
          'With “and,” treat as plural (usually).',
          'With “or/nor,” match the verb to the nearest subject.',
        ],
        why: 'Compound subjects appear often in reading and tests.',
      },
      {
        code: '0.2.6',
        stage: '0.2 — Simple Present Tense and Subject–Verb Agreement (SVA)',
        title: 'Distance Between Subject & Verb',
        summary: 'Ignore interrupting phrases to keep agreement accurate',
        highlights: [
          'Bracket prepositional/interrupting phrases to see the core subject.',
          'Re-read without the interrupter to choose the verb.',
        ],
        why: 'Longer sentences can mislead learners about number.',
      },
      {
        code: '0.2.7',
        stage: '0.2 — Simple Present Tense and Subject–Verb Agreement (SVA)',
        title: 'Indefinite Pronouns',
        summary: 'anyone, everyone, both, few, several, none',
        highlights: [
          'Sort into always-singular vs always-plural vs context-dependent.',
          'Pair each with a sample verb in simple present.',
        ],
        why: 'Indefinite pronouns are a common SVA trap.',
      },
      {
        code: '0.2.8',
        stage: '0.2 — Simple Present Tense and Subject–Verb Agreement (SVA)',
        title: 'Collective Nouns',
        summary: 'class, team, family, committee',
        highlights: [
          'Treat as singular when acting as one unit.',
          'Show optional plural sense when members act separately (advanced note).',
        ],
        why: 'Collective nouns appear in academic reading; learners must choose verb number.',
      },
      {
        code: '0.2.9',
        stage: '0.2 — Simple Present Tense and Subject–Verb Agreement (SVA)',
        title: 'There is / There are',
        summary: 'Handle inverted “there” sentences in simple present',
        highlights: [
          'Identify the true subject after “there is/are.”',
          'Compare singular vs plural nouns to select the verb.',
        ],
        why: 'Students often copy “There’s many…”; this fixes that habit.',
      },
      {
        code: '0.2.quiz',
        stage: '0.2 — Simple Present Tense and Subject–Verb Agreement (SVA)',
        title: 'Checkpoint Quiz (0.2)',
        summary: 'Mixed review from 0.2.1–0.2.2 simple present and SVA rules',
        highlights: [
          '10 items pulled randomly from 0.2.1 and 0.2.2',
          'Need at least 8/10 to proceed',
          'Counts toward progress (required)',
        ],
        why: 'Checks mastery of simple present recognition before moving forward.',
        content: {
          english: {
            intro: 'Take a 10-item checkpoint on simple present tense and SVA singular/plural rules.',
            definitions: [],
            closing: 'Score 8/10 or higher to continue.',
          },
        },
        flow: [
          {
            type: 'ready',
            title: 'Quiz Instructions',
            message: '10 questions from 0.2.1–0.2.2. You need 8/10 to pass.',
          },
          {
            type: 'quiz',
            title: 'Checkpoint Quiz',
            note: 'English-only • randomized • pulled from 0.2.1 and 0.2.2 • need 8/10 to pass',
            questionBank: {
              moduleId: ['0.2.1', '0.2.2'],
              count: 10,
            },
          },
        ],
      },
      {
        code: '0.2.practice',
        stage: '0.2 — Simple Present Tense and Subject–Verb Agreement (SVA)',
        title: 'Practice Deck (0.2)',
        summary: 'Optional practice quiz — randomized questions from 0.2.1–0.2.2',
        highlights: ['Randomized mix of questions', 'No tracking, just review'],
        optional: true,
        isPractice: true,
        content: {
          english: {
            intro: 'Optional practice for simple present and SVA singular/plural. Questions are randomized each attempt.',
            definitions: [],
            closing: 'Not recorded in the tracker; retake anytime.',
          },
        },
        flow: [
          {
            type: 'ready',
            title: 'Warm-up',
            message: 'Ready to review? Optional practice — not counted in progress.',
          },
          {
            type: 'quiz',
            title: 'Practice Test',
            note: '5 randomized questions from 0.2.1–0.2.2 • not recorded in progress tracker',
            questionBank: {
              moduleId: ['0.2.1', '0.2.2'],
              count: 5,
            },
          },
        ],
      },
      {
        code: '0.4.1',
        stage: '0.4 — Question Formation (Do/Does/Did, WH-Questions)',
        title: 'WH-Question Forms',
        summary: 'what • who • why • where • which • how',
        highlights: [
          'Model statements vs questions with inversion.',
          'Add polite question variations for classroom use.',
        ],
        why: 'By now learners control verbs, so swapping to question order feels natural.',
      },
      {
        code: '0.4.2',
        stage: '0.4 — Question Formation (Do/Does/Did, WH-Questions)',
        title: 'Yes/No Questions',
        summary: 'Building short answers with auxiliaries',
        highlights: [
          'Compare declarative sentences with their yes/no question pairs.',
          'Include tone practice so students sound courteous, not abrupt.',
        ],
        why: 'Daily classroom checks rely on clean yes/no question forms.',
      },
      {
        code: '0.4.3',
        stage: '0.4 — Question Formation (Do/Does/Did, WH-Questions)',
        title: 'Do/Does/Did Rules',
        summary: 'Choosing the helper verb that fits tense and subject',
        highlights: [
          'Connect the helper verb to the tense chart from Stage 0.2.',
          'Give quick drills switching between “does” and “do.”',
        ],
        why: 'Misusing do/does/did ruins clarity—this lesson locks in the pattern.',
      },
      {
        code: '0.4.4',
        stage: '0.4 — Question Formation (Do/Does/Did, WH-Questions)',
        title: 'Inversion Patterns',
        summary: 'Swapping subject and verb order for questions',
        highlights: [
          'Show the difference between statements (“They are ready”) and questions (“Are they ready?”).',
          'Use call-and-response practice so the inversion sticks.',
        ],
        why: 'Inversion is a mechanical step students must automate before writing longer responses.',
      },
      {
        code: '0.4.5',
        stage: '0.4 — Question Formation (Do/Does/Did, WH-Questions)',
        title: 'Polite Questions',
        summary: 'Could you…? May I…? Would it be okay…?',
        highlights: [
          'Teach softening phrases used in Filipino classrooms and online chats.',
          'Contrast informal vs polite tones.',
        ],
        why: 'Respectful questioning matters in blended learning spaces and digital etiquette.',
      },
      {
        code: '0.4.6',
        stage: '0.4 — Question Formation (Do/Does/Did, WH-Questions)',
        title: 'Turning Statements into Questions',
        summary: 'Transform declarative sentences step by step',
        highlights: [
          'Break apart the sentence, move the helper verb, and add punctuation.',
          'Have learners convert content from science/math statements into questions.',
        ],
        why: 'This lesson is the final check that students truly control the full question pattern.',
      },
      {
        code: '0.5.1',
        stage: '0.5 — Basic Sentence Construction',
        title: 'Fragments vs Run-ons',
        summary: 'Complete vs incomplete sentences',
        highlights: [
          'Use color coding to show missing subjects or verbs.',
          'Rebuild run-ons into simple, compound, or complex lines.',
        ],
        why: 'Clean sentence boundaries enable better writing and reading.',
      },
      {
        code: '0.5.2',
        stage: '0.5 — Basic Sentence Construction',
        title: 'Complete vs Incomplete Sentences',
        summary: 'Check for subject + predicate every time',
        highlights: [
          'Use checklists to ensure each sentence carries a doer and an action.',
          'Let learners fix incomplete exit-ticket answers.',
        ],
        why: 'Sentence completion is the foundation for paragraph writing and assessments.',
      },
      {
        code: '0.5.3',
        stage: '0.5 — Basic Sentence Construction',
        title: 'Simple Subject + Predicate',
        summary: 'Spotting who/what + what happens',
        highlights: [
          'Color code subjects vs predicates to build fluency.',
          'Link back to parts of speech so students know which words matter.',
        ],
        why: 'Understanding basic structure keeps future clause lessons from overwhelming learners.',
      },
      {
        code: '0.5.4',
        stage: '0.5 — Basic Sentence Construction',
        title: 'Direct and Indirect Objects',
        summary: 'Who/what receives the action? To whom is it given?',
        highlights: [
          'Use Filipino names in sample sentences to show the object clearly.',
          'Map the path from subject to verb to object with arrows.',
        ],
        why: 'Recognizing objects prepares students for voice changes and essay feedback.',
      },
      {
        code: '0.6.1',
        stage: '0.6 — Punctuation & Capitalization Essentials',
        title: 'Capital Letters',
        summary: 'Names, first words, and important places',
        highlights: [
          'Re-train uppercase rules for names of people and local places.',
          'Blend reminders with quick practice prompts.',
        ],
        why: 'Learners can now polish sentences before publishing them.',
      },
      {
        code: '0.6.2',
        stage: '0.6 — Punctuation & Capitalization Essentials',
        title: 'Periods, Commas, Question Marks',
        summary: 'Ending punctuation and the most common comma uses',
        highlights: [
          'Reinforce rising vs falling intonation with matching punctuation.',
          'Provide comma checklists for lists, introductory words, and compound sentences.',
        ],
        why: 'Clean punctuation keeps readers from misinterpreting answers or essay points.',
      },
      {
        code: '0.6.3',
        stage: '0.6 — Punctuation & Capitalization Essentials',
        title: 'Colon & Semicolon (Intro)',
        summary: 'Gentle introduction using lists and close ideas',
        highlights: [
          'Show one colon use (introducing a list) and one semicolon use (linking related sentences).',
          'Highlight misuse examples to build awareness.',
        ],
        why: 'Students see these marks in textbooks; giving them a safe practice space avoids fear later.',
      },
      {
        code: '0.6.4',
        stage: '0.6 — Punctuation & Capitalization Essentials',
        title: 'Quotation Marks',
        summary: 'Dialogue, direct quotes, and cited lines',
        highlights: [
          'Practice punctuating simple two-line conversations.',
          'Remind learners where to place commas and periods relative to quotes.',
        ],
        why: 'Quotation marks appear in both literature and reading exams, so mastery adds confidence.',
      },
      {
        code: '0.7.1',
        stage: '0.7 — Basic Writing Clarity',
        title: 'Removing Double Negatives',
        summary: 'Tuning sentences for clarity and tone',
        highlights: [
          'Swap “don’t have no” into formal structures.',
          'Show how redundancy affects essays.',
        ],
        why: 'The final touch ensures students can express ideas cleanly.',
      },
      {
        code: '0.7.2',
        stage: '0.7 — Basic Writing Clarity',
        title: 'Avoiding Redundancy',
        summary: 'Tightening sentences by removing repeated ideas',
        highlights: [
          'Identify and trim repeated adjectives or phrases.',
          'Use before/after samples so students hear the improved flow.',
        ],
        why: 'Redundant writing slows down readers; concise answers are scored higher.',
      },
      {
        code: '0.7.3',
        stage: '0.7 — Basic Writing Clarity',
        title: 'Coherence & Transitions',
        summary: 'Linking sentences smoothly',
        highlights: [
          'Practice using Filipino-friendly connectors (after that, meanwhile, in addition).',
          'Rearrange jumbled sentences to show the power of transitions.',
        ],
        why: 'Smooth transitions prepare learners for paragraph writing in later modules.',
      },
    ],
  },
  {
    id: '1',
    label: 'MODULE 1',
    shortLabel: 'Module 1',
    title: 'Academic Language Foundations (CALS)',
    description: 'Uccelli’s CALS paired with DepEd competencies.',
    color: '#7ac9ff',
    lessons: [
      { code: '1.1', title: 'Academic Connectives', summary: 'Contrast, cause-effect, addition, exemplification' },
      { code: '1.2', title: 'Nominalizations', summary: 'Turn verbs into academic noun phrases' },
      {
        code: '1.3',
        title: 'Text Structure Recognition',
        summary: 'Cause-effect • Problem-solution • Sequence • Compare-contrast • Definition • Classification',
      },
      {
        code: '1.4',
        title: 'Epistemic Stance & Certainty Markers',
        summary: 'May/might/probably vs strong claims, evaluating author certainty',
      },
    ],
  },
  {
    id: '2',
    label: 'MODULE 2',
    shortLabel: 'Module 2',
    title: 'Vocabulary Mastery',
    description: 'Tier-2 words, affixes, and discipline-neutral vocabulary.',
    color: '#f9b4ff',
    lessons: [
      { code: '2.1', title: 'Context Clues', summary: 'Definition • Synonym • Antonym • Example • Inference' },
      { code: '2.2', title: 'Affixes & Word Formation', summary: 'Prefixes • Suffixes • Root words • Word families' },
      {
        code: '2.3',
        title: 'Academic Tier-2 Words',
        summary: 'evaluate • analyze • interpret • identify • construct • infer • justify • formulate • emphasize',
      },
      {
        code: '2.4',
        title: 'Discipline-Neutral Vocabulary',
        summary: 'factor • variable • significant • process • function • impact • outcome • consistency • hypothesis',
      },
    ],
  },
  {
    id: '3',
    label: 'MODULE 3',
    shortLabel: 'Module 3',
    title: 'Grammar & Usage (Intermediate–Advanced)',
    description: 'Clauses, verbals, modals, voice, and sentence sophistication.',
    color: '#9ed86f',
    lessons: [
      { code: '3.1', title: 'Clauses', summary: 'Independent vs dependent; adjective, noun, and adverb clauses' },
      { code: '3.2', title: 'Verbals', summary: 'Gerunds • Infinitives • Participles' },
      { code: '3.3', title: 'Modals', summary: 'Obligation • Possibility • Permission • Politeness' },
      { code: '3.4', title: 'Active & Passive Voice', summary: 'Transformations and usage in academic writing' },
      { code: '3.5', title: 'Sentence Types & Structure', summary: 'Simple • Compound • Complex • Compound-complex' },
    ],
  },
  {
    id: '4',
    label: 'MODULE 4',
    shortLabel: 'Module 4',
    title: 'Reading Comprehension',
    description: 'Blend literal, inferential, and critical reading routines.',
    color: '#ffa36c',
    lessons: [
      { code: '4.1', title: 'Literal & Inferential Reading', summary: 'Details • Inference • Predictions • Main ideas' },
      {
        code: '4.2',
        title: 'Critical Reading (Bias, Tone, Purpose)',
        summary: 'Persuasive vs informative • Emotional vs neutral tone • Identifying bias',
      },
      {
        code: '4.3',
        title: 'Reading with Diagrams & Tables (CALS)',
        summary: 'Graphs • Charts • Maps • Infographics • Table-based inference',
      },
    ],
  },
  {
    id: '5',
    label: 'MODULE 5',
    shortLabel: 'Module 5',
    title: 'Literature',
    description: 'Short stories, myths, folklore, and poetry with Filipino context.',
    color: '#71b4ff',
    lessons: [
      { code: '5.1', title: 'Short Stories', summary: 'Plot • Setting • Characters • Conflict • Theme' },
      { code: '5.2', title: 'Myths / Legends / Folklore', summary: 'Cultural meaning • Archetypes • Symbolism' },
      {
        code: '5.3',
        title: 'Poetry',
        summary: 'Imagery • Figurative language • Tone • Theme • Sound devices (alliteration, assonance)',
      },
    ],
  },
  {
    id: '6',
    label: 'MODULE 6',
    shortLabel: 'Module 6',
    title: 'Writing Essentials',
    description: 'Paragraph craft, cohesion, and academic rewriting.',
    color: '#6ce3ce',
    lessons: [
      { code: '6.1', title: 'Paragraph Structure', summary: 'Topic sentence • Supporting details • Unity' },
      { code: '6.2', title: 'Cohesion in Writing', summary: 'Transitions • Pronoun referencing • Flow' },
      {
        code: '6.3',
        title: 'Academic Rewriting',
        summary: 'Move from informal → semi-formal → academic while avoiding slang',
      },
    ],
  },
  {
    id: '7',
    label: 'MODULE 7',
    shortLabel: 'Module 7',
    title: 'Listening & Viewing',
    description: 'Summaries, tone, intent, and integrating text with visuals.',
    color: '#ffdf6b',
    lessons: [
      { code: '7.1', title: 'Summaries', summary: 'Listen for key points and condense information' },
      { code: '7.2', title: 'Tone (Listening)', summary: 'Angry • Excited • Bored • Uncertain • Formal • Neutral' },
      {
        code: '7.3',
        title: 'Intent (Listening)',
        summary: 'To inform • Persuade • Entertain • Warn • Advise',
      },
      {
        code: '7.4',
        title: 'Text-Visual Integration (CALS)',
        summary: 'Interpret video clips with captions and match audio to visuals',
      },
    ],
  },
];

export const getModuleById = (id) => modules.find((module) => module.id === id);

const slugify = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export const getStageDecks = (module) => {
  if (!module) return [];
  const decks = new Map();
  module.lessons?.forEach((lesson) => {
    const hasStage = Boolean(lesson.stage);
    const stageLabel = hasStage ? lesson.stage : module.label;
    const [codePart, ...rest] = stageLabel.split('—');
    const code = hasStage
      ? (codePart || module.shortLabel || module.label || 'Stage').trim()
      : module.label;
    const title = hasStage
      ? rest.join('—').trim() || stageLabel.trim()
      : module.title;
    const key = `${module.id}-${code}`;
    if (!decks.has(key)) {
      decks.set(key, {
        id: key,
        code,
        title,
        slug: slugify(`${module.id}-${code}`),
        lessons: [],
      });
    }
    decks.get(key).lessons.push(lesson);
  });

  if (decks.size === 0 && module.lessons?.length) {
    const fallbackKey = `${module.id}-${module.label}`;
    decks.set(fallbackKey, {
      id: fallbackKey,
      code: module.label,
      title: module.title,
      slug: slugify(fallbackKey),
      lessons: module.lessons,
    });
  }

  return Array.from(decks.values());
};
