const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#nav');
const changeMenu = (open) => {
  nav.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  toggle.textContent = open ? '×' : '☰';
};
toggle.addEventListener('click', () => changeMenu(!nav.classList.contains('open')));
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => changeMenu(false)));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && nav.classList.contains('open')) { changeMenu(false); toggle.focus(); }
});
document.querySelector('#year').textContent = new Date().getFullYear();

const events = window.TEX_EVENTS || [];
const today = window.texToday;
const dateLabel = iso => iso.split('-').reverse().join('/');
const upcoming = events.find(event => event.title && !event.pending && event.date >= today());
if (upcoming) {
  document.querySelector('#featured-label').textContent = upcoming.date === today() ? 'HOJE NO TEX' : 'PRÓXIMO ROLÊ · ' + dateLabel(upcoming.date).slice(0,5);
  document.querySelector('#featured-title').textContent = upcoming.title;
  const details = [upcoming.description, ...upcoming.extra].filter(Boolean).join(' · ');
  if (details) document.querySelector('#featured-description').textContent = details;
  document.querySelector('#featured-link').href = '/calendario/?evento=' + upcoming.date + '#evento-' + upcoming.date;
}

const form = document.querySelector('#reservation-form');
const {name: nameInput,date: dateInput,time: timeInput,guests: guestsInput} = form.elements;
const feedback = document.querySelector('#form-feedback');
const context = document.querySelector('#reserve-event');
const guidance = document.querySelector('#reserve-hours');
const requestedDate = new URLSearchParams(location.search).get('evento');
const eligible = date => events.find(event => event.date === date && event.title && !event.pending);
const selectedEvent = eligible(requestedDate);
dateInput.min = today();
if (selectedEvent && requestedDate >= today()) dateInput.value = requestedDate;

function updateDateContext() {
  const selectedDate = dateInput.value;
  const event = eligible(selectedDate);
  const pending = events.find(e => e.date === selectedDate && e.pending);
  context.hidden = !event && !pending;
  context.textContent = event ? 'Programação do dia: ' + event.title : pending ? 'A transmissão deste jogo no Tex ainda não foi confirmada.' : '';
  const [min,max] = event?.hours || ['17:00','23:59'];
  timeInput.min = min; timeInput.max = max;
  guidance.textContent = event?.hours
    ? 'Nesta data, solicite um horário entre ' + min + ' e ' + max + '.'
    : 'Horário habitual: quarta a sábado, das 17h às 00h. Confira os horários especiais na programação.';
}
updateDateContext();
dateInput.addEventListener('change',updateDateContext);
const fail = (input, message) => {
  input.setAttribute('aria-invalid','true');
  feedback.textContent = message;
  input.focus();
};
form.addEventListener('input', e => {
  e.target.removeAttribute('aria-invalid');
  feedback.textContent = '';
});
form.addEventListener('submit', e => {
  e.preventDefault();
  feedback.textContent = '';
  const name = nameInput.value.trim();
  const date = dateInput.value;
  const time = timeInput.value;
  const guests = Number(guestsInput.value);
  if (!name) return fail(nameInput,'Digite seu nome para continuar.');
  if (!date || date < today()) return fail(dateInput,'Escolha uma data a partir de hoje.');
  if (!time || time < timeInput.min || time > timeInput.max) return fail(timeInput,'Escolha um horário entre ' + timeInput.min + ' e ' + timeInput.max + '.');
  if (!Number.isInteger(guests) || guests < 1 || guests > 100) return fail(guestsInput,'Informe uma quantidade de 1 a 100 pessoas.');
  const event = eligible(date);
  const message = [
    'Olá, TEX PUB! Gostaria de solicitar uma reserva. 🍻','',
    '👤 Nome: ' + name, '📅 Data: ' + dateLabel(date), '🕒 Horário: ' + time,
    '👥 Pessoas: ' + guests, ...(event ? ['🎟️ Programação do dia: ' + event.title] : []),'',
    'Aguardo a confirmação da equipe. Obrigado!'
  ].join('\n');
  const url = 'https://wa.me/5511917481700?text=' + encodeURIComponent(message);
  feedback.textContent = 'Abrindo o WhatsApp. Envie a mensagem por lá para solicitar a reserva.';
  location.assign(url);
});
