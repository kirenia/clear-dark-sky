import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './components/Home'
import Documentation from './components/Documentation'
import Forecast from './components/Forecast'
import Charts from './components/Charts'
import About from './components/About'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/c/:key" element={<Forecast />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/about" element={<About />} />
          <Route path="/docs" element={<Documentation />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App