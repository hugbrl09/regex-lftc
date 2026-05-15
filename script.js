const els = {
    pattern: document.getElementById("inputRegex"),
    text: document.getElementById("inputText"),
    status: document.getElementById("regexStatus"),
    highlighted: document.getElementById("highlightedText"),
    inlineMessage: document.getElementById("inlineMessage"),
    matchCount: document.getElementById("matchCount"),
    groupCount: document.getElementById("groupCount"),
    literalRegex: document.getElementById("literalRegex"),
    matchList: document.getElementById("matchList"),
    groupList: document.getElementById("groupList"),
    referenceList: document.getElementById("referenceList"),
    selectedMatchLabel: document.getElementById("selectedMatchLabel"),
    prevMatchButton: document.getElementById("prevMatchButton"),
    nextMatchButton: document.getElementById("nextMatchButton"),
    escapeSelectionButton: document.getElementById("escapeSelectionButton"),
    copyRegexButton: document.getElementById("copyRegexButton"),
    clearButton: document.getElementById("clearButton"),
    examplesGrid: document.getElementById("examplesGrid"),
    flags: {
        g: document.getElementById("flagG"),
        i: document.getElementById("flagI"),
        m: document.getElementById("flagM"),
        s: document.getElementById("flagS"),
        u: document.getElementById("flagU"),
        y: document.getElementById("flagY")
    }
};

const state = {
    matches: [],
    selectedIndex: 0,
    error: null
};

const examples = [
    {
        title: "Datas",
        summary: "Captura dia, mes e ano com grupos.",
        pattern: "\\b(\\d{2})\\/(\\d{2})\\/(\\d{4})\\b",
        flags: "g",
        text: "A prova sera em 14/05/2026. A entrega final ficou para 21/05/2026."
    },
    {
        title: "E-mails",
        summary: "Combina usuarios, dominio e sufixo.",
        pattern: "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b",
        flags: "gi",
        text: "Contatos: ana.silva@ulbra.br, suporte@regex.dev e um texto sem e-mail."
    },
    {
        title: "CPF",
        summary: "Usa pontos e hifen escapados.",
        pattern: "\\b\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}\\b",
        flags: "g",
        text: "CPF valido no formato: 123.456.789-10. Sem mascara: 12345678910."
    },
    {
        title: "Chaves",
        summary: "Lookahead encontra nomes antes de dois pontos.",
        pattern: "\\b\\w+(?=:)",
        flags: "g",
        text: "nome: Hugo\ncurso: LFTC\nsem marcador aqui\nnota: 10"
    },
    {
        title: "Nomeados",
        summary: "Grupos nomeados viram campos legiveis.",
        pattern: "(?<dia>\\d{2})-(?<mes>\\d{2})-(?<ano>\\d{4})",
        flags: "g",
        text: "Inicio: 14-05-2026. Revisao: 28-05-2026."
    }
];

const referenceItems = [
    ["\\d", "Digito decimal, equivalente a [0-9]."],
    ["\\w", "Caractere de palavra: letras, digitos e underscore."],
    ["\\s", "Espaco em branco, tab ou quebra de linha."],
    [".", "Qualquer caractere, exceto quebra de linha sem a flag s."],
    ["[abc]", "Classe: casa um caractere entre as opcoes."],
    ["[^abc]", "Classe negada: casa um caractere fora das opcoes."],
    ["*", "Zero ou mais repeticoes do item anterior."],
    ["+", "Uma ou mais repeticoes do item anterior."],
    ["?", "Zero ou uma repeticao; tambem deixa quantificadores lazy."],
    ["{2,4}", "Entre duas e quatro repeticoes."],
    ["(abc)", "Grupo de captura."],
    ["(?:abc)", "Grupo sem captura."],
    ["(?=abc)", "Lookahead positivo: exige algo a seguir sem consumir."],
    ["^", "Inicio do texto; com m, inicio de linha."],
    ["$", "Fim do texto; com m, fim de linha."],
    ["|", "Alternancia: esquerda ou direita."]
];

function getFlags() {
    return Object.entries(els.flags)
        .filter(([, input]) => input.checked)
        .map(([flag]) => flag)
        .join("");
}

function setFlags(flags) {
    Object.entries(els.flags).forEach(([flag, input]) => {
        input.checked = flags.includes(flag);
    });
}

