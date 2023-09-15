// import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Nav from './components/Nav';
import ScrollToTop from './ScrollToTop';
import Home from './components/pages/Home';
import Proposal from "./components/pages/Proposal";
import CreateProposal from "./components/pages/CreateProposal";
function App() {

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="container">
        <Nav />
        <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/:id" element={<Proposal />} />
        <Route exact path="/create" element={<CreateProposal />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
