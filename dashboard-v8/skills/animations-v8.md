# Animations V8 - Movimento e Animações do Borgonovi Dashboard V8

Observação inicial sobre o padrão V8: o output visual é idêntico ao V7; as classes e APIs são mantidas para facilitar a migração.

## FILOSOFIA DE MOVIMENTO
5 princípios:
- Função sobre flash — cada animação tem propósito
- Rápido e ágil — 150-400ms, nunca > 600ms
- Suavidade natural — cubic-bezier, nunca linear
- Stagger é opcional, não regra
- Respeitar prefers-reduced-motion

## MOTION TOKENS
Observação: valores exatos são os mesmos do V7, definidos no theme.css :root (não em app.css inline).

### Durations
| Token | Valor | Quando usar |
|---|---|---|
| --dur-instant | 100ms | Interações micro |
| --dur-fast | 150ms | Mudanças de estado ao passar o mouse |
| --dur-base | 200ms | Expansão, revelação básica |
| --dur-medium | 300ms | Transições de visualização, gaveta |
| --dur-slow | 400ms | Transições de página |
| --dur-deliberate | 600ms | Revelações de hero com foco |

### Easings
| Token | cubic-bezier | Quando usar |
|---|---|---|
| --ease-standard | (0.4, 0, 0.2, 1) | Padrão |
| --ease-decelerate | (0, 0, 0.2, 1) | Entrando na tela |
| --ease-accelerate | (0.4, 0, 1, 1) | Saindo da tela |
| --ease-emphasized | (0.2, 0, 0, 1) | Cards, hero |
| --ease-spring | (0.34, 1.56, 0.64, 1) | Bounce sutil |
| --ease-crisp | (0.22, 1, 0.36, 1) | Card hover lift |

Observação: O V8 define estes tokens no theme.css dentro :root, não em estilos inline.

## ANIMAÇÕES POR COMPONENTE

