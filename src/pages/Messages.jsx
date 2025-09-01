import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, X, Eye, Loader2 } from 'lucide-react'
import apiService from '../services/api'
import './Messages.css'

const Messages = () => {
  const [messages, setMessages] = useState([])
  const [editingMessage, setEditingMessage] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewMessage, setPreviewMessage] = useState('')
  const [newMessage, setNewMessage] = useState({
    message_key: '',
    content: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [notifications, setNotifications] = useState([])

  // Carregar mensagens do backend
  useEffect(() => {
    loadMessages()
  }, [])

  // Sistema de notificações
  const showNotification = (message, type = 'success') => {
    const id = Date.now()
    const notification = { id, message, type }
    
    setNotifications(prev => [...prev, notification])
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const loadMessages = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getMessages()
      
      if (response.success) {
        setMessages(response.data)
      } else {
        setError('Erro ao carregar mensagens')
        showNotification('Erro ao carregar mensagens', 'error')
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
      setError('Erro ao carregar mensagens: ' + error.message)
      showNotification('Erro ao carregar mensagens: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleEditMessage = (message) => {
    setEditingMessage({
      message_key: message.message_key,
      content: message.content,
      description: message.description || ''
    })
  }

  const handleSaveMessage = async () => {
    if (!editingMessage) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await apiService.updateMessage(editingMessage.message_key, {
        content: editingMessage.content,
        description: editingMessage.description
      })
      
      if (response.success) {
        // Atualizar a lista local com a mensagem editada
        setMessages(prev => 
          prev.map(message => 
            message.message_key === editingMessage.message_key 
              ? { ...message, content: editingMessage.content, description: editingMessage.description }
              : message
          )
        )
        setEditingMessage(null)
        showNotification('Mensagem atualizada com sucesso!', 'success')
      } else {
        setError('Erro ao atualizar mensagem')
        showNotification('Erro ao atualizar mensagem', 'error')
      }
    } catch (error) {
      console.error('Erro ao atualizar mensagem:', error)
      setError('Erro ao atualizar mensagem: ' + error.message)
      showNotification('Erro ao atualizar mensagem: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMessage = async () => {
    if (!newMessage.message_key || !newMessage.content) {
      setError('Chave e conteúdo são obrigatórios')
      showNotification('Chave e conteúdo são obrigatórios', 'warning')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await apiService.createMessage({
        message_key: newMessage.message_key,
        content: newMessage.content,
        description: newMessage.description
      })
      
      if (response.success) {
        // Adicionar a nova mensagem à lista
        setMessages(prev => [...prev, response.data])
        setNewMessage({ message_key: '', content: '', description: '' })
        setShowCreateModal(false)
        showNotification('Mensagem criada com sucesso!', 'success')
      } else {
        setError('Erro ao criar mensagem')
        showNotification('Erro ao criar mensagem', 'error')
      }
    } catch (error) {
      console.error('Erro ao criar mensagem:', error)
      setError('Erro ao criar mensagem: ' + error.message)
      showNotification('Erro ao criar mensagem: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMessage = async (messageKey) => {
    if (!confirm('Tem certeza que deseja excluir esta mensagem?')) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await apiService.deleteMessage(messageKey)
      
      if (response.success) {
        // Remover a mensagem da lista local
        setMessages(prev => prev.filter(message => message.message_key !== messageKey))
        showNotification('Mensagem excluída com sucesso!', 'success')
      } else {
        setError('Erro ao excluir mensagem')
        showNotification('Erro ao excluir mensagem', 'error')
      }
    } catch (error) {
      console.error('Erro ao excluir mensagem:', error)
      setError('Erro ao excluir mensagem: ' + error.message)
      showNotification('Erro ao excluir mensagem: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePreviewMessage = (content) => {
    setPreviewMessage(content)
    setShowPreviewModal(true)
  }

  const renderMinecraftText = (text) => {
    // Simulação básica de renderização Minecraft
    let result = text
    
    // Aplicar cores
    result = result.replace(/&0/g, '<span style="color: #000000">')
    result = result.replace(/&1/g, '<span style="color: #0000AA">')
    result = result.replace(/&2/g, '<span style="color: #00AA00">')
    result = result.replace(/&3/g, '<span style="color: #00AAAA">')
    result = result.replace(/&4/g, '<span style="color: #AA0000">')
    result = result.replace(/&5/g, '<span style="color: #AA00AA">')
    result = result.replace(/&6/g, '<span style="color: #FFAA00">')
    result = result.replace(/&7/g, '<span style="color: #AAAAAA">')
    result = result.replace(/&8/g, '<span style="color: #555555">')
    result = result.replace(/&9/g, '<span style="color: #5555FF">')
    result = result.replace(/&a/g, '<span style="color: #55FF55">')
    result = result.replace(/&b/g, '<span style="color: #55FFFF">')
    result = result.replace(/&c/g, '<span style="color: #FF5555">')
    result = result.replace(/&d/g, '<span style="color: #FF55FF">')
    result = result.replace(/&e/g, '<span style="color: #FFFF55">')
    result = result.replace(/&f/g, '<span style="color: #FFFFFF">')
    
    // Aplicar formatação
    result = result.replace(/&l/g, '<strong>')
    result = result.replace(/&m/g, '<span style="text-decoration: line-through">')
    result = result.replace(/&n/g, '<span style="text-decoration: underline">')
    result = result.replace(/&o/g, '<em>')
    
    // Fechar tags
    result = result.replace(/(<span[^>]*>)/g, '$1')
    result = result.replace(/(<strong>)/g, '$1')
    result = result.replace(/(<em>)/g, '$1')
    
    // Adicionar fechamento para cada tag aberta
    const openTags = (result.match(/<[^>]*>/g) || []).length
    const closeTags = (result.match(/<\/[^>]*>/g) || []).length
    
    if (openTags > closeTags) {
      const diff = openTags - closeTags
      for (let i = 0; i < diff; i++) {
        result += '</span>'
      }
    }
    
    // Quebras de linha
    result = result.replace(/\n/g, '<br>')
    
    return result
  }

  return (
    <div className="messages-page fade-in">
      <div className="page-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Gerenciar Mensagens</h1>
          </div>
          <p className="header-subtitle">
            Gerencie as mensagens do sistema. Você pode criar, editar e excluir mensagens conforme necessário.
          </p>
        </div>
        <button 
          className="create-message-button"
          onClick={() => {
            console.log('Create Message Button Clicked!')
            setShowCreateModal(true)
          }}
        >
          <Plus size={20} />
          Criar Mensagem
        </button>
      </div>

      {/* Tabela de Mensagens */}
      <div className="messages-table-container">
        <table className="messages-table">
          <thead>
            <tr>
              <th>CHAVE</th>
              <th>CONTEÚDO</th>
              <th>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="loading-message">
                  <Loader2 className="loader-icon" />
                  Carregando mensagens...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="3" className="error-message">
                  {error}
                </td>
              </tr>
            ) : messages.length === 0 ? (
              <tr>
                <td colSpan="3" className="no-messages-message">
                  Nenhuma mensagem encontrada.
                </td>
              </tr>
            ) : (
              messages.map((message) => (
                <tr key={message.message_key}>
                  <td className="message-key">
                    <span className="key-tag">{message.message_key}</span>
                  </td>
                  <td className="message-content">
                    <div className="content-preview">
                      {message.content.length > 100 
                        ? `${message.content.substring(0, 100)}...` 
                        : message.content
                      }
                    </div>
                  </td>
                  <td className="message-actions">
                    <button 
                      className="action-button preview"
                      onClick={() => handlePreviewMessage(message.content)}
                      title="Visualizar no Minecraft"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      className="action-button edit"
                      onClick={() => handleEditMessage(message)}
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="action-button delete"
                      onClick={() => handleDeleteMessage(message.message_key)}
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Edição */}
      {editingMessage && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Editar Mensagem</h3>
              <button 
                className="close-button"
                onClick={() => setEditingMessage(null)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-field">
                <label>Chave</label>
                <input
                  type="text"
                  value={editingMessage.message_key}
                  onChange={(e) => setEditingMessage({
                    ...editingMessage,
                    message_key: e.target.value
                  })}
                  disabled
                />
                <small>ID da coluna MySQL</small>
              </div>
              
              <div className="form-field">
                <label>Descrição</label>
                <input
                  type="text"
                  value={editingMessage.description}
                  onChange={(e) => setEditingMessage({
                    ...editingMessage,
                    description: e.target.value
                  })}
                  placeholder="Descrição da mensagem..."
                />
                <small>Descrição opcional para organização</small>
              </div>
              
              <div className="form-field">
                <label>Conteúdo</label>
                <textarea
                  value={editingMessage.content}
                  onChange={(e) => setEditingMessage({
                    ...editingMessage,
                    content: e.target.value
                  })}
                  rows={4}
                  placeholder="Digite o conteúdo da mensagem..."
                />
                <small>
                  Use &0-&f para cores e &l, &m, &n, &o para formatação.
                </small>
              </div>
              
              <div className="minecraft-preview">
                <label>Visualização no Minecraft</label>
                <div className="preview-box">
                  <div 
                    className="minecraft-text"
                    dangerouslySetInnerHTML={{ 
                      __html: renderMinecraftText(editingMessage.content) 
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="cancel-button" onClick={() => setEditingMessage(null)}>
                Cancelar
              </button>
              <button 
                className="save-button" 
                onClick={handleSaveMessage}
                disabled={loading}
              >
                {loading ? <Loader2 className="loader-icon" /> : null}
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Criar Nova Mensagem</h3>
              <button 
                className="close-button"
                onClick={() => setShowCreateModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-field">
                <label>Chave</label>
                <input
                  type="text"
                  placeholder="Ex: welcome_message"
                  value={newMessage.message_key}
                  onChange={(e) => setNewMessage({
                    ...newMessage,
                    message_key: e.target.value
                  })}
                />
                <small>ID da coluna MySQL</small>
              </div>
              
              <div className="form-field">
                <label>Descrição</label>
                <input
                  type="text"
                  placeholder="Descrição da mensagem..."
                  value={newMessage.description}
                  onChange={(e) => setNewMessage({
                    ...newMessage,
                    description: e.target.value
                  })}
                />
                <small>Descrição opcional para organização</small>
              </div>
              
              <div className="form-field">
                <label>Conteúdo</label>
                <textarea
                  placeholder="Digite o conteúdo da mensagem..."
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({
                    ...newMessage,
                    content: e.target.value
                  })}
                  rows={4}
                />
                <small>
                  Use &0-&f para cores e &l, &m, &n, &o para formatação.
                </small>
              </div>
              
              {newMessage.content && (
                <div className="minecraft-preview">
                  <label>Visualização no Minecraft</label>
                  <div className="preview-box">
                    <div 
                      className="minecraft-text"
                      dangerouslySetInnerHTML={{ 
                        __html: renderMinecraftText(newMessage.content) 
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-actions">
              <button className="cancel-button" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </button>
              <button 
                className="save-button" 
                onClick={handleCreateMessage}
                disabled={loading}
              >
                {loading ? <Loader2 className="loader-icon" /> : null}
                {loading ? 'Criando...' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {showPreviewModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Visualização da Mensagem no Minecraft</h3>
              <button 
                className="close-button"
                onClick={() => setShowPreviewModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="preview-section">
                <label>Código da Mensagem</label>
                <div className="code-box">
                  <code>{previewMessage}</code>
                </div>
              </div>
              
              <div className="preview-section">
                <label>Visualização</label>
                <div className="minecraft-preview-box">
                  <div 
                    className="minecraft-text"
                    dangerouslySetInnerHTML={{ 
                      __html: renderMinecraftText(previewMessage) 
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="close-button-full" onClick={() => setShowPreviewModal(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sistema de Notificações */}
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

export default Messages 