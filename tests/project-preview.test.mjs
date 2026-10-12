import test from 'node:test';
import assert from 'node:assert/strict';
import { projectPreview } from '../lib/project-preview.ts';

test('curated application preview allows external HTTPS only and rejects self recursion', () => {
  assert.equal(projectPreview('https://app.example.test/path', 'https://hq.example.test').url, 'https://app.example.test/path');
  for (const url of ['http://app.example.test', 'javascript:alert(1)', 'https://secret:password@app.example.test']) {
    assert.equal(projectPreview(url, 'https://hq.example.test').url, null);
  }
  assert.equal(projectPreview('https://hq.example.test/project', 'https://hq.example.test').url, null);
  assert.equal(projectPreview('https://solutions-hq.vercel.app/', 'http://localhost:3212', true).url, null);
  assert.equal(projectPreview(undefined, 'https://hq.example.test').url, null);
});

test('ChatGPT hosts and subdomains never enter the embedded preview', () => {
  for (const host of ['chatgpt.com', 'www.chatgpt.com', 'chat.openai.com', 'example.chat.openai.com']) {
    assert.equal(projectPreview(`https://${host}/`, 'https://hq.example.test').url, null);
  }
});