function escapeRegexLiteral(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function displayValue(value) {
    if (value === undefined) return "undefined";
    if (value === "") return "(vazio)";
    return value;
}

function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
}

function buildLiteral(pattern, flags) {
    return `/${pattern || " "}/${flags}`;
}

function advanceIndex(text, index, unicode) {
    if (!unicode || index >= text.length) return index + 1;
    const first = text.charCodeAt(index);
    const second = text.charCodeAt(index + 1);
    const isSurrogatePair = first >= 0xd800 && first <= 0xdbff && second >= 0xdc00 && second <= 0xdfff;
    return index + (isSurrogatePair ? 2 : 1);
}

function collectMatches(regex, text) {
    const shouldLoop = regex.global || regex.sticky;
    const matches = [];
    const maxMatches = 500;

    regex.lastIndex = 0;

    if (!shouldLoop) {
        const match = regex.exec(text);
        return match ? [normalizeMatch(match)] : [];
    }

    let match = regex.exec(text);
    while (match && matches.length < maxMatches) {
        matches.push(normalizeMatch(match));

        if (match[0] === "") {
            regex.lastIndex = advanceIndex(text, regex.lastIndex, regex.unicode);
        }

        match = regex.exec(text);
    }

    return matches;
}

function normalizeMatch(match) {
    const value = match[0];
    const start = match.index;
    const groups = match.slice(1).map((group, index) => ({
        name: String(index + 1),
        value: group
    }));

    if (match.groups) {
        Object.entries(match.groups).forEach(([name, value]) => {
            groups.push({ name, value, named: true });
        });
    }

    return {
        value,
        start,
        end: start + value.length,
        groups
    };
}

function renderHighlighted(text, matches) {
    const fragment = document.createDocumentFragment();
    let cursor = 0;

    matches.forEach((match, index) => {
        if (match.start > cursor) {
            fragment.append(document.createTextNode(text.slice(cursor, match.start)));
        }

        if (match.end === match.start) {
            const marker = createElement("span", `zero-match ${index === state.selectedIndex ? "is-selected" : ""}`);
            marker.title = `Match ${index + 1} na posicao ${match.start}`;
            fragment.append(marker);
            cursor = match.start;
            return;
        }

        const mark = createElement("mark", `tone-${index % 3} ${index === state.selectedIndex ? "is-selected" : ""}`, text.slice(match.start, match.end));
        mark.title = `Match ${index + 1}: posicoes ${match.start}-${match.end}`;
        fragment.append(mark);
        cursor = match.end;
    });

    fragment.append(document.createTextNode(text.slice(cursor)));
    els.highlighted.replaceChildren(fragment);
}

function renderMatchList() {
    els.matchList.replaceChildren();

    if (state.error) {
        els.matchList.append(createElement("p", "empty-state", "Corrija a regex para ver os matches."));
        return;
    }

    if (!els.pattern.value) {
        els.matchList.append(createElement("p", "empty-state", "Digite um padrao para iniciar a busca."));
        return;
    }

    if (state.matches.length === 0) {
        els.matchList.append(createElement("p", "empty-state", "Nenhum trecho do texto casou com este padrao."));
        return;
    }

    state.matches.forEach((match, index) => {
        const button = createElement("button", `match-item ${index === state.selectedIndex ? "is-selected" : ""}`);
        button.type = "button";
        button.dataset.index = String(index);

        const title = createElement("div", "match-title");
        title.append(createElement("strong", null, `#${index + 1}`));
        title.append(createElement("span", "match-meta", `[${match.start}, ${match.end})`));

        const value = createElement("code", null, displayValue(match.value));
        button.append(title, value);
        els.matchList.append(button);
    });
}

function renderGroups() {
    els.groupList.replaceChildren();

    if (!state.matches.length) {
        els.groupList.append(createElement("p", "empty-state", "Selecione um exemplo com grupos ou crie capturas usando parenteses."));
        return;
    }

    const match = state.matches[state.selectedIndex];
    const full = createElement("div", "group-card");
    const fullRow = createElement("div", "group-row");
    fullRow.append(createElement("strong", null, "Match completo"));
    fullRow.append(createElement("span", null, `[${match.start}, ${match.end})`));
    full.append(fullRow, createElement("p", null, displayValue(match.value)));
    els.groupList.append(full);

    if (match.groups.length === 0) {
        els.groupList.append(createElement("p", "empty-state", "Este match nao tem grupos de captura."));
        return;
    }

    match.groups.forEach((group) => {
        const card = createElement("div", "group-card");
        const row = createElement("div", "group-row");
        row.append(createElement("strong", null, group.named ? `<${group.name}>` : `$${group.name}`));
        row.append(createElement("span", null, group.named ? "nomeado" : "captura"));
        card.append(row, createElement("p", null, displayValue(group.value)));
        els.groupList.append(card);
    });
}

