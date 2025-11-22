import { Suspense, lazy } from 'react'
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom'
import './App.css'

const LauncherPage = lazy(() => import('./pages/LauncherPage'))
const HomePage = lazy(() => import('./pages/HomePage'))
const EnglishClassPage = lazy(() => import('./pages/EnglishClassPage'))
const ModulePage = lazy(() => import('./pages/ModulePage'))
const StagePage = lazy(() => import('./pages/StagePage'))
const CelebrationPage = lazy(() => import('./pages/CelebrationPage'))
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'))
const GamePage = lazy(() => import('./pages/GamePage'))

const RouterComponent = window.location.protocol === 'file:' ? HashRouter : BrowserRouter
const basename = window.location.protocol === 'file:' ? undefined : '/reap'

const App = () => (
  <RouterComponent basename={basename}>
    <Suspense
      fallback={
        <div className="page loading-page">
          <p>Loading…</p>
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<LauncherPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/english" element={<EnglishClassPage />} />
        <Route path="/english/modules/:moduleId" element={<ModulePage />} />
        <Route path="/english/modules/:moduleId/stages/:stageId" element={<StagePage />} />
        <Route path="/celebration" element={<CelebrationPage />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/play" element={<GamePage />} />
      </Routes>
    </Suspense>
  </RouterComponent>
);

export default App
