// Audit fixture for hchowdhu@4db950b, 12 October 2026.
// Copy this file into an isolated extraction's backend directory after building it.
// Run there with: node 20261012-hasan-smoke.cjs
// Never use a production checkout; all 42 responses and credentials below are fake.
// Some assertions deliberately reproduce known defects; this is review evidence,
// not the acceptance suite for a corrected backend.
const assert = require('node:assert/strict');
const http = require('node:http');
const realFetch = global.fetch;
const calls = [];
let failOAuth = false;
const sampleStudent = {id: 42, login: 'fixture42', first_name: 'Fixture', last_name: 'Student', displayname: 'Fixture Student', image: {link: 'https://example.invalid/avatar.png'}, campus: [{id: 1, name: '42 Paris', country: 'France'}], cursus_users: [{cursus_id: 21, grade: 'Learner', level: 7, skills: [], begin_at: '2024-01-01T00:00:00Z', end_at: null, cursus: {name: '42cursus'}}]};
global.fetch = async (url, opts = {}) => {
  calls.push({url, method: opts.method || 'GET'});
  const u = new URL(url);
  if (u.origin !== 'https://api.intra.42.fr') throw new Error('Unexpected upstream');
  if (u.pathname === '/oauth/token') {
    await new Promise(r => setTimeout(r, 10));
    if (failOAuth && opts.body.get('grant_type') === 'authorization_code') return new Response('{}', {status: 503});
    return Response.json({access_token: 'mock-only-token', expires_in: 7200});
  }
  if (u.pathname === '/v2/me') return Response.json(sampleStudent);
  if (u.pathname === '/v2/users/missing') return new Response('{}', {status: 404});
  if (u.pathname === '/v2/users/fixture42') return Response.json(sampleStudent);
  if (u.pathname === '/v2/users/42/projects_users') {
    const page = Number(u.searchParams.get('page[number]'));
    const amount = page === 1 ? 100 : 1;
    return Response.json(Array.from({length: amount}, (_, i) => ({id: (page - 1) * 100 + i, status: 'finished', final_mark: 100, 'validated?': true, created_at: '2025-01-01', marked_at: '2025-02-01', cursus_ids: [21], project: {id: i, name: 'Fixture Project', slug: 'fixture'}})));
  }
  throw new Error('Unimplemented upstream fixture');
};
Object.assign(process.env, {PORT: '39042', SESSION_SECRET: 'isolated-review-secret-not-a-real-secret', INTRA42_CLIENT_ID: 'mock-client', INTRA42_CLIENT_SECRET: 'mock-secret', INTRA42_REDIRECT_URI: 'http://localhost/api/auth/42/callback'});
let server;
const originalListen = http.Server.prototype.listen;
http.Server.prototype.listen = function (port, callback) {
  server = this;
  return originalListen.call(this, 0, '127.0.0.1', callback);
};
require('./dist/server.js');
const results = [];
(async () => {
  if (!server.listening) await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = (path, opts) => realFetch(base + path, {redirect: 'manual', ...opts});
  let response = await request('/api/health'); assert.equal(response.status, 200); assert.equal((await response.json()).status, 'ok'); results.push('health=200');
  response = await request('/api/auth/me'); assert.equal(response.status, 401); results.push('unauthenticated me=401');
  const initialTokenCalls = calls.filter(c => c.url.endsWith('/oauth/token')).length;
  const burst = await Promise.all(Array.from({length: 8}, () => request('/api/students/fixture42')));
  assert(burst.every(r => r.status === 200));
  const tokensForBurst = calls.filter(c => c.url.endsWith('/oauth/token')).length - initialTokenCalls;
  results.push(`8 concurrent unauthenticated profiles=200; upstream token requests=${tokensForBurst}`);
  response = await request('/api/students/fixture42/projects'); const projects = await response.json(); assert.equal(response.status, 200); assert.equal(projects.total, 101); assert.equal(projects.projects[0].score, 100); results.push('anonymous project history=200; pagination100+1=101');
  response = await request('/api/students/bad%20login'); assert.equal(response.status, 400); results.push('invalid login=400');
  response = await request('/api/students/missing'); assert.equal(response.status, 502); results.push('upstream nonexistent student404 maps to502');
  const beforeBadState = calls.length;
  response = await request('/api/auth/42/callback?code=mock&state=wrong'); assert.equal(response.status, 400); assert.equal(calls.length, beforeBadState); results.push('invalid OAuth state=400; no upstream request');
  response = await request('/api/auth/42'); assert.equal(response.status, 302);
  const state = new URL(response.headers.get('location')).searchParams.get('state'); const initialCookie = response.headers.get('set-cookie').split(';')[0];
  assert(state.length === 64); assert(!response.headers.get('set-cookie').includes('Secure')); results.push('OAuth random state64; HttpOnly SameSite=Lax cookie without Secure');
  response = await request(`/api/auth/42/callback?code=mock&state=${state}`, {headers: {cookie: initialCookie}}); assert.equal(response.status, 302); assert.equal(response.headers.get('location'), '/api/auth/me');
  const authCookie = response.headers.get('set-cookie').split(';')[0]; assert.notEqual(authCookie, initialCookie);
  response = await request('/api/auth/me', {headers: {cookie: authCookie}}); assert.equal(response.status, 200); assert.equal((await response.json()).login, 'fixture42');
  response = await request('/api/auth/me', {headers: {cookie: initialCookie}}); assert.equal(response.status, 401); results.push('mock OAuth callback regenerates session; new cookie authenticated; old cookie401');
  response = await request('/api/auth/logout', {method: 'POST', headers: {cookie: authCookie}}); assert.equal(response.status, 200);
  response = await request('/api/auth/me', {headers: {cookie: authCookie}}); assert.equal(response.status, 401); results.push('logout=200; subsequent me401');
  response = await request('/api/auth/42'); const state2 = new URL(response.headers.get('location')).searchParams.get('state'); const cookie2 = response.headers.get('set-cookie').split(';')[0]; failOAuth = true;
  response = await request(`/api/auth/42/callback?code=mock&state=${state2}`, {headers: {cookie: cookie2}}); assert.equal(response.status, 500); assert(response.headers.get('content-type').includes('text/html')); results.push('upstream OAuth503 maps to500 HTML (OpenAPI says502)');
  response = await request('/apidocumentation'); assert.equal(response.status, 404);
  response = await request('/api/docs/'); assert.equal(response.status, 200); results.push('documented /apidocumentation=404; actual /api/docs/=200');
  console.log(JSON.stringify({results, externalRequests: 0}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;}).finally(() => {server.closeAllConnections(); server.close();});
