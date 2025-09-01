import express from 'express'
import { selectQuery, executeQuery } from '../config/database.js'

const router = express.Router()

// GET - Listar todas as mensagens
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        message_key,
        content,
        description,
        created_at,
        updated_at
      FROM messages 
      ORDER BY message_key ASC
    `
    
    const result = await selectQuery(query)
    
    if (!result.success) {
      return res.status(500).json({ error: 'Erro ao buscar mensagens' })
    }
    
    res.json({
      success: true,
      data: result.data
    })
    
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// GET - Buscar mensagem por chave
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params
    
    const query = `
      SELECT 
        id,
        message_key,
        content,
        description,
        created_at,
        updated_at
      FROM messages 
      WHERE message_key = ?
    `
    
    const result = await selectQuery(query, [key])
    
    if (!result.success) {
      return res.status(500).json({ error: 'Erro ao buscar mensagem' })
    }
    
    if (result.data.length === 0) {
      return res.status(404).json({ error: 'Mensagem não encontrada' })
    }
    
    res.json({
      success: true,
      data: result.data[0]
    })
    
  } catch (error) {
    console.error('Erro ao buscar mensagem:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// POST - Criar nova mensagem
router.post('/', async (req, res) => {
  try {
    const { message_key, content, description } = req.body
    
    if (!message_key || !content) {
      return res.status(400).json({ 
        error: 'Chave da mensagem e conteúdo são obrigatórios' 
      })
    }
    
    // Verificar se já existe uma mensagem com a mesma chave
    const checkQuery = 'SELECT id FROM messages WHERE message_key = ?'
    const checkResult = await selectQuery(checkQuery, [message_key])
    
    if (!checkResult.success) {
      return res.status(500).json({ error: 'Erro ao verificar mensagem existente' })
    }
    
    if (checkResult.data.length > 0) {
      return res.status(400).json({ error: 'Já existe uma mensagem com esta chave' })
    }
    
    const insertQuery = `
      INSERT INTO messages (message_key, content, description, created_at, updated_at)
      VALUES (?, ?, ?, NOW(), NOW())
    `
    
    const result = await executeQuery(insertQuery, [
      message_key, 
      content, 
      description || ''
    ])
    
    if (!result.success) {
      return res.status(500).json({ error: 'Erro ao criar mensagem' })
    }
    
    // Buscar a mensagem criada
    const newMessageQuery = 'SELECT * FROM messages WHERE id = ?'
    const newMessageResult = await selectQuery(newMessageQuery, [result.data.insertId])
    
    res.status(201).json({
      success: true,
      message: 'Mensagem criada com sucesso',
      data: newMessageResult.success ? newMessageResult.data[0] : { id: result.data.insertId }
    })
    
  } catch (error) {
    console.error('Erro ao criar mensagem:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// PUT - Atualizar mensagem
router.put('/:key', async (req, res) => {
  try {
    const { key } = req.params
    const { content, description } = req.body
    
    if (!content) {
      return res.status(400).json({ error: 'Conteúdo é obrigatório' })
    }
    
    const updateQuery = `
      UPDATE messages 
      SET content = ?, description = ?, updated_at = NOW()
      WHERE message_key = ?
    `
    
    const result = await executeQuery(updateQuery, [content, description || '', key])
    
    if (!result.success) {
      return res.status(500).json({ error: 'Erro ao atualizar mensagem' })
    }
    
    if (result.data.affectedRows === 0) {
      return res.status(404).json({ error: 'Mensagem não encontrada' })
    }
    
    res.json({
      success: true,
      message: 'Mensagem atualizada com sucesso'
    })
    
  } catch (error) {
    console.error('Erro ao atualizar mensagem:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// DELETE - Deletar mensagem
router.delete('/:key', async (req, res) => {
  try {
    const { key } = req.params
    
    const deleteQuery = 'DELETE FROM messages WHERE message_key = ?'
    const result = await executeQuery(deleteQuery, [key])
    
    if (!result.success) {
      return res.status(500).json({ error: 'Erro ao deletar mensagem' })
    }
    
    if (result.data.affectedRows === 0) {
      return res.status(404).json({ error: 'Mensagem não encontrada' })
    }
    
    res.json({
      success: true,
      message: 'Mensagem deletada com sucesso'
    })
    
  } catch (error) {
    console.error('Erro ao deletar mensagem:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// GET - Buscar mensagem por chave (para uso em jogos)
router.get('/game/:key', async (req, res) => {
  try {
    const { key } = req.params
    const { player_name, rank, ...placeholders } = req.query
    
    const query = `
      SELECT 
        message_key,
        content
      FROM messages 
      WHERE message_key = ?
    `
    
    const result = await selectQuery(query, [key])
    
    if (!result.success) {
      return res.status(500).json({ error: 'Erro ao buscar mensagem' })
    }
    
    if (result.data.length === 0) {
      return res.status(404).json({ error: 'Mensagem não encontrada' })
    }
    
    let content = result.data[0].content
    
    // Substituir placeholders
    if (player_name) {
      content = content.replace(/%%s/g, player_name)
    }
    
    if (rank) {
      content = content.replace(/{rank}/g, rank)
    }
    
    // Substituir placeholders numéricos {0}, {1}, etc.
    Object.keys(placeholders).forEach((key, index) => {
      content = content.replace(new RegExp(`\\{${index}\\}`, 'g'), placeholders[key])
    })
    
    res.json({
      success: true,
      data: {
        message_key: key,
        content: content,
        original_content: result.data[0].content
      }
    })
    
  } catch (error) {
    console.error('Erro ao buscar mensagem do jogo:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// GET - Listar chaves de mensagens disponíveis
router.get('/available/keys', async (req, res) => {
  try {
    const query = `
      SELECT 
        message_key as key,
        description
      FROM messages 
      ORDER BY message_key ASC
    `
    
    const result = await selectQuery(query)
    
    if (!result.success) {
      return res.status(500).json({ error: 'Erro ao buscar chaves disponíveis' })
    }
    
    res.json({
      success: true,
      data: result.data
    })
    
  } catch (error) {
    console.error('Erro ao buscar chaves disponíveis:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default router 