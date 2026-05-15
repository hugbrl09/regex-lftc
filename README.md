# Plataforma Gamificada de Expressões Regulares (Notação Académica)

Projeto desenvolvido como trabalho para a disciplina **Linguagens Formais e Teoria da Computação** — CEULP/ULBRA Palmas.

## Objetivo

Construir um MVP educativo, responsivo e com tema Dark/Académico, que ensine conceitos de expressões regulares na notação formal académica. A aplicação oferece puzzles em níveis progressivos (10 níveis), um motor de conversão que traduz a notação formal para `RegExp` do JavaScript de forma transparente, e uma interface didática com dicionário visual de símbolos.

## Tecnologias

- HTML5
- CSS3 (tema Dark)
- JavaScript (Vanilla)

## Estrutura

- `index.html` — aplicação front-end (MVP com 10 níveis, motor conversor e UI de testes)
- `sessaoIA.md` — histórico e notas da sessão de desenvolvimento

## Integrantes

- Hugo Gabriel
- Rafael Silva
- Sérgio Gabriel

## Como funciona o motor conversor (Notação Académica → RegExp JS)

O arquivo `index.html` inclui uma função chamada `convertFormalToJSRegex()` que traduz a notação formal académica para um padrão compatível com o `RegExp` do JavaScript. Abaixo está uma explicação passo a passo, escrita de forma didática para estudantes de Linguagens Formais.

1. Contexto

- As expressões regulares académicas usam símbolos e operadores com significados formais (ex.: `Σ`, `+`, `ε`, `∅`, `*`).
- O motor JavaScript (`RegExp`) usa outra sintaxe (ex.: `|` para união, `+` para "um ou mais"). Para validar cadeias de teste no browser, precisamos converter a notação académica para a sintaxe JS.

2. Passos da conversão

- Substituição de `Σ` (Sigma):
	- `Σ` é substituído por uma união explícita de todos os símbolos do alfabeto atual. Por exemplo, se `alphabetArray = ["a", "b"]`, então `Σ` vira `(a|b)`.

- Conversão da União `+` para `|`:
	- Na notação académica `A+B` significa "A ou B". Em JS isto é `A|B`. A função troca todos os `+` por `|`.

- Tratamento da cadeia vazia `ε`:
	- `ε` representa a ausência de caracteres (string vazia). Em vez de tentar mapear `ε` para um token especial, a função remove `ε` da expressão, pois concatenar a string vazia é equivalente a não inserir caracteres.

- Representação do Conjunto Vazio `∅`:
	- `∅` significa uma linguagem que não aceita nenhuma cadeia. Para forçar a falha em qualquer teste com o motor JS, a função substitui `∅` por um negative lookahead impossível `(?!)`, que nunca casa com nada.

3. Uso seguro e validação

- A string gerada é encapsulada entre âncoras para correspondência exata: `^(${pattern})$`.
- A criação do objeto `RegExp` é feita dentro de um bloco `try/catch` para capturar erros de sintaxe (parênteses desbalanceados, operadores sem operandos, etc.). Se ocorrer erro, a UI informa erro de sintaxe.

4. Integração com a interface de testes

- Para cada nível há listas de "Cadeias Aceites" e "Cadeias Rejeitadas". Ao digitar uma ER na notação académica, o fluxo é:
	1. Converter a ER formal para o padrão JS usando `convertFormalToJSRegex()`;
	2. Construir `new RegExp(`^(${pattern})$`);` e, se válido, testar cada cadeia de aceitação (deve casar) e cada cadeia de rejeição (não deve casar);
	3. Mapear `ε` nas listas de teste para a string vazia (`''`) antes de aplicar `test()`.

5. Casos especiais

- Nível "Linguagem Vazia": quando a lista de cadeias aceites é vazia, a interface mostra uma mensagem especial "Linguagem Vazia (Nenhuma cadeia deve ser aceite)" em vez de uma lista.

6. Exemplo simplificado

- Expressão académica: `Σ*0Σ*` (todas as cadeias do alfabeto que contenham um `0` em qualquer posição)
- Se `Σ={0,1}`, a conversão gera: `(0|1)*0(0|1)*` e, com âncoras, `^((0|1)*0(0|1)*)$` — pronto para ser usado pelo `RegExp` do JS.

Se quiser, posso acrescentar um pequeno diagrama ou um exemplo interativo no `README.md` demonstrando a conversão passo a passo com uma expressão real.
