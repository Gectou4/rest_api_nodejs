import { query, beginTransaction } from '../config/db.js';
import Task from './task.js';

export default class UserTask {
  constructor(userId = null) {
    this.userId = userId || 0;
    this.taskList = {};
    this.persistedIds = new Set();
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
    const rows = await query('SELECT task_id FROM user_task WHERE user_id = ?', [userId]);
    for (const row of rows) {
      this.addTaskId(row.task_id);
      this.persistedIds.add(String(row.task_id));
    }
    this.loaded = true;
  }

  /**
   * Persist only the difference with what was loaded, so that concurrent
   * requests on the same user do not overwrite each other's associations.
   */
  async save() {
    const current = new Set(Object.keys(this.taskList));
    const toAdd = [...current].filter((id) => !this.persistedIds.has(id));
    const toRemove = [...this.persistedIds].filter((id) => !current.has(id));
    let connection;
    try {
      connection = await beginTransaction();
      for (const taskId of toAdd) {
        await connection.execute('INSERT IGNORE INTO user_task (user_id, task_id) VALUES (?, ?)', [
          this.userId,
          taskId,
        ]);
      }
      for (const taskId of toRemove) {
        await connection.execute('DELETE FROM user_task WHERE user_id = ? AND task_id = ?', [
          this.userId,
          taskId,
        ]);
      }
      await connection.commit();
      connection.release();
      this.persistedIds = current;
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
      connection = await beginTransaction();
      await connection.execute('DELETE FROM user_task WHERE user_id = ? AND task_id = ?', [
        this.userId,
        taskId,
      ]);
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
