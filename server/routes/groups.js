import express from 'express'
import { selectQuery, executeQuery } from '../config/database.js'

const router = express.Router()

// GET - Listar todos os grupos
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        internal_name,
        display_name,
        prefix,
        visualization,
        permissions,
        created_at,
        updated_at
      FROM groups 
      ORDER BY id ASC
    `
    
    const result = await selectQuery(query)
    
    if (!result.success) {
      return res.status(500).json({ error: 'Erro ao buscar grupos' })
    }
    
    res.json({
      success: true,
      data: result.data
    })
    
  } catch (error) {
    console.error('Erro ao buscar grupos:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// GET - Buscar grupo por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const query = `
      SELECT 
        id,
        internal_name,
        display_name,
        prefix,
        visualization,
        permissions,
        created_at,
        updated_at
      FROM groups 
      WHERE id = ?
    `
    
    const result = await selectQuery(query, [id])
    
    if (!result.success) {
      return res.status(500).json({ error: 'Erro ao buscar grupo' })
    }
    
    if (result.data.length === 0) {
      return res.status(404).json({ error: 'Grupo não encontrado' })
    }
    
    res.json({
      success: true,
      data: result.data[0]
    })
    
  } catch (error) {
    console.error('Erro ao buscar grupo:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// POST - Criar novo grupo
router.post('/', async (req, res) => {
  try {
    const { internal_name, display_name, prefix, visualization, permissions } = req.body
    
    if (!internal_name || !display_name) {
      return res.status(400).json({ 
        error: 'Nome interno e nome de exibição são obrigatórios' 
      })
    }
    
    // Verificar se já existe um grupo com o mesmo nome interno
    const checkQuery = 'SELECT id FROM groups WHERE internal_name = ?'
    const checkResult = await selectQuery(checkQuery, [internal_name])
    
    if (!checkResult.success) {
      return res.status(500).json({ error: 'Erro ao verificar grupo existente' })
    }
    
    if (checkResult.data.length > 0) {
      return res.status(400).json({ error: 'Já existe um grupo com este nome interno' })
    }
    
    const insertQuery = `
      INSERT INTO groups (internal_name, display_name, prefix, visualization, permissions, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `
    
    const result = await executeQuery(insertQuery, [
      internal_name, 
      display_name, 
      prefix || '', 
      visualization || '', 
      permissions || ''
    ])
    
    if (!result.success) {
      return res.status(500).json({ error: 'Erro ao criar grupo' })
    }
    
    // Buscar o grupo criado
    const newGroupQuery = 'SELECT * FROM groups WHERE id = ?'
    const newGroupResult = await selectQuery(newGroupQuery, [result.data.insertId])
    
    res.status(201).json({
      success: true,
      message: 'Grupo criado com sucesso',
      data: newGroupResult.success ? newGroupResult.data[0] : { id: result.data.insertId }
    })
    
  } catch (error) {
    console.error('Erro ao criar grupo:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// PUT - Atualizar grupo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { internal_name, display_name, prefix, visualization, permissions } = req.body
    
    if (!internal_name || !display_name) {
      return res.status(400).json({ 
        error: 'Nome interno e nome de exibição são obrigatórios' 
      })
    }
    
    // Verificar se já existe outro grupo com o mesmo nome interno
    const checkQuery = 'SELECT id FROM groups WHERE internal_name = ? AND id != ?'
    const checkResult = await selectQuery(checkQuery, [internal_name, id])
    
    if (!checkResult.success) {
      return res.status(500).json({ error: 'Erro ao verificar grupo existente' })
    }
    
    if (checkResult.data.length > 0) {
      return res.status(400).json({ error: 'Já existe outro grupo com este nome interno' })
    }
    
    const updateQuery = `
      UPDATE groups 
      SET internal_name = ?, display_name = ?, prefix = ?, visualization = ?, permissions = ?, updated_at = NOW()
      WHERE id = ?
    `
    
    const result = await executeQuery(updateQuery, [
      internal_name, 
      display_name, 
      prefix || '', 
      visualization || '', 
      permissions || '', 
      id
    ])
    
    if (!result.success) {
      return res.status(500).json({ error: 'Erro ao atualizar grupo' })
    }
    
    if (result.data.affectedRows === 0) {
      return res.status(404).json({ error: 'Grupo não encontrado' })
    }
    
    res.json({
      success: true,
      message: 'Grupo atualizado com sucesso'
    })
    
  } catch (error) {
    console.error('Erro ao atualizar grupo:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// DELETE - Deletar grupo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // Verificar se há jogadores usando este grupo na tabela account
    const checkPlayersQuery = 'SELECT COUNT(*) as count FROM account WHERE rank = (SELECT internal_name FROM groups WHERE id = ?)'
    const checkPlayersResult = await selectQuery(checkPlayersQuery, [id])
    
    if (!checkPlayersResult.success) {
      return res.status(500).json({ error: 'Erro ao verificar jogadores' })
    }
    
    if (checkPlayersResult.data[0].count > 0) {
      return res.status(400).json({ 
        error: 'Não é possível deletar este grupo pois há jogadores usando-o' 
      })
    }
    
    const deleteQuery = 'DELETE FROM groups WHERE id = ?'
    const result = await executeQuery(deleteQuery, [id])
    
    if (!result.success) {
      return res.status(500).json({ error: 'Erro ao deletar grupo' })
    }
    
    if (result.data.affectedRows === 0) {
      return res.status(404).json({ error: 'Grupo não encontrado' })
    }
    
    res.json({
      success: true,
      message: 'Grupo deletado com sucesso'
    })
    
  } catch (error) {
    console.error('Erro ao deletar grupo:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// GET - Listar grupos disponíveis para jogadores
router.get('/available/ranks', async (req, res) => {
  try {
    const query = `
      SELECT 
        internal_name as value,
        display_name as label,
        prefix,
        visualization
      FROM groups 
      ORDER BY id ASC
    `
    
    const result = await selectQuery(query)
    
    if (!result.success) {
      return res.status(500).json({ error: 'Erro ao buscar grupos disponíveis' })
    }
    
    res.json({
      success: true,
      data: result.data
    })
    
  } catch (error) {
    console.error('Erro ao buscar grupos disponíveis:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default router 