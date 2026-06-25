const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const db = require('./db');
const { signToken, authMiddleware } = require('./auth');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 注册
app.post('/api/auth/register', (req, res) => {
  const { username, password, building } = req.body;
  if (!username || !password || !building) {
    return res.status(400).json({ message: '请填写完整信息' });
  }
  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (exists) {
    return res.status(400).json({ message: '用户名已存在' });
  }
  const hashed = bcrypt.hashSync(password, 10);
  const result = db
    .prepare('INSERT INTO users (username, password, building) VALUES (?, ?, ?)')
    .run(username, hashed, building);
  const user = { id: result.lastInsertRowid, username, building };
  const token = signToken(user);
  res.json({ token, user });
});

// 登录
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: '请填写用户名和密码' });
  }
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: '用户名或密码错误' });
  }
  const token = signToken(user);
  res.json({
    token,
    user: { id: user.id, username: user.username, building: user.building },
  });
});

// 获取当前用户信息
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// 筛选条件：楼栋列表
app.get('/api/filters/buildings', (req, res) => {
  const rows = db
    .prepare('SELECT DISTINCT building FROM books ORDER BY building')
    .all();
  res.json({ buildings: rows.map((r) => r.building) });
});

// 筛选条件：品类列表
app.get('/api/filters/categories', (req, res) => {
  const rows = db
    .prepare('SELECT DISTINCT category FROM books ORDER BY category')
    .all();
  res.json({ categories: rows.map((r) => r.category) });
});

