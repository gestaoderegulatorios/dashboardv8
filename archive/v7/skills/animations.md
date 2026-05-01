# ✨ BORGONOVI V7 — MOTION & ANIMATIONS

> Sistema completo de motion design, easing curves, micro-interactions e transições sofisticadas.
> Consultar este arquivo para adicionar polimento visual premium ao dashboard.

---

## FILOSOFIA DE MOVIMENTO

> Animação em BI corporativo tem UMA função: **reduzir carga cognitiva**.
> Movimento bom é invisível — o usuário entende, mas não percebe a animação.
> Movimento ruim chama atenção para si mesmo.

### Princípios

1. **Function over flash** — toda animação tem propósito (orientar, confirmar, revelar)
2. **Fast & snappy** — 150–400ms na maioria dos casos, nunca >600ms
3. **Ease naturalmente** — use curvas baseadas em física (cubic-bezier), nunca `linear`
4. **Stagger é opcional, não regra** — use para listas, não para tudo
5. **Respeitar `prefers-reduced-motion`** — sempre, sem exceção

---

## MOTION TOKENS (COPIAR EXATAMENTE)

### Durations

| Token | Valor | Quando usar |
|-------|-------|-------------|
| `--dur-instant` | 100ms | Micro-interactions: button press, checkbox tick |
| `--dur-fast` | 150ms | Hover state changes, color transitions |
| `--dur-base` | 200ms | Expansão de items, reveal básico |
| `--dur-medium` | 300ms | View transitions, drawer abrindo |
| `--dur-slow` | 400ms | Page transitions, reveal principal |
| `--dur-deliberate` | 600ms | Apenas para hero reveals, chart render inicial |

### Easings

| Token | cubic-bezier | Quando usar |
|-------|--------------|-------------|
| `--ease-standard` | `(0.4, 0, 0.2, 1)` | Padrão Material — maioria dos casos |
| `--ease-decelerate` | `(0, 0, 0.2, 1)` | Entrando na tela (fade/slide in) |
| `--ease-accelerate` | `(0.4, 0, 1, 1)` | Saindo da tela (fade/slide out) |
| `--ease-emphasized` | `(0.2, 0, 0, 1)` | Movimento com caráter (cards, hero) |
| `--ease-spring` | `(0.34, 1.56, 0.64, 1)` | Bounce sutil (toasts, badges novos) |
| `--ease-crisp` | `(0.22, 1, 0.36, 1)` | Para elementos em card (hover lift) |

### Stagger delays

Para listas/grids, escalonar com **40–80ms** entre items, nunca mais de 500ms total.

```css
.stagger-item:nth-child(1) { animation-delay: 0ms; }
.stagger-item:nth-child(2) { animation-delay: 60ms; }
.stagger-item:nth-child(3) { animation-delay: 120ms; }
.stagger-item:nth-child(4) { animation-delay: 180ms; }
.stagger-item:nth-child(5) { animation-delay: 240ms; }
.stagger-item:nth-child(n+6) { animation-delay: 300ms; } /* Cap */
```

---

## CSS COMPLEMENTAR (adicionar ao bloco `<style>` da SKILL.md)

