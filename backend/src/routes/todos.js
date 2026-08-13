const router = require('express').Router();
const db = require('../db/client');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// ─── GET /api/todos — user's own todos only ─────────────────
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id; // enforced — never from query/body

    const { search, priority, completed, sort } = req.query;
    let q = `SELECT * FROM todos WHERE user_id = $1`;
    const params = [userId];
    let idx = 2;

    if (search) {
      q += ` AND (title ILIKE $${idx} OR description ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    if (priority) {
      q += ` AND priority = $${idx}`;
      params.push(priority.toUpperCase());
      idx++;
    }
    if (completed !== undefined) {
      q += ` AND completed = $${idx}`;
      params.push(completed === 'true');
      idx++;
    }

    // Sorting
    const sortMap = {
      'due_date': 'due_date ASC NULLS LAST',
      'priority': `CASE priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END`,
      'created': 'created_at DESC',
    };
    q += ` ORDER BY ${sortMap[sort] || 'created_at DESC'}`;

    const { rows } = await db.query(q, params);
    res.json({ todos: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// ─── POST /api/todos — create todo ──────────────────────────
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, priority, dueDate } = req.body;

    if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });

    const { rows } = await db.query(
      `INSERT INTO todos (user_id, title, description, priority, due_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, title.trim(), description || null,
       (priority || 'MEDIUM').toUpperCase(), dueDate || null]
    );
    res.status(201).json({ todo: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// ─── PATCH /api/todos/:id — edit todo ───────────────────────
router.patch('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows: existing } = await db.query(
      `SELECT * FROM todos WHERE id = $1`, [req.params.id]
    );
    if (!existing.length) return res.status(404).json({ error: 'Todo not found' });
    // Enforce ownership — users cannot edit each other's todos
    if (existing[0].user_id !== userId)
      return res.status(403).json({ error: 'Not your todo' });

    const { title, description, priority, dueDate, completed } = req.body;
    const todo = existing[0];

    const completedAt = completed === true && !todo.completed ? 'NOW()' : null;
    const completedAtExpr = completed === true && !todo.completed
      ? 'completed_at = NOW(),'
      : completed === false && todo.completed
        ? 'completed_at = NULL,'
        : '';

    const { rows } = await db.query(
      `UPDATE todos SET
         title        = COALESCE($1, title),
         description  = COALESCE($2, description),
         priority     = COALESCE($3, priority),
         due_date     = COALESCE($4, due_date),
         completed    = COALESCE($5, completed),
         completed_at = CASE
           WHEN $5 = TRUE AND NOT completed THEN NOW()
           WHEN $5 = FALSE AND completed THEN NULL
           ELSE completed_at
         END,
         updated_at   = NOW()
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [
        title?.trim() || null,
        description !== undefined ? description : null,
        priority ? priority.toUpperCase() : null,
        dueDate !== undefined ? dueDate : null,
        completed !== undefined ? completed : null,
        req.params.id,
        userId,
      ]
    );
    res.json({ todo: rows[0] });
  } catch (err) {
    console.error('Update todo error:', err);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// ─── DELETE /api/todos/:id — delete todo ────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { rowCount } = await db.query(
      `DELETE FROM todos WHERE id = $1 AND user_id = $2`, [req.params.id, userId]
    );
    if (!rowCount) return res.status(404).json({ error: 'Todo not found' });
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

module.exports = router;
