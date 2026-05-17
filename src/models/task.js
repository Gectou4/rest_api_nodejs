const db = require('../config/db');
const { TaskStatus, fromValue } = require('./taskStatus');

class Task {
  constructor(id = null) {
    this.id = 0;
    this.title = '';
    this.description = '';
    this.creationDate = null;
    this.status = TaskStatus.Backlog;
    this.loaded = false;
    if (id) {
      this.load(id);
    }
  }

  async load(id) {
    if (this.loaded) {
      return;
    }
    this.id = id;
    const rows = await db.query(
      'SELECT status, title, description, creation_date FROM task WHERE task_id = ?',
      [id]
    );
    if (rows.length > 0) {
      const row = rows[0];
      this.status = fromValue(row.status);
      this.title = row.title;
      this.description = row.description;
      this.creationDate = row.creation_date;
      this.loaded = true;
    }
  }

  isLoaded() {
    return this.loaded;
  }

  getId() {
    return this.id;
  }

  setId(id) {
    this.id = id;
    return this;
  }

  setStatus(status) {
    this.status = fromValue(status);
    return this;
  }

  getStatus() {
    return this.status;
  }

  setTitle(title) {
    this.title = title;
    return this;
  }

  getTitle() {
    return this.title;
  }

  setDescription(description) {
    this.description = description;
    return this;
  }

  getDescription() {
    return this.description;
  }

  setCreationDate(datetime) {
    this.creationDate = datetime;
    return this;
  }

  getCreationDate() {
    if (this.creationDate) {
      return this.creationDate;
    }
    const now = new Date();
    return now.toISOString().slice(0, 19).replace('T', ' ');
  }

  async save() {
    try {
      if (this.id <= 0) {
        const result = await db.execute(
          'INSERT INTO task (status, title, description, creation_date) VALUES (?, ?, ?, ?)',
          [this.status, this.title, this.description, this.getCreationDate()]
        );
        this.id = result.insertId;
        this.loaded = true;
        return true;
      } else {
        await db.execute(
          'UPDATE task SET status=?, title=?, description=?, creation_date=? WHERE task_id = ?',
          [this.status, this.title, this.description, this.getCreationDate(), this.id]
        );
        return true;
      }
    } catch {
      return false;
    }
  }

  async delete() {
    try {
      await db.execute('DELETE FROM task WHERE task_id = ?', [this.id]);
      return true;
    } catch {
      return false;
    }
  }

  async getAll(offset = null, limit = null) {
    try {
      let sql = 'SELECT task_id, status, title, description, creation_date FROM task';
      const params = [];
      if (limit !== null) {
        sql += ' LIMIT ?';
        params.push(limit);
      }
      if (offset !== null) {
        sql += ' OFFSET ?';
        params.push(offset);
      }
      const rows = await db.query(sql, params);
      const taskList = {};
      for (const row of rows) {
        taskList[row.task_id] = {
          task_id: row.task_id,
          status: row.status,
          title: row.title,
          description: row.description,
          creation_date: row.creation_date,
        };
      }
      return taskList;
    } catch {
      return {};
    }
  }

  toArray() {
    return {
      task_id: this.id,
      status: this.status,
      title: this.title,
      description: this.description,
      creation_date: this.getCreationDate(),
    };
  }
}

module.exports = Task;
