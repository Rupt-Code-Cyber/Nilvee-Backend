import test from 'node:test';
import assert from 'node:assert/strict';
import { createApplication } from '../app.js';

test('Nilvee Backend Core Integration Test Suite', async (t) => {
  const app = await createApplication();

  t.after(async () => {
    await app.close();
  });

  await t.test('GET /api/v1/services — Should open public engineering services data', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/services',
    });

    assert.equal(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
  });

  await t.test('GET /api/v1/inquiries — Unauthenticated attempts should fail with HTTP 401', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/inquiries',
    });

    assert.equal(response.statusCode, 401);
    const body = JSON.parse(response.body);
    assert.equal(body.success, false);
    assert.equal(body.error.name, 'Unauthorized');
  });

  await t.test('POST /api/v1/auth/login — Supplying blank parameter inputs should return HTTP 400', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {},
    });

    assert.equal(response.statusCode, 400);
    const body = JSON.parse(response.body);
    assert.equal(body.success, false);
  });

  await t.test('POST /api/v1/inquiries — Supplying malformed payload values should fail validation', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/inquiries',
      payload: {
        email: 'broken-email-syntax',
        subject: 'Short',
      },
    });

    assert.equal(response.statusCode, 400);
    const body = JSON.parse(response.body);
    assert.equal(body.success, false);
  });
});
