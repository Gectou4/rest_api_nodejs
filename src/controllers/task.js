const Task = require('../models/task');
const User = require('../models/user');
const UserTask = require('../models/userTask');
const { TaskStatus } = require('../models/taskStatus');

class TaskController {
  async index(req, res) {
    const task = new Task();
    const all = await task.getAll();
    res.status(200).json(all);
  }

  async addTask(req, res) {
    const { title, description, status } = req.body;
    if (!title) {
      return res.status(400).send('Title is required');
    }

    const task = new Task();
    task.setTitle(title);
    task.setDescription(description || '');
    task.setStatus(status || TaskStatus.Backlog);

    const saved = await task.save();
    if (saved) {
      return res.status(201).json(task.toArray());
    }

    res.status(500).send('Unable to create new Task');
  }

  async addTaskToUser(req, res) {
    const userId = parseInt(req.params.userId, 10);
    const taskId = parseInt(req.params.taskId, 10);

    const user = new User(userId);
    await user.load(userId);
    if (!user.isLoaded()) {
      return res.status(400).send(`User [${userId}] not exists`);
    }

    const task = new Task(taskId);
    await task.load(taskId);
    if (!task.isLoaded()) {
      return res.status(400).send(`Task [${taskId}] not exists`);
    }

    const userTask = new UserTask(userId);
    await userTask.load(userId);
    userTask.addTaskId(taskId);

    const saved = await userTask.save();
    if (saved) {
      return res.status(200).json(1);
    }

    res.status(500).send('Unable to add Task to user');
  }

  async editTask(req, res) {
    const id = parseInt(req.params.id, 10);
    if (!id) {
      return res.status(400).send('Id of task to edit is required');
    }

    const task = new Task(id);
    await task.load(id);
    if (!task.isLoaded()) {
      return res.status(400).send('Task not found');
    }

    const { title, description, status } = req.body;
    task.setTitle(title !== undefined ? title : task.getTitle());
    task.setDescription(description !== undefined ? description : task.getDescription());
    task.setStatus(status !== undefined ? status : task.getStatus());

    const saved = await task.save();
    if (saved) {
      return res.status(200).json(1);
    }

    res.status(500).send('Unable to update Task');
  }

  async deleteTask(req, res) {
    const id = parseInt(req.params.id, 10);

    const task = new Task(id);
    await task.load(id);
    if (!task.isLoaded()) {
      return res.status(400).send(`Task [${id}] not exists`);
    }

    const deleted = await task.delete();
    if (deleted) {
      return res.status(200).json(1);
    }

    res.status(500).send('Unable to delete Task');
  }

  async deleteUserTask(req, res) {
    const userId = parseInt(req.params.userId, 10);
    const taskId = parseInt(req.params.taskId, 10);

    const user = new User(userId);
    await user.load(userId);
    if (!user.isLoaded()) {
      return res.status(400).send(`User [${userId}] not exists`);
    }

    const userTask = new UserTask(userId);
    await userTask.load(userId);

    if (userTask.hasTask(taskId)) {
      const deleted = await userTask.deleteUserTask(taskId);
      if (deleted) {
        return res.status(200).json(1);
      }
      return res.status(500).send('Unable to delete Task of user');
    }

    res.status(200).json(1);
  }
}

module.exports = new TaskController();
