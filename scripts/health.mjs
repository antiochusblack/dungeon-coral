import {ID,CONDITIONS} from './config.mjs';
import {mitigatedDamage} from './rules.mjs';
import {chat,esc} from './ui.mjs';
import {stateFor,addCondition,clearConditions,effectCondition,encounter,encounterActors,setEncounter,advanceClock,resetActions,setPhase} from './state.mjs';
const matches=(text,type)=>(text||'').split(/[,;\n]/).map(x=>x.trim().toLowerCase()).includes(type.toLowerCase());
export async function applyDamage(actor,amount,type='Untyped',{bypassDR=false,ongoing=false}={}){if(!Number.isFinite(amount)||amount<0)throw Error('Invalid damage.');const s=actor.system;
 const damage=mitigatedDamage(amount,bypassDR?0:s.totalDR,matches(s.totalResistances,type),matches(s.totalVulnerabilities,type),matches(s.totalImmunities,type));if(damage===0)return {slots:0,damage:0};
 if(s.health.value===0){await actor.update({'system.deathTimer':Math.max(0,s.deathTimer-1)});return {slots:0,damage,dying:true};}
 let remaining=damage;const update={};if(s.shield.value>0){const shieldCapacity=s.shield.value*s.shield.slot;const absorbed=Math.min(remaining,shieldCapacity);update['system.shield.value']=Math.max(0,s.shield.value-Math.ceil(absorbed/s.shield.slot));remaining=Math.max(0,remaining-shieldCapacity);}
 const slots=Math.ceil(remaining/s.health.slot);const health=Math.max(0,s.health.value-slots);update['system.health.value']=health;if(health===0&&actor.type!=='adversary'&&!(actor.type==='companion'&&actor.system.companionRole==='Pet'))update['system.deathTimer']=s.stats.con.mod;await actor.update(update);if(slots>0)await clearConditions(actor,['terrified']);if(health===0&&actor.type!=='adversary'&&!(actor.type==='companion'&&actor.system.companionRole==='Pet'))await addCondition(actor,'dying');return {slots,damage,remaining:health};}
export async function heal(actor,slots){if(actor.system.activeConditions.includes('taint'))throw Error('The Taint prevents healing.');if(!Number.isFinite(slots)||slots<0)throw Error('Invalid healing.');await actor.update({'system.health.value':Math.min(actor.system.health.max,actor.system.health.value+Math.floor(slots)),'system.deathTimer':0});await clearConditions(actor,['dying']);}
export async function cleanupRound(){if(!game.user.isGM)return;const e=encounter();if(!e.active)throw Error('No active encounter.');if(e.lastCleanup===e.round)return;await setPhase(4);
 for(const actor of encounterActors()){
  for(const effect of [...actor.effects.contents]){if(effect.disabled)continue;const id=effectCondition(effect),c=CONDITIONS[id];if(!c?.damage)continue;const stacks=effect.flags?.[ID]?.stacks||1;
   for(let i=0;i<stacks;i++){const roll=await new Roll(`${c.damage} + ${actor.system.floor}`).evaluate();const s=actor.system;const mitigated=mitigatedDamage(roll.total,0,matches(s.totalResistances,c.type),matches(s.totalVulnerabilities,c.type),matches(s.totalImmunities,c.type));let avoids=false;
    if(actor.type!=='adversary'&&!(actor.type==='companion'&&actor.system.companionRole==='Pet')&&s.health.value>0&&Math.ceil(mitigated/s.health.slot)>=s.health.value){const save=await new Roll(`1d20 + ${s.stats.con.mod} - ${s.checkPenalty}`).evaluate();const natural=save.dice[0].results[0].result;avoids=natural===20||natural!==1&&save.total>=10+s.floor;await chat(actor,'Fatal debuff save',`<p>${save.total} vs ${10+s.floor} · ${avoids?'Success: debuff ends and this damage is avoided.':'Failure: apply damage.'}</p>`,[save]);}
    if(avoids){await effect.delete();break;}const applied=await applyDamage(actor,roll.total,c.type,{bypassDR:true,ongoing:true});await chat(actor,c.label,`<p>${roll.total} ${esc(c.type)} ongoing damage · ${applied.slots} Health Bar slots lost. DR bypassed.</p>`,[roll]);
   }
  }
  if(actor.system.health.value===0&&actor.type!=='adversary'&&!(actor.type==='companion'&&actor.system.companionRole==='Pet')){const timer=Math.max(0,actor.system.deathTimer-1);await actor.update({'system.deathTimer':timer});await chat(actor,timer?'Dying countdown':'Crawler death',`<p>${timer?`${timer} rounds remain.`:'Death timer reached zero. The crawler has died.'}</p>`);}
 }
 await setEncounter({lastCleanup:e.round});}
export async function nextRound(){if(!game.user.isGM)return;await cleanupRound();await advanceClock(10);const e=encounter();await setEncounter({round:e.round+1,phase:0});await resetActions();const combat=game.combat;if(combat&&combat.scene?.id===e.sceneId)await combat.update({round:e.round+1,turn:0});return chat(null,'Next round',`<p>Round ${e.round+1} · Mob declarations. Actions refreshed.</p>`);}