```css
/* ============================================
   MOTION TOKENS — Variáveis CSS globais
   ============================================ */
:root {
    --dur-instant: 100ms;
    --dur-fast: 150ms;
    --dur-base: 200ms;
    --dur-medium: 300ms;
    --dur-slow: 400ms;
    --dur-deliberate: 600ms;

    --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
    --ease-decelerate: cubic-bezier(0, 0, 0.2, 1);
    --ease-accelerate: cubic-bezier(0.4, 0, 1, 1);
    --ease-emphasized: cubic-bezier(0.2, 0, 0, 1);
    --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
    --ease-crisp: cubic-bezier(0.22, 1, 0.36, 1);
}

/* ============================================
   REVEAL ON SCROLL — Intersection Observer
   ============================================ */
.reveal {
    opacity: 0;
    transform: translateY(16px);
    transition: opacity var(--dur-slow) var(--ease-decelerate),
                transform var(--dur-slow) var(--ease-decelerate);
}
.reveal.visible {
    opacity: 1;
    transform: translateY(0);
}
.reveal-scale {
    opacity: 0;
    transform: scale(0.96);
    transition: opacity var(--dur-medium) var(--ease-decelerate),
                transform var(--dur-medium) var(--ease-decelerate);
}
.reveal-scale.visible {
    opacity: 1;
    transform: scale(1);
}

/* ============================================
   STAGGER — delay automático em grid/lista
   ============================================ */
.stagger > * {
    opacity: 0;
    transform: translateY(12px);
    animation: staggerIn var(--dur-slow) var(--ease-decelerate) forwards;
}
.stagger > *:nth-child(1) { animation-delay: 0ms; }
.stagger > *:nth-child(2) { animation-delay: 60ms; }
.stagger > *:nth-child(3) { animation-delay: 120ms; }
.stagger > *:nth-child(4) { animation-delay: 180ms; }
.stagger > *:nth-child(5) { animation-delay: 240ms; }
.stagger > *:nth-child(6) { animation-delay: 300ms; }
.stagger > *:nth-child(n+7) { animation-delay: 340ms; }
@keyframes staggerIn {
    to { opacity: 1; transform: translateY(0); }
}

/* ============================================
   CARD HOVER LIFT — elevação sutil
   ============================================ */
.card-lift {
    transition: transform var(--dur-base) var(--ease-crisp),
                box-shadow var(--dur-base) var(--ease-crisp),
                border-color var(--dur-base) var(--ease-crisp);
}
.card-lift:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px -8px rgba(10, 31, 68, 0.12),
                0 2px 4px -2px rgba(10, 31, 68, 0.06);
    border-color: #c5c6cf;
}

/* ============================================
   CARD TILT — tilt 3D sutil ao hover
   Usar APENAS em cards de destaque (não em grid denso)
   ============================================ */
.card-tilt {
    transition: transform var(--dur-medium) var(--ease-crisp);
    transform-style: preserve-3d;
    will-change: transform;
}
.card-tilt:hover {
    transform: perspective(1000px) rotateX(2deg) rotateY(-2deg) translateZ(4px);
}

/* ============================================
   GRADIENT TEXT — para títulos hero
   Usar com moderação (1–2 por dashboard)
   ============================================ */
.text-gradient {
    background: linear-gradient(135deg, #4c5e86 0%, #0a1f44 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
}

/* ============================================
   ANIMATED BORDER — borda gradient que pulsa
   Usar em elementos de alta prioridade (KPI crítico)
   ============================================ */
.border-glow {
    position: relative;
    border: 1px solid transparent;
    background: linear-gradient(#fff, #fff) padding-box,
                linear-gradient(135deg, #4c5e86, #b4c6f4, #4c5e86) border-box;
    background-size: 100% 100%, 200% 200%;
    animation: borderShift 4s linear infinite;
}
@keyframes borderShift {
    0% { background-position: 0% 0%, 0% 50%; }
    100% { background-position: 0% 0%, 200% 50%; }
}

/* ============================================
   RIPPLE EFFECT — ondulação ao clicar
   Aplicado automaticamente via Borg.attachRipple()
   ============================================ */
.ripple-container {
    position: relative;
    overflow: hidden;
}
.ripple-wave {
    position: absolute;
    border-radius: 50%;
    background: rgba(76, 94, 134, 0.3);
    transform: scale(0);
    animation: ripple 600ms var(--ease-decelerate);
    pointer-events: none;
}
@keyframes ripple {
    to { transform: scale(2.4); opacity: 0; }
}

/* ============================================
   SHIMMER APRIMORADO — mais elegante
   ============================================ */
@keyframes shimmerPro {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
}
.animate-shimmer-pro {
    background: linear-gradient(
        90deg,
        rgba(226, 232, 240, 0.6) 0%,
        rgba(241, 245, 249, 0.9) 50%,
        rgba(226, 232, 240, 0.6) 100%
    ) !important;
    background-size: 1000px 100% !important;
    animation: shimmerPro 1.8s var(--ease-standard) infinite;
}

/* ============================================
   NUMBER TICKER — contador animado com mascara
   ============================================ */
.ticker {
    display: inline-block;
    overflow: hidden;
    vertical-align: bottom;
}
.ticker-digit {
    display: inline-block;
    transition: transform var(--dur-slow) var(--ease-spring);
}

/* ============================================
   PULSE DOT — indicador "ao vivo"
   ============================================ */
.pulse-dot {
    position: relative;
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10b981;
}
.pulse-dot::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: inherit;
    animation: pulseRing 2s var(--ease-decelerate) infinite;
}
@keyframes pulseRing {
    0% { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(2.4); opacity: 0; }
}

/* ============================================
   SMOOTH SCROLL (opt-in por elemento)
   ============================================ */
html {
    scroll-behavior: smooth;
}

/* ============================================
   VIEW TRANSITION aprimorado (substitui viewFadeIn)
   ============================================ */
.view-section {
    animation: viewEnter var(--dur-medium) var(--ease-emphasized);
}
@keyframes viewEnter {
    from { opacity: 0; transform: translateY(12px) scale(0.995); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}

/* ============================================
   TOAST APRIMORADO — slide + scale + bounce leve
   ============================================ */
.toast-animate {
    animation: toastEnter var(--dur-medium) var(--ease-spring);
}
@keyframes toastEnter {
    from { opacity: 0; transform: translateY(24px) scale(0.9); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}

/* ============================================
   KPI VALUE ENTRANCE — escala sutil ao aparecer
   ============================================ */
[data-animate-value] {
    animation: valueEnter var(--dur-slow) var(--ease-emphasized);
}
@keyframes valueEnter {
    from { opacity: 0; transform: scale(0.94); }
    to { opacity: 1; transform: scale(1); }
}

/* ============================================
   FOCUS RING ANIMADO
   ============================================ */
*:focus-visible {
    outline: 2px solid #4c5e86;
    outline-offset: 2px;
    border-radius: 4px;
    animation: focusPulse 0.6s var(--ease-decelerate);
}
@keyframes focusPulse {
    0% { outline-offset: 0; }
    50% { outline-offset: 4px; }
    100% { outline-offset: 2px; }
}

/* ============================================
   REDUCED MOTION — override respeitoso
   ============================================ */
@media (prefers-reduced-motion: reduce) {
    :root {
        --dur-instant: 0ms;
        --dur-fast: 0ms;
        --dur-base: 0ms;
        --dur-medium: 0ms;
        --dur-slow: 0ms;
        --dur-deliberate: 0ms;
    }
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
    .pulse-dot::before { display: none; }
    .border-glow { animation: none; }
    .animate-shimmer-pro { animation: none; }
}
```

