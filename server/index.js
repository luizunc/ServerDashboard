import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { initializeDatabase, testConnection } from './config/database.js'
import playersRoutes from './routes/players.js'
import groupsRoutes from './routes/groups.js'
import messagesRoutes from './routes/messages.js'

const app = express()
const PORT = process.env.PORT || 5000

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Testar conexão com banco
app.get('/api/health', async (req, res) => {
  const isConnected = await testConnection()
  res.json({ 
    status: isConnected ? 'online' : 'offline',
    database: isConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  })
})

// Rotas
app.use('/api/players', playersRoutes)
app.use('/api/groups', groupsRoutes)
app.use('/api/messages', messagesRoutes)

// Rota padrão
app.get('/', (req, res) => {
  res.json({ 
    message: 'HYPEMC API - Dashboard Minecraft',
    version: 'v0.1',
    copyright: '©eduzp',
    endpoints: {
      health: '/api/health',
      players: '/api/players',
      groups: '/api/groups',
      messages: '/api/messages'
    }
  })
})

// Middleware de erro
app.use((err, req, res, next) => {
  console.error('Erro:', err.message)
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: err.message 
  })
})

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado' })
})

// Função para inicializar o servidor
const startServer = async () => {
  try {
    console.log('Iniciando servidor HYPEMC...')
    
    const dbInitialized = await initializeDatabase()
    
    if (dbInitialized) {
      app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`)
        console.log(`Dashboard: http://localhost:3000`)
        console.log(`API: http://localhost:${PORT}`)
        console.log('Sistema pronto para uso')
      })
    } else {
      console.error('Falha ao inicializar banco de dados')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error)
    process.exit(1)
  }
}

// Iniciar servidor
startServer() 