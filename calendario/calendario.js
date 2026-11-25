const events = window.TEX_EVENTS || [];
const today = window.texToday();
const wanted = new URLSearchParams(location.search).get('evento');
const activeDate = events.find(e => e.date === wanted)?.date;
let month = activeDate ? Number(activeDate.slice(5,7)) : today >= '2026-12-01' ? 12 : 11;
let filter = 'Todos';
const list = document.querySelector('#events');
const feature = document.querySelector('#cal-feature');
const week = ['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
const labels = {11:'Novembro',12:'Dezembro'};
const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  return node;
};
const addArrow = (link) => {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns,'svg');
  svg.setAttribute('class','icon'); svg.setAttribute('viewBox','0 0 16 16');
  svg.setAttribute('aria-hidden','true'); svg.setAttribute('focusable','false');
  const path = document.createElementNS(ns,'path'); path.setAttribute('d','M4 12 12 4M5 4h7v7');
  svg.append(path); link.append(' ',svg);
};
const reserveLink = (event,cls) => {
  const link = el('a',cls,'SOLICITAR RESERVA');
  link.href = '/?evento=' + event.date + '#reserva';
  link.setAttribute('aria-label','Solicitar reserva para ' + event.title + ' em ' + event.date.split('-').reverse().join('/'));
  addArrow(link);
  return link;
};
const monthIncludes = event => Number(event.date.slice(5,7)) === month;
const render = () => {
  document.querySelector('#month-title').textContent = labels[month] + ' de 2026';
  document.querySelectorAll('[data-month],[data-filter]').forEach(button => {
    const state = button.dataset.month ? Number(button.dataset.month) === month : button.dataset.filter === filter;
    button.classList.toggle('active',state);
    button.setAttribute('aria-pressed',String(state));
  });
  const next = events.find(e => monthIncludes(e) && e.date >= today && e.title && !e.pending &&
    (filter === 'Todos' || e.categories.includes(filter) || filter === 'Especial' && e.categories.includes('Festa')));
  feature.hidden = !next;
  feature.replaceChildren();
  if (next) {
    const img = el('img'); img.src = '/assets/126-003A2587.webp'; img.alt = 'Público reunido no Tex Pub';
    const details = el('div');
    details.append(el('div','eyebrow',next.date === today ? 'HOJE NO TEX' : 'PRÓXIMO NESTA SELEÇÃO · ' + next.date.slice(8) + '/' + next.date.slice(5,7)),
      el('h2','',next.title));
    if (next.description || next.extra.length) details.append(el('p','',[next.description,...next.extra].filter(Boolean).join(' · ')));
    details.append(reserveLink(next,'spotlight-action'));
    feature.append(img,details);
  }
  const selected = events.filter(e => monthIncludes(e) && (filter === 'Todos' || e.categories.includes(filter) || filter === 'Especial' && e.categories.includes('Festa')));
  list.replaceChildren();
  if (!selected.length) list.append(el('p','','Nenhum evento nessa categoria neste mês.'));
  for (const event of selected) {
    const card = el('article','event' + (!event.title ? ' empty' : '') + (event.type === 'Festa' ? ' special' : ''));
    card.id = 'evento-' + event.date;
    const header = el('div','date');
    header.append(el('strong','day',event.date.slice(-2)),el('div','meta',week[new Date(event.date+'T12:00:00').getDay()] + ' · ' + labels[month].slice(0,3)));
    if (event.categories.length) {
      const categories = el('div','categories');
      event.categories.forEach(category => categories.append(el('span','category',category)));
      header.append(categories);
    }
    card.append(header,el('h3','',event.title || 'Programação a confirmar'));
    if (event.description) card.append(el('p','description',event.description));
    if (event.extra.length) card.append(el('p',event.pending ? 'extra pending' : 'extra',event.extra.join(' · ')));
    if (!event.title) card.append(el('p','foot','Nenhuma atração anunciada até o momento.'));
    else if (!event.pending && event.date >= today) card.append(reserveLink(event,'reserve'));
    list.append(card);
  }
};
document.querySelectorAll('[data-month]').forEach(b => b.addEventListener('click',() => { month=Number(b.dataset.month);render(); }));
document.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click',() => { filter=b.dataset.filter;render(); }));
render();
if (activeDate) requestAnimationFrame(() => document.getElementById('evento-' + activeDate)?.scrollIntoView());