---

## JAVASCRIPT COMPLEMENTAR (adicionar ao namespace Borg)

```javascript
// ========== REVEAL ON SCROLL ==========
function initReveal() {
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal, .reveal-scale').forEach(function(el) {
        observer.observe(el);
    });
}

// ========== RIPPLE EFFECT ==========
function attachRipple(element) {
    element.classList.add('ripple-container');
    element.addEventListener('click', function(e) {
        var rect = element.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height);
        var wave = document.createElement('span');
        wave.className = 'ripple-wave';
        wave.style.width = wave.style.height = size + 'px';
        wave.style.left = (e.clientX - rect.left - size / 2) + 'px';
        wave.style.top = (e.clientY - rect.top - size / 2) + 'px';
        element.appendChild(wave);
        setTimeout(function() { wave.remove(); }, 600);
    });
}
function initRipples() {
    document.querySelectorAll('[data-ripple]').forEach(attachRipple);
}

// ========== COMMAND PALETTE (Cmd+K / Ctrl+K) ==========
var commandPalette = {
    open: function() {
        var palette = document.getElementById('command-palette');
        if (!palette) return;
        palette.classList.remove('hidden');
        var input = palette.querySelector('input');
        if (input) { input.value = ''; input.focus(); }
        commandPalette.renderResults('');
    },
    close: function() {
        var palette = document.getElementById('command-palette');
        if (palette) palette.classList.add('hidden');
    },
    renderResults: function(query) {
        var container = document.getElementById('command-palette-results');
        if (!container) return;
        var q = query.toLowerCase().trim();
        var commands = commandPalette.commands.filter(function(c) {
            return !q || c.label.toLowerCase().includes(q) || (c.keywords || '').toLowerCase().includes(q);
        });
        container.innerHTML = commands.map(function(c, i) {
            return '<button class="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 ' +
                (i === 0 ? 'bg-slate-50' : '') + '" data-command-index="' + i + '" ' +
                'onclick="Borg.commandPalette.execute(' + i + ')">' +
                '<span class="material-symbols-outlined text-on-surface-variant">' + (c.icon || 'chevron_right') + '</span>' +
                '<div class="flex-1">' +
                '<div class="text-sm font-medium text-primary">' + c.label + '</div>' +
                (c.hint ? '<div class="text-xs text-on-surface-variant">' + c.hint + '</div>' : '') +
                '</div>' +
                (c.shortcut ? '<kbd class="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">' + c.shortcut + '</kbd>' : '') +
                '</button>';
        }).join('') || '<div class="px-4 py-8 text-center text-sm text-on-surface-variant">Nada encontrado</div>';
    },
    execute: function(index) {
        var container = document.getElementById('command-palette-results');
        var q = document.querySelector('#command-palette input').value.toLowerCase().trim();
        var commands = commandPalette.commands.filter(function(c) {
            return !q || c.label.toLowerCase().includes(q) || (c.keywords || '').toLowerCase().includes(q);
        });
        var cmd = commands[index];
        if (cmd && cmd.action) { cmd.action(); commandPalette.close(); }
    },
    register: function(command) { commandPalette.commands.push(command); },
    commands: []
};

// ========== DARK MODE TOGGLE ==========

// **LEI 3**: O toggle de dark mode DEVE funcionar visualmente.
// É OBRIGATÓRIO incluir um bloco CSS `.dark` com overrides para TODOS os tokens de cor.
// Sem esse bloco CSS, o toggle apenas alterna a classe mas nada muda visualmente.
// Ver bloco CSS completo em SKILL.md → LEI 3.

function toggleDarkMode() {
    var html = document.documentElement;
    var isDark = html.classList.contains('dark');
    html.classList.toggle('dark', !isDark);
    html.classList.toggle('light', isDark);
    state.darkMode = !isDark;
    document.dispatchEvent(new CustomEvent('borg:themeChanged', { detail: { dark: !isDark } }));
    showToast('Tema ' + (!isDark ? 'escuro' : 'claro') + ' ativado', 'info');
}

// ========== EXPORT PDF (via window.print) ==========
function exportPDF(filename) {
    var title = document.title;
    if (filename) document.title = filename;
    window.print();
    document.title = title;
}

// ========== ENHANCED NUMBER FORMATTING ==========
function formatCompact(val) {
    if (val == null || isNaN(val)) return '';
    var abs = Math.abs(val);
    if (abs >= 1e9) return (val / 1e9).toFixed(1).replace('.', ',') + 'B';
    if (abs >= 1e6) return (val / 1e6).toFixed(1).replace('.', ',') + 'M';
    if (abs >= 1e3) return (val / 1e3).toFixed(1).replace('.', ',') + 'K';
    return val.toLocaleString('pt-BR');
}
function formatPercent(val, decimals) {
    decimals = decimals == null ? 1 : decimals;
    return (val == null || isNaN(val)) ? '' : val.toFixed(decimals).replace('.', ',') + '%';
}
function formatDateBR(dateStr) {
    var d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function formatTimeAgo(dateStr) {
    var d = new Date(dateStr);
    var now = new Date();
    var diff = (now - d) / 1000;
    if (diff < 60) return 'agora';
    if (diff < 3600) return Math.floor(diff / 60) + ' min atrás';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h atrás';
    if (diff < 2592000) return Math.floor(diff / 86400) + 'd atrás';
    return formatDateBR(dateStr);
}

// ========== SMOOTH SCROLL HELPERS ==========
function scrollToEl(selector, offset) {
    offset = offset || 80;
    var el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: top, behavior: 'smooth' });
}
```

