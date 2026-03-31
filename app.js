/* Lightweight interactive behaviors for the single-page UI.
   Starts interactions immediately (mobile-first). No external libs required. */

const root = document.getElementById('content');

/* Navigation button highlight (visual only) */
document.querySelectorAll('.nav-item').forEach(btn=>{
  btn.addEventListener('click', ()=> {
    document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  });
});

/* Wire main action buttons to simple modal-like overlays */
function showPanel(title, text, actionLabel){
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = `
    <div class="panel" role="dialog" aria-modal="true" aria-label="${title}">
      <strong>${title}</strong>
      <p>${text}</p>
      <div class="panel-actions">
        <button class="btn outline close">Закрыть</button>
        <button class="btn primary action">${actionLabel}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('.close').focus();
  overlay.addEventListener('click', (e)=>{
    if(e.target===overlay || e.target.classList.contains('close')) overlay.remove();
  });
  overlay.querySelector('.action').addEventListener('click', ()=>{
    overlay.remove();
    // Placeholder: actual flows would route to calculators/forms/AI chat
    alert(title + ' — действие запущено');
  });
}

/* Buttons */
/* Inline calculator behavior */
const calcCard = document.getElementById('calc');
const options = calcCard.querySelectorAll('.option');
const resultNode = document.getElementById('calc-result');
const runBtn = document.getElementById('calc-run');
const resetBtn = document.getElementById('calc-reset');

let activeOption = null;
options.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    options.forEach(b=>b.classList.remove('selected'));
    btn.classList.add('selected');
    activeOption = btn.dataset.key;
    // focus first input
    calcCard.querySelector('#goods-value').focus();
  });
});

function formatCurrency(num){
  return Number(num).toLocaleString('ru-RU',{minimumFractionDigits:2,maximumFractionDigits:2});
}

function compute(){
  const goods = parseFloat(document.getElementById('goods-value').value) || 0;
  const tariff = parseFloat(document.getElementById('tariff-rate').value) || 0;
  const vatRate = parseFloat(document.getElementById('vat-rate').value) || 0;
  const excise = parseFloat(document.getElementById('excise-rate').value) || 0;

  // basic calculations (illustrative)
  const customsDuty = goods * (tariff/100);
  const vat = (goods + customsDuty + excise) * (vatRate/100);
  const total = goods + customsDuty + vat + excise;

  if(!activeOption){
    resultNode.textContent = 'Пожалуйста, выберите, что нужно рассчитать.';
    return;
  }

  switch(activeOption){
    case 'customs':
      resultNode.innerHTML = `Таможенная стоимость: <strong>${formatCurrency(customsDuty)} EUR</strong>`;
      break;
    case 'vat':
      resultNode.innerHTML = `НДС: <strong>${formatCurrency(vat)} EUR</strong>`;
      break;
    case 'excise':
      resultNode.innerHTML = `Акциз: <strong>${formatCurrency(excise)} EUR</strong>`;
      break;
    case 'total':
      resultNode.innerHTML = `Итоговый расчёт: <strong>${formatCurrency(total)} EUR</strong>`;
      break;
    default:
      resultNode.textContent = 'Неизвестный вариант.';
  }
}

runBtn.addEventListener('click', compute);
resetBtn.addEventListener('click', ()=>{
  document.getElementById('goods-value').value = 100;
  document.getElementById('tariff-rate').value = 5;
  document.getElementById('vat-rate').value = 20;
  document.getElementById('excise-rate').value = 0;
  options.forEach(b=>b.classList.remove('selected'));
  activeOption = null;
  resultNode.textContent = 'Выберите вариант и введите параметры, затем нажмите "Рассчитать".';
});
document.getElementById('create-docs').addEventListener('click', ()=>{
  showPanel('Конструктор документов', 'Открыть конструктор деклараций и сопроводительных документов.', 'Создать');
});
document.getElementById('ask-ai').addEventListener('click', ()=>{
  showPanel('AI Помощник', 'Задайте вопрос по таможенному законодательству и оформлению грузов.', 'Задать вопрос');
});
document.getElementById('open-kb').addEventListener('click', ()=>{
  // bring the in-card knowledge column into focus/visible area
  const kb = document.getElementById('kb-content');
  if(kb){
    kb.scrollIntoView({behavior:'smooth',block:'center'});
    kb.focus();
  } else {
    showPanel('База знаний', 'Доступ к законам, правилам и судебной практике.', 'Открыть');
  }
});

/* Simple styling injected for overlay panel to keep files minimal */
const css = `
.overlay{
  position:fixed;inset:0;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(rgba(4,20,60,0.35),rgba(4,20,60,0.35));
  z-index:60;padding:20px;
}
.panel{
  width:100%;max-width:520px;background:#fff;border-radius:12px;padding:18px;box-shadow:0 12px 40px rgba(11,94,255,0.12);
}
.panel p{color:#374151;margin:10px 0 16px}
.panel-actions{display:flex;gap:10px;justify-content:flex-end}
.panel .btn{min-width:110px}
`;
const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);

/* Keep layout within one screen: prevent accidental body scroll on mobile when overlays open */
document.addEventListener('touchmove', (e)=>{}, {passive:true});

/* Личный кабинет: toggle menu and simple handlers */
const accountBtn = document.getElementById('account-btn');
const accountMenu = document.getElementById('account-menu');
const accountWrap = document.getElementById('account');

if(accountBtn && accountMenu && accountWrap){
  function closeAccountMenu(){
    accountMenu.hidden = true;
    accountBtn.setAttribute('aria-expanded','false');
  }
  function openAccountMenu(){
    accountMenu.hidden = false;
    accountBtn.setAttribute('aria-expanded','true');
    // focus first menu item
    const first = accountMenu.querySelector('.menu-item');
    if(first) first.focus();
  }

  accountBtn.addEventListener('click', (e)=>{
    const isOpen = accountMenu.hidden === false;
    if(isOpen) closeAccountMenu(); else openAccountMenu();
  });

  // close when clicking outside
  document.addEventListener('click', (e)=>{
    if(!accountWrap.contains(e.target)) closeAccountMenu();
  });

  // keyboard: Esc to close
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') closeAccountMenu();
  });

  // handle menu item actions (placeholder)
  accountMenu.addEventListener('click', (e)=>{
    const btn = e.target.closest('.menu-item');
    if(!btn) return;
    const action = btn.dataset.action;
    closeAccountMenu();
    // basic routing placeholder: show panel for each section
    switch(action){
      case 'profile': showPanel('Профиль', 'Открыть ваш профиль.', 'Перейти'); break;
      case 'history': showPanel('История действий', 'Просмотр недавних действий в системе.', 'Открыть'); break;
      case 'calculations': showPanel('Предыдущие расчёты', 'Список ваших предыдущих расчетов.', 'Открыть'); break;
      case 'viewed': showPanel('Просмотренные документы', 'Документы, которые вы просматривали ранее.', 'Открыть'); break;
      default: break;
    }
  });
}
