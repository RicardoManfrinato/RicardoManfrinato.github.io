const R=window.Receitas;
const grid=document.getElementById('receitasGrid'),status=document.getElementById('catalogoStatus'),search=document.getElementById('searchInput');
let receitas=[],categoriaAtiva='',falhas=[];
function filtrar(){
 const termo=R.normalizar(search.value);
 const lista=receitas.filter(r=>(!categoriaAtiva||R.categoria(r.categoria)===categoriaAtiva)&&(!termo||R.normalizar(r.titulo+' '+r.ingredientes.join(' ')).includes(termo)));
 grid.replaceChildren(...lista.map(rec=>{
  const card=R.elemento('article',undefined,'card'),content=R.elemento('div',undefined,'card-content');
  const img=R.imagem(rec);if(img)card.append(img);
  content.append(R.elemento('span',R.categoria(rec.categoria),'badge'),R.elemento('h3',rec.titulo),R.elemento('p',rec.descricao));
  const link=R.elemento('a','Ver Receita','btn');link.href='receita.html?id='+encodeURIComponent(rec.id);content.append(link);card.append(content);return card;
 }));
 if(!lista.length)grid.append(R.elemento('p',receitas.length?'Nenhuma receita encontrada com esses filtros.':'Nenhuma receita disponível.'));
 status.textContent=`${lista.length} de ${receitas.length} receitas${categoriaAtiva?' · '+categoriaAtiva:''}.`;
 const aviso=document.getElementById('catalogoAviso');aviso.hidden=!falhas.length;
 aviso.textContent=falhas.length?'Não foi possível carregar: '+falhas.join(', ')+'. As demais receitas continuam disponíveis.':'';
 document.querySelectorAll('[data-categoria]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.categoria===categoriaAtiva)));
}
function criarCategorias(){
 const nomes=['',...new Set(receitas.map(r=>R.categoria(r.categoria)).sort((a,b)=>a.localeCompare(b,'pt-BR')))];
 document.getElementById('categorias').replaceChildren(...nomes.map(nome=>{
  const li=R.elemento('li'),button=R.elemento('button',nome||'Todas');button.type='button';button.dataset.categoria=nome;
  button.onclick=()=>{categoriaAtiva=nome;filtrar();document.getElementById('navMenu').classList.remove('active');document.getElementById('hamburgerBtn').setAttribute('aria-expanded','false');};li.append(button);return li;
 }));
}
async function iniciar(){try{
 const data=await R.catalogo();const resultados=[];
 // The authenticated remote gateway deliberately limits connections. Keep a
 // bounded number of recipe reads instead of flooding its HTTPS proxy over HTTP/2.
 for(let offset=0;offset<data.arquivos.length;offset+=4){
  resultados.push(...await Promise.allSettled(data.arquivos.slice(offset,offset+4).map(file=>R.carregar(file.slice(0,-5)))));
 }
 resultados.forEach((item,i)=>{if(item.status==='fulfilled')receitas.push(item.value);else falhas.push(data.arquivos[i]);});
 receitas.sort((a,b)=>a.titulo.localeCompare(b.titulo,'pt-BR'));criarCategorias();filtrar();
}catch{grid.replaceChildren(R.elemento('p','Não foi possível carregar o catálogo. Atualize a página para tentar novamente.'));status.textContent='Catálogo indisponível.';}}
search.addEventListener('input',filtrar);
document.getElementById('limparFiltros').onclick=()=>{search.value='';categoriaAtiva='';filtrar();};
document.getElementById('hamburgerBtn').onclick=()=>{const open=document.getElementById('navMenu').classList.toggle('active');document.getElementById('hamburgerBtn').setAttribute('aria-expanded',String(open));};
iniciar();
