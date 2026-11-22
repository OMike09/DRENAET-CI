'use strict';
const S=require('./security');
const AUTOMATIC=new Set(['platform_admin','regional_director','school_head']);
const MANAGE_ACTIONS=new Set(['view','create','edit','reset','activate','disable','suspend','block','unblock','reactivate','delete','reassign','export','history']);
const same=(x,y)=>x!=null&&y!=null&&String(x)===String(y);
async function enabled(c,actor,role,action){if(!MANAGE_ACTIONS.has(action))S.fail('Pouvoir inconnu.',400);return !!(await c.query('SELECT 1 FROM account_permission_matrix WHERE manager_role=$1 AND target_role=$2 AND action=$3 AND enabled=true',[actor.role_key,role,action])).rowCount}
async function authority(c,actor,target,action){if(!actor||!target||same(actor.id,target.id)||target.role_key==='platform_admin')return false;
 if(target.status==='deleted'&&!['view','history','export'].includes(action))return false;
 if(!await enabled(c,actor,target.role_key,action))return false;
 if(actor.role_key==='platform_admin')return true;
 if(actor.role_key==='regional_director')return same(actor.region_id,target.region_id)&&target.role_key!=='regional_director';
 if(actor.role_key==='school_head')return same(actor.organization_id,target.organization_id)&&S.SCHOOL_SUBORDINATES.has(target.role_key);
 if(!same(actor.organization_id,target.organization_id)||!same(actor.region_id,target.region_id))return false;
 const ranks=await c.query('SELECT role_key,rank FROM roles WHERE role_key=ANY($1::text[])',[[actor.role_key,target.role_key]]);let rank=Object.fromEntries(ranks.rows.map(x=>[x.role_key,x.rank]));if(!(rank[actor.role_key]>rank[target.role_key]))return false;
 return !!(await c.query('SELECT 1 FROM account_responsibilities WHERE manager_id=$1 AND dependent_id=$2 AND revoked_at IS NULL',[actor.id,target.id])).rowCount;
}
async function assignable(c,actor,role,org,action='create'){
 if(!actor||!org||role==='platform_admin'||S.ROLE_SCOPE[role]!==org.kind)return false;
 if(!await enabled(c,actor,role,action))return false;
 if(actor.role_key==='platform_admin')return true;
 if(actor.role_key==='regional_director')return same(actor.region_id,org.kind==='region'?org.id:org.region_id)&&role!=='regional_director';
 if(actor.role_key==='school_head')return same(actor.organization_id,org.id)&&S.SCHOOL_SUBORDINATES.has(role);
 if(!same(actor.organization_id,org.id)||!same(actor.region_id,org.region_id))return false;
 let ranks=await c.query('SELECT role_key,rank FROM roles WHERE role_key=ANY($1::text[])',[[actor.role_key,role]]);let rank=Object.fromEntries(ranks.rows.map(x=>[x.role_key,x.rank]));return rank[actor.role_key]>rank[role];
}
async function hasSpace(c,actor){if(!actor)return false;return !!(await c.query('SELECT 1 FROM account_permission_matrix WHERE manager_role=$1 AND enabled AND action=$2 LIMIT 1',[actor.role_key,'view'])).rowCount}
function scopeSQL(actor,alias='a'){
 if(actor.role_key==='platform_admin')return {sql:'TRUE',params:[]};
 if(actor.role_key==='regional_director')return {sql:`${alias}.region_id=$1`,params:[actor.region_id]};
 if(actor.role_key==='school_head')return {sql:`${alias}.organization_id=$1`,params:[actor.organization_id]};
 return {sql:`${alias}.organization_id=$1 AND EXISTS(SELECT 1 FROM account_responsibilities ar WHERE ar.dependent_id=${alias}.id AND ar.manager_id=$2 AND ar.revoked_at IS NULL)`,params:[actor.organization_id,actor.id]};
}
module.exports={enabled,authority,assignable,hasSpace,scopeSQL,MANAGE_ACTIONS,AUTOMATIC};
