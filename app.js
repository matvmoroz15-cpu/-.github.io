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
document.getElementById('start-calc').addEventListener('click', ()=> {
  showPanel('Расчет таможенных платежей', 'Запустить быстрый расчет пошлин, налогов и сборов.', 'Начать расчет');
});
document.getElementById('create-docs').addEventListener('click', ()=>{
  showPanel('Конструктор документов', 'Открыть конструктор деклараций и сопроводительных документов.', 'Создать');
});
document.getElementById('ask-ai').addEventListener('click', ()=>{
  showPanel('AI Помощник', 'Задайте вопрос по таможенному законодательству и оформлению грузов.', 'Задать вопрос');
});
document.getElementById('open-kb').addEventListener('click', ()=>{
  showPanel('База знаний', 'Доступ к законам, правилам и судебной практике.', 'Открыть');
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