'use strict';
// Navigation seulement : chaque clé reste liée à son module et à ses contrôles serveur existants.
const LABELS={dashboard:'Vue générale',instructions:'Instructions',tasks:'Mes tâches',alerts:'Notifications',messages:'Messagerie',groups:'Groupes',correspondence:'Courriers',reports:'Rapports',library:'Bibliothèque',calendar:'Calendrier',statistics:'Statistiques',observatory:'Observatoire',training:'Formation continue',announcements:'Annonces',academic:'Année scolaire',supervisions:'Devoirs et évaluations',timetables:'Emplois du temps',pedagogy:'Cahier de texte',grades:'Cahier de notes','roll-calls':'Cahier d’appel',parents:'Parents d’élèves',inspections:'Inspections disciplinaires',coges:'Dossiers COGES',examinations:'Examens et délibérations',requests:'Mes demandes',exports:'Exports',circuits:'Circuits de rapports',organizations:'Établissements et structure',accounts:'Utilisateurs et personnel',audit:'Journal des actions',attendance:'Pointage','my-attendance':'Mon pointage','attendance-notices':'Messages régionaux',profile:'Mon profil','menu-admin':'Personnalisation du tableau de bord','visual-admin':'Identité visuelle de la plateforme'};
const ICONS={none:'',grid:'▦',folder:'▣',people:'♟',book:'▤',chat:'✉',calendar:'▦',chart:'▥',clock:'◷',bell:'◉',image:'▧',settings:'⚙',school:'⌂',star:'★',check:'✓',file:'▤'};
const GROUPS=[
 ['dashboard','TABLEAU DE BORD',['dashboard','alerts','tasks','instructions']],
 ['administration','ADMINISTRATION ET GESTION',['accounts','organizations','academic','audit']],
 ['auxiliaires','AUXILIAIRES PÉDAGOGIQUES',['pedagogy','roll-calls','grades']],
 ['suivi','SUIVI PÉDAGOGIQUE',['timetables','training','observatory','inspections']],
 ['examens','EXAMENS ET ÉVALUATIONS',['supervisions','calendar','examinations']],
 ['vie-scolaire','VIE SCOLAIRE',['attendance','my-attendance','attendance-notices','requests']],
 ['parents','PARENTS D’ÉLÈVES',['parents']],
 ['coges','COGES',['coges']],
 ['communication','COMMUNICATION',['announcements','messages','groups','correspondence','library']],
 ['rapports','RAPPORTS ET STATISTIQUES',['reports','statistics','circuits','exports']],
 ['parametres','PARAMÈTRES',['profile','menu-admin','visual-admin']]
];
const keys=Object.keys(LABELS);
if(new Set(GROUPS.flatMap(x=>x[2])).size!==keys.length||GROUPS.flatMap(x=>x[2]).some(k=>!LABELS[k]))throw Error('Une option de navigation est absente ou dupliquée.');
const defaultLayout=()=>({categories:GROUPS.map(([id,label,items])=>({id,label,hidden:false,options:items.map(key=>({key,label:null,icon:'none',hidden:false}))}))});
// An old one-section configuration remains intact in its archived version; adapt its display only.
function groupedLegacy(layout){if(!layout?.categories)return defaultLayout();if(layout.categories.length===1&&layout.categories[0].id==='main'){let source=layout.categories[0],byKey=new Map(source.options.map(x=>[x.key,x]));return {categories:GROUPS.map(([id,label,items])=>({id,label,hidden:source.hidden,options:items.map(key=>byKey.get(key)||{key,label:null,icon:'none',hidden:false})}))}}let categories=JSON.parse(JSON.stringify(layout.categories)),seen=new Set(categories.flatMap(x=>x.options.map(y=>y.key)));for(let [id,label,items] of GROUPS){let fresh=items.filter(k=>!seen.has(k));if(!fresh.length)continue;let c=categories.find(x=>x.id===id);if(!c){c={id,label,hidden:false,options:[]};categories.push(c)}for(let key of fresh){c.options.push({key,label:null,icon:'none',hidden:false});seen.add(key)}}return {categories}}
module.exports={LABELS,ICONS,keys,defaultLayout,groupedLegacy};
