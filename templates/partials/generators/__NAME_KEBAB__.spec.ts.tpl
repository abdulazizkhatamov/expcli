//__IF_VITEST__
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
//__END_IF_VITEST__
import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '../../app.js';

let app: Express;

beforeAll(() => {
  app = createApp();
});

afterAll(() => {
  // clean up if needed
});

describe('__NAME_PASCAL__ routes', () => {
  describe('GET /__NAME_PLURAL__', () => {
    it('should return 200 with an array', async () => {
      const res = await request(app).get('/api/__NAME_PLURAL__');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /__NAME_PLURAL__', () => {
    it('should create a new __NAME_CAMEL__ and return 201', async () => {
      const res = await request(app)
        .post('/api/__NAME_PLURAL__')
        .send({
          // TODO: replace with valid __NAME_PASCAL__ fields
        });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('success', true);
    });
  });

  describe('GET /__NAME_PLURAL__/:id', () => {
    it('should return 404 for a non-existent id', async () => {
      const res = await request(app).get('/api/__NAME_PLURAL__/nonexistent-id');
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /__NAME_PLURAL__/:id', () => {
    it('should return 404 for a non-existent id', async () => {
      const res = await request(app)
        .patch('/api/__NAME_PLURAL__/nonexistent-id')
        .send({});
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /__NAME_PLURAL__/:id', () => {
    it('should return 404 for a non-existent id', async () => {
      const res = await request(app).delete('/api/__NAME_PLURAL__/nonexistent-id');
      expect(res.status).toBe(404);
    });
  });
});
