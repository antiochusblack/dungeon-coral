import {importReference} from './reference.mjs';

/** World-wide content belongs in the Journal sidebar, including its popout. */
export function addContentImportButton(application,element){
 const root=element?.querySelector?element:element?.[0];
 if(!root)return;
 const existing=root.querySelector('[data-dcf-content-import]');
 if(!game.user.isGM){existing?.remove();return;}
 if(existing)return;
 const button=root.ownerDocument.createElement('button');
 button.type='button';button.dataset.dcfContentImport='';
 button.className='dcf-content-import';
 button.textContent='Import DCC game content';
 button.title='Import the private JSON pack into world Journals, Roll Tables and Items.';
 button.addEventListener('click',async event=>{
  event.preventDefault();event.stopPropagation();button.disabled=true;
  try{await importReference();}catch(error){ui.notifications.error(error.message||String(error));}
  finally{button.disabled=false;}
 });
 const header=root.querySelector('.directory-header')||root.querySelector('[data-application-part="header"]');
 if(header)header.append(button);else root.prepend(button);
}
