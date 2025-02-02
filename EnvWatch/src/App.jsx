import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './Pages/Landing';
import { About } from './Pages/About';
import { StopDetails } from './Pages/StopDetails'; // Import StopDetails page
import { Navbar } from './Components/Navbar/Navbar';
import './App.css';

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='/about' element={<About />} />
          <Route path='/stop/:stopId' element={<StopDetails />} />{' '}
          {/* Add Stop Details route */}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
