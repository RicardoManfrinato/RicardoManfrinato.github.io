/* Share only the selected recipe. No contacts, automatic sending or private links. */
window.CompartilharReceita=(()=>{
 const R=window.Receitas;
 function texto(rec){
  return [rec.titulo,'',`Categoria: ${R.categoria(rec.categoria)}`,
   `Tempo de preparo: ${rec.tempoPreparo}`,`Rendimento: ${rec.rendimento}`,
   '',rec.descricao,'','INGREDIENTES',
   ...rec.ingredientes.filter(item=>item.trim()).map(item=>'• '+item),
   '','MODO DE PREPARO',
   ...rec.modoPreparo.filter(item=>item.trim()).map((item,i)=>`${i+1}. ${item}`)
  ].join('\n').trim();
 }
 function criar(rec){
  const content=texto(rec),section=R.elemento('section',undefined,'compartilhar-receita');
  section.setAttribute('aria-label','Compartilhar esta receita');
  const actions=R.elemento('div',undefined,'compartilhar-acoes');
  const status=R.elemento('p','','compartilhar-status');status.setAttribute('role','status');
  const help=R.elemento('p','Envie a receita completa, com ingredientes e preparo. A pessoa recebe o texto e não precisa acessar este site.','compartilhar-nota');
  const field=R.elemento('textarea');field.readOnly=true;field.value=content;field.hidden=true;
  field.setAttribute('aria-label','Texto completo da receita para copiar');field.rows=8;
  function mostrarTexto(){field.hidden=false;field.focus();field.select();}
  const share=R.elemento('button','Compartilhar','btn');share.type='button';
  share.onclick=async()=>{
   if(typeof navigator.share!=='function'){
    mostrarTexto();status.textContent='Escolha WhatsApp ou Copiar receita. Você também pode selecionar e copiar o texto abaixo.';return;
   }
   try{
    // Invoke directly from the click to preserve mobile user activation.
    await navigator.share({title:rec.titulo,text:content});
    status.textContent='Receita encaminhada ao aplicativo escolhido. Confira o envio nele.';
   }catch(error){
    if(error.name==='AbortError'){status.textContent='Compartilhamento cancelado.';return;}
    mostrarTexto();status.textContent='O menu de compartilhamento não está disponível. Use WhatsApp ou copie o texto abaixo.';
   }
  };
  const whatsapp=R.elemento('a','WhatsApp','btn compartilhar-whatsapp');
  whatsapp.href='https://wa.me/?text='+encodeURIComponent(content);
  whatsapp.target='_blank';whatsapp.rel='noopener noreferrer';
  whatsapp.setAttribute('aria-label','Abrir WhatsApp com o texto desta receita');
  whatsapp.onclick=()=>{status.textContent='No WhatsApp, escolha a pessoa e confirme o envio. Se o aplicativo não abrir, use Copiar receita.';};
  const copy=R.elemento('button','Copiar receita','btn compartilhar-secundario');copy.type='button';
  copy.onclick=async()=>{
   try{
    if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');
    await navigator.clipboard.writeText(content);
    status.textContent='Receita completa copiada. Cole na conversa de sua escolha.';
   }catch{
    mostrarTexto();let copied=false;
    try{copied=typeof document.execCommand==='function'&&document.execCommand('copy');}catch{}
    status.textContent=copied?'Receita completa copiada. Cole na conversa de sua escolha.':'Texto selecionado abaixo. Use Copiar no seu aparelho e cole na conversa.';
   }
  };
  const download=R.elemento('button','Baixar receita (.txt)','btn compartilhar-secundario');download.type='button';
  download.onclick=()=>{
   const url=URL.createObjectURL(new Blob(['\ufeff',content],{type:'text/plain;charset=utf-8'}));
   const link=R.elemento('a');link.href=url;link.download=rec.id+'.txt';
   document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
   status.textContent='Arquivo de texto preparado para baixar. Você pode anexá-lo a uma mensagem.';
  };
  actions.append(share,whatsapp,copy,download);section.append(actions,help,status,field);return section;
 }
 return {texto,criar};
})();
