import {ID,TYPES,CONDITIONS} from './config.mjs';
import {CrawlerModel,ItemModel} from './models.mjs';
import {DCFActor,DCFItem} from './documents.mjs';
import {DCFTable,importReference,rollTable} from './reference.mjs';
import {CrawlerSheet,CrawlerItemSheet} from './sheets.mjs';
import {registerState,dungeon,encounter,effectCondition,stateFor,addCondition} from './state.mjs';
import {rollCheck} from './rolls.mjs';
import {statMod} from './rules.mjs';
import {confirm} from './ui.mjs';
export async function createStarter(){if(!game.user.isGM)throw Error('Only the GM can create a starter crawler.');if(!await confirm('Create a starter crawler with Unarmed Combat, Fists, Heal, Endurance and Fabricate?'))return;const actor=await Actor.create({name:'New Crawler',type:'crawler',system:{floor:dungeon().floor}});const [skill]=await actor.createEmbeddedDocuments('Item',[{name:'Unarmed Combat',type:'skill',system:{stat:'str',category:'attack',checkType:'opposed',rank:3,damage:'1d4',damageStat:'str',damageType:'Bludgeoning',description:'Unarmed strikes against the target’s Evade.',upgrades:[{rank:5,check:0,damage:'1d4',mana:0,heal:0,text:'Add 1d4 base damage.'}]}}]);await actor.createEmbeddedDocuments('Item',[{name:'Fists',type:'weapon',system:{skill:skill.id,category:'attack',stat:'str',damage:'1d4',damageStat:'str',damageType:'Bludgeoning',range:'5 ft',location:'Held / Ready'}},{name:'Heal',type:'spell',system:{rank:1,maxRank:1,stat:'int',passive:true,requiresCheck:false,hotlist:true,mana:2,healSlots:2,description:'Self only. Restores two Health Bar slots. May be used as an Interrupt.'}},{name:'Endurance',type:'skill',system:{rank:0,stat:'con',description:'Avoid fatigue from grinding, extended travel and strenuous activity.'}},{name:'Fabricate',type:'skill',system:{rank:0,stat:'int',description:'Craft mundane objects without moving parts, fluids or chemicals.'}}]);actor.sheet.render({force:true});return actor;}
Hooks.once('init',()=>{
 CONFIG.Actor.documentClass=DCFActor;CONFIG.Item.documentClass=DCFItem;CONFIG.RollTable.documentClass=DCFTable;
 CONFIG.Actor.dataModels={crawler:CrawlerModel,adversary:CrawlerModel,companion:CrawlerModel};CONFIG.Item.dataModels=Object.fromEntries(Object.keys(TYPES).map(t=>[t,ItemModel]));CONFIG.time.roundTime=10;CONFIG.Combat.initiative={formula:'0',decimals:0};registerState();
 for(const [key,value] of Object.entries(CONDITIONS))CONFIG.statusEffects[`dcf-${key}`]={id:`dcf-${key}`,name:value.label,img:'icons/svg/poison.svg',hud:true,flags:{[ID]:{condition:key,stacks:1,rest:value.rest||''}}};
 const sheets=foundry.applications.apps.DocumentSheetConfig;sheets.registerSheet(foundry.documents.Actor,ID,CrawlerSheet,{types:['crawler','adversary','companion'],makeDefault:true,label:'Crawler Forge'});sheets.registerSheet(foundry.documents.Item,ID,CrawlerItemSheet,{types:Object.keys(TYPES),makeDefault:true,label:'Crawler Forge Item'});
 game.dccCrawlerForge={rollCheck,importReference,importTables:importReference,rollTable,statMod,createStarter};
});
Hooks.on('updateSetting',setting=>{if(!setting.key?.startsWith(ID+'.'))return;for(const a of game.actors.contents)for(const sheet of Object.values(a.apps||{}))if(sheet.rendered)sheet.render({force:true});});
Hooks.on('createActiveEffect',async effect=>{if(game.users.activeGM?.id!==game.user.id)return;const key=effectCondition(effect),config=CONDITIONS[key];if(!config||effect.flags?.[ID]?.appliedRound!=null)return;const s=stateFor(effect.parent);const data={condition:key,stacks:1,appliedRound:s.round,combatKey:s.combatKey,rest:config.rest||''};if(config.rounds)data.expiresAt=s.elapsed+config.rounds*10;if(config.seconds)data.expiresAt=s.elapsed+config.seconds;await effect.update({[`flags.${ID}`]:data});});
