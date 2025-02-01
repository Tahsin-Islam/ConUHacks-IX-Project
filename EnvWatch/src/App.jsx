import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Landing } from './Pages/Landing'
import { About } from './Pages/About'
import { Navbar } from './Components/Navbar/Navbar';
import Map from './map';


function App() {

  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Map />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
