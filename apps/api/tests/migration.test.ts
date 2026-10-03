import {it,expect} from 'vitest';
import pg from 'pg';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
it('legacy mixed inventory is quarantined without losing rooms, blocks or photos',async()=>{
 const url=process.env.TEST_DATABASE_URL;if(!url||!new URL(url).pathname.endsWith('_test'))throw new Error('Disposable test database required.');
 const client=new pg.Client({connectionString:url});await client.connect();
 const schema='migration_'+randomUUID().replaceAll('-','');
 try{
  await client.query(`CREATE SCHEMA "${schema}"`);await client.query(`SET search_path TO "${schema}"`);
  await client.query(readFileSync('apps/api/prisma/migrations/20261002000000_initial/migration.sql','utf8'));
  const location=randomUUID(),property=randomUUID(),whole=randomUUID(),room=randomUUID(),block=randomUUID(),media=randomUUID();
  await client.query('INSERT INTO "Location" (id,name,slug,"updatedAt") VALUES ($1,\'City\',\'city\',now())',[location]);
  await client.query('INSERT INTO "Property" (id,"locationId",name,slug,status,"updatedAt") VALUES ($1,$2,\'Legacy\',\'legacy\',\'PUBLISHED\',now())',[property,location]);
  await client.query('INSERT INTO "Unit" (id,"propertyId",name,"updatedAt") VALUES ($1,$2,\'Entire Property\',now()),($3,$2,\'Room 101\',now())',[whole,property,room]);
  await client.query('INSERT INTO "AvailabilityBlock" (id,"unitId","startDate","endDate","updatedAt") VALUES ($1,$2,\'2099-01-01\',\'2099-01-04\',now())',[block,whole]);
  await client.query('INSERT INTO "PropertyMedia" (id,"propertyId","cloudinaryPublicId","secureUrl",format,width,height,bytes,"altText","updatedAt") VALUES ($1,$2,\'legacy-photo\',\'https://example.invalid/photo\',\'jpg\',640,480,1000,\'Legacy photo\',now())',[media,property]);
  await client.query(readFileSync('apps/api/prisma/migrations/20261003000000_inventory_and_local_context/migration.sql','utf8'));
  const p=(await client.query('SELECT * FROM "Property" WHERE id=$1',[property])).rows[0];expect(p.status).toBe('DRAFT');expect(p.inventoryMode).toBe('MULTI_UNIT');expect(p.inventoryReviewRequired).toBe(true);
  expect((await client.query('SELECT "isActive" FROM "Unit" WHERE id=$1',[whole])).rows[0].isActive).toBe(false);
  expect((await client.query('SELECT id FROM "AvailabilityBlock"')).rows[0].id).toBe(block);
  expect((await client.query('SELECT id FROM "PropertyMedia"')).rows[0].id).toBe(media);
  expect((await client.query('SELECT id FROM "Unit"')).rowCount).toBe(2);
 }finally{await client.query('SET search_path TO public');await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);await client.end();}
});
