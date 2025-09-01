import React, { useState, useEffect } from 'react'
import { Plus, Eye, Edit, Trash2, X, Loader2, Users, Palette, Settings } from 'lucide-react'
import apiService from '../services/api'
import './Groups.css'

const Groups = () => {
  const [groups, setGroups] = useState([])
  const [showColorReference, setShowColorReference] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newGroup, setNewGroup] = useState({
    internalName: '',
    displayName: '',
    prefix: '',
    permissions: ''
  })

  // Mapa de cores Minecraft
  const minecraftColors = {
    '§0': '#000000', // Preto
    '§1': '#0000AA', // Azul Escuro
    '§2': '#00AA00', // Verde Escuro
    '§3': '#00AAAA', // Ciano Escuro
    '§4': '#AA0000', // Vermelho Escuro
    '§5': '#AA00AA', // Roxo
    '§6': '#FFAA00', // Dourado
    '§7': '#AAAAAA', // Cinza
    '§8': '#555555', // Cinza Escuro
    '§9': '#5555FF', // Azul
    '§a': '#55FF55', // Verde
    '§b': '#55FFFF', // Ciano
    '§c': '#FF5555', // Vermelho
    '§d': '#FF55FF', // Rosa
    '§e': '#FFFF55', // Amarelo
    '§f': '#FFFFFF', // Branco
    '§l': 'bold', // Negrito
    '§m': 'line-through', // Riscado
    '§n': 'underline', // Sublinhado
    '§o': 'italic', // Itálico
    '§r': 'normal' // Reset
  }

  // Função para renderizar texto Minecraft com cores
  const renderMinecraftText = (text) => {
    if (!text) return '';
    
    const parts = [];
    let currentText = '';
    let currentStyle = {};
    
    // Dividir o texto pelos códigos de cor
    const segments = text.split(/(§[0-9a-fklmnor])/);
    
    segments.forEach((segment, index) => {
      if (segment.startsWith('§')) {
        // É um código de cor/formatação
        if (currentText) {
          parts.push({ text: currentText, style: { ...currentStyle } });
          currentText = '';
        }
        
        const code = segment;
        if (minecraftColors[code]) {
          if (code === '§l') currentStyle.fontWeight = 'bold';
          else if (code === '§m') currentStyle.textDecoration = 'line-through';
          else if (code === '§n') currentStyle.textDecoration = 'underline';
          else if (code === '§o') currentStyle.fontStyle = 'italic';
          else if (code === '§r') currentStyle = {};
          else currentStyle.color = minecraftColors[code];
        }
      } else if (segment) {
        // É texto normal
        currentText += segment;
      }
    });
    
    // Adicionar o último segmento de texto
    if (currentText) {
      parts.push({ text: currentText, style: { ...currentStyle } });
    }
    
    return parts;
  };

  // Função para limpar códigos de cor (para exibição simples)
  const cleanMinecraftText = (text) => {
    if (!text) return '';
    return text.replace(/§[0-9a-fklmnor]/g, '');
  };

  // Carregar grupos do servidor
  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiService.getGroups()
      
      if (response.success) {
        setGroups(response.data)
      } else {
        setError('Erro ao carregar grupos')
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error)
      setError('Erro ao carregar grupos. Verifique a conexão com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  const colorCodes = [
    { code: '§0', name: 'Preto', example: 'Texto Preto', color: '#000000' },
    { code: '§1', name: 'Azul Escuro', example: 'Texto Azul Escuro', color: '#0000AA' },
    { code: '§2', name: 'Verde Escuro', example: 'Texto Verde Escuro', color: '#00AA00' },
    { code: '§3', name: 'Ciano Escuro', example: 'Texto Ciano Escuro', color: '#00AAAA' },
    { code: '§4', name: 'Vermelho Escuro', example: 'Texto Vermelho Escuro', color: '#AA0000' },
    { code: '§5', name: 'Roxo', example: 'Texto Roxo', color: '#AA00AA' },
    { code: '§6', name: 'Dourado', example: 'Texto Dourado', color: '#FFAA00' },
    { code: '§7', name: 'Cinza', example: 'Texto Cinza', color: '#AAAAAA' },
    { code: '§8', name: 'Cinza Escuro', example: 'Texto Cinza Escuro', color: '#555555' },
    { code: '§9', name: 'Azul', example: 'Texto Azul', color: '#5555FF' },
    { code: '§a', name: 'Verde', example: 'Texto Verde', color: '#55FF55' },
    { code: '§b', name: 'Ciano', example: 'Texto Ciano', color: '#55FFFF' },
    { code: '§c', name: 'Vermelho', example: 'Texto Vermelho', color: '#FF5555' },
    { code: '§d', name: 'Rosa', example: 'Texto Rosa', color: '#FF55FF' },
    { code: '§e', name: 'Amarelo', example: 'Texto Amarelo', color: '#FFFF55' },
    { code: '§f', name: 'Branco', example: 'Texto Branco', color: '#FFFFFF' }
  ]

  const formatCodes = [
    { code: '§l', name: 'Negrito', example: 'Texto Negrito', icon: 'B' },
    { code: '§m', name: 'Riscado', example: 'Texto Riscado', icon: 'S' },
    { code: '§n', name: 'Sublinhado', example: 'Texto Sublinhado', icon: 'U' },
    { code: '§o', name: 'Itálico', example: 'Texto Itálico', icon: 'I' }
  ]

  const handleEditGroup = (group) => {
    setEditingGroup(group)
  }

  const handleSaveGroup = async () => {
    if (editingGroup) {
      try {
        const response = await apiService.updateGroup(editingGroup.id, editingGroup)
        
        if (response.success) {
          // Atualizar estado local
          setGroups(prev => 
            prev.map(group => 
              group.id === editingGroup.id ? editingGroup : group
            )
          )
          setEditingGroup(null)
        } else {
          setError('Erro ao atualizar grupo')
        }
      } catch (error) {
        console.error('Erro ao atualizar grupo:', error)
        setError('Erro ao atualizar grupo')
      }
    }
  }

  const handleCreateGroup = async () => {
    if (newGroup.internalName && newGroup.displayName) {
      try {
        const response = await apiService.createGroup(newGroup)
        
        if (response.success) {
          // Recarregar grupos
          await loadGroups()
          setNewGroup({ internalName: '', displayName: '', prefix: '', permissions: '' })
          setShowCreateModal(false)
        } else {
          setError('Erro ao criar grupo')
        }
      } catch (error) {
        console.error('Erro ao criar grupo:', error)
        setError('Erro ao criar grupo')
      }
    }
  }

  const handleDeleteGroup = async (groupId) => {
    try {
      const response = await apiService.deleteGroup(groupId)
      
      if (response.success) {
        // Recarregar grupos
        await loadGroups()
      } else {
        setError('Erro ao deletar grupo')
      }
    } catch (error) {
      console.error('Erro ao deletar grupo:', error)
      setError('Erro ao deletar grupo')
    }
  }

  if (loading) {
    return (
      <div className="groups-page fade-in">
        <div className="loading-container">
          <div className="loading-spinner-wrapper">
            <Loader2 size={48} className="loading-spinner" />
          </div>
          <h2>Carregando Grupos</h2>
          <p>Aguarde enquanto carregamos os grupos do servidor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="groups-page fade-in">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Erro ao Carregar Grupos</h2>
          <p>{error}</p>
          <button onClick={loadGroups} className="retry-button">
            <Loader2 size={16} />
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="groups-page fade-in">
      {/* Header da Página */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-title">
            <Users size={32} className="header-icon" />
            <h1>Gerenciar Grupos</h1>
          </div>
          <p className="header-subtitle">
            Gerencie os grupos de usuários do sistema com permissões e configurações personalizadas
          </p>
        </div>
        <button 
          className="create-group-button"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={20} />
          Criar Grupo
        </button>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{groups.length}</h3>
            <p>Total de Grupos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Settings size={24} />
          </div>
          <div className="stat-content">
            <h3>{groups.filter(g => g.permissions).length}</h3>
            <p>Com Permissões</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Palette size={24} />
          </div>
          <div className="stat-content">
            <h3>{groups.filter(g => g.prefix.includes('§')).length}</h3>
            <p>Com Cores</p>
          </div>
        </div>
      </div>

      {/* Barra de Ações */}
      <div className="action-bar">
        <div className="action-bar-left">
          <button 
            className="color-reference-toggle"
            onClick={() => setShowColorReference(!showColorReference)}
          >
            <Palette size={16} />
            {showColorReference ? 'Ocultar Referência de Cores' : 'Mostrar Referência de Cores'}
          </button>
        </div>
        <div className="action-bar-right">
          <span className="groups-count">
            Mostrando {groups.length} grupo{groups.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Referência de Cores */}
      {showColorReference && (
        <div className="color-reference-section">
          <div className="section-header">
            <h2>🎨 Referência de Cores Minecraft</h2>
            <p>Use estes códigos para personalizar a aparência dos grupos</p>
          </div>
          
          <div className="color-grid">
            {colorCodes.map((color) => (
              <div key={color.code} className="color-card" style={{ borderLeftColor: color.color }}>
                <div className="color-code">{color.code}</div>
                <div className="color-name">{color.name}</div>
                <div className="color-example" style={{ color: color.color }}>
                  {color.example}
                </div>
              </div>
            ))}
          </div>
          
          <div className="format-section">
            <h3>📝 Códigos de Formatação</h3>
            <div className="format-grid">
              {formatCodes.map((format) => (
                <div key={format.code} className="format-card">
                  <div className="format-code">{format.code}</div>
                  <div className="format-name">{format.name}</div>
                  <div className="format-example">
                    <span className={`format-${format.code.slice(-1)}`}>
                      {format.example}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Grupos */}
      <div className="groups-table-container">
        <div className="table-header">
          <h2>📋 Lista de Grupos</h2>
          <p>Gerencie todos os grupos do sistema</p>
        </div>
        
        <div className="table-wrapper">
          <table className="groups-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>NOME INTERNO</th>
                <th>NOME DE EXIBIÇÃO</th>
                <th>PREFIXO</th>
                <th>PERMISSÕES</th>
                <th>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr key={group.id} className="group-row">
                  <td className="group-id">{group.id}</td>
                  <td className="group-internal-name">
                    <span className="internal-name-badge">{group.internal_name}</span>
                  </td>
                  <td className="group-display-name">
                    <div className="minecraft-text-render">
                      {renderMinecraftText(group.display_name).map((part, index) => (
                        <span key={index} style={part.style}>
                          {part.text}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="group-prefix">
                    <div className="minecraft-text-render">
                      {renderMinecraftText(group.prefix).map((part, index) => (
                        <span key={index} style={part.style}>
                          {part.text}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="group-permissions">
                    {group.permissions ? (
                      <span className="permissions-badge">{group.permissions}</span>
                    ) : (
                      <span className="no-permissions">Sem permissões</span>
                    )}
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="action-button edit"
                      onClick={() => handleEditGroup(group)}
                      title="Editar Grupo"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="action-button delete"
                      onClick={() => handleDeleteGroup(group.id)}
                      title="Deletar Grupo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edição */}
      {editingGroup && (
        <div className="modal-overlay" onClick={() => setEditingGroup(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Edit size={20} />
                <h3>Editar Grupo</h3>
              </div>
              <button 
                className="close-button"
                onClick={() => setEditingGroup(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="form-row">
                <div className="form-group">
                  <label>Nome Interno:</label>
                  <input
                    type="text"
                    value={editingGroup.internal_name}
                    onChange={(e) => setEditingGroup({
                      ...editingGroup,
                      internal_name: e.target.value
                    })}
                    placeholder="Ex: Admin"
                  />
                </div>
                <div className="form-group">
                  <label>Nome de Exibição:</label>
                  <input
                    type="text"
                    value={editingGroup.display_name}
                    onChange={(e) => setEditingGroup({
                      ...editingGroup,
                      display_name: e.target.value
                    })}
                    placeholder="Ex: §4Admin"
                  />
                  <div className="input-preview">
                    <small>Preview:</small>
                    <div className="minecraft-text-render">
                      {renderMinecraftText(editingGroup.display_name).map((part, index) => (
                        <span key={index} style={part.style}>
                          {part.text}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Prefixo:</label>
                  <input
                    type="text"
                    value={editingGroup.prefix}
                    onChange={(e) => setEditingGroup({
                      ...editingGroup,
                      prefix: e.target.value
                    })}
                    placeholder="Ex: §4§lADMIN §4"
                  />
                  <div className="input-preview">
                    <small>Preview:</small>
                    <div className="minecraft-text-render">
                      {renderMinecraftText(editingGroup.prefix).map((part, index) => (
                        <span key={index} style={part.style}>
                          {part.text}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>Permissões:</label>
                  <input
                    type="text"
                    value={editingGroup.permissions || ''}
                    onChange={(e) => setEditingGroup({
                      ...editingGroup,
                      permissions: e.target.value
                    })}
                    placeholder="Ex: rank.admin"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-button"
                onClick={() => setEditingGroup(null)}
              >
                Cancelar
              </button>
              <button 
                className="save-button"
                onClick={handleSaveGroup}
              >
                <Edit size={16} />
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação */}
      {showCreateModal && (
        <>
          <div className="create-group-overlay" onClick={() => setShowCreateModal(false)} />
          <div className="create-group-panel">
            <div className="create-group-header">
              <h3>Criar Novo Grupo</h3>
              <button 
                className="close-button"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="create-group-content">
              <div className="create-group-field">
                <label>Nome Interno</label>
                <input
                  type="text"
                  placeholder="Ex: Admin"
                  value={newGroup.internalName}
                  onChange={(e) => setNewGroup({
                    ...newGroup,
                    internalName: e.target.value
                  })}
                />
              </div>
              
              <div className="create-group-field">
                <label>Nome de Exibição</label>
                <input
                  type="text"
                  placeholder="Ex: §4Admin"
                  value={newGroup.displayName}
                  onChange={(e) => setNewGroup({
                    ...newGroup,
                    displayName: e.target.value
                  })}
                />
                {newGroup.displayName && (
                  <div className="input-preview">
                    <small>Preview:</small>
                    <div className="minecraft-text-render">
                      {renderMinecraftText(newGroup.displayName).map((part, index) => (
                        <span key={index} style={part.style}>
                          {part.text}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="create-group-field">
                <label>Prefixo</label>
                <input
                  type="text"
                  placeholder="Ex: §4§lADMIN §4"
                  value={newGroup.prefix}
                  onChange={(e) => setNewGroup({
                    ...newGroup,
                    prefix: e.target.value
                  })}
                />
                {newGroup.prefix && (
                  <div className="input-preview">
                    <small>Preview:</small>
                    <div className="minecraft-text-render">
                      {renderMinecraftText(newGroup.prefix).map((part, index) => (
                        <span key={index} style={part.style}>
                          {part.text}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="create-group-field">
                <label>Permissões</label>
                <input
                  type="text"
                  placeholder="Ex: rank.admin"
                  value={newGroup.permissions}
                  onChange={(e) => setNewGroup({
                    ...newGroup,
                    permissions: e.target.value
                  })}
                />
              </div>
              
              <div className="create-group-actions">
                <button className="cancel-button" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </button>
                <button className="create-button" onClick={handleCreateGroup}>
                  <Plus size={16} />
                  Criar Grupo
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Groups 