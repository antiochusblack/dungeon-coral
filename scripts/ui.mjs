import {ID} from './config.mjs';
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const lines=s=>esc(s).replace(/\n/g,'<br>');
export const opts=(values,current)=>Object.entries(values).map(([k,v])=>`<option value="${esc(k)}" ${k===current?'selected':''}>${esc(v)}</option>`).join('');
export const ask=(title,content)=>foundry.applications.api.DialogV2.input({window:{title},content,rejectClose:false,ok:{label:'Apply'}});
export const confirm=content=>foundry.applications.api.DialogV2.confirm({window:{title:'Please confirm'},content:`<p>${esc(content)}</p>`,rejectClose:false});
export async function chat(actor,title,content,rolls=[],flags={}){const data={speaker:ChatMessage.getSpeaker({actor}),content:`<article class="dcf-card"><header><small>WORLD DUNGEON // CRAWLER FEED</small><h3>${esc(title)}</h3></header><div>${content}</div></article>`,rolls,flags:{[ID]:flags}};ChatMessage.applyRollMode(data,game.settings.get('core','rollMode'));return ChatMessage.create(data);}
export async function chooseFile(title){return foundry.applications.api.DialogV2.prompt({window:{title},rejectClose:false,content:'<label>JSON file <input type="file" name="file" accept=".json"></label>',ok:{label:'Import',callback:(event,button)=>button.form.elements.file.files[0]}});}
export async function audit(actor,text){await actor.update({'system.log':`${new Date().toISOString().slice(0,10)} — ${text}\n${actor.system.log||''}`.slice(0,24000)});}
