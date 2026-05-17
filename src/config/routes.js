import express from 'express';
import userController from '../controllers/user.js';
import taskController from '../controllers/task.js';

const router = express.Router();

router.get('/user/:id', userController.index.bind(userController));
router.get('/user/:id/task', userController.userTask.bind(userController));

router.get('/task', taskController.index.bind(taskController));

router.post('/task', taskController.addTask.bind(taskController));
router.put('/task', taskController.addTask.bind(taskController));

router.post('/task/:id', taskController.editTask.bind(taskController));
router.put('/task/:id', taskController.editTask.bind(taskController));
router.delete('/task/:id', taskController.deleteTask.bind(taskController));

router.post('/user/:userId/task/:taskId', taskController.addTaskToUser.bind(taskController));
router.put('/user/:userId/task/:taskId', taskController.addTaskToUser.bind(taskController));
router.delete('/user/:userId/task/:taskId', taskController.deleteUserTask.bind(taskController));

export default router;