// 书籍列表（支持筛选）
app.get('/api/books', (req, res) => {
  const { building, category, keyword } = req.query;
  let sql = `
    SELECT b.*, u.username as owner_name
    FROM books b
    LEFT JOIN users u ON b.owner_id = u.id
    WHERE 1=1
  `;
  const params = [];
  if (building && building !== '全部') {
    sql += ' AND b.building = ?';
    params.push(building);
  }
  if (category && category !== '全部') {
    sql += ' AND b.category = ?';
    params.push(category);
  }
  if (keyword) {
    sql += ' AND (b.title LIKE ? OR b.author LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  sql += ' ORDER BY b.created_at DESC';
  const books = db.prepare(sql).all(...params);
  res.json({ books });
});

// 书籍详情
app.get('/api/books/:id', (req, res) => {
  const book = db
    .prepare(
      `
    SELECT b.*, u.username as owner_name, u.building as owner_building
    FROM books b
    LEFT JOIN users u ON b.owner_id = u.id
    WHERE b.id = ?
  `
    )
    .get(req.params.id);
  if (!book) {
    return res.status(404).json({ message: '书籍不存在' });
  }
  res.json({ book });
});

// 发布书籍
app.post('/api/books', authMiddleware, (req, res) => {
  const { title, author, condition, category, description } = req.body;
  if (!title || !author || !condition || !category) {
    return res.status(400).json({ message: '请填写必填项' });
  }
  const validConditions = ['全新', '九成新', '有划线'];
  if (!validConditions.includes(condition)) {
    return res.status(400).json({ message: '品相参数错误' });
  }
  const result = db
    .prepare(
      `INSERT INTO books (owner_id, title, author, condition, building, category, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      req.user.id,
      title,
      author,
      condition,
      req.user.building,
      category,
      description || ''
    );
  res.json({ id: result.lastInsertRowid, message: '发布成功' });
});

// 提交借阅申请
app.post('/api/borrow-requests', authMiddleware, (req, res) => {
  const { book_id, duration, handover_time } = req.body;
  if (!book_id || !duration || !handover_time) {
    return res.status(400).json({ message: '请填写完整信息' });
  }
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(book_id);
  if (!book) {
    return res.status(404).json({ message: '书籍不存在' });
  }
  if (book.owner_id === req.user.id) {
    return res.status(400).json({ message: '不能借阅自己发布的书' });
  }
  if (book.status !== '可借阅') {
    return res.status(400).json({ message: '该书当前不可借阅' });
  }
  const exists = db
    .prepare(
      `SELECT id FROM borrow_requests
       WHERE book_id = ? AND borrower_id = ? AND status IN ('待审批', '已通过')`
    )
    .get(book_id, req.user.id);
  if (exists) {
    return res.status(400).json({ message: '您已申请过借阅此书，请等待审批' });
  }
  const result = db
    .prepare(
      `INSERT INTO borrow_requests (book_id, borrower_id, duration, handover_time)
       VALUES (?, ?, ?, ?)`
    )
    .run(book_id, req.user.id, duration, handover_time);
  res.json({ id: result.lastInsertRowid, message: '申请已提交' });
});

// 我收到的借阅申请（书主）
app.get('/api/borrow-requests/received', authMiddleware, (req, res) => {
  const rows = db
    .prepare(
      `
    SELECT br.*, b.title as book_title, b.author as book_author,
           u.username as borrower_name, u.building as borrower_building
    FROM borrow_requests br
    JOIN books b ON br.book_id = b.id
    JOIN users u ON br.borrower_id = u.id
    WHERE b.owner_id = ?
    ORDER BY br.created_at DESC
  `
    )
    .all(req.user.id);
  res.json({ requests: rows });
});

// 我的借阅申请（借阅者）
app.get('/api/borrow-requests/sent', authMiddleware, (req, res) => {
  const rows = db
    .prepare(
      `
    SELECT br.*, b.title as book_title, b.author as book_author,
           u.username as owner_name, u.building as owner_building
    FROM borrow_requests br
    JOIN books b ON br.book_id = b.id
    JOIN users u ON b.owner_id = u.id
    WHERE br.borrower_id = ?
    ORDER BY br.created_at DESC
  `
    )
    .all(req.user.id);
  res.json({ requests: rows });
});

// 审批申请（通过/拒绝）
app.post('/api/borrow-requests/:id/approve', authMiddleware, (req, res) => {
  const reqRow = db
    .prepare(
      `SELECT br.*, b.owner_id FROM borrow_requests br
       JOIN books b ON br.book_id = b.id WHERE br.id = ?`
    )
    .get(req.params.id);
  if (!reqRow) {
    return res.status(404).json({ message: '申请不存在' });
  }
  if (reqRow.owner_id !== req.user.id) {
    return res.status(403).json({ message: '无权审批此申请' });
  }
  if (reqRow.status !== '待审批') {
    return res.status(400).json({ message: '此申请已处理过' });
  }
  db.prepare("UPDATE borrow_requests SET status = '已通过' WHERE id = ?").run(
    req.params.id
  );
  db.prepare("UPDATE books SET status = '借出中' WHERE id = ?").run(
    reqRow.book_id
  );
  // 拒绝该书籍的其他待审批申请
  db.prepare(
    "UPDATE borrow_requests SET status = '已拒绝' WHERE book_id = ? AND id != ? AND status = '待审批'"
  ).run(reqRow.book_id, req.params.id);
  res.json({ message: '已通过申请' });
});

app.post('/api/borrow-requests/:id/reject', authMiddleware, (req, res) => {
  const reqRow = db
    .prepare(
      `SELECT br.*, b.owner_id FROM borrow_requests br
       JOIN books b ON br.book_id = b.id WHERE br.id = ?`
    )
    .get(req.params.id);
  if (!reqRow) {
    return res.status(404).json({ message: '申请不存在' });
  }
  if (reqRow.owner_id !== req.user.id) {
    return res.status(403).json({ message: '无权审批此申请' });
  }
  if (reqRow.status !== '待审批') {
    return res.status(400).json({ message: '此申请已处理过' });
  }
  db.prepare("UPDATE borrow_requests SET status = '已拒绝' WHERE id = ?").run(
    req.params.id
  );
  res.json({ message: '已拒绝申请' });
});

// 确认归还
app.post('/api/borrow-requests/:id/return', authMiddleware, (req, res) => {
  const reqRow = db
    .prepare(
      `SELECT br.*, b.owner_id FROM borrow_requests br
       JOIN books b ON br.book_id = b.id WHERE br.id = ?`
    )
    .get(req.params.id);
  if (!reqRow) {
    return res.status(404).json({ message: '申请不存在' });
  }
  if (reqRow.owner_id !== req.user.id && reqRow.borrower_id !== req.user.id) {
    return res.status(403).json({ message: '无权操作' });
  }
  if (reqRow.status !== '已通过') {
    return res.status(400).json({ message: '当前状态不能确认归还' });
  }
  db.prepare("UPDATE borrow_requests SET status = '已归还' WHERE id = ?").run(
    req.params.id
  );
  db.prepare("UPDATE books SET status = '可借阅' WHERE id = ?").run(
    reqRow.book_id
  );
  res.json({ message: '已确认归还' });
});

// 静态文件：前端构建产物
const distPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`🚀 服务已启动: http://localhost:${PORT}`);
});
