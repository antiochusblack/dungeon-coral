import {ID,CONDITIONS,TYPES,SLOTS} from './config.mjs';
import {skillCap,healthSlots} from './rules.mjs';
import {confirm} from './ui.mjs';
import {dungeon} from './state.mjs';
export class DCFActor extends foundry.documents.Actor {
 async _preCreate(data,options,user){await super._preCreate(data,options,user);if(this.type==='adversary')this.updateSource({'system.health.value':healthSlots(this.type,{...this.system,...data.system})});this.updateSource({prototypeToken:{actorLink:this.type==='crawler',bar1:{attribute:'health'},bar2:{attribute:'mana'},displayBars:40}});}
}
export function validateItem(item,data){const actor=item.actor;if(!actor)return;
 const others=actor.items.filter(i=>i.id!==item.id&&!i.system.broken);const s=data.system;
 if(s.hotlist&&others.filter(i=>i.system.hotlist).length>=10)throw Error('The Hotlist has ten slots.');
 if(s.equipped){if(!SLOTS.includes(s.slot))throw Error('Choose a valid body slot.');const count=others.filter(i=>i.system.equipped&&i.system.slot===s.slot).length;if(count>=(s.slot==='Accessories'?10:1))throw Error(`The ${s.slot} slot is full.`);}
 if(s.external&&s.active&&others.filter(i=>i.system.external&&i.system.active).length>=3)throw Error('Only three External Buffs can be active.');
 if(s.location==='Inventory'&&s.weight*s.quantity>actor.system.lift)throw Error('This item exceeds the unaided lift limit.');
 if(s.location==='Inventory'&&(s.living||!s.sealed||s.volatile))throw Error('Living, uncontained-liquid or active volatile items cannot be stored normally.');
 if(['skill','spell'].includes(item.type)&&s.rank>skillCap(s,actor.system.floor))throw Error('Rank exceeds this skill’s current floor cap.');
}
export class DCFItem extends foundry.documents.Item {
 async _preCreate(data,options,user){const result=await super._preCreate(data,options,user);if(result===false)return false;const merged=foundry.utils.mergeObject(this.toObject(),data,{inplace:false});validateItem(this,merged);}
 async _preUpdate(changes,options,user){const result=await super._preUpdate(changes,options,user);if(result===false)return false;const expanded=foundry.utils.expandObject(changes);const data=foundry.utils.mergeObject(this.toObject(),expanded,{inplace:false});validateItem(this,data);if(['skill','spell'].includes(this.type)&&data.system.rank!==this.system.rank&&!options.dcfRankConfirmed){if(!await confirm(`Change ${this.name} from rank ${this.system.rank} to ${data.system.rank}?`))return false;}}
 async _preDelete(options,user){const result=await super._preDelete(options,user);if(result===false)return false;if(!options.dcfDeleteConfirmed&&!await confirm(`Delete ${this.name}?`))return false;}
}
