# Histórico do Projeto

## Plataforma Gamificada de Expressões Regulares

**Notação académica**

**Data da sessão:** Maio de 2026

**Especialidades envolvidas:** Gamificação Educacional, Teoria da Computação, Desenvolvimento Front-end Sênior (EdTech)

**Tecnologias utilizadas:** HTML5, CSS3, JavaScript Vanilla

## 1. O Ponto de Partida: O Desafio

O projeto iniciou-se com o upload de materiais didáticos (PDFs) sobre Linguagens Formais e Teoria da Computação. O utilizador solicitou a criação de um guia de requisitos para uma plataforma interativa, estilo RegexCrossword, que ensinasse Expressões Regulares (ER).

### Regra de ouro

A plataforma deveria utilizar estritamente a notação académica formal definida nos materiais, rejeitando a sintaxe tradicional de programação.

### Convenções formais

- Alfabeto: `Σ`
- Cadeia vazia: `ε`
- Conjunto vazio: `∅`
- União: `+` e não o `|` tradicional das linguagens de programação
- Concatenação: justaposição
- Fecho de Kleene: `*`

A IA gerou um guia gamificado estruturado em 4 níveis de progressão, detalhando a mecânica de testes, com cadeias aceites e rejeitadas, além da distinção crítica entre conjunto vazio (`$\emptyset$`) e cadeia vazia (`$\{\varepsilon\}$`).

## 2. O MVP (Produto Mínimo Viável)

Na segunda iteração, o utilizador solicitou a codificação real do MVP num único ficheiro, exigindo um tema Dark/Académico, responsividade e, principalmente, um motor de conversão.

### Desafio técnico

O JavaScript utiliza a classe `RegExp`, que não entende a notação formal. Por exemplo, o `+` significa "um ou mais" em JS, mas na academia significa "união".

### Solução implementada

Foi criada a função `convertFormalToJSRegex()`, que atua de forma invisível para o aluno:

- Traduz `Σ` para `(simbolo1|simbolo2)`.
- Substitui a união matemática `+` pelo operador lógico `|`.
- Apaga o `ε`, pois a ausência de caracteres já simula o elemento neutro na string.
- Transforma o `∅` num Negative Lookahead infinito `(?!)` para forçar a falha no motor JS.

O MVP foi entregue com 2 níveis iniciais de teste e validação visual, com verde para sucesso e vermelho para erro.

## 3. Expansão de Conteúdo (10 Níveis)

O utilizador solicitou a expansão do jogo para 10 níveis totais.

A IA formulou 8 novos níveis com dificuldade progressiva, abordando:

- O uso correto do Fecho de Kleene (`*`).
- Lógica de ramificação com União (`+`).
- Restrições de tamanho de cadeias.
- O caso especial da Linguagem Vazia (Nível 8), exigindo uma adaptação no front-end para exibir mensagens como "Nenhuma cadeia deve ser aceite" na coluna de testes.
- O conceito de Fecho Positivo (`$\Sigma^+$`) simulado formalmente no último desafio.

## 4. Aprimoramento Didático e UI/UX

Na quarta iteração, o utilizador notou a necessidade de contextualizar o aluno antes de ele tentar resolver os puzzles.

### Funcionalidades solicitadas

- Um texto introdutório explicando o que são ERs e por que são importantes.
- Dicas, tooltips e hover ao passar o rato nos botões do teclado de símbolos especiais.

A IA introduziu a secção "O que são Expressões Regulares (ER)?", destacando o uso no mundo real, como validação de e-mails e pesquisas avançadas. Também adicionou atributos `title` nativos aos botões com longas explicações.

## 5. Refinamento Final: Dicionário Visual de Símbolos

Para tornar a interface ainda mais limpa e didática, o utilizador pediu uma última otimização:

- As explicações longas dos símbolos deveriam sair dos botões e ir para a secção didática.
- Os tooltips dos botões deveriam conter apenas exemplos práticos de operação, como "A+B resulta em A ou B".

### Entrega final

A IA criou um "Dicionário de Símbolos Académicos" utilizando CSS Grid. Foram gerados cartões para cada símbolo (`Σ`, `ε`, `∅`, `+`, `*`, `( )`), contendo o seu nome, definição teórica e um exemplo prático.

O teclado de símbolos teve os seus atributos hover simplificados para mostrar ações rápidas de "Input -> Resultado", garantindo uma curva de aprendizagem suave e uma excelente experiência de utilizador (UX).

## Conclusão da Sessão

O projeto evoluiu de uma simples extração de requisitos baseada em PDFs para uma aplicação educacional front-end completa, funcional, gamificada e perfeitamente alinhada com o rigor matemático exigido nas disciplinas universitárias de Teoria da Computação e Linguagens Formais.
