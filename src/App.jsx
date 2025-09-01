import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Players from './pages/Players'
import Groups from './pages/Groups'
import Messages from './pages/Messages'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Players />} />
        <Route path="/players" element={<Players />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/messages" element={<Messages />} />
      </Routes>
    </Layout>
  )
}

export default App 