import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Users, MessageCircle, Star, Menu, X } from 'lucide-react'
import './Layout.css'

const Layout = ({ children }) => {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { path: '/players', label: 'Jogadores', icon: Users },
    { path: '/messages', label: 'Mensagens', icon: MessageCircle },
    { path: '/groups', label: 'Grupos', icon: Star }
  ]

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="layout">
      {/* Botão de menu mobile */}
      <button 
        className="menu-toggle"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay para mobile */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1>HYPEMC</h1>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Footer da sidebar */}
        <div className="sidebar-footer">
          <div className="version-info">
            <span>v0.1</span>
          </div>
          <div className="copyright-info">
            <span>©eduzp</span>
          </div>
        </div>
      </aside>
      
      {/* Conteúdo principal */}
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default Layout 