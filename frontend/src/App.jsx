import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './components/Home'
import Docs from './components/Docs'
import Forecast from './components/Forecast'
import Charts from './components/Charts'
import Calc from './components/Calc'
import About from './components/About'
import Legal from './components/Legal'
import Credits from './components/Credits'
import Danko from './components/Danko'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/danko" element={<Danko />} />
        <Route path="*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/c/:key" element={<Forecast />} />
              <Route path="/charts" element={<Charts />} />
              <Route path="/about" element={<About />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/calc" element={<Calc />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/credits" element={<Credits />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App