export const ID='dcc-crawler-forge';
export const TYPES={skill:'Skill',spell:'Spell',weapon:'Weapon',armour:'Armour',gear:'Gear',consumable:'Consumable',race:'Race',class:'Class',ability:'Ability',achievement:'Achievement',quest:'Quest',recipe:'Recipe',craftingTable:'Crafting Table'};
export const LOCATIONS=['Inventory','Held / Ready','Equipped','Dropped','Elsewhere'];
export const SLOTS=['Head','Torso','Arms','Legs','Feet','Hands','Accessories'];
export const PHASES=['Mob declarations','Crawler reactions','Mob resolution','Crawler actions','Clean Up'];
export const CONDITIONS={
 bloodTrail:{label:'Blood Trail',damage:'1d6',type:'Untyped',stack:true},burned:{label:'Burned',damage:'1d10',type:'Fire',combat:true,seconds:300},drowning:{label:'Drowning',damage:'1d6',type:'Untyped'},dying:{label:'Dying'},
 enraged:{label:'Enraged',rounds:2},fatigued:{label:'Fatigued',penalty:1,stack:true,rest:'long'},held:{label:'Held'},longMajor:{label:'Long-Term Major Injury',penalty:5,rest:'day'},longMinor:{label:'Long-Term Minor Injury',penalty:2,rest:'long'},major:{label:'Major Injury',penalty:5,rest:'long',upgrade:'longMajor'},minor:{label:'Minor Injury',penalty:2,rest:'short',upgrade:'longMinor'},
 muted:{label:'Muted',combat:true,seconds:300},poisoned:{label:'Poisoned',damage:'1d8',type:'Poison',stack:true},paralyzed:{label:'Paralyzed',rounds:2},queasy:{label:'Queasy',nextAction:true},sepsis:{label:'Sepsis',damage:'1d10',type:'Poison'},shitFaced:{label:'Shit-Faced',seconds:600},shocked:{label:'Shocked',nextAction:true},sore:{label:'Sore as Shit',penalty:1,seconds:3600},staggered:{label:'Staggered',nextAction:true},stiffLegs:{label:'Stiff Legs',combat:true,seconds:300},stunned:{label:'Stunned',nextCheck:true},takeDown:{label:'Take Down'},terrified:{label:'Terrified',rounds:2},taint:{label:'The Taint',combat:true,seconds:300},woozy:{label:'Woozy',rounds:2}
};
export const DAMAGE_TYPES=['Bludgeoning','Piercing','Slashing','Fire','Cold','Ice','Electric','Psychic','Poison','Acid','Force','Necrotic','Radiant','Sonic','Untyped'];
export const BOSS_LEVELS={neighborhood:1,borough:2,city:3,province:4,country:5,floor:6};
