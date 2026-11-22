const R=window.Receitas;
(async()=>{
 const container=document.getElementById('receitaContainer');const requested=new URLSearchParams(location.search).get('id');
 if(!R.validId(requested)){container.replaceChildren(R.elemento('p','Receita não encontrada.'));return;}
 try{
  const data=await R.catalogo();const id=Object.prototype.hasOwnProperty.call(data.aliases||{},requested)?data.aliases[requested]:requested;
  if(!R.validId(id)||!data.arquivos.includes(id+'.json'))throw Error();
  const rec=await R.carregar(id);document.title=rec.titulo+' · Minhas Receitas';
  const article=R.elemento('article',undefined,'receita-detalhe');
  if(id!==requested)article.append(R.elemento('p','Este endereço apontava para uma cópia do creme de chocolate. Exibindo a receita original.','aviso'));
  article.append(R.elemento('h1',rec.titulo),R.elemento('p',`${R.categoria(rec.categoria)} · ${rec.tempoPreparo} · ${rec.rendimento}`,'meta-info'));
  article.append(window.CompartilharReceita.criar(rec));
  const img=R.imagem(rec,'img-destaque');if(img)article.append(img);
  article.append(R.elemento('p',rec.descricao,'descricao-longa'));
  for(const [titulo,tag,items] of [['🛒 Ingredientes','ul',rec.ingredientes],['👩‍🍳 Modo de preparo','ol',rec.modoPreparo]]){
   const section=R.elemento('section',undefined,'secao-receita'),list=R.elemento(tag);section.append(R.elemento('h2',titulo));
   list.append(...items.filter(item=>item.trim()).map(item=>R.elemento('li',item)));section.append(list);article.append(section);
  }
  container.replaceChildren(article);
 }catch{container.replaceChildren(R.elemento('p','Não foi possível carregar esta receita. Volte ao catálogo e tente novamente.'));}
})();
