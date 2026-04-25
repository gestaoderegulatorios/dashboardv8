# 🎲 BORGONOVI V7 — MOCK DATA PT-BR

> Faixas de valores realistas por setor para quando o dashboard usa dados placeholder.
> **R$ 847.239.102 para uma padaria destrói a credibilidade do dashboard.** Este arquivo existe para evitar isso.

---

## PRINCÍPIO

Dados mock precisam ser **plausíveis** — não perfeitos, não redondos, não absurdos.
Um dashboard com dados mal calibrados é percebido como "demo amador" mesmo quando o design é impecável.

---

## COMO USAR

1. Identifique o **setor** do cliente (o usuário costuma dizer ou dá pra inferir)
2. Identifique o **porte** (pequeno, médio, grande)
3. Use as faixas deste arquivo como base
4. Some jitter (±10–20%) para realismo
5. Marque no HTML: `<!-- MOCK DATA — SUBSTITUIR POR DADOS REAIS -->`

---

## NOMES REALISTAS PT-BR

### Nomes próprios (para "Top Vendedores", "Responsável", etc.)

```
Ana Clara Mendes
Beatriz Ferreira
Carlos Alberto Souza
Daniela Ribeiro
Eduardo Almeida
Fernanda Costa
Gabriel Martins
Helena Araújo
Isabela Dias
João Pedro Silva
Juliana Vieira
Leonardo Pereira
Mariana Santos
Matheus Oliveira
Natália Cardoso
Pedro Henrique Lima
Rafaela Rocha
Rodrigo Nunes
Sofia Carvalho
Thiago Barbosa
```

### Empresas fictícias (para CRM, B2B)

```
Agromix Distribuidora
Atlântico Indústria
Bandeirante Varejo
Comercial Aurora
Construtora Horizonte
Delta Logística
EnergyTech Brasil
Farmácia Vida
Grupo Meridional
Horizonte Soluções
Industrial Paulista
JBR Alimentos
Kronos Consultoria
Líder Transportes
Mercatto Supermercados
Nova Era Engenharia
Onix Tecnologia
Prime Varejo
Quiron Saúde
Rede Sul Comércio
Sigma Industrial
Trevo Agronegócio
Unidos Atacado
Vanguarda Serviços
Zênite Participações
```

### Cidades brasileiras (para "Top Regiões")

```
São Paulo - SP (20% do volume em média)
Rio de Janeiro - RJ (10%)
Belo Horizonte - MG (6%)
Brasília - DF (5%)
Curitiba - PR (5%)
Porto Alegre - RS (4%)
Salvador - BA (4%)
Fortaleza - CE (3%)
Recife - PE (3%)
Campinas - SP (3%)
Goiânia - GO (2%)
Manaus - AM (2%)
```

---

## FAIXAS DE VALORES POR SETOR

### 💰 Financeiro / Bancário (Fintech média)

| Métrica | Mínimo | Típico | Máximo |
|---------|--------|--------|--------|
| Receita mensal | R$ 500K | R$ 3–8M | R$ 50M |
| Transações/dia | 10K | 50–200K | 2M |
| Ticket médio | R$ 85 | R$ 150–400 | R$ 2K |
| Inadimplência | 1% | 2,5–5% | 12% |
| NPS | 30 | 50–70 | 85 |
| Usuários ativos | 5K | 50–500K | 5M |

### 🛒 Varejo (rede multi-loja)

| Métrica | Mínimo | Típico | Máximo |
|---------|--------|--------|--------|
| Receita/loja/mês | R$ 80K | R$ 300–900K | R$ 3M |
| Ticket médio | R$ 45 | R$ 80–200 | R$ 500 |
| Vendas/dia/loja | 150 | 400–1.200 | 3.500 |
| Margem bruta | 18% | 25–35% | 48% |
| Ruptura de estoque | 2% | 5–8% | 15% |
| Conversão (varejo físico) | 12% | 20–30% | 45% |

### 🏭 Indústria (média — faturamento R$ 50M–500M/ano)

| Métrica | Mínimo | Típico | Máximo |
|---------|--------|--------|--------|
| Receita mensal | R$ 2M | R$ 8–30M | R$ 40M |
| Margem EBITDA | 8% | 15–22% | 35% |
| OEE (eficiência) | 55% | 70–82% | 90% |
| Produtividade (unid/h) | 200 | 600–1.500 | 4K |
| Taxa de refugo | 0,3% | 1–3% | 6% |
| Horas paradas/mês | 4h | 12–30h | 80h |

### 💻 SaaS / Tecnologia

| Métrica | Mínimo | Típico | Máximo |
|---------|--------|--------|--------|
| MRR | R$ 50K | R$ 200K–2M | R$ 20M |
| Novos clientes/mês | 20 | 80–300 | 1.500 |
| Churn mensal | 1% | 2–4% | 8% |
| CAC | R$ 300 | R$ 800–2K | R$ 8K |
| LTV | R$ 2K | R$ 5–20K | R$ 80K |
| NPS | 40 | 55–70 | 80 |
| Uptime | 99% | 99,5–99,9% | 99,99% |

### 🏥 Saúde (hospital / clínica rede)

| Métrica | Mínimo | Típico | Máximo |
|---------|--------|--------|--------|
| Atendimentos/dia | 150 | 500–1.500 | 5K |
| Taxa de ocupação | 55% | 70–85% | 98% |
| Tempo médio espera | 15 min | 30–60 min | 3h |
| Receita mensal | R$ 500K | R$ 3–12M | R$ 50M |
| Cancelamentos | 4% | 8–15% | 25% |
| NPS paciente | 30 | 50–70 | 85 |

