const TaskStatus = {
  Backlog: 1,
  Todo: 2,
  InProgress: 3,
  Done: 4,
  Closed: 5,
};

function isValid(value) {
  return Object.values(TaskStatus).includes(Number(value));
}

function fromValue(value) {
  const num = Number(value);
  if (!isValid(num)) {
    throw new Error(`Invalid TaskStatus value: ${value}`);
  }
  return num;
}

function label(value) {
  const num = Number(value);
  const reverse = {
    1: 'Backlog',
    2: 'Todo',
    3: 'InProgress',
    4: 'Done',
    5: 'Closed',
  };
  return reverse[num] || 'Unknown';
}

module.exports = { TaskStatus, isValid, fromValue, label };
