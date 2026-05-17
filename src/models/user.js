const db = require('../config/db');

class User {
  constructor(id = null) {
    this.userId = null;
    this.name = '';
    this.email = '';
    this.loaded = false;
    if (id) {
      this.load(id);
    }
  }

  async load(id) {
    if (this.loaded) {
      return;
    }
    this.userId = id;
    const rows = await db.query('SELECT email, name FROM user WHERE user_id = ?', [id]);
    if (rows.length > 0) {
      this.name = rows[0].name;
      this.email = rows[0].email;
      this.loaded = true;
    }
  }

  isLoaded() {
    return this.loaded;
  }

  getId() {
    return this.userId;
  }

  getName() {
    return this.name;
  }

  getEmail() {
    return this.email;
  }

  setName(name) {
    this.name = name;
    return this;
  }

  setEmail(email) {
    this.email = email;
    return this;
  }

  async getTasks() {
    const UserTask = require('./userTask');
    return UserTask.getTaskByUser(this);
  }

  toArray() {
    return {
      user_id: this.userId,
      name: this.name,
      email: this.email,
    };
  }
}

module.exports = User;
