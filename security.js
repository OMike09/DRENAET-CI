'use strict';
const crypto=require('node:crypto');const {promisify}=require('node:util');const scrypt=promisify(crypto.scrypt);
const ROLE_SCOPE=Object.freeze({platform_admin:'platform',regional_director:'region',regional_secretariat:'region',regional_staff:'region',inspector:'region',school_head:'school',school_deputy:'school',coordinator:'school',service_manager:'service',educator:'school',teacher:'school',school_staff:'school'});
const SCHOOL_SUBORDINATES=new Set(['school_deputy','coordinator','educator','teacher','school_staff']);
const ROOT='platform_admin',REGIONAL='regional_director',SCHOOL='school_head';
function fail(message,status=400){const e=new Error(message);e.status=status;throw e}
function login(value){const s=String(value||'').trim().toLowerCase();if(!/^[a-z0-9][a-z0-9._@+-]{2,79}$/.test(s))fail('Identifiant invalide.');return s}
function label(value,name,max=160){const s=String(value||'').trim().replace(/\s+/g,' ');if(!s||s.length>max||/[<>\u0000-\u001f]/.test(s))fail(`${name} invalide.`);return s}
function password(value){if(typeof value!=='string'||Array.from(value).length<12||Array.from(value).length>128)fail('Le mot de passe doit contenir entre 12 et 128 caractères.');return value}
const token=()=>crypto.randomBytes(32).toString('base64url');const hashToken=value=>crypto.createHash('sha256').update(String(value)).digest('hex');
async function hashPassword(p){password(p);let salt=crypto.randomBytes(16);let buf=await scrypt(p,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024});return 'scrypt$32768$'+salt.toString('hex')+'$'+buf.toString('hex')}
async function verifyPassword(value,encoded){if(typeof value!=='string'||!encoded)return false;let m=/^scrypt\$(\d+)\$([0-9a-f]{32})\$([0-9a-f]{128})$/.exec(encoded);if(!m||m[1]!=='32768')return false;let expected=Buffer.from(m[3],'hex'),got=await scrypt(value,Buffer.from(m[2],'hex'),64,{N:32768,r:8,p:1,maxmem:64*1024*1024});return crypto.timingSafeEqual(got,expected)}
function canManage(actor,target){if(!actor||!target||String(actor.id)===String(target.id)||target.role_key===ROOT)return false;
 if(actor.role_key===ROOT)return true;
 if(actor.role_key===REGIONAL)return String(actor.region_id)===String(target.region_id)&&target.role_key!==REGIONAL;
 if(actor.role_key===SCHOOL)return String(actor.organization_id)===String(target.organization_id)&&SCHOOL_SUBORDINATES.has(target.role_key);
 return false}
function canAssign(actor,role,org){if(!actor||!org||ROLE_SCOPE[role]!==org.kind||role===ROOT)return false;
 if(actor.role_key===ROOT)return true;
 if(String(actor.region_id)!==String(org.region_id||org.id))return false;
 if(actor.role_key===REGIONAL)return role!==REGIONAL;
 return actor.role_key===SCHOOL&&String(actor.organization_id)===String(org.id)&&SCHOOL_SUBORDINATES.has(role)}
function canList(actor){return !!actor&&[ROOT,REGIONAL,SCHOOL].includes(actor.role_key)}
// An order is not account administration: only the explicitly defined reporting lines may issue one.
const REGIONAL_REPORTS=new Set(['regional_secretariat','regional_staff','inspector','school_head','service_manager']);
const DEPUTY_REPORTS=new Set(['coordinator','educator','teacher','school_staff']);
function canDirect(actor,target){if(!actor||!target||actor.status!=='active'||target.status!=='active'||String(actor.id)===String(target.id))return false;
 if(actor.role_key===ROOT)return target.role_key===REGIONAL;
 if(actor.role_key===REGIONAL)return String(actor.region_id)===String(target.region_id)&&REGIONAL_REPORTS.has(target.role_key);
 if(actor.role_key===SCHOOL)return String(actor.organization_id)===String(target.organization_id)&&SCHOOL_SUBORDINATES.has(target.role_key);
 if(actor.role_key==='school_deputy')return String(actor.organization_id)===String(target.organization_id)&&DEPUTY_REPORTS.has(target.role_key);
 return false}
function canIssue(actor){return !!actor&&[ROOT,REGIONAL,SCHOOL,'school_deputy'].includes(actor.role_key)}
module.exports={ROLE_SCOPE,SCHOOL_SUBORDINATES,fail,login,label,password,token,hashToken,hashPassword,verifyPassword,canAssign,canManage,canList,canDirect,canIssue};