### 1. View Transition
V8: Ao trocar de view, o controller de view faz host.innerHTML = '' e monta a nova view. A animação CSS é:
```css
.view-section { animation: viewFadeIn 0.3s ease-out; }
@keyframes viewFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### 2. KPI Counter Animation
V8 usa initAnimatedValues(root) de src/ui/animate.js:
- Elementos com atributo data-animate-value
- data-target para o número alvo
- data-prefix, data-suffix para formatação
- data-format para tipo: "full" (BRL), "compact" (9.4M), "full-text" (127/200)
- data-decimals para casas decimais
- Duração: 800ms com easeOutCubic
- Respeita prefers-reduced-motion

Uso dentro do mount():
```javascript
import { initAnimatedValues } from '../ui/animate.js';
// Depois de host.innerHTML = template():
initAnimatedValues(host);
```

### 3. Reveal on Scroll
V8 usa initReveal(host) de src/ui/reveal.js:
```css
.reveal { opacity: 0; transform: translateY(16px); }
.reveal.revealed {
  opacity: 1; transform: translateY(0);
  transition: opacity var(--dur-slow) var(--ease-decelerate), transform var(--dur-slow) var(--ease-decelerate);
}
```
Delays em cascata para listas:
```css
.reveal-stagger > *:nth-child(1) { transition-delay: 0ms; }
.reveal-stagger > *:nth-child(2) { transition-delay: 60ms; }
...até nth-child(7+) com 340ms
```

### 4. Card Lift (hover)
```css
.card-lift {
  transition: transform var(--dur-base) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard);
  will-change: transform;
}
.card-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px -8px rgba(15, 23, 42, 0.12);
}
```
Uso: KPIs standard, report cards, linhas de tabela (opcional)

### 5. Card Tilt (efeito 3D no KPI hero)
```css
.card-tilt {
  transition: transform var(--dur-medium) var(--ease-standard);
  transform-style: preserve-3d; perspective: 1000px;
}
.card-tilt:hover { transform: translateY(-2px) rotateX(1deg) rotateY(-1deg); }
```
Uso: KPI Hero APENAS. Máx 1 por view.

### 6. Border Glow (borda animada)
```css
.border-glow { position: relative; isolation: isolate; }
.border-glow::before {
  content: ''; position: absolute; inset: -1px; border-radius: inherit;
  padding: 1px; z-index: -1;
  background: linear-gradient(120deg, rgba(76,94,134,0) 0%, rgba(76,94,134,0.6) 50%, rgba(76,94,134,0) 100%);
  background-size: 300% 100%;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  animation: borderSlide 3s linear infinite;
}
@keyframes borderSlide { 0% { background-position: 300% 0; } 100% { background-position: -300% 0; } }
```
Uso: KPI Hero APENAS. Máx 1 por view.

### 7. Ripple Effect
V8 usa manipulador delegado: atributo [data-ripple].
```javascript
import { initRipple } from '../ui/ripple.js';
// Chamado uma vez no boot de main.js
initRipple();
```
Adicione data-ripple aos botões para ripple no clique.

### 8. Sidebar Toggle
```css
#sidebar { transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.sidebar-collapsed { width: 64px; }
.sidebar-expanded { width: 240px; }
.nav-text { opacity: 0; transition: opacity 0.2s ease; }
.sidebar-expanded .nav-text { opacity: 1; }
```

### 9. Detail Drawer
```css
.detail-drawer { max-height: 0; overflow: hidden; opacity: 0; transition: max-height 0.4s ease-out, opacity 0.4s ease-out; }
.detail-drawer.open { max-height: 800px; opacity: 1; }
```

### 10. Toast Notification
```css
@keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
.toast-animate { animation: slideUp 0.3s ease-out; }
```

### 11. Command Palette
```css
#cmd-palette-panel { animation: cmdPaletteIn var(--dur-medium) var(--ease-emphasized); }
@keyframes cmdPaletteIn { from { opacity: 0; transform: translateY(-12px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
```

### 12. Pulse Dot (indicadores ao vivo)
```css
.pulse-dot { display: inline-block; width: 8px; height: 8px; border-radius: 9999px; background: #16a34a; position: relative; }
.pulse-dot::after { content: ''; position: absolute; inset: 0; border-radius: 9999px; background: #16a34a; animation: pulseDot 1.8s ease-out infinite; }
@keyframes pulseDot { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2.6); opacity: 0; } }
```

### 13. Skeleton Shimmer (loading)
```css
.animate-shimmer {
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%) !important;
  background-size: 200% 100% !important;
  animation: shimmer 1.5s infinite;
}
```

### 14. Dark Mode Transition
V8 dark mode usa variáveis de CSS — as transições ocorrem naturalmente:
```css
html.dark body { background: #0b1220; color: #e2e8f0; }
html.dark .bg-white { background-color: #111a2e; }
```
Não é necessário usar !important — a cascata natural via variáveis CSS.

### 15. Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
Além disso, animateNumber() em V8 verifica prefersReduced() e pula a animação.

## CHECKLIST DE ANIMAÇÕES POR VIEW
- [ ] initAnimatedValues(host) chamado após render
- [ ] initReveal(host) chamado após render
- [ ] card-lift em KPIs padrão
- [ ] card-tilt + border-glow em KPI Hero (máx 1)
- [ ] data-ripple em botões principais
- [ ] viewFadeIn na section da view
- [ ] Charts com animação easeinout 800ms
- [ ] respeitar prefers-reduced-motion

## CONTEXTO
- V8 animations são idênticas visualmente ao V7
- Usa as mesmas classes: card-lift, card-tilt, border-glow, reveal, etc.
- O código JS de V8 utiliza initAnimatedValues(), initReveal(), initRipple() em src/ui/
- O modo escuro em V8 é baseado em variáveis de CSS (sem !important)
- Projeção de conteúdo do V8 mantém compatibilidade com padrões do V7 para facilitar a migração

<!-- OMO_INTERNAL_INITIATOR -->
