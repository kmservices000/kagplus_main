import module011Bank from '@tests/t_module_0.1.1.json';
import module012Bank from '@tests/t_module_0.1.2.json';
import module021Bank from '@tests/t_module_0.2.1.json';
import module022Bank from '@tests/t_module_0.2.2.json';
import module023Bank from '@tests/t_module_0.2.3.json';
import module024Bank from '@tests/t_module_0.2.4.json';
import module025Bank from '@tests/t_module_0.2.5.json';
import module026Bank from '@tests/t_module_0.2.6.json';

const rawBanks = [
  module011Bank,
  module012Bank,
  module021Bank,
  module022Bank,
  module023Bank,
  module024Bank,
  module025Bank,
  module026Bank,
]
  .flat()
  .filter(Boolean);

const bankByModule = rawBanks.reduce((acc, entry) => {
  if (entry?.module_id) {
    acc[entry.module_id] = entry;
  }
  return acc;
}, {});

const findBanks = (moduleIdOrIds) => {
  if (Array.isArray(moduleIdOrIds)) {
    return moduleIdOrIds.map((id) => bankByModule[id]).filter(Boolean);
  }
  const bank = bankByModule[moduleIdOrIds];
  return bank ? [bank] : [];
};

const sanitizeTitle = (header) => {
  if (!header || typeof header !== 'string') return '';
  const delimiterIndex = header.indexOf('—');
  if (delimiterIndex === -1) return header.trim();
  return header.slice(delimiterIndex + 1).trim();
};

const toQuestionShape = (item) => {
  if (!item) return null;
  const optionLetters = Object.keys(item.options || {}).sort();
  const options = optionLetters.map((letter) => `${letter}. ${item.options[letter]}`);
  return {
    id: item.number,
    title: sanitizeTitle(item.header),
    prompt: item.question,
    options,
    answer: `${item.correct_option}. ${item.correct_answer}`,
  };
};

const shuffle = (input) => {
  const items = [...input];
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
};

export const getQuestionBankMeta = (moduleId) => {
  const banks = findBanks(moduleId);
  const bank = banks[0];
  if (!bank) return null;
  return {
    label: bank.step4_label,
    instructions: bank.instructions,
    moduleTitle: bank.module_title,
  };
};

const splitQuestions = (questions, prioritizeIds = []) => {
  if (!prioritizeIds.length) return { prioritized: [], remaining: questions };
  const lookup = new Map(questions.map((question) => [String(question.id), question]));
  const prioritized = [];
  prioritizeIds.forEach((id) => {
    const key = String(id);
    if (lookup.has(key)) {
      prioritized.push(lookup.get(key));
      lookup.delete(key);
    }
  });
  return { prioritized, remaining: Array.from(lookup.values()) };
};

export const getRandomQuestionsFromBank = (moduleId, amount = 5, options = {}) => {
  const banks = findBanks(moduleId);
  if (!banks.length) return [];
  const transformed = banks
    .flatMap((bank) => (bank.items || []).map(toQuestionShape))
    .filter(Boolean);
  if (!transformed.length) return [];
  const { prioritizeIds = [] } = options;
  const limit = Math.min(amount, transformed.length);
  const { prioritized, remaining } = splitQuestions(transformed, prioritizeIds);
  const combined = [...prioritized, ...shuffle(remaining)];
  return combined.slice(0, limit);
};
