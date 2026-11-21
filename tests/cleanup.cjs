'use strict';
// DROP DATABASE ... WITH (FORCE) can kill a browser request still completing,
// emitting an uncaught pg connection error after a successful UI assertion.
// Wait for graceful release; do not hide a real connection leak.
module.exports=async function dropTemporaryDatabase(control,name){
 if(!/^drenaet_[a-z0-9_]+$/.test(name))throw Error('Temporary database name rejected');
 let last;
 for(let attempt=0;attempt<50;attempt++){
  try{await control.query('DROP DATABASE IF EXISTS '+name);return}catch(e){if(e.code!=='55006')throw e;last=e;await new Promise(ok=>setTimeout(ok,100))}
 }
 throw last;
};
