let sequence=0;
export const inputs=[],confirmations=[],rolls=[];
export class Collection extends Array {get contents(){return [...this];}get(id){return this.find(x=>x.id===id);}}
const clone=x=>structuredClone(x);
function set(object,path,value){const parts=path.split('.');let o=object;for(const k of parts.slice(0,-1))o=o[k]??={};o[parts.at(-1)]=clone(value);}
function merge(target,source){for(const [k,v] of Object.entries(source||{})){if(k.includes('.')){set(target,k,v);continue;}if(v&&typeof v==='object'&&!Array.isArray(v)){target[k]??={};merge(target[k],v);}else target[k]=clone(v);}return target;}
class Field {constructor(options={}){this.options=options;}initial(){return typeof this.options.initial==='function'?this.options.initial():this.options.initial??null;}}
class SchemaField extends Field{constructor(fields){super();this.fields=fields;}initial(){return Object.fromEntries(Object.entries(this.fields).map(([k,f])=>[k,f.initial()]));}}
class ArrayField extends Field{constructor(field,options){super(options);this.field=field;}}
class Model {constructor(values={},options={}){this.parent=options.parent;Object.assign(this,merge(Object.fromEntries(Object.entries(this.constructor.defineSchema()).map(([k,f])=>[k,f.initial()])),values));}}
export const settings=new Map();
class Document {
 constructor(data={},parent=null){this._source=clone(data);this._source._id??=`id${String(++sequence).padStart(14,'0')}`;this.parent=parent;this.flags=this._source.flags||{};this.name=data.name||'';this.img=data.img||'icons/svg/item-bag.svg';this.type=data.type;this.id=this._source._id;this.isOwner=true;this.apps={};this.sheet={render(){}};}
 get uuid(){return this.parent?`${this.parent.uuid}.${this.constructor.documentName}.${this.id}`:`${this.constructor.documentName}.${this.id}`;}
 getFlag(scope,key){return this.flags?.[scope]?.[key];}
 async setFlag(scope,key,value){return this.update({[`flags.${scope}.${key}`]:value});}
 async unsetFlag(scope,key){delete this._source.flags?.[scope]?.[key];this.flags=this._source.flags||{};}
 toObject(){return clone(this._source);}
 updateSource(changes){merge(this._source,changes);this.refresh?.();return changes;}
 async _preCreate(){}async _preUpdate(){}async _preDelete(){}
 async update(changes,options={}){if(await this._preUpdate(changes,options,game.user)===false)return;merge(this._source,changes);this.flags=this._source.flags||{};this.name=this._source.name;this.refresh?.();this.parent?.refresh?.();return this;}
 async delete(options={}){if(await this._preDelete(options,game.user)===false)return;const collection=this.parent?this instanceof Effect?this.parent.effects:this.parent.items:game.items;const idx=collection.indexOf(this);if(idx>=0)collection.splice(idx,1);this.parent?.refresh?.();return this;}
 testUserPermission(){return true;}
}
class Effect extends Document{static documentName='ActiveEffect';constructor(data,parent){super(data,parent);this.statuses=new Set(data.statuses||[]);this.disabled=!!data.disabled;}refresh(){this.disabled=!!this._source.disabled;}}
class BaseItem extends Document{static documentName='Item';constructor(data,parent){super(data,parent);this.actor=parent;this.refresh();}refresh(){const M=CONFIG.Item.dataModels?.[this.type];if(M){this.system=new M(this._source.system||{}, {parent:this});this._source.system=Object.fromEntries(Object.keys(M.defineSchema()).map(k=>[k,clone(this.system[k])]));}}static async create(data){const i=new CONFIG.Item.documentClass(data);if(await i._preCreate(data,{},game.user)===false)return;game.items.push(i);return i;}}
class BaseActor extends Document{static documentName='Actor';constructor(data){super(data);this.items=new Collection();this.effects=new Collection();this.refresh();}refresh(){const M=CONFIG.Actor.dataModels?.[this.type];if(M){this.system=new M(this._source.system||{},{parent:this});this._source.system=Object.fromEntries(Object.keys(M.defineSchema()).map(k=>[k,clone(this.system[k])]));this.system.prepareDerivedData();}}static async create(data){const a=new CONFIG.Actor.documentClass(data);await a._preCreate(data,{},game.user);game.actors.push(a);return a;}async createEmbeddedDocuments(type,data){const out=[];for(const d of data){const doc=type==='Item'?new CONFIG.Item.documentClass(d,this):new Effect(d,this);if(type==='Item'&&await doc._preCreate(d,{},game.user)===false)continue;(type==='Item'?this.items:this.effects).push(doc);out.push(doc);}this.refresh();return out;}async deleteEmbeddedDocuments(type,ids){for(const id of ids){const doc=(type==='Item'?this.items:this.effects).get(id);if(doc)await doc.delete({dcfDeleteConfirmed:true});}this.refresh();}}
class BaseTable extends Document{static documentName='RollTable';constructor(data){super(data);this.results=new Collection(...data.results.map(r=>({...r,flags:r.flags||{}})));}static async create(data){const t=new CONFIG.RollTable.documentClass(data);game.tables.push(t);return t;}async draw(){const r=new MockRoll(this._source.formula);await r.evaluate();const results=this.results.filter(x=>r.total>=x.range[0]&&r.total<=x.range[1]);await this.toMessage(results,{roll:r});return {roll:r,results};}async toMessage(){}}
class BaseSheet{constructor(actor){this.actor=actor;this.item=actor;this.isEditable=true;this.element={querySelector:()=>null,querySelectorAll:()=>[]};}async _prepareContext(){return {};}async _onRender(){}render(){}async _onDropItem(e,item){const data=item.toObject();delete data._id;return (await this.actor.createEmbeddedDocuments('Item',[data]))[0];}}
const registrations=[];
const callbacks=new Map();
globalThis.Hooks={once:(name,fn)=>callbacks.set(name,[...(callbacks.get(name)||[]),fn]),on:(name,fn)=>callbacks.set(name,[...(callbacks.get(name)||[]),fn])};
export async function fire(name,...args){for(const fn of callbacks.get(name)||[])await fn(...args);}
globalThis.foundry={data:{fields:{NumberField:Field,StringField:Field,BooleanField:Field,SchemaField,ArrayField}},abstract:{TypeDataModel:Model},documents:{Actor:BaseActor,Item:BaseItem,RollTable:BaseTable},utils:{deepClone:clone,randomID:()=>`key${++sequence}`,expandObject:o=>merge({},o),mergeObject:(a,b,{inplace=true}={})=>merge(inplace?a:clone(a),b)},applications:{api:{DialogV2:{input:async()=>inputs.shift()??null,confirm:async()=>confirmations.shift()??true,prompt:async()=>inputs.shift()??null},HandlebarsApplicationMixin:b=>b},sheets:{ActorSheetV2:BaseSheet,ItemSheetV2:BaseSheet},apps:{DocumentSheetConfig:{registerSheet:(...a)=>registrations.push(a)}},ux:{TextEditor:{implementation:{enrichHTML:async s=>s}}}}};
globalThis.CONFIG={Actor:{},Item:{},RollTable:{},time:{},Combat:{},statusEffects:{}};
globalThis.game={user:{id:'gm',isGM:true,targets:new Set()},users:{activeGM:{id:'gm'}},actors:new Collection(),items:new Collection(),tables:new Collection(),journal:new Collection(),folders:new Collection(),scenes:new Collection(),messages:new Collection(),settings:{register:(scope,key,data)=>{if(!settings.has(scope+'.'+key))settings.set(scope+'.'+key,clone(data.default));},get:(scope,key)=>scope==='core'?'publicroll':settings.get(scope+'.'+key),set:async(scope,key,value)=>{settings.set(scope+'.'+key,clone(value));return value;}}};
globalThis.ui={notifications:{warn(){},info(){},error(){}}};globalThis.canvas={scene:null};
class MockRoll{constructor(formula){this.formula=formula;}async evaluate(){const next=rolls.shift();if(next){this.total=next.total;this.dice=[{results:[{result:next.natural??next.total,active:true}]}];return this;}const expr=this.formula.replace(/(\d*)d(\d+)(kh|kl)?/g,(_,n,d)=>'1');this.total=Function(`return ${expr}`)();this.dice=[{results:[{result:1,active:true}]}];return this;}async render(){return '<div class="dice-roll">Dice</div>';}}
globalThis.Roll=MockRoll;
globalThis.ChatMessage={getSpeaker:({actor})=>({actor:actor?.id}),applyRollMode:()=>{},create:async data=>{const m={...data,id:`msg${++sequence}`};game.messages.push(m);return m;}};
globalThis.Actor={create:data=>BaseActor.create(data)};globalThis.Item={create:data=>BaseItem.create(data)};globalThis.RollTable={create:data=>BaseTable.create(data)};
globalThis.Folder={create:async data=>{const f={...data,id:`folder${++sequence}`,folder:data.folder?{id:data.folder}:null};game.folders.push(f);return f;}};
globalThis.JournalEntry={create:async data=>{const j=new Document(data);game.journal.push(j);return j;}};
await import('../scripts/main.mjs');await fire('init');
export {registrations};
export function reset(){inputs.length=confirmations.length=rolls.length=0;game.actors.length=game.items.length=game.tables.length=game.journal.length=game.messages.length=game.folders.length=game.scenes.length=0;game.user.targets.clear();game.user.isGM=true;settings.set('dcc-crawler-forge.encounter',{active:false,combatKey:'',round:0,phase:0,sceneId:'',actorUuids:[],crawlerCount:0,surprise:false,lastCleanup:0});settings.set('dcc-crawler-forge.dungeon',{floor:1,remaining:540000,elapsed:0,sceneKey:'initial',neighborhood:'',saferoom:false});}
