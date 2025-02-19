import { validateSQL, splitQueries } from './helpers';
import { describe, expect, it } from "vitest";

describe('SQL Helper Utilities', () => {

  describe('validateSQL', () => {
    it('should return error if query does not end with semicolon', () => {
      const result = validateSQL('SELECT * FROM users');
      expect(result).toBe('Invalid SQL syntax: Each SQL statement must end with a semicolon (;)');
    });

    it('should return error if query does not start with valid SQL command', () => {
      const result = validateSQL('INVALID query;');
      expect(result).toMatch(/Invalid SQL syntax:.+Query must start with a valid SQL command/);
    });

    it('should validate multiple queries correctly', () => {
      const result = validateSQL('SELECT * FROM users; DELETE FROM posts;');
      expect(result).toBeNull();
    });

    it('should return null for valid single query', () => {
      const result = validateSQL('SELECT * FROM users;');
      expect(result).toBeNull();
    });

    it('should validate other common SQL commands', () => {
      const validQueries = [
        'INSERT INTO users VALUES (1, "test");',
        'UPDATE users SET name = "test";',
        'CREATE TABLE users (id INT);',
        'DROP TABLE users;',
        'ALTER TABLE users ADD column;',
        'WITH cte AS (SELECT 1) SELECT * FROM cte;',
        'SHOW TABLES;',
        'DESCRIBE users;',
        'EXPLAIN SELECT * FROM users;'
      ];

      validQueries.forEach(query => {
        expect(validateSQL(query)).toBeNull();
      });
    });
  });

  describe('splitQueries', () => {
    it('should split multiple queries correctly', () => {
      const input = 'SELECT * FROM users; DELETE FROM posts; INSERT INTO logs;';
      const result = splitQueries(input);
      expect(result).toEqual([
        'SELECT * FROM users',
        'DELETE FROM posts',
        'INSERT INTO logs'
      ]);
    });

    it('should handle empty queries and whitespace', () => {
      const input = '  SELECT 1;  ;  SELECT 2;  ';
      const result = splitQueries(input);
      expect(result).toEqual(['SELECT 1', 'SELECT 2']);
    });

    it('should return empty array for empty input', () => {
      expect(splitQueries('')).toEqual([]);
      expect(splitQueries('  ')).toEqual([]);
      expect(splitQueries(';')).toEqual([]);
    });
  });
}); 