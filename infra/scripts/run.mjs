import {existsSync} from 'node:fs';
import {spawn} from 'node:child_process';
if(existsSync('.env')) process.loadEnvFile('.env');
const [task,...rest]=process.argv.slice(2);
const commands={
 'web:build':['node_modules/next/dist/bin/next','build','apps/web','--webpack'],
 'web:dev':['node_modules/next/dist/bin/next','dev','apps/web','--hostname','0.0.0.0','--port',process.env.WEB_PORT||'3000'],
 'web:start':['node_modules/next/dist/bin/next','start','apps/web','--hostname','0.0.0.0','--port',process.env.WEB_PORT||'3000'],
 'api:dev':['--import','tsx','apps/api/src/server.ts'],
 'test':['node_modules/vitest/vitest.mjs','run'],
 'test:e2e':['node_modules/@playwright/test/cli.js','test'],
 'db:migrate':['node_modules/prisma/build/index.js','migrate','deploy','--schema=apps/api/prisma/schema.prisma'],
 'db:seed':['--import','tsx','apps/api/prisma/seed.ts'],
};
if(!commands[task])throw new Error('Unknown task');
if(task==='web:build'||task==='web:start')process.env.NODE_ENV='production';
if(task==='web:dev')process.env.NODE_ENV='development';
const child=spawn(process.execPath,[...commands[task],...rest],{stdio:'inherit',env:process.env});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
child.on('exit',code=>process.exit(code??1));
