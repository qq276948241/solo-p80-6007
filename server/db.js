const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'books.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    building TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    condition TEXT NOT NULL CHECK(condition IN ('全新', '九成新', '有划线')),
    building TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT '可借阅' CHECK(status IN ('可借阅', '借出中')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS borrow_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    borrower_id INTEGER NOT NULL,
    duration TEXT NOT NULL,
    handover_time TEXT NOT NULL,
    status TEXT DEFAULT '待审批' CHECK(status IN ('待审批', '已通过', '已归还', '已拒绝')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id),
    FOREIGN KEY (borrower_id) REFERENCES users(id)
  );
`);

const categories = db.prepare('SELECT COUNT(*) as count FROM books').get();
if (categories.count === 0) {
  const insertUser = db.prepare('INSERT INTO users (username, password, building) VALUES (?, ?, ?)');
  const bcrypt = require('bcryptjs');
  const hashed = bcrypt.hashSync('123456', 10);
  const u1 = insertUser.run('demo1', hashed, '1号楼').lastInsertRowid;
  const u2 = insertUser.run('demo2', hashed, '2号楼').lastInsertRowid;
  const u3 = insertUser.run('demo3', hashed, '3号楼').lastInsertRowid;

  const insertBook = db.prepare(`
    INSERT INTO books (owner_id, title, author, condition, building, category, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertBook.run(u1, '百年孤独', '加西亚·马尔克斯', '九成新', '1号楼', '文学', '经典魔幻现实主义小说');
  insertBook.run(u1, '活着', '余华', '有划线', '1号楼', '文学', '余华代表作');
  insertBook.run(u2, '人类简史', '尤瓦尔·赫拉利', '全新', '2号楼', '历史', '从认知革命到科学革命');
  insertBook.run(u2, '思考，快与慢', '丹尼尔·卡尼曼', '九成新', '2号楼', '心理学', '行为经济学经典');
  insertBook.run(u3, '三体', '刘慈欣', '九成新', '3号楼', '科幻', '雨果奖获奖作品');
  insertBook.run(u3, '小王子', '圣埃克苏佩里', '全新', '3号楼', '文学', '给大人看的童话');
}

module.exports = db;
