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
/* Calculator moved into modal — open template and wire modal controls */
const calcRunBtn = document.getElementById('calc-run');

function formatCurrency(num){
  return Number(num).toLocaleString('ru-RU',{minimumFractionDigits:2,maximumFractionDigits:2});
}

function openCalcModal(){
  const tpl = document.getElementById('calc-template');
  if(!tpl) return;
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = `
    <div class="panel" role="dialog" aria-modal="true" aria-label="Калькулятор таможенных платежей">
      <strong>Калькулятор таможенных платежей</strong>
      <div class="panel-body">${tpl.innerHTML}</div>
    </div>
  `;
  document.body.appendChild(overlay);
  // focus first interactive element
  const firstOpt = overlay.querySelector('.option');
  if(firstOpt) firstOpt.focus();

  // manage selection within modal
  let activeOption = null;
  const options = overlay.querySelectorAll('.option');
  options.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      options.forEach(b=>b.classList.remove('selected'));
      btn.classList.add('selected');
      activeOption = btn.dataset.key;
      const firstInput = overlay.querySelector('#modal-goods-value');
      if(firstInput) firstInput.focus();
    });
  });

  const resultNode = overlay.querySelector('#modal-calc-result');

  function computeModal(){
    const goods = parseFloat(overlay.querySelector('#modal-goods-value').value) || 0;
    const tariff = parseFloat(overlay.querySelector('#modal-tariff-rate').value) || 0;
    const vatRate = parseFloat(overlay.querySelector('#modal-vat-rate').value) || 0;
    const excise = parseFloat(overlay.querySelector('#modal-excise-rate').value) || 0;

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

  // button handlers
  const closeBtn = overlay.querySelector('#modal-close');
  const runBtn = overlay.querySelector('#modal-run');

  overlay.addEventListener('click', (e)=>{
    if(e.target === overlay) overlay.remove();
  });
  if(closeBtn) closeBtn.addEventListener('click', ()=> overlay.remove());
  if(runBtn) runBtn.addEventListener('click', computeModal);

  // keyboard: Escape closes modal
  function onKey(e){
    if(e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', onKey);
    }
  }
  document.addEventListener('keydown', onKey);
}

if(calcRunBtn){
  calcRunBtn.addEventListener('click', openCalcModal);
}

document.getElementById('create-docs').addEventListener('click', ()=>{
  showPanel('Конструктор документов', 'Открыть конструктор деклараций и сопроводительных документов.', 'Создать');
});
document.getElementById('ask-ai').addEventListener('click', ()=>{
  showPanel('AI Помощник', 'Задайте вопрос по таможенному законодательству и оформлению грузов.', 'Задать вопрос');
});
document.getElementById('open-kb').addEventListener('click', ()=>{
  const tpl = document.getElementById('kb-template');
  if(tpl){
    // create a modal panel with the template's inner content
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `
      <div class="panel" role="dialog" aria-modal="true" aria-label="База знаний">
        <strong>База знаний</strong>
        <div class="kb-panel-content">${tpl.innerHTML}</div>
        <div class="panel-actions">
          <button class="btn outline close">Закрыть</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('.close').focus();
    // make inner scrollable container keyboard-focusable
    const inner = overlay.querySelector('.kb-scroll');
    if(inner) inner.focus();
    overlay.addEventListener('click', (e)=>{
      if(e.target===overlay || e.target.classList.contains('close')) overlay.remove();
    });
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