### 🎓 Educação (instituição ensino)

| Métrica | Mínimo | Típico | Máximo |
|---------|--------|--------|--------|
| Alunos ativos | 200 | 1.500–8K | 50K |
| Mensalidade média | R$ 300 | R$ 600–1.800 | R$ 5K |
| Inadimplência | 3% | 6–12% | 25% |
| Evasão anual | 5% | 10–18% | 30% |
| Taxa de matrícula | 40% | 60–80% | 95% |
| Horas-aula/mês | 1K | 5–20K | 100K |

### 🚚 Logística / Transporte

| Métrica | Mínimo | Típico | Máximo |
|---------|--------|--------|--------|
| Entregas/dia | 200 | 1K–8K | 50K |
| On-time delivery | 78% | 85–93% | 98% |
| Custo por entrega | R$ 4 | R$ 8–25 | R$ 80 |
| Taxa de avarias | 0,3% | 1–3% | 6% |
| Frota ativa (veículos) | 15 | 50–300 | 2K |
| Km rodados/mês | 30K | 200K–1M | 10M |

### 🏗️ Construção Civil

| Métrica | Mínimo | Típico | Máximo |
|---------|--------|--------|--------|
| Obras ativas | 2 | 8–25 | 80 |
| Receita mensal | R$ 800K | R$ 4–15M | R$ 60M |
| Atraso médio | 5% | 12–20% | 40% |
| Margem bruta | 8% | 15–22% | 30% |
| Custo/m² | R$ 1.800 | R$ 2.500–4K | R$ 8K |

### 🍽️ Alimentação / Restaurante

| Métrica | Mínimo | Típico | Máximo |
|---------|--------|--------|--------|
| Faturamento/loja/mês | R$ 40K | R$ 150–500K | R$ 2M |
| Ticket médio | R$ 25 | R$ 45–85 | R$ 200 |
| Covers/dia | 40 | 120–400 | 1.200 |
| CMV | 28% | 32–38% | 45% |
| Turnover mesa | 1,2 | 2–3,5 | 5 |

### 🏨 Hotelaria

| Métrica | Mínimo | Típico | Máximo |
|---------|--------|--------|--------|
| Ocupação | 45% | 65–80% | 95% |
| Diária média | R$ 180 | R$ 300–600 | R$ 1.800 |
| RevPAR | R$ 100 | R$ 200–450 | R$ 1.500 |
| NPS | 40 | 60–75 | 85 |
| Estadia média | 1,5 dias | 2–3 dias | 7 dias |

---

## DATAS E PERÍODOS (PT-BR)

### Meses abreviados (padrão BI)

```
Jan, Fev, Mar, Abr, Mai, Jun, Jul, Ago, Set, Out, Nov, Dez
```

### Trimestres

```
T1 2024, T2 2024, T3 2024, T4 2024
```

### Períodos relativos

```
Hoje · Ontem · Esta semana · Últimos 7 dias · Este mês · Último mês ·
Este trimestre · Este semestre · Este ano · Últimos 12 meses · YTD · MTD
```

---

## CATEGORIAS GENÉRICAS (placeholder)

### Produtos (varejo/indústria)

```
Linha Premium  ·  Linha Standard  ·  Linha Essencial  ·  Promocional
```

### Canais de venda

```
Loja Física  ·  E-commerce  ·  Marketplace  ·  B2B  ·  Revenda  ·  Call Center
```

### Departamentos

```
Comercial  ·  Marketing  ·  Operações  ·  Financeiro  ·  RH  ·  TI  ·  Jurídico
```

### Status (workflow)

```
Novo  ·  Em Análise  ·  Aprovado  ·  Em Execução  ·  Concluído  ·  Cancelado
```

---

## FÓRMULA PARA NÚMEROS PLAUSÍVEIS

> Ao gerar séries temporais (ex: 12 meses de receita), use esta fórmula mental:

```
valor_mês = base × (1 + sazonalidade × seno(mês)) × (1 + ruído_aleatório ±10%) × tendência_anual
```

- **base**: valor central da faixa (ex: R$ 3M para varejo)
- **sazonalidade**: 0.15–0.25 (20% é realista no varejo; menor no SaaS)
- **ruído**: ±10% por mês
- **tendência**: 1.02–1.15/ano (crescimento de 2–15% anual é crível)

### Exemplo (varejo, R$ 3M base, dez/nov pico, fev vale)

```
Jan: 2.850  Fev: 2.620  Mar: 2.900  Abr: 3.100
Mai: 3.050  Jun: 3.200  Jul: 3.150  Ago: 3.300
Set: 3.250  Out: 3.400  Nov: 3.780  Dez: 3.920
```

---

## CHECKLIST DE MOCK DATA

- [ ] Nenhum número redondo demais (R$ 1.000.000 é suspeito; R$ 987.340 é crível)
- [ ] Séries temporais têm tendência + sazonalidade + ruído
- [ ] Percentuais realistas (NPS>85 é quase impossível; taxa de churn 0% também)
- [ ] Nomes pt-BR sem repetição óbvia
- [ ] Cidades distribuídas conforme demografia brasileira (SP dominante)
- [ ] Datas no formato DD/MM/AAAA ou "DD mmm. AAAA"
- [ ] Valores formatados em pt-BR: `R$ 1.234.567,89` (ponto = milhar, vírgula = decimal)
- [ ] Marcação `<!-- MOCK DATA -->` presente em todos os dados placeholder
