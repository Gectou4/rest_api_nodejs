const { TaskStatus, isValid, fromValue, label } = require('../src/models/taskStatus');

describe('TaskStatus', () => {
  describe('constants', () => {
    it('should have correct values', () => {
      expect(TaskStatus.Backlog).toBe(1);
      expect(TaskStatus.Todo).toBe(2);
      expect(TaskStatus.InProgress).toBe(3);
      expect(TaskStatus.Done).toBe(4);
      expect(TaskStatus.Closed).toBe(5);
    });
  });

  describe('isValid', () => {
    it('should return true for valid values', () => {
      expect(isValid(1)).toBe(true);
      expect(isValid(2)).toBe(true);
      expect(isValid(3)).toBe(true);
      expect(isValid(4)).toBe(true);
      expect(isValid(5)).toBe(true);
    });

    it('should return false for invalid values', () => {
      expect(isValid(0)).toBe(false);
      expect(isValid(6)).toBe(false);
      expect(isValid(-1)).toBe(false);
      expect(isValid('abc')).toBe(false);
    });

    it('should handle string numbers', () => {
      expect(isValid('1')).toBe(true);
      expect(isValid('5')).toBe(true);
    });
  });

  describe('fromValue', () => {
    it('should return the numeric value', () => {
      expect(fromValue(1)).toBe(1);
      expect(fromValue('3')).toBe(3);
    });

    it('should throw for invalid values', () => {
      expect(() => fromValue(0)).toThrow();
      expect(() => fromValue(99)).toThrow();
    });
  });

  describe('label', () => {
    it('should return correct labels', () => {
      expect(label(1)).toBe('Backlog');
      expect(label(2)).toBe('Todo');
      expect(label(3)).toBe('InProgress');
      expect(label(4)).toBe('Done');
      expect(label(5)).toBe('Closed');
    });

    it('should return Unknown for invalid values', () => {
      expect(label(0)).toBe('Unknown');
      expect(label(99)).toBe('Unknown');
    });
  });
});