---

## HTML — Command Palette (adicionar ao skeleton)

```html
<!-- COMMAND PALETTE (Cmd+K) -->
<div id="command-palette"
     class="hidden fixed inset-0 z-[95] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-32 px-4"
     role="dialog" aria-modal="true" aria-labelledby="cmd-palette-title"
     onclick="if(event.target === this) Borg.commandPalette.close()">
    <div class="w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
        <div class="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
            <span class="material-symbols-outlined text-on-surface-variant">search</span>
            <input type="text"
                   class="flex-1 outline-none text-sm placeholder:text-slate-400"
                   placeholder="Digite para buscar... (navegação, ações, atalhos)"
                   oninput="Borg.commandPalette.renderResults(this.value)"
                   aria-label="Buscar comandos">
            <kbd class="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">ESC</kbd>
        </div>
        <div id="command-palette-results" class="max-h-96 overflow-y-auto py-2"
             role="listbox" aria-label="Comandos disponíveis"></div>
        <div class="px-4 py-2 border-t border-slate-100 text-[10px] text-on-surface-variant flex justify-between bg-slate-50/50">
            <span>↑↓ navegar · ↵ executar</span>
            <span>Cmd+K para abrir</span>
        </div>
    </div>
</div>
```

---

## REGISTRO DE COMANDOS PADRÃO

