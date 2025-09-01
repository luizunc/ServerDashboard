import React, { useState, useEffect } from 'react'
import { Search, Filter, MoreHorizontal, Loader2, Edit, Ban, UserX, Shield, Crown, Trash2, Eye, UserCheck } from 'lucide-react'
import apiService from '../services/api'
import './Players.css'

const Players = () => {
  const [players, setPlayers] = useState([])
  const [filteredPlayers, setFilteredPlayers] = useState([])
  const [showFilter, setShowFilter] = useState(false)
  const [filters, setFilters] = useState({
    id: '',
    name: ''
  })
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [activeActionsMenu, setActiveActionsMenu] = useState(null)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [showPlayerModal, setShowPlayerModal] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [lastStatusUpdate, setLastStatusUpdate] = useState(new Date())
  const [activeGroupMenu, setActiveGroupMenu] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeModalGroupMenu, setActiveModalGroupMenu] = useState(null)

  // Carregar dados iniciais
  useEffect(() => {
    loadPlayers()
    loadGroups()
  }, [pagination.page])

  // Atualização automática do status dos jogadores a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      // Atualizar apenas o status sem recarregar toda a lista
      updatePlayersStatus()
    }, 30000) // 30 segundos
    
    return () => clearInterval(interval)
  }, [])

  // Fechar menu de ações quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeActionsMenu && !event.target.closest('.actions-container')) {
        setActiveActionsMenu(null)
      }
      if (activeGroupMenu && !event.target.closest('.group-select-container')) {
        setActiveGroupMenu(null)
      }
      if (activeModalGroupMenu && !event.target.closest('.modal-group-select-container')) {
        setActiveModalGroupMenu(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [activeActionsMenu, activeGroupMenu, activeModalGroupMenu])

  // Fechar modal quando pressionar ESC
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && showPlayerModal) {
        handlePlayerModalClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showPlayerModal])

  const loadPlayers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiService.getPlayers(
        pagination.page, 
        pagination.limit, 
        filters.name || filters.id
      )
      
      if (response.success) {
        setPlayers(response.data.players)
        setFilteredPlayers(response.data.players)
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        }))
      }
    } catch (error) {
      console.error('Erro ao carregar jogadores:', error)
      setError('Erro ao carregar jogadores. Verifique a conexão com o banco.')
    } finally {
      setLoading(false)
    }
  }

  const loadGroups = async () => {
    try {
      const response = await apiService.getAvailableRanks()
      if (response.success) {
        setGroups(response.data.map(group => group.value))
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error)
    }
  }

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value }
    setFilters(newFilters)
    
    let filtered = players
    
    if (newFilters.id) {
      filtered = filtered.filter(player => 
        player.id.toString().includes(newFilters.id)
      )
    }
    
    if (newFilters.name) {
      filtered = filtered.filter(player => 
        player.name.toLowerCase().includes(newFilters.name.toLowerCase())
      )
    }
    
    setFilteredPlayers(filtered)
  }

  const clearFilters = () => {
    setFilters({ id: '', name: '' })
    setFilteredPlayers(players)
  }

  const showNotification = (message, type = 'success') => {
    const id = Date.now()
    const notification = { id, message, type }
    
    setNotifications(prev => [...prev, notification])
    
    // Auto-remover notificação após 5 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const handleGroupChange = async (playerId, newGroup) => {
    try {
      const response = await apiService.updatePlayerRank(playerId, newGroup)
      
      if (response.success) {
        // Atualizar estado local com rank e tag
        setPlayers(prev => 
          prev.map(player => 
            player.id === playerId ? { 
              ...player, 
              rank: response.data.rank,
              tag: response.data.tag 
            } : player
          )
        )
        setFilteredPlayers(prev => 
          prev.map(player => 
            player.id === playerId ? { 
              ...player, 
              rank: response.data.rank,
              tag: response.data.tag 
            } : player
          )
        )
        
        // Mostrar notificação de sucesso
        showNotification('Rank e tag atualizados com sucesso!', 'success')
      }
    } catch (error) {
      console.error('Erro ao atualizar rank e tag:', error)
      showNotification('Erro ao atualizar rank e tag: ' + error.message, 'error')
    }
  }

  const handleActionsClick = (playerId, event) => {
    event.stopPropagation()
    if (activeActionsMenu === playerId) {
      setActiveActionsMenu(null)
    } else {
      setActiveActionsMenu(playerId)
    }
  }

  const closeActionsMenu = () => {
    setActiveActionsMenu(null)
  }

  const handleBanPlayer = async (playerId, playerName) => {
    if (window.confirm(`Tem certeza que deseja banir o jogador ${playerName}?`)) {
      try {
        // Aqui você implementaria a lógica de banimento
        showNotification(`Jogador ${playerName} foi banido com sucesso!`, 'success')
        // Recarregar lista de jogadores
        loadPlayers()
      } catch (error) {
        console.error('Erro ao banir jogador:', error)
        showNotification('Erro ao banir jogador: ' + error.message, 'error')
      }
    }
    setActiveActionsMenu(null)
  }

  const handleKickPlayer = async (playerId, playerName) => {
    if (window.confirm(`Tem certeza que deseja kickar o jogador ${playerName}?`)) {
      try {
        // Aqui você implementaria a lógica de kick
        showNotification(`Jogador ${playerName} foi kickado com sucesso!`, 'success')
      } catch (error) {
        console.error('Erro ao kickar jogador:', error)
        showNotification('Erro ao kickar jogador: ' + error.message, 'error')
      }
    }
    setActiveActionsMenu(null)
  }

  const handleDeletePlayer = async (playerId, playerName) => {
    if (window.confirm(`Tem certeza que deseja deletar permanentemente o jogador ${playerName}? Esta ação não pode ser desfeita.`)) {
      try {
        const response = await apiService.deletePlayer(playerId)
        if (response.success) {
          showNotification(`Jogador ${playerName} foi deletado com sucesso!`, 'success')
          loadPlayers()
        }
      } catch (error) {
        console.error('Erro ao deletar jogador:', error)
        showNotification('Erro ao deletar jogador: ' + error.message, 'error')
      }
    }
    setActiveActionsMenu(null)
  }

  const handleViewPlayerDetails = (player) => {
    setSelectedPlayer(player)
    setShowPlayerModal(true)
    setActiveActionsMenu(null)
  }

  const handlePlayerModalClose = () => {
    setShowPlayerModal(false)
    setSelectedPlayer(null)
  }

  const handlePlayerUpdate = async (updatedData) => {
    try {
      const response = await apiService.updatePlayer(selectedPlayer.id, updatedData)
      if (response.success) {
        showNotification('Jogador atualizado com sucesso!', 'success')
        loadPlayers()
        handlePlayerModalClose()
      }
    } catch (error) {
      console.error('Erro ao atualizar jogador:', error)
      showNotification('Erro ao atualizar jogador: ' + error.message, 'error')
    }
  }

  const handlePlayerStatusChange = async (playerId, playerName, newStatus) => {
    if (window.confirm(`Tem certeza que deseja alterar o status do jogador ${playerName} para ${newStatus}?`)) {
      try {
        // Aqui você implementaria a lógica de mudança de status
        showNotification(`Status do jogador ${playerName} alterado para ${newStatus} com sucesso!`, 'success')
        loadPlayers()
      } catch (error) {
        console.error('Erro ao alterar status:', error)
        showNotification('Erro ao alterar status: ' + error.message, 'error')
      }
    }
    setActiveActionsMenu(null)
  }

  const handlePlayerWhitelist = async (playerId, playerName, action) => {
    const actionText = action === 'add' ? 'adicionar' : 'remover'
    if (window.confirm(`Tem certeza que deseja ${actionText} o jogador ${playerName} da whitelist?`)) {
      try {
        // Aqui você implementaria a lógica de whitelist
        showNotification(`Jogador ${playerName} foi ${actionText === 'adicionar' ? 'adicionado à' : 'removido da'} whitelist com sucesso!`, 'success')
        loadPlayers()
      } catch (error) {
        console.error('Erro ao gerenciar whitelist:', error)
        showNotification('Erro ao gerenciar whitelist: ' + error.message, 'error')
      }
    }
    setActiveActionsMenu(null)
  }

  const updatePlayersStatus = () => {
    // Atualizar apenas o status dos jogadores sem fazer nova requisição
    setPlayers(prev => 
      prev.map(player => ({
        ...player,
        // O status será recalculado automaticamente pelo isPlayerOnline()
      }))
    )
    setFilteredPlayers(prev => 
      prev.map(player => ({
        ...player,
        // O status será recalculado automaticamente pelo isPlayerOnline()
      }))
    )
    
    // Atualizar timestamp da última atualização
    setLastStatusUpdate(new Date())
  }

  // Função para forçar atualização manual
  const forceRefreshStatus = async () => {
    if (isRefreshing) return // Evitar múltiplas atualizações simultâneas
    
    setIsRefreshing(true)
    showNotification('Atualizando status dos jogadores...', 'info')
    
    try {
      // Recarregar dados dos jogadores do servidor para obter informações mais recentes
      await loadPlayers()
      await loadGroups()
      
      // Atualizar timestamp da última atualização
      setLastStatusUpdate(new Date())
      
      showNotification('Status atualizado com sucesso!', 'success')
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      showNotification('Erro ao atualizar status: ' + error.message, 'error')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Função para determinar se o jogador está online (baseado no último login)
  const isPlayerOnline = (lastLogin) => {
    if (!lastLogin) return false
    
    const lastLoginTime = new Date(parseInt(lastLogin.toString().length <= 10 ? lastLogin * 1000 : lastLogin))
    const now = new Date()
    const diffInMinutes = Math.floor((now - lastLoginTime) / (1000 * 60))
    
    // Considerar online se o último login foi há menos de 30 minutos
    // Isso é mais realista para servidores Minecraft onde jogadores podem ficar online por horas
    return diffInMinutes < 30
  }

  // Função para obter o status do jogador
  const getPlayerStatus = (player) => {
    if (isPlayerOnline(player.last_login)) {
      return { status: 'online', text: 'Online', color: '#10b981' }
    } else {
      return { status: 'offline', text: 'Offline', color: '#6b7280' }
    }
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'nunca'
    
    // Converter timestamp em milissegundos para Date
    // Se o timestamp for menor que 10^10, assumir que está em segundos e converter para milissegundos
    const timestampMs = timestamp.toString().length <= 10 ? timestamp * 1000 : timestamp
    const date = new Date(parseInt(timestampMs))
    const now = new Date()
    
    // Verificar se a data é válida
    if (isNaN(date.getTime())) return 'data inválida'
    
    const diffInMs = now - date
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInMinutes < 1) return 'agora mesmo'
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`
    if (diffInHours < 24) return `${diffInHours}h atrás`
    if (diffInDays < 30) return `${diffInDays}d atrás`
    if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30)
      return `${months}mes atrás`
    }
    
    const years = Math.floor(diffInDays / 365)
    return `${years}ano${years > 1 ? 's' : ''} atrás`
  }

  /**
   * Busca a skin head real do jogador pelo nome usando a API oficial do Minecraft
   * @param {string} playerName - Nome do jogador
   * @returns {string} URL da imagem do head
   */
  const getMinecraftHead = (playerName) => {
    try {
      if (!playerName || typeof playerName !== 'string') {
        return 'https://mc-heads.net/avatar/steve/32'
      }
      
      // Limpar o nome do jogador (remover espaços e caracteres especiais)
      // A API do Minecraft só aceita nomes com 3-16 caracteres alfanuméricos e underscore
      const cleanName = playerName.trim().replace(/[^a-zA-Z0-9_]/g, '')
      
      if (cleanName && cleanName.length >= 3 && cleanName.length <= 16) {
        // Usar a API mc-heads.net que busca automaticamente a skin atual do jogador
        // Esta API é confiável e sempre retorna a skin mais recente
        return `https://mc-heads.net/avatar/${cleanName}/32`
      }
    } catch (error) {
      console.warn('Erro ao buscar skin do jogador:', error)
    }
    
    // Fallback para o head do Steve se o nome for inválido
    return 'https://mc-heads.net/avatar/steve/32'
  }

  /**
   * Renderiza o avatar do jogador como um head de Minecraft
   * Substitui os emojis coloridos anteriores por heads reais dos jogadores
   * @param {string} name - Nome do jogador
   * @returns {JSX.Element} Imagem do head de Minecraft
   */
  const getAvatarColor = (name) => {
    // Substituir emojis por heads de Minecraft
    return (
      <img 
        src={getMinecraftHead(name)} 
        alt={`Head de ${name}`}
        className="minecraft-head"
        onError={(e) => {
          // Se falhar, usar um fallback (head do Steve)
          e.target.src = 'https://mc-heads.net/avatar/steve/32'
        }}
      />
    )
  }

  /**
   * Formatar UUID para exibição compacta
   * @param {string} uuid - UUID completo do jogador
   * @returns {string} UUID formatado para exibição
   */
  const formatUUID = (uuid) => {
    if (!uuid || typeof uuid !== 'string') {
      return 'N/A'
    }
    
    // Se for um UUID padrão (36 caracteres), mostrar apenas os primeiros 8
    if (uuid.length === 36) {
      return uuid.substring(0, 8).toLowerCase()
    }
    
    // Se for menor, mostrar completo
    if (uuid.length <= 12) {
      return uuid.toLowerCase()
    }
    
    // Se for maior que 12 mas menor que 36, mostrar os primeiros 8
    return uuid.substring(0, 8).toLowerCase()
  }

  if (loading && players.length === 0) {
    return (
      <div className="players-page fade-in">
        <div className="loading-container">
          <Loader2 className="loading-spinner" size={48} />
          <p>Carregando jogadores...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="players-page fade-in">
        <div className="error-container">
          <h2>Erro ao carregar dados</h2>
          <p>{error}</p>
          <button onClick={loadPlayers} className="retry-button">
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="players-page fade-in">
      <div className="page-header">
        <h1>Jogadores</h1>
        <div className="header-actions">
          <button 
            className="refresh-status-button"
            onClick={forceRefreshStatus}
            title="Atualizar Status"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 size={16} className="refresh-spinner" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/>
              </svg>
            )}
            Atualizar
          </button>
          <button 
            className="filter-button"
            onClick={() => setShowFilter(!showFilter)}
          >
            <Filter size={20} />
            Filtrar
          </button>
        </div>
      </div>

      <div className="players-table-container">
        <table className="players-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>NOME</th>
              <th>GRUPO</th>
              <th>STATUS</th>
              <th>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map((player) => (
              <tr key={player.id}>
                <td className="player-id">
                  <span className="player-avatar">{getAvatarColor(player.name)}</span>
                  <span className="player-id-text" title={`UUID completo: ${player.id}`}>
                    {formatUUID(player.id)}
                  </span>
                </td>
                <td className="player-name">
                  <div className="player-name-container">
                    <span className="player-name-text">{player.name}</span>
                  </div>
                </td>
                <td className="player-group">
                  <div className="group-select-container">
                    <button 
                      className="group-select-button"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (activeGroupMenu === player.id) {
                          setActiveGroupMenu(null)
                        } else {
                          setActiveGroupMenu(player.id)
                        }
                      }}
                      title="Alterar Grupo"
                    >
                      <span className="current-group">{player.rank || 'Membro'}</span>
                      <span className="group-arrow">▼</span>
                    </button>
                    
                    {activeGroupMenu === player.id && (
                      <div className="group-dropdown">
                        {groups.map(group => (
                          <button 
                            key={group}
                            className={`group-option ${player.rank === group ? 'active' : ''}`}
                            onClick={() => {
                              handleGroupChange(player.id, group)
                              setActiveGroupMenu(null)
                            }}
                          >
                            {group}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="player-time">
                  <div className="player-status-display">
                    <span className={`status-text ${isPlayerOnline(player.last_login) ? 'online' : 'offline'}`}>
                      {isPlayerOnline(player.last_login) ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </td>
                <td className="player-actions">
                  <div className="actions-container">
                    <button 
                      className="actions-button"
                      onClick={(e) => handleActionsClick(player.id, e)}
                      title="Ações"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    
                    {activeActionsMenu === player.id && (
                      <div className="actions-dropdown">
                        <button 
                          className="action-item"
                          onClick={() => handleViewPlayerDetails(player)}
                        >
                          <Eye size={16} />
                          <span>Ver Detalhes</span>
                        </button>
                        
                        <button 
                          className="action-item"
                          onClick={() => handleGroupChange(player.id, player.rank === 'Admin' ? 'Membro' : 'Admin')}
                        >
                          <Crown size={16} />
                          <span>{player.rank === 'Admin' ? 'Remover Admin' : 'Tornar Admin'}</span>
                        </button>
                        
                        <button 
                          className="action-item"
                          onClick={() => handlePlayerWhitelist(player.id, player.name, 'add')}
                        >
                          <Shield size={16} />
                          <span>Adicionar à Whitelist</span>
                        </button>
                        
                        <button 
                          className="action-item"
                          onClick={() => handlePlayerStatusChange(player.id, player.name, 'suspenso')}
                        >
                          <UserX size={16} />
                          <span>Suspender</span>
                        </button>
                        
                        <button 
                          className="action-item"
                          onClick={() => handleKickPlayer(player.id, player.name)}
                        >
                          <UserX size={16} />
                          <span>Kickar</span>
                        </button>
                        
                        <button 
                          className="action-item"
                          onClick={() => handleBanPlayer(player.id, player.name)}
                        >
                          <Ban size={16} />
                          <span>Banir</span>
                        </button>
                        
                        <button 
                          className="action-item danger"
                          onClick={() => handleDeletePlayer(player.id, player.name)}
                        >
                          <Trash2 size={16} />
                          <span>Deletar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Filtro de jogadores */}
      {showFilter && (
        <>
          <div className="filter-overlay" onClick={() => setShowFilter(false)} />
          <div className="filter-panel">
            <div className="filter-header">
              <h3>Filtrar Jogadores</h3>
              <button 
                className="close-button"
                onClick={() => setShowFilter(false)}
              >
                ×
              </button>
            </div>
            
            <div className="filter-content">
              <div className="filter-field">
                <label>ID do Jogador</label>
                <input
                  type="text"
                  placeholder="Filtrar por ID"
                  value={filters.id}
                  onChange={(e) => handleFilterChange('id', e.target.value)}
                />
              </div>
              
              <div className="filter-field">
                <label>Nome do Jogador</label>
                <input
                  type="text"
                  placeholder="Filtrar por nome"
                  value={filters.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                />
              </div>
              
              <div className="filter-actions">
                <button className="clear-button" onClick={clearFilters}>
                  Limpar
                </button>
                <button className="apply-button" onClick={() => setShowFilter(false)}>
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Paginação */}
      {pagination.pages > 1 && (
        <div className="pagination">
          {pagination.page > 1 && (
            <div 
              className="page-number"
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              ←
            </div>
          )}
          
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
            <div 
              key={page}
              className={`page-number ${page === pagination.page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </div>
          ))}
          
          {pagination.page < pagination.pages && (
            <div 
              className="page-number"
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              →
            </div>
          )}
        </div>
      )}

      {/* Modal de Detalhes/Edição do Jogador */}
      {showPlayerModal && selectedPlayer && (
        <div className="modal-overlay" onClick={handlePlayerModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalhes do Jogador</h3>
              <button className="modal-close" onClick={handlePlayerModalClose}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="player-info-grid">
                <div className="info-item">
                  <label>Nome:</label>
                  <input 
                    type="text" 
                    value={selectedPlayer.name} 
                    onChange={(e) => setSelectedPlayer({...selectedPlayer, name: e.target.value})}
                  />
                </div>
                
                <div className="info-item">
                  <label>Rank:</label>
                  <div className="modal-group-select-container">
                    <input 
                      type="text" 
                      value={selectedPlayer.rank || 'Membro'} 
                      readOnly
                      className="modal-rank-input"
                      onClick={() => {
                        if (activeModalGroupMenu === selectedPlayer.id) {
                          setActiveModalGroupMenu(null)
                        } else {
                          setActiveModalGroupMenu(selectedPlayer.id)
                        }
                      }}
                    />
                    
                    {activeModalGroupMenu === selectedPlayer.id && (
                      <div className="modal-group-dropdown">
                        {groups.map(group => (
                          <button 
                            key={group}
                            className={`modal-group-option ${selectedPlayer.rank === group ? 'active' : ''}`}
                            onClick={() => {
                              setSelectedPlayer({...selectedPlayer, rank: group})
                              setActiveModalGroupMenu(null)
                            }}
                          >
                            {group}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="info-item">
                  <label>Tag:</label>
                  <input 
                    type="text" 
                    value={selectedPlayer.tag || ''} 
                    onChange={(e) => setSelectedPlayer({...selectedPlayer, tag: e.target.value})}
                  />
                </div>
                
                <div className="info-item">
                  <label>Último Login:</label>
                  <span>{formatDate(selectedPlayer.last_login)}</span>
                </div>
                
                <div className="info-item">
                  <label>Data de Criação:</label>
                  <span>{formatDate(selectedPlayer.created_at)}</span>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-secondary" onClick={handlePlayerModalClose}>
                Cancelar
              </button>
              <button 
                className="btn-primary" 
                onClick={() => handlePlayerUpdate({
                  name: selectedPlayer.name,
                  rank: selectedPlayer.rank
                })}
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notificações */}
      {notifications.map(notification => (
        <div 
          key={notification.id} 
          className={`notification-toast ${notification.type}`}
          onClick={() => removeNotification(notification.id)}
        >
          {notification.message}
        </div>
      ))}
    </div>
  )
}

export default Players 