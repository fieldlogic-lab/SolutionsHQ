import test from 'node:test';
import assert from 'node:assert/strict';
import { configured, issueSession, validSession, sameOrigin, readJson } from '../lib/ai-team/auth.ts';
import { parseRequest, requestMarker } from '../lib/ai-team/config.ts';

test('owner session expires, rejects tampering and rotates with password', () => {
 process.env.HQ_OWNER_PASSWORD = 'p'.repeat(32); process.env.HQ_SESSION_SECRET = 's'.repeat(32);
 assert.equal(configured(), true);
 const session = issueSession(1000);
 assert.equal(validSession(session, 1000), true);
 assert.equal(validSession(session + 'x', 1000), false);
 assert.equal(validSession(session, 1000 + 28800000), false);
 process.env.HQ_OWNER_PASSWORD = 'q'.repeat(32);
 assert.equal(validSession(session, 1000), false);
 process.env.HQ_OWNER_PASSWORD = 'weak'; assert.equal(configured(), false);
});
test('origin and bounded body fail closed', async () => {
 process.env.HQ_APP_ORIGIN='https://hq.test';
 assert.equal(sameOrigin(new Request('https://hq.test/api', { headers: { origin: 'https://evil.test' } })), false);
 assert.equal(sameOrigin(new Request('https://hq.test/api', { headers: { origin: 'https://hq.test' } })), true);
 await assert.rejects(readJson(new Request('https://hq.test/api', { method:'POST', body:'x'.repeat(16001) })));
 await assert.rejects(readJson(new Request('https://hq.test/api', { method:'POST', body:'invalid' })));
});
test('request metadata requires allowlisted project, UUID and protocol version', () => {
 const id='12345678-1234-4123-8123-123456789012';
 assert.equal(parseRequest(requestMarker(id,'hydrographic-usv'))?.requestId,id);
 assert.equal(parseRequest(requestMarker(id,'constructor')),null);
 assert.equal(parseRequest(requestMarker('arbitrary','hydrographic-usv')),null);
 assert.equal(parseRequest('<!-- solutionshq-request:{"version":2} -->'),null);
});
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
const configCode = stripTypeScriptTypes(await readFile(new URL('../lib/ai-team/config.ts', import.meta.url), 'utf8'));
const configUrl = 'data:text/javascript;base64,' + Buffer.from(configCode).toString('base64');
const githubCode = stripTypeScriptTypes((await readFile(new URL('../lib/ai-team/github.ts', import.meta.url), 'utf8')).replace('"./config"', JSON.stringify(configUrl)));
const { submit, inspect, validateApproval, hashPlan } = await import('data:text/javascript;base64,' + Buffer.from(githubCode).toString('base64'));
const id='12345678-1234-4123-8123-123456789012';
const issue={number:1,title:'test',body:requestMarker(id,'hydrographic-usv'),html_url:'https://github.com/test/issues/1',state:'open'};
process.env.AI_TEAM_GITHUB_TOKEN='test-only';
test('submission dispatches a real planning workflow and retry does not dispatch again', async () => {
 let created=false, dispatches=0;
 globalThis.fetch=async (url, options) => {
   if (String(url).includes('/dispatches')) { dispatches++; assert.equal(JSON.parse(options.body).inputs.phase,'plan'); return new Response(null,{status:204}); }
   if(options.method==='POST') { created=true; return Response.json(issue); }
   return Response.json(created?[issue]:[]);
 };
 await submit('allow/repo','hydrographic-usv',id,'A meaningful request');
 const again=await submit('allow/repo','hydrographic-usv',id,'A meaningful request');
 assert.equal(again.duplicate,true); assert.equal(dispatches,1);
});
test('failed dispatch never reports issue-only success', async () => {
 globalThis.fetch=async (url, options) => {
  if(String(url).includes('/dispatches')) return new Response(null,{status:403});
  return Response.json(options.method==='POST'?issue:[]);
 };
 await assert.rejects(submit('allow/repo','hydrographic-usv',id,'A meaningful request'), /agent dispatch was not confirmed/);
});
test('inspection ignores spoofed event, retains PR and invalidates QA for changed SHA', async () => {
 const comment=(event,user='github-actions[bot]')=>({id:2,body:`<!-- solutionshq-event:${JSON.stringify({version:1,requestId:id,...event})} -->`,user:{login:user},html_url:'https://github.com/test/comment'});
 globalThis.fetch=async url => {
  const path=String(url);
  if(path.includes('/comments')) return Response.json([comment({type:'plan'},'attacker'),comment({type:'status',prNumber:4}),comment({type:'qa',headSha:'old',status:'pass'}),comment({type:'status',status:'awaiting_final_approval',headSha:'old',buildStatus:'pass'})]);
  if(path.includes('/runs')) return Response.json({workflow_runs:[]});
  if(path.includes('/pulls/')) return Response.json({number:4,html_url:'https://github.com/test/pull/4',head:{sha:'new'},state:'open',draft:true});
  if(path.includes('/check-runs')) return Response.json({check_runs:[]});
  throw new Error('Unexpected URL');
 };
 const state=await inspect('allow/repo',issue);
 assert.equal(state.plan,null); assert.equal(state.pullRequest.number,4); assert.equal(state.pullRequest.qa,null); assert.equal(state.latest.status,"qa_stale"); assert.equal(state.latest.buildStatus,undefined);
});

test('scope approval binds exact comment and full-body hash and rejects dispatch replay',()=>{
 const plan={commentId:42,hash:hashPlan('scope body'),body:'scope body',url:'url'};
 const state={plan,runs:[]};
 assert.equal(validateApproval(state,42,hashPlan('scope body')),plan);
 assert.throws(()=>validateApproval(state,41,plan.hash),/plan changed/);
 assert.throws(()=>validateApproval(state,42,hashPlan('edited scope')),/plan changed/);
 assert.throws(()=>validateApproval({plan,runs:[{display_title:'develop request'}]},42,plan.hash),/already been dispatched/);
});

test('canonical origin ignores forged host and forwarded headers',()=>{
 process.env.HQ_APP_ORIGIN='https://hq.test';
 assert.equal(sameOrigin(new Request('http://localhost/api',{headers:{origin:'https://evil.test',host:'evil.test','x-forwarded-host':'evil.test'}})),false);
 assert.equal(sameOrigin(new Request('http://localhost/api',{headers:{origin:'https://hq.test',host:'internal'}})),true);
 process.env.HQ_APP_ORIGIN='https://hq.test/path';
 assert.equal(sameOrigin(new Request('https://hq.test/api',{headers:{origin:'https://hq.test/path'}})),false);
 delete process.env.HQ_APP_ORIGIN;
});

test('workspace bounded reader accepts valid Unicode payload and rejects byte overflow',async()=>{
 const text=JSON.stringify({content:'🌊'.repeat(7000),sourceRefs:Array(50).fill('source:'+('é'.repeat(100)))});
 const read=await readJson(new Request('https://hq.test/api',{method:'POST',body:text}),128000);
 assert.equal(read.content.length,14000);
 await assert.rejects(readJson(new Request('https://hq.test/api',{method:'POST',body:'🌊'.repeat(33000)}),128000),/too large/);
});
