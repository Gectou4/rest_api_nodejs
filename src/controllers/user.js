import User from '../models/user.js';

class UserController {
  async index(req, res) {
    const user = new User(parseInt(req.params.id, 10));
    await user.load(parseInt(req.params.id, 10));
    if (!user.isLoaded()) {
      return res.status(404).send('No user found');
    }
    res.status(200).json(user.toArray());
  }

  async userTask(req, res) {
    const user = new User(parseInt(req.params.id, 10));
    await user.load(parseInt(req.params.id, 10));
    if (!user.isLoaded()) {
      return res.status(404).send('No user found');
    }
    const userTask = await user.getTasks();
    res.status(200).json(userTask.toArray());
  }
}

export default new UserController();
