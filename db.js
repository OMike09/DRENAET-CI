'use strict';
const fs=require('node:fs');const path=require('node:path');const {Pool}=require('pg');
async function connectDatabase(url){
 if(!url||!/^postgres(?:ql)?:\/\//.test(url))throw Error('DATABASE_URL PostgreSQL est nécessaire (sa valeur doit rester privée).');
 const bootstrap=new Pool({connectionString:url,max:1});
 try{await bootstrap.query('CREATE SCHEMA IF NOT EXISTS drenaet_ci')}finally{await bootstrap.end()}
 // Keep this application's tables apart from any pre-existing database content.
 const pool=new Pool({connectionString:url,options:'-c search_path=drenaet_ci,public',max:10,connectionTimeoutMillis:10000,statement_timeout:15000});
 try{
  const c=await pool.connect();try{
   await c.query('BEGIN');await c.query('SELECT pg_advisory_xact_lock(6496280171)');
   await c.query('CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY,applied_at TIMESTAMPTZ NOT NULL DEFAULT now())');
   const files=fs.readdirSync(path.join(__dirname,'migrations')).filter(f=>/^\d{3}_[a-z0-9_]+\.sql$/.test(f)).sort();
   for(const f of files){let version=Number(f.slice(0,3)),check=await c.query('SELECT 1 FROM schema_migrations WHERE version=$1',[version]);if(check.rowCount)continue;await c.query(fs.readFileSync(path.join(__dirname,'migrations',f),'utf8'));await c.query('INSERT INTO schema_migrations(version) VALUES ($1)',[version])}
   await c.query('COMMIT');
  }catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}
  return pool;
 }catch(e){await pool.end();throw e}
}
async function tx(pool,fn){const c=await pool.connect();try{await c.query('BEGIN');const out=await fn(c);await c.query('COMMIT');return out}catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}}
module.exports={connectDatabase,tx};
