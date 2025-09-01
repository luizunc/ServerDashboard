import express from 'express'
import { selectQuery, executeQuery } from '../config/database.js'

const router = express.Router()

// GET - Listar todos os jogadores
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', group = '' } = req.query
    const offset = (page - 1) * limit
    
    let whereClause = 'WHERE 1=1'
    let params = []
    
    if (search) {
      whereClause += ' AND (name LIKE ? OR CAST(created AS CHAR) LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }
    
    if (group) {
      whereClause += ' AND rank = ?'
      params.push(group)
    }
    
    // Query para contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM account ${whereClause}`
    const countResult = await selectQuery(countQuery, params)
    
    if (!countResult.success) {
      return res.status(500).json({ error: 'Erro ao contar jogadores' })
    }
    
    const total = countResult.data[0].total
    
    // Query para buscar jogadores da tabela account
    const playersQuery = `
      SELECT 
        created as id, 
        name, 
        rank, 
        tag,
        lastlogin as last_login,
        created as created_at
      FROM account 
      ${whereClause}
      ORDER BY lastlogin DESC 
      LIMIT ? OFFSET ?
    `
    
    params.push(parseInt(limit), offset)
    const playersResult = await selectQuery(playersQuery, params)
    
    if (!playersResult.success) {
      return res.status(500).json({ error: 'Erro ao buscar jogadores' })
    }
    
    // Buscar grupos disponíveis
    const groupsQuery = 'SELECT DISTINCT rank FROM account WHERE rank IS NOT NULL ORDER BY rank'
    const groupsResult = await selectQuery(groupsQuery)
    
    res.json({
      success: true,
      data: {
        players: playersResult.data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        groups: groupsResult.success ? groupsResult.data.map(g => g.rank) : []
      }
    })
    
  } catch (error) {
    console.error('Erro ao buscar jogadores:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// GET - Buscar jogador por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const query = `
      SELECT 
        created as id, 
        name, 
        rank, 
        lastlogin as last_login,
        created as created_at
      FROM account 
      WHERE created = ?
    `
    
    const result = await selectQuery(query, [id])
    
    if (!result.success) {
      return res.status(500).json({ error: 'Erro ao buscar jogador' })
    }
    
    if (result.data.length === 0) {
      return res.status(404).json({ error: 'Jogador não encontrado' })
    }
    
    res.json({
      success: true,
      data: result.data[0]
    })
    
  } catch (error) {
    console.error('Erro ao buscar jogador:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// PUT - Atualizar grupo/rank e tag do jogador
router.put('/:id/rank', async (req, res) => {
  try {
    const { id } = req.params // id = UUID do jogador
    const { rank } = req.body
    
    if (!rank) {
      return res.status(400).json({ error: 'Rank é obrigatório' })
    }
    
    // Para ranks como Iron, Gold, Emerald, etc., salvar tanto em rank quanto em tag
    const rankList = ['Iron', 'Gold', 'Emerald', 'Beta', 'Apoiador', 'Partner', 'Partner+', 'Helper', 'Builder', 'Mod', 'Mod+', 'Admin']
    
    let finalRank = rank
    let finalTag = ''
    
    // Se é um rank da lista, salvar também como tag
    if (rankList.includes(rank)) {
      finalRank = rank
      finalTag = rank // Salvar o mesmo valor em tag
    } else {
      // Buscar informações do grupo na tabela groups
      const groupQuery = 'SELECT internal_name, prefix, permissions FROM groups WHERE internal_name = ?'
      const groupResult = await selectQuery(groupQuery, [rank])
      
      if (groupResult.success && groupResult.data.length > 0) {
        const group = groupResult.data[0]
        
        // Se é uma tag especial (permissão começa com 'tag.'), atualizar apenas a tag
        if (group.permissions && group.permissions.startsWith('tag.')) {
          // É uma tag especial, manter o rank atual e definir a tag
          const currentPlayerQuery = 'SELECT rank FROM account WHERE created = ?'
          const currentPlayerResult = await selectQuery(currentPlayerQuery, [id])
          
          if (currentPlayerResult.success && currentPlayerResult.data.length > 0) {
            finalRank = currentPlayerResult.data[0].rank || 'Membro'
          } else {
            finalRank = 'Membro'
          }
          
          finalTag = group.prefix || group.internal_name
        } else {
          // É um rank normal, definir rank e tag
          finalRank = group.internal_name
          finalTag = group.internal_name // Salvar também como tag
        }
      } else {
        // Grupo não encontrado na tabela groups, apenas atualizar rank
        finalRank = rank
        finalTag = rank // Salvar também como tag
      }
    }
    
    // Atualizar tanto rank quanto tag
    const query = 'UPDATE account SET rank = ?, tag = ? WHERE created = ?'
    const result = await executeQuery(query, [finalRank, finalTag, id])
    
    if (!result.success) {
      return res.status(500).json({ error: 'Erro ao atualizar rank e tag' })
    }
    
    if (result.data.affectedRows === 0) {
      return res.status(404).json({ error: 'Jogador não encontrado' })
    }
    
    res.json({
      success: true,
      message: 'Rank e tag atualizados com sucesso',
      data: { id, rank: finalRank, tag: finalTag }
    })
    
  } catch (error) {
    console.error('Erro ao atualizar rank e tag:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// PUT - Atualizar jogador
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, rank } = req.body
    
    const updateFields = []
    const params = []
    
    if (name !== undefined) {
      updateFields.push('name = ?')
      params.push(name)
    }
    
    if (rank !== undefined) {
      updateFields.push('rank = ?')
      params.push(rank)
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' })
    }
    
    params.push(id)
    const query = `UPDATE account SET ${updateFields.join(', ')} WHERE created = ?`
    const result = await executeQuery(query, params)
    
    if (!result.success) {
      return res.status(500).json({ error: 'Erro ao atualizar jogador' })
    }
    
    if (result.data.affectedRows === 0) {
      return res.status(404).json({ error: 'Jogador não encontrado' })
    }
    
    res.json({
      success: true,
      message: 'Jogador atualizado com sucesso'
    })
    
  } catch (error) {
    console.error('Erro ao atualizar jogador:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// DELETE - Deletar jogador
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const query = 'DELETE FROM account WHERE created = ?'
    const result = await executeQuery(query, [id])
    
    if (!result.success) {
      return res.status(500).json({ error: 'Erro ao deletar jogador' })
    }
    
    if (result.data.affectedRows === 0) {
      return res.status(404).json({ error: 'Jogador não encontrado' })
    }
    
    res.json({
      success: true,
      message: 'Jogador deletado com sucesso'
    })
    
  } catch (error) {
    console.error('Erro ao deletar jogador:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default router 