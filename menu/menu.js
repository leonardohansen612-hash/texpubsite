const search = document.querySelector('#menu-search');
const pages = [...document.querySelectorAll('.page')];
const tabs = [...document.querySelectorAll('.tabs a')];
const status = document.querySelector('#menu-status');
const norm = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
function filterMenu() {
  const terms = norm(search.value).trim().split(/\s+/).filter(Boolean);
  let total = 0;
  for (const page of pages) {
    let found = 0;
    for (const group of page.querySelectorAll('.menu-group')) {
      let visible = 0;
      for (const item of group.querySelectorAll('.menu-item')) {
        const text = norm(item.textContent + ' ' + group.querySelector('h3').textContent + ' ' + page.querySelector('h2').textContent);
        const match = terms.every(term => text.includes(term));
        item.hidden = !match;
        if (match) visible++;
      }
      group.hidden = !visible;
      found += visible;
    }
    page.hidden = !found;
    page.querySelector('.original').hidden = !!terms.length;
    const tab = tabs.find(a => a.hash === '#' + page.id);
    if (tab) tab.hidden = !found;
    total += found;
  }
  status.textContent = terms.length ? (total ? total + (total === 1 ? ' item encontrado.' : ' itens encontrados.') : 'Nenhum item encontrado. Tente outro termo.') : '';
}
search.addEventListener('input', filterMenu);
const tabState = () => tabs.forEach(a => {
  if (location.hash === a.hash) a.setAttribute('aria-current','true');
  else a.removeAttribute('aria-current');
});
addEventListener('hashchange',tabState);
tabState();
