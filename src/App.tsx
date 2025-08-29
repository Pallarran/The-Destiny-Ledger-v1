import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Landing } from './pages/Landing'
import { BuildVault } from './pages/BuildVault'
import { CharacterBuilder } from './pages/CharacterBuilder'
import { DprLab } from './pages/DprLab'
import { Compare } from './pages/Compare'
import { LevelPathExplorer } from './pages/LevelPathExplorer'
import { Settings } from './pages/Settings'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/vault" element={<BuildVault />} />
          <Route path="/builder" element={<CharacterBuilder />} />
          <Route path="/builder/:buildId" element={<CharacterBuilder />} />
          <Route path="/dpr" element={<DprLab />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/explorer" element={<LevelPathExplorer />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App