const API_BASE_URL = 'http://localhost:5000/api'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  // Método genérico para fazer requisições
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options
    }

    try {
      const response = await fetch(url, defaultOptions)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Métodos para Jogadores
  async getPlayers(page = 1, limit = 10, search = '', group = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(group && { group })
    })
    
    return this.request(`/players?${params}`)
  }

  async getPlayer(id) {
    return this.request(`/players/${id}`)
  }

  async updatePlayerRank(id, rank) {
    return this.request(`/players/${id}/rank`, {
      method: 'PUT',
      body: JSON.stringify({ rank })
    })
  }

  async updatePlayer(id, data) {
    return this.request(`/players/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deletePlayer(id) {
    return this.request(`/players/${id}`, {
      method: 'DELETE'
    })
  }

  // Métodos para Grupos
  async getGroups() {
    return this.request('/groups')
  }

  async getGroup(id) {
    return this.request(`/groups/${id}`)
  }

  async createGroup(groupData) {
    return this.request('/groups', {
      method: 'POST',
      body: JSON.stringify(groupData)
    })
  }

  async updateGroup(id, groupData) {
    return this.request(`/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(groupData)
    })
  }

  async deleteGroup(id) {
    return this.request(`/groups/${id}`, {
      method: 'DELETE'
    })
  }

  async getAvailableRanks() {
    return this.request('/groups/available/ranks')
  }

  // Métodos para Mensagens
  async getMessages() {
    return this.request('/messages')
  }

  async getMessage(key) {
    return this.request(`/messages/${key}`)
  }

  async createMessage(messageData) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData)
    })
  }

  async updateMessage(key, messageData) {
    return this.request(`/messages/${key}`, {
      method: 'PUT',
      body: JSON.stringify(messageData)
    })
  }

  async deleteMessage(key) {
    return this.request(`/messages/${key}`, {
      method: 'DELETE'
    })
  }

  async getGameMessage(key, placeholders = {}) {
    const params = new URLSearchParams(placeholders)
    return this.request(`/messages/game/${key}?${params}`)
  }

  async getAvailableMessageKeys() {
    return this.request('/messages/available/keys')
  }

  // Verificar status da API
  async checkHealth() {
    return this.request('/health')
  }
}

// Criar instância única
const apiService = new ApiService()

export default apiService 