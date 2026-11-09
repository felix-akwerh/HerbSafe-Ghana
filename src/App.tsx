import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Learn from './pages/Learn'
import Products from './pages/Products'
import ReportWizard from './pages/Report'
import Submitted from './pages/Submitted'
import Suspicious from './pages/Suspicious'
import Track from './pages/Track'
import CaseView from './pages/reviewer/Case'
import Queue from './pages/reviewer/Queue'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="report" element={<ReportWizard />} />
        <Route path="suspicious" element={<Suspicious />} />
        <Route path="submitted/:id" element={<Submitted />} />
        <Route path="track" element={<Track />} />
        <Route path="track/:id" element={<Track />} />
        <Route path="products" element={<Products />} />
        <Route path="learn" element={<Learn />} />
        <Route path="reviewer" element={<Queue />} />
        <Route path="reviewer/:id" element={<CaseView />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  )
}
