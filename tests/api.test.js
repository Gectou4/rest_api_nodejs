import request from 'supertest';
import app from '../src/app.js';
import { getPool, execute } from '../src/config/db.js';

const createdTaskIds = [];

beforeAll(async () => {
  await getPool();
});

afterAll(async () => {
  for (const id of createdTaskIds) {
    await execute('DELETE FROM user_task WHERE task_id = ?', [id]);
    await execute('DELETE FROM task WHERE task_id = ?', [id]);
  }
  await getPool().end();
});

function trackTask(id) {
  if (id) {
    createdTaskIds.push(id);
  }
  return id;
}

describe('GET /user/:id', () => {
  it('should return user data', async () => {
    const res = await request(app).get('/user/1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user_id', 1);
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('email');
  });

  it('should return correct user fields', async () => {
    const res = await request(app).get('/user/1');
    expect(res.body.name).toBe('G4');
    expect(res.body.email).toBe('gectou4@gmail.com');
  });

  it('should return 404 for non-existent user', async () => {
    const res = await request(app).get('/user/99999');
    expect(res.status).toBe(404);
    expect(res.text).toBe('No user found');
  });

  it('should return 404 for invalid id', async () => {
    const res = await request(app).get('/user/abc');
    expect(res.status).toBe(404);
  });
});

describe('GET /user/:id/task', () => {
  it('should return user tasks', async () => {
    const res = await request(app).get('/user/1/task');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user_id', 1);
    expect(res.body).toHaveProperty('tasks');
    expect(typeof res.body.tasks).toBe('object');
  });

  it('should return 404 for non-existent user', async () => {
    const res = await request(app).get('/user/99999/task');
    expect(res.status).toBe(404);
  });

  it('should return tasks with correct structure', async () => {
    const res = await request(app).get('/user/1/task');
    for (const task of Object.values(res.body.tasks)) {
      expect(task).toHaveProperty('task_id');
      expect(task).toHaveProperty('status');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('description');
      expect(task).toHaveProperty('creation_date');
    }
  });
});

describe('POST /task', () => {
  it('should create a new task with 201', async () => {
    const res = await request(app)
      .post('/task')
      .send({
        title: 'Faire le the',
        description: 'Comme pour le cafe, mais avec du the',
        status: 1,
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('task_id');
    expect(res.body).toHaveProperty('title', 'Faire le the');
    expect(res.body).toHaveProperty('status', 1);
    expect(res.body).toHaveProperty('description');
    expect(res.body).toHaveProperty('creation_date');
    trackTask(res.body.task_id);
  });

  it('should create task with default status (Backlog=1)', async () => {
    const res = await request(app)
      .post('/task')
      .send({ title: 'Task without status', description: 'Test' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe(1);
    trackTask(res.body.task_id);
  });

  it('should return 400 if title is missing', async () => {
    const res = await request(app).post('/task').send({ description: 'No title' });
    expect(res.status).toBe(400);
    expect(res.text).toBe('Title is required');
  });

  it('should return 400 if body is empty', async () => {
    const res = await request(app).post('/task').send({});
    expect(res.status).toBe(400);
  });
});

describe('PUT /task/:id', () => {
  it('should update a task', async () => {
    const createRes = await request(app)
      .post('/task')
      .send({ title: 'Task to edit', description: 'Original', status: 1 });
    const taskId = createRes.body.task_id;
    trackTask(taskId);

    const res = await request(app)
      .put(`/task/${taskId}`)
      .send({ title: 'Edited task', description: 'Updated', status: 2 });
    expect(res.status).toBe(200);
    expect(res.body).toBe(1);
  });

  it('should return 400 for non-existent task', async () => {
    const res = await request(app)
      .put('/task/99999')
      .send({ title: 'Ghost task' });
    expect(res.status).toBe(400);
  });

  it('should partially update (keep existing fields)', async () => {
    const createRes = await request(app)
      .post('/task')
      .send({ title: 'Partial update', description: 'Keep me', status: 1 });
    const taskId = createRes.body.task_id;
    trackTask(taskId);

    await request(app)
      .put(`/task/${taskId}`)
      .send({ title: 'New title only' });

    const res = await request(app).get(`/task/${taskId}`);
    expect(res.status).not.toBe(404);
  });
});

describe('POST /user/:userId/task/:taskId', () => {
  it('should associate a task to a user', async () => {
    const createRes = await request(app)
      .post('/task')
      .send({ title: 'Task for user', description: 'Test', status: 1 });
    const taskId = createRes.body.task_id;
    trackTask(taskId);

    const res = await request(app).post(`/user/1/task/${taskId}`);
    expect(res.status).toBe(200);
    expect(res.body).toBe(1);
  });

  it('should return 400 for non-existent user', async () => {
    const res = await request(app).post('/user/99999/task/1');
    expect(res.status).toBe(400);
    expect(res.text).toContain('not exists');
  });

  it('should return 400 for non-existent task', async () => {
    const res = await request(app).post('/user/1/task/99999');
    expect(res.status).toBe(400);
  });
});

describe('DELETE /user/:userId/task/:taskId', () => {
  it('should remove task from user', async () => {
    const createRes = await request(app)
      .post('/task')
      .send({ title: 'Task to remove', description: 'Test', status: 1 });
    const taskId = createRes.body.task_id;
    trackTask(taskId);

    await request(app).post(`/user/1/task/${taskId}`);

    const res = await request(app).delete(`/user/1/task/${taskId}`);
    expect(res.status).toBe(200);
    expect(res.body).toBe(1);
  });

  it('should be idempotent (delete non-associated task)', async () => {
    const res = await request(app).delete('/user/1/task/99999');
    expect(res.status).toBe(200);
    expect(res.body).toBe(1);
  });

  it('should return 400 for non-existent user', async () => {
    const res = await request(app).delete('/user/99999/task/1');
    expect(res.status).toBe(400);
  });
});

describe('DELETE /task/:id', () => {
  it('should delete a task', async () => {
    const createRes = await request(app)
      .post('/task')
      .send({ title: 'Task to delete', description: 'Test', status: 1 });
    const taskId = createRes.body.task_id;

    const res = await request(app).delete(`/task/${taskId}`);
    expect(res.status).toBe(200);
    expect(res.body).toBe(1);
  });

  it('should return 400 for non-existent task', async () => {
    const res = await request(app).delete('/task/99999');
    expect(res.status).toBe(400);
    expect(res.text).toContain('not exists');
  });
});

describe('Content negotiation', () => {
  it('should return JSON by default', async () => {
    const res = await request(app).get('/user/1');
    expect(res.headers['content-type']).toContain('application/json');
  });

  it('should return Markdown when Accept: text/markdown', async () => {
    const res = await request(app)
      .get('/user/1')
      .set('Accept', 'text/markdown');
    expect(res.headers['content-type']).toContain('text/markdown');
    expect(res.text).toContain('**user_id**');
    expect(res.text).toContain('**name**');
  });
});

describe('CORS', () => {
  it('should include CORS headers', async () => {
    const res = await request(app).get('/user/1');
    expect(res.headers['access-control-allow-origin']).toBe('*');
  });
});

describe('Invalid routes', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/unknown');
    expect(res.status).toBe(404);
  });

  it('should return 404 for unsupported methods', async () => {
    const res = await request(app).patch('/user/1');
    expect(res.status).toBe(404);
  });
});
