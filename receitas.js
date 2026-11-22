/* Shared static recipe reader. Recipe content is data, never executable HTML. */
window.Receitas=(()=>{
 const validId=id=>typeof id==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);
 const normalizar=texto=>texto.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
 const categorias={'bebidas':'Bebidas','caseiros':'Caseiros','coberturas-e-recheios':'Coberturas e recheios','doces':'Doces','doces-e-sobremesas':'Sobremesas','sobremesas':'Sobremesas','paes':'Pães','salgados':'Salgados','temperos':'Temperos','lanches':'Lanches'};
 const categoria=value=>categorias[normalizar(value)]||value.trim();
 function validar(receita,id){
  if(!receita||receita.id!==id||!validId(id))throw Error('Identificador de receita inválido.');
  for(const campo of ['titulo','categoria','tempoPreparo','rendimento','descricao'])if(typeof receita[campo]!=='string'||!receita[campo].trim())throw Error('Campo obrigatório inválido: '+campo);
  for(const campo of ['ingredientes','modoPreparo'])if(!Array.isArray(receita[campo])||!receita[campo].length||receita[campo].some(item=>typeof item!=='string'))throw Error('Lista inválida: '+campo);
  if(typeof receita.imagem!=='string')throw Error('Imagem inválida.');return receita;
 }
 async function json(path){
  for(let attempt=0;attempt<3;attempt++){
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
   try{
    const response=await fetch(path,{cache:'no-store',signal:controller.signal});
    if([429,502,503,504].includes(response.status)&&attempt<2){await new Promise(resolve=>setTimeout(resolve,300*(attempt+1)));continue;}
    if(!response.ok)throw Error('Arquivo indisponível.');
    return await response.json();
   }catch(error){
    if(attempt<2&&(error instanceof TypeError||error.name==='AbortError')){await new Promise(resolve=>setTimeout(resolve,300*(attempt+1)));continue;}
    throw error;
   }finally{clearTimeout(timer);}
  }
 }
 async function catalogo(){const data=await json('catalogo.json');if(!Array.isArray(data.arquivos)||!data.arquivos.every(id=>validId(id.replace(/\.json$/,''))&&id.endsWith('.json'))||new Set(data.arquivos).size!==data.arquivos.length)throw Error('Catálogo inválido.');return data;}
 async function carregar(id){if(!validId(id))throw Error('Receita não encontrada.');return validar(await json('receitas/'+id+'.json'),id);}
 function elemento(tag,texto,classe){const node=document.createElement(tag);if(texto!==undefined)node.textContent=texto;if(classe)node.className=classe;return node;}
 function imagem(receita,classe){if(!receita.imagem.trim())return null;try{const url=new URL(receita.imagem,location.href);if(!['http:','https:'].includes(url.protocol)||url.username||url.password)return null;const img=elemento('img',undefined,classe);img.alt=receita.titulo;img.src=url.href;img.loading='lazy';img.addEventListener('error',()=>img.remove(),{once:true});return img;}catch{return null;}}
 return {validId,normalizar,categoria,catalogo,carregar,elemento,imagem};
})();