function findTokenHints(pattern) {
    const hints = [];
    const add = (token, description) => {
        if (!hints.some((item) => item[0] === token)) hints.push([token, description]);
    };

    for (let index = 0; index < pattern.length; index += 1) {
        const char = pattern[index];
        const next = pattern[index + 1];

        if (char === "\\") {
            const token = `\\${next || ""}`;
            const item = referenceItems.find(([ref]) => ref === token);
            if (item) add(item[0], item[1]);
            index += 1;
            continue;
        }

        if (char === "[") add("[...]", "Classe de caracteres: escolhe um caractere permitido.");
        if (char === "(" && next === "?") add("(?...)", "Grupo especial, como lookahead, sem captura ou nomeado.");
        if (char === "(" && next !== "?") add("(...)", "Grupo de captura numerado.");
        if (char === ".") add(".", "Coringa para um caractere.");
        if (char === "^") add("^", "Ancora de inicio.");
        if (char === "$") add("$", "Ancora de fim.");
        if (char === "|") add("|", "Alternancia entre possibilidades.");
        if (char === "*") add("*", "Repete zero ou mais vezes.");
        if (char === "+") add("+", "Repete uma ou mais vezes.");
        if (char === "?") add("?", "Opcional ou modificador lazy.");
        if (char === "{") add("{n,m}", "Quantificador com intervalo de repeticoes.");
    }

    return hints.slice(0, 8);
}

function renderReference() {
    els.referenceList.replaceChildren();

    const patternHints = findTokenHints(els.pattern.value);
    if (patternHints.length > 0) {
        const title = createElement("p", "empty-state", "No padrao atual:");
        els.referenceList.append(title);
        patternHints.forEach(([token, description]) => {
            els.referenceList.append(createReferenceCard(token, description));
        });
    }

    const title = createElement("p", "empty-state", patternHints.length ? "Referencia rapida:" : "Referencia rapida:");
    els.referenceList.append(title);
    referenceItems.forEach(([token, description]) => {
        els.referenceList.append(createReferenceCard(token, description));
    });
}

function createReferenceCard(token, description) {
    const card = createElement("div", "reference-card");
    const row = createElement("div", "reference-row");
    row.append(createElement("strong", null, token));
    row.append(createElement("span", null, "regex"));
    card.append(row, createElement("p", null, description));
    return card;
}

function renderStats(pattern, flags) {
    const selectedMatch = state.matches[state.selectedIndex];
    const groupCount = selectedMatch ? selectedMatch.groups.length : 0;

    els.matchCount.textContent = String(state.matches.length);
    els.groupCount.textContent = String(groupCount);
    els.literalRegex.textContent = buildLiteral(pattern, flags);
    els.selectedMatchLabel.textContent = state.matches.length ? `${state.selectedIndex + 1} / ${state.matches.length}` : "0 / 0";

    const canNavigate = state.matches.length > 1;
    els.prevMatchButton.disabled = !canNavigate;
    els.nextMatchButton.disabled = !canNavigate;
}

function setStatus(kind, message) {
    els.status.className = "status-pill";
    if (kind === "valid") els.status.classList.add("is-valid");
    if (kind === "error") els.status.classList.add("is-error");
    els.status.textContent = message;
}

function setInlineMessage(message, isError = false) {
    els.inlineMessage.textContent = message;
    els.inlineMessage.classList.toggle("is-error", isError);
}

