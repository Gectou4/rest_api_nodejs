const db = require('../config/db');
const Task = require('./task');

class UserTask {
  constructor(userId = null) {
    this.userId = userId || 0;
    this.taskList = {};
    this.loaded = false;
    if (userId) {
      this.load(userId);
    }
  }

  async load(id) {
    if (this.loaded) {
      return;
    }
    await this.loadByUserId(id);
  }

  getUserId() {
    return this.userId;
  }

  setUserId(id) {
    this.userId = id;
    return this;
  }

  getId() {
    return this.getUserId();
  }

  setId(id) {
    this.setUserId(id);
  }

  getTaskIds() {
    return Object.keys(this.taskList);
  }

  getTaskList() {
    return this.taskList;
  }

  addTaskId(taskId) {
    this.taskList[taskId] = new Task(taskId);
    return this;
  }

  addTask(task) {
    this.taskList[task.getId()] = new Task(task.getId());
    return this;
  }

  removeTask(task) {
    delete this.taskList[task.getId()];
    return this;
  }

  removeTaskId(taskId) {
    delete this.taskList[taskId];
    return this;
  }

  hasTask(taskId) {
    return taskId in this.taskList;
  }

  static async getTaskByUser(user) {
    const instance = new UserTask();
    await instance.loadByUser(user);
    return instance;
  }

  async loadByUser(user) {
    await this.loadByUserId(user.getId());
  }

  async loadByUserId(userId) {
    if (this.loaded) {
      return;
    }
    this.userId = userId;
    const rows = await db.query(
      'SELECT task_id FROM user_task WHERE user_id = ?',
      [userId]
    );
    for (const row of rows) {
      this.addTaskId(row.task_id);
    }
    this.loaded = true;
  }

  async save() {
    let connection;
    try {
      connection = await db.beginTransaction();
      await connection.execute('DELETE FROM user_task WHERE user_id = ?', [this.userId]);
      for (const taskId of Object.keys(this.taskList)) {
        await connection.execute(
          'INSERT INTO user_task (user_id, task_id) VALUES (?, ?)',
          [this.userId, taskId]
        );
      }
      await connection.commit();
      connection.release();
      return true;
    } catch (err) {
      if (connection) {
        await connection.rollback();
        connection.release();
      }
      return false;
    }
  }

  async deleteUserTask(taskId) {
    let connection;
    try {
      connection = await db.beginTransaction();
      await connection.execute(
        'DELETE FROM user_task WHERE user_id = ? AND task_id = ?',
        [this.userId, taskId]
      );
      await connection.commit();
      connection.release();
      return true;
    } catch (err) {
      if (connection) {
        await connection.rollback();
        connection.release();
      }
      return false;
    }
  }

  toArray() {
    const tasks = {};
    for (const [taskId, task] of Object.entries(this.taskList)) {
      tasks[taskId] = task.toArray();
    }
    return {
      user_id: this.userId,
      tasks,
    };
  }
}

module.exports = UserTask;
