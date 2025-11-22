export const SceneKeys = {
  Launcher: 'LauncherScene',
  ModuleSelect: 'ModuleSelectScene',
  Vocabulary: 'GameVocabularyScene',
  Grammar: 'GameGrammarScene',
  Reading: 'ReadingChallengeScene',
  Settings: 'SettingsScene',
} as const

export type SceneKey = (typeof SceneKeys)[keyof typeof SceneKeys]
