import {createInterface} from 'node:readline/promises';
import argon2 from 'argon2';
// Password comes from stdin so it is never present in shell arguments/history.
const rl=createInterface({input:process.stdin,output:process.stderr});
const password=await rl.question('Password (input is visible; use a private terminal): ');rl.close();
if(password.length<14) throw new Error('Use at least 14 characters.');
console.log(await argon2.hash(password,{type:argon2.argon2id,memoryCost:65536,timeCost:3,parallelism:1}));