function update() {
    const pattern = els.pattern.value;
    const text = els.text.value;
    const flags = getFlags();

    state.error = null;

    if (!pattern) {
        state.matches = [];
        state.selectedIndex = 0;
        renderHighlighted(text, []);
        renderStats(pattern, flags);
        renderMatchList();
        renderGroups();
        renderReference();
        setStatus("idle", "Aguardando padrao");
        setInlineMessage("Informe um padrao para comecar.");
        return;
    }

    try {
        const regex = new RegExp(pattern, flags);
        state.matches = collectMatches(regex, text);
        if (state.selectedIndex >= state.matches.length) state.selectedIndex = Math.max(0, state.matches.length - 1);

        renderHighlighted(text, state.matches);
        renderStats(pattern, flags);
        renderMatchList();
        renderGroups();
        renderReference();

        const suffix = flags.includes("g") || flags.includes("y") ? "busca repetida" : "primeiro match";
        setStatus("valid", `${state.matches.length} match${state.matches.length === 1 ? "" : "es"}`);
        setInlineMessage(state.matches.length ? `Regex valida: ${suffix}.` : "Regex valida, mas sem matches neste texto.");
    } catch (error) {
        state.error = error;
        state.matches = [];
        state.selectedIndex = 0;
        renderHighlighted(text, []);
        renderStats(pattern, flags);
        renderMatchList();
        renderGroups();
        renderReference();
        setStatus("error", "Regex invalida");
        setInlineMessage(error.message, true);
    }
}

function selectMatch(index) {
    if (!state.matches.length) return;
    state.selectedIndex = (index + state.matches.length) % state.matches.length;
    update();
}

function renderExamples() {
    examples.forEach((example, index) => {
        const button = createElement("button", "example-button");
        button.type = "button";
        button.dataset.example = String(index);
        button.append(createElement("strong", null, example.title), createElement("span", null, example.summary));
        els.examplesGrid.append(button);
    });
}

function applyExample(index) {
    const example = examples[index];
    if (!example) return;

    els.pattern.value = example.pattern;
    els.text.value = example.text;
    setFlags(example.flags);
    state.selectedIndex = 0;
    update();
}

function copyRegex() {
    const literal = buildLiteral(els.pattern.value, getFlags());
    if (!navigator.clipboard) {
        setInlineMessage(`Regex pronta: ${literal}`);
        return;
    }

    navigator.clipboard.writeText(literal)
        .then(() => setInlineMessage(`Regex copiada: ${literal}`))
        .catch(() => setInlineMessage(`Regex pronta: ${literal}`));
}

function escapeSelection() {
    const start = els.text.selectionStart;
    const end = els.text.selectionEnd;
    const selected = els.text.value.slice(start, end) || els.text.value.trim().slice(0, 80);

    if (!selected) {
        setInlineMessage("Selecione um trecho do texto ou preencha o texto de teste.");
        return;
    }

    els.pattern.value = escapeRegexLiteral(selected);
    els.flags.g.checked = true;
    state.selectedIndex = 0;
    update();
}

function clearAll() {
    els.pattern.value = "";
    els.text.value = "";
    state.selectedIndex = 0;
    update();
    els.pattern.focus();
}

function activateTab(tabName) {
    document.querySelectorAll(".tab-button").forEach((button) => {
        const isActive = button.dataset.tab === tabName;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-selected", String(isActive));
    });

    document.querySelectorAll(".tab-panel").forEach((panel) => {
        panel.hidden = panel.id !== `${tabName}Panel`;
    });
}

els.pattern.addEventListener("input", () => {
    state.selectedIndex = 0;
    update();
});

els.text.addEventListener("input", () => {
    state.selectedIndex = 0;
    update();
});

Object.values(els.flags).forEach((input) => {
    input.addEventListener("change", () => {
        state.selectedIndex = 0;
        update();
    });
});

els.prevMatchButton.addEventListener("click", () => selectMatch(state.selectedIndex - 1));
els.nextMatchButton.addEventListener("click", () => selectMatch(state.selectedIndex + 1));
els.escapeSelectionButton.addEventListener("click", escapeSelection);
els.copyRegexButton.addEventListener("click", copyRegex);
els.clearButton.addEventListener("click", clearAll);

els.matchList.addEventListener("click", (event) => {
    const button = event.target.closest(".match-item");
    if (!button) return;
    selectMatch(Number(button.dataset.index));
});

document.querySelector(".tab-list").addEventListener("click", (event) => {
    const button = event.target.closest(".tab-button");
    if (!button) return;
    activateTab(button.dataset.tab);
});

els.examplesGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".example-button");
    if (!button) return;
    applyExample(Number(button.dataset.example));
});

renderExamples();
applyExample(0);
