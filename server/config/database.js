import mysql from 'mysql2/promise'

// Configuração do banco
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'server',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

// Pool de conexões
const pool = mysql.createPool(dbConfig)

// Schema das tabelas auxiliares
const createGroupsTable = `
CREATE TABLE IF NOT EXISTS \`groups\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`internal_name\` varchar(32) NOT NULL,
  \`display_name\` varchar(64) NOT NULL,
  \`prefix\` varchar(64) DEFAULT NULL,
  \`visualization\` varchar(64) DEFAULT NULL,
  \`permissions\` text DEFAULT NULL,
  \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`internal_name\` (\`internal_name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`

const createMessagesTable = `
CREATE TABLE IF NOT EXISTS \`messages\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`message_key\` varchar(64) NOT NULL,
  \`content\` text NOT NULL,
  \`description\` varchar(255) DEFAULT NULL,
  \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`message_key\` (\`message_key\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`

// Grupos reais do servidor (ranks e tags)
const initialGroups = `
INSERT IGNORE INTO \`groups\` (\`internal_name\`, \`display_name\`, \`prefix\`, \`visualization\`, \`permissions\`) VALUES
('Admin', '§4Admin', '§4§lADMIN §4', 'Admin', 'rank.admin'),
('Mod+', '§5Mod+', '§5§lMOD+§5 ', 'Mod+', 'rank.mod+'),
('Mod', '§5Mod', '§5§lMOD§5 ', 'Mod', 'rank.mod'),
('Helper', '§9Helper', '§9§lHELPER§9 ', 'Helper', 'rank.helper'),
('Builder', '§2Builder', '§2§lBUILDER§2 ', 'Builder', 'rank.builder'),
('Beta', '§1Beta', '§1§lBETA§1 ', 'Beta', 'rank.beta'),
('Partner+', '§3Partner+', '§3§lPARTNER+§3 ', 'Partner+', 'rank.partner+'),
('Partner', '§bPartner', '§b§lPARTNER§b ', 'Partner', 'rank.partner'),
('Emerald', '§2Emerald', '§2§lEMERALD §2', 'Emerald', 'rank.emerald'),
('Gold', '§6Gold', '§6§lGOLD §6', 'Gold', 'rank.gold'),
('Iron', '§fIron', '§f§lIRON §f', 'Iron', 'rank.iron'),
('Apoiador', '§9Apoiador', '§9§lAPOIADOR §9', 'Apoiador', 'rank.apoiador'),
('Membro', '§7Membro', '§7', 'Membro', '')
`

// Sem mensagens predefinidas - o usuário criará todas as mensagens
const initialMessages = ``

// Verificar e criar estrutura da tabela account
const checkAndCreateAccountStructure = async (connection) => {
  try {
    const [rows] = await connection.execute(`
      SELECT COLUMN_NAME FROM information_schema.columns 
      WHERE table_schema = ? AND table_name = 'account'
    `, [dbConfig.database])
    
    const columns = rows.map(row => row.COLUMN_NAME.toLowerCase())
    const required = ['name', 'created', 'rank', 'lastlogin']
    
    const missing = required.filter(col => !columns.includes(col))
    
    if (missing.length > 0) {
      console.log('Colunas faltando:', missing.join(', '))
      return false
    }
    
    // Verificar se a coluna tag existe, se não, criar
    if (!columns.includes('tag')) {
      console.log('Criando coluna tag na tabela account...')
      await connection.execute(`
        ALTER TABLE account ADD COLUMN tag VARCHAR(64) DEFAULT NULL
      `)
      console.log('Coluna tag criada com sucesso')
    }
    
    return true
  } catch (error) {
    console.error('Erro ao verificar estrutura:', error.message)
    return false
  }
}

// Limpar grupos antigos e inserir apenas os novos
const updateGroups = async (connection) => {
  try {
    await connection.execute('DELETE FROM `groups`')
    await connection.execute(initialGroups)
    console.log('Grupos atualizados')
    return true
  } catch (error) {
    console.log('Erro ao atualizar grupos:', error.message)
    return false
  }
}

// Criar tabelas auxiliares
const createAuxiliaryTables = async (connection) => {
  try {
    await connection.execute(createGroupsTable)
    await connection.execute(createMessagesTable)
    await updateGroups(connection)
    
    // Verificar e criar estrutura da tabela account
    await checkAndCreateAccountStructure(connection)
    
    await connection.execute('CREATE INDEX IF NOT EXISTS `idx_account_rank` ON `account` (`rank`)')
    await connection.execute('CREATE INDEX IF NOT EXISTS `idx_account_lastlogin` ON `account` (`lastlogin`)')
    await connection.execute('CREATE INDEX IF NOT EXISTS `idx_account_tag` ON `account` (`tag`)')
    console.log('Sistema configurado')
    return true
  } catch (error) {
    console.log('Erro ao criar tabelas:', error.message)
    return false
  }
}

// Inicializar banco de dados
export const initializeDatabase = async () => {
  try {
    console.log('Inicializando banco de dados...')
    console.log(`Conectando: ${dbConfig.host}:${dbConfig.port} | ${dbConfig.database}`)
    
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database
    })
    
    console.log('Conexão estabelecida')
    
    const [tables] = await connection.execute(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = ? AND table_name = 'account'
    `, [dbConfig.database])
    
    if (tables[0].count === 0) {
      console.log('Tabela account não encontrada')
      connection.end()
      return false
    }
    
    if (!(await checkAndCreateAccountStructure(connection))) {
      console.log('Estrutura da tabela account inválida')
      connection.end()
      return false
    }
    
    await createAuxiliaryTables(connection)
    connection.end()
    
    console.log('Banco inicializado com sucesso')
    return true
    
  } catch (error) {
    console.error('Erro ao inicializar:', error.message)
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('Verifique usuário/senha e permissões')
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('Verifique se o banco existe')
    }
    
    return false
  }
}

// Testar conexão
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection()
    connection.release()
    return true
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message)
    return false
  }
}

// Executar queries
export const executeQuery = async (query, params = []) => {
  try {
    const [rows] = await pool.execute(query, params)
    return { success: true, data: rows }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Executar queries de seleção
export const selectQuery = async (query, params = []) => {
  try {
    const [rows] = await pool.query(query, params)
    return { success: true, data: rows }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export default pool 