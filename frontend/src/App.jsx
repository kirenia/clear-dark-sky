import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage'
import ReadingCharts from './components/ReadingCharts'
import ChartPage from './components/ChartPage'
import AllChartsPage from './components/AllChartsPage'
import AboutPage from './components/AboutPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/c/:key" element={<ChartPage />} />
        <Route path="/charts" element={<AllChartsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/about/reading-charts" element={<ReadingCharts />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App