> Chamar em `Borg.init()` ou `DOMContentLoaded`:

```javascript
document.addEventListener('DOMContentLoaded', function() {
    // Views (dinâmico baseado no nav)
    document.querySelectorAll('.nav-item[data-view]').forEach(function(item) {
        var label = item.querySelector('.nav-text');
        if (label) {
            Borg.commandPalette.register({
                label: 'Ir para ' + label.textContent,
                hint: 'Navegação',
                icon: 'arrow_forward',
                keywords: 'ir navegar view ' + label.textContent.toLowerCase(),
                action: function() { Borg.switchView(item.dataset.view); }
            });
        }
    });

    // Ações globais
    Borg.commandPalette.register({
        label: 'Alternar tema claro/escuro',
        hint: 'Aparência',
        icon: 'dark_mode',
        shortcut: 'Cmd+D',
        keywords: 'dark light tema cor noturno',
        action: Borg.toggleDarkMode
    });
    Borg.commandPalette.register({
        label: 'Exportar PDF',
        hint: 'Ações',
        icon: 'picture_as_pdf',
        keywords: 'pdf exportar imprimir relatório',
        action: function() { Borg.exportPDF(); }
    });
    Borg.commandPalette.register({
        label: 'Alternar sidebar',
        hint: 'Layout',
        icon: 'menu',
        keywords: 'menu sidebar lateral',
        action: Borg.toggleSidebar
    });
});

// Shortcut Cmd+K / Ctrl+K
document.addEventListener('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        Borg.commandPalette.open();
    }
    if (e.key === 'Escape') Borg.commandPalette.close();
    if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        Borg.toggleDarkMode();
    }
});
```

---

## QUANDO USAR CADA EFEITO

| Efeito | Usar em | Não usar em |
|--------|---------|-------------|
| `reveal` | Seções principais, KPIs de destaque | Todos os elementos — seletivo |
| `reveal-scale` | Cards hero, modais | Texto, badges |
| `stagger` | Grids de KPIs, lista de alertas | Tabelas (linhas já stripadas) |
| `card-lift` | Cards clicáveis, sub-cards | Cards estáticos puramente informativos |
| `card-tilt` | APENAS KPI Hero principal | Qualquer outro card |
| `text-gradient` | Título da página, KPI hero value | Texto corrido, labels |
| `border-glow` | Card com métrica crítica em alerta | Cards normais (poluição visual) |
| `ripple` | Botões principais, nav items | Inputs, checkboxes |
| `pulse-dot` | Indicador "dados ao vivo", alertas ativos | Decoração |
| `shimmer-pro` | Skeletons durante load | Elementos estáticos |

---

## CHECKLIST MOTION

- [ ] Todas as transições usam uma variável `--ease-*`, não `ease` ou `linear`
- [ ] Durations usam tokens `--dur-*`
- [ ] `prefers-reduced-motion` zera todos os tokens
- [ ] Nenhuma animação passa de 600ms (exceto indicadores contínuos como pulse)
- [ ] KPI Hero entra com valueEnter, não fadeIn genérico
- [ ] View transitions usam easing emphasized (caráter), não standard
- [ ] Toasts usam easing spring (bounce suave)
- [ ] Stagger cap em 340ms (não >500ms total)
- [ ] `card-tilt` usado no MÁXIMO em 1 elemento por view
- [ ] `border-glow` usado no MÁXIMO em 1 elemento por view
- [ ] `will-change` apenas em elementos que de fato animam propriedades caras
- [ ] `animation-fill-mode: forwards` em animações one-shot que devem persistir estado final
