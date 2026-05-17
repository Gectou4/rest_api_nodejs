import request from 'supertest';
import app from '../src/app.js';
import { getPool, execute } from '../src/config/db.js';

let testTaskId = null;

beforeAll(async () => {
  await getPool();
});

afterAll(async () => {
  if (testTaskId) {
    await execute('DELETE FROM user_task WHERE task_id = ?', [testTaskId]);
    await execute('DELETE FROM task WHERE task_id = ?', [testTaskId]);
  }
  await getPool().end();
});

describe('Task CRUD lifecycle', () => {
  it('1. CREATE a task', async () => {
    const res = await request(app)
      .post('/task')
      .send({
        title: 'Lifecycle test task',
        description: 'Testing full CRUD lifecycle',
        status: 2,
      });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Lifecycle test task');
    expect(res.body.status).toBe(2);
    testTaskId = res.body.task_id;
  });

  it('2. READ the task', async () => {
    const res = await request(app).get(`/task/${testTaskId}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Lifecycle test task');
  });

  it('3. UPDATE the task', async () => {
    const res = await request(app)
      .put(`/task/${testTaskId}`)
      .send({ title: 'Updated lifecycle task', status: 4 });
    expect(res.status).toBe(200);
  });

  it('4. READ the updated task', async () => {
    const res = await request(app).get(`/task/${testTaskId}`);
    expect(res.body.title).toBe('Updated lifecycle task');
    expect(res.body.status).toBe(4);
  });

  it('5. DELETE the task', async () => {
    const res = await request(app).delete(`/task/${testTaskId}`);
    expect(res.status).toBe(200);
    testTaskId = null;
  });

  it('6. Verify task is deleted', async () => {
    const res = await request(app).get(`/task/99999`);
    expect(res.status).toBe(404);
  });
});

describe('User-Task association lifecycle', () => {
  it('1. Create a task', async () => {
    const res = await request(app)
      .post('/task')
      .send({ title: 'Association test', description: 'Test', status: 1 });
    expect(res.status).toBe(201);
    testTaskId = res.body.task_id;
  });

  it('2. Associate task to user', async () => {
    const res = await request(app).post(`/user/1/task/${testTaskId}`);
    expect(res.status).toBe(200);
  });

  it('3. Verify task appears in user tasks', async () => {
    const res = await request(app).get('/user/1/task');
    expect(res.body.tasks).toHaveProperty(String(testTaskId));
  });

  it('4. Remove task from user', async () => {
    const res = await request(app).delete(`/user/1/task/${testTaskId}`);
    expect(res.status).toBe(200);
  });

  it('5. Verify task no longer in user tasks', async () => {
    const res = await request(app).get('/user/1/task');
    expect(res.body.tasks).not.toHaveProperty(String(testTaskId));
  });

  it('6. Cleanup: delete task', async () => {
    const res = await request(app).delete(`/task/${testTaskId}`);
    expect(res.status).toBe(200);
    testTaskId = null;
  });
});
