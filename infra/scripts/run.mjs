import {existsSync} from 'node:fs';
import {spawn, spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
if(existsSync('.env')) process.loadEnvFile('.env');
const [task,...rest]=process.argv.slice(2);
const root=process.cwd();
const next=resolve(root,'node_modules/next/dist/bin/next');
const commands={
 'web:build':{args:[next,'build','--webpack'],cwd:'apps/web'},
 'web:dev':{args:[next,'dev','--hostname','0.0.0.0','--port',process.env.WEB_PORT||'3000'],cwd:'apps/web'},
 'web:start':{args:[next,'start','--hostname','0.0.0.0','--port',process.env.WEB_PORT||'3000'],cwd:'apps/web'},
 'api:dev':{args:['--watch','--import','tsx','apps/api/src/server.ts'],cwd:'.'},
 'test':{args:['node_modules/vitest/vitest.mjs','run'],cwd:'.'},
 'test:e2e':{args:['node_modules/@playwright/test/cli.js','test'],cwd:'.'},
 'db:migrate':{args:['node_modules/prisma/build/index.js','migrate','deploy','--schema=apps/api/prisma/schema.prisma'],cwd:'.'},
 'db:seed':{args:['--import','tsx','apps/api/prisma/seed.ts'],cwd:'.'},
};
if(!commands[task])throw new Error('Unknown task');
if(task==='web:build'||task==='web:start')process.env.NODE_ENV='production';
if(task==='web:dev')process.env.NODE_ENV='development';
const command=commands[task];
// Own the process group so the whole tool tree (Next.js spawns its own
// Turbopack child) can be stopped together. Killing only the direct child left
// that grandchild listening on the port, so the next run failed with EADDRINUSE
// and concurrently -k then tore down the API.
const detached=process.platform!=='win32';
const child=spawn(process.execPath,[...command.args,...rest],{
 stdio:'inherit',
 env:process.env,
 cwd:resolve(root,command.cwd),
 detached,
});
let stopping=false;
// Stop the launcher's entire subtree, not just the direct child.
function stopTree(signal){
 if(!child.pid||child.exitCode!==null)return;
 try{
  if(process.platform==='win32')
   spawnSync('taskkill',['/pid',String(child.pid),'/T','/F'],{stdio:'ignore'});
  else
   process.kill(-child.pid,signal||'SIGTERM');
 }catch{
  try{child.kill(signal||'SIGTERM');}catch{}
 }
}
for(const signal of ['SIGINT','SIGTERM','SIGHUP'])
 process.on(signal,()=>{
  if(stopping)return;
  stopping=true;
  stopTree(signal);
  process.exit(0);
 });
process.on('exit',()=>{if(!stopping)stopTree();});
child.on('error',err=>{
 console.error(`[run.mjs] failed to start ${task}: ${err.message}`);
 process.exit(1);
});
child.on('exit',(code,signal)=>{
 stopping=true;
 if(signal)console.error(`[run.mjs] ${task} stopped by ${signal}`);
 process.exit(signal?1:(code??1));
});
