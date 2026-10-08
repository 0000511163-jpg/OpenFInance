/* ================= DATA ================= */
function mostrarData() {
    const data = document.getElementById("dataAtual");
    if (data) {
        const hoje = new Date();
        const dia = String(hoje.getDate()).padStart(2, "0");
        const mes = String(hoje.getMonth() + 1).padStart(2, "0");
        const ano = hoje.getFullYear();
        data.textContent = `${dia}/${mes}/${ano}`;
    }
}

/* ================= SUBMENU ================= */
function toggleDropdown(event, id) {
    event.preventDefault();
    event.stopPropagation();
    
    const submenu = document.getElementById(id);
    document.querySelectorAll(".submenu").forEach(item => {
        if (item !== submenu) item.classList.remove("ativo");
    });

    if (submenu) {
        submenu.classList.toggle("ativo");
    }
}

document.addEventListener("click", function(event) {
    if (!event.target.closest(".menu-item")) {
        document.querySelectorAll(".submenu").forEach(item => item.classList.remove("ativo"));
    }
});

/* ================= MÁSCARAS E VALIDAÇÕES ================= */
function validarEmail(email) {
    // Aceita qualquer e-mail no formato usuario@dominio.extensao
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function aplicarMascaraTelefone(input) {
    input.addEventListener("input", function(e) {
        let valor = e.target.value.replace(/\D/g, "");
        if (valor.length > 11) valor = valor.slice(0, 11);

        if (valor.length > 10) {
            valor = valor.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
        } else if (valor.length > 6) {
            valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
        } else if (valor.length > 2) {
            valor = valor.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
        } else if (valor.length > 0) {
            valor = valor.replace(/^(\d{1,2})/, "($1");
        }
        e.target.value = valor;
    });
}

function aplicarMascaraCPF(inputCpf) {
    inputCpf.addEventListener('input', (e) => {
        let valor = e.target.value.replace(/\D/g, '').substring(0, 11);
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        e.target.value = valor;
    });
}

/* ================= CADASTRO ================= */
function cadastrar(event) {
    event.preventDefault();

    const nome = document.getElementById("nome")?.value.trim();
    const email = document.getElementById("cadastroEmail")?.value.trim();
    const telefone = document.getElementById("telefone")?.value.replace(/\D/g, "");
    const cpf = document.getElementById("cpf")?.value.replace(/\D/g, "");
    const senha = document.getElementById("cadastroSenha")?.value;
    const confirmar = document.getElementById("confirmarSenha")?.value;

    if (!validarEmail(email)) {
        alert("E-mail inválido! Por favor insira um endereço válido.");
        return;
    }

    if (telefone && telefone.length < 10) {
        alert("Por favor, digite um telefone válido contendo DDD.");
        return;
    }

    if (cpf && cpf.length < 11) {
        alert("Por favor, informe um CPF válido com 11 dígitos.");
        return;
    }

    if (!senha || senha.length < 6) {
        alert("A senha precisa ter pelo menos 6 caracteres.");
        return;
    }

    if (senha !== confirmar) {
        alert("As senhas não são iguais.");
        return;
    }

    // CPF incluído no salvamento
    const usuario = { nome, email, telefone, cpf, senha };
    localStorage.setItem("usuario", JSON.stringify(usuario));
    localStorage.removeItem("tentativasLogin");

    alert("Cadastro realizado com sucesso!");
    window.location.href = "login.html";
}

/* ================= LOGIN ================= */
function login(event) {
    event.preventDefault();

    const email = document.getElementById("email")?.value.trim();
    const senha = document.getElementById("senha")?.value;

    if (!validarEmail(email)) {
        alert("Formato de e-mail inválido!");
        return;
    }

    const usuarioSalvo = localStorage.getItem("usuario");

    if (!usuarioSalvo) {
        alert("Nenhuma conta cadastrada. Redirecionando para o cadastro...");
        window.location.href = "cadastro.html";
        return;
    }

    const usuario = JSON.parse(usuarioSalvo);
    let tentativas = Number(localStorage.getItem("tentativasLogin")) || 0;

    if (email === usuario.email && senha === usuario.senha) {
        localStorage.setItem("logado", "true");
        localStorage.setItem("tentativasLogin", "0");
        alert("Login realizado com sucesso!");
        window.location.href = "financeiro.html";
    } else {
        tentativas++;
        localStorage.setItem("tentativasLogin", tentativas);

        if (tentativas >= 2) {
            alert("Errou credenciais 2 vezes. Redirecionando para a criação de conta...");
            localStorage.setItem("tentativasLogin", "0");
            window.location.href = "cadastro.html";
        } else {
            alert("E-mail ou senha incorretos. Resta 1 tentativa antes do bloqueio.");
        }
    }
}

function sair() {
    localStorage.removeItem("logado");
    window.location.href = "index.html";
}

/* ================= MOVIMENTAÇÕES ================= */
let movimentacoes = JSON.parse(localStorage.getItem("movimentacoes")) || [];

function adicionarMovimentacao(event) {
    event.preventDefault();

    const descricao = document.getElementById("descricao")?.value.trim();
    const valor = Number(document.getElementById("valor")?.value);
    const tipo = document.getElementById("tipo")?.value;

    if (!descricao || valor <= 0) {
        alert("Preencha os dados corretamente.");
        return;
    }

    movimentacoes.push({ descricao, valor, tipo });
    localStorage.setItem("movimentacoes", JSON.stringify(movimentacoes));

    event.target.reset();
    mostrarMovimentacoes();
    atualizarSaldo();
}

function mostrarMovimentacoes() {
    const lista = document.getElementById("listaMovimentacoes");
    if (!lista) return;

    lista.innerHTML = "";

    if (movimentacoes.length === 0) {
        lista.innerHTML = '<p class="sem-movimentacoes">Nenhuma movimentação cadastrada.</p>';
        return;
    }

    movimentacoes.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "movimentacao";

        const sinal = item.tipo === "ganho" ? "+" : "-";
        const classe = item.tipo === "ganho" ? "valor-ganho" : "valor-despesa";

        div.innerHTML = `
            <div>
                <strong class="desc-texto"></strong><br>
                <small>${item.tipo === "ganho" ? "Ganho" : "Despesa"}</small>
            </div>
            <div class="${classe}">
                ${sinal} R$ ${item.valor.toFixed(2)}
                <button onclick="excluirMovimentacao(${index})" class="botao-excluir">×</button>
            </div>
        `;

        // Proteção contra XSS na descrição
        div.querySelector(".desc-texto").textContent = item.descricao;
        lista.appendChild(div);
    });
}

function atualizarSaldo() {
    let ganhos = 0;
    let despesas = 0;

    movimentacoes.forEach(item => {
        if (item.tipo === "ganho") ganhos += item.valor;
        else despesas += item.valor;
    });

    const saldo = ganhos - despesas;

    const elSaldo = document.getElementById("saldo");
    const elGanhos = document.getElementById("ganhos");
    const elDespesas = document.getElementById("despesas");

    if (elSaldo) elSaldo.textContent = formatarMoeda(saldo);
    if (elGanhos) elGanhos.textContent = formatarMoeda(ganhos);
    if (elDespesas) elDespesas.textContent = formatarMoeda(despesas);
}

function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function excluirMovimentacao(index) {
    movimentacoes.splice(index, 1);
    localStorage.setItem("movimentacoes", JSON.stringify(movimentacoes));
    mostrarMovimentacoes();
    atualizarSaldo();
}

function verificarLogin() {
    if (window.location.pathname.includes("financeiro.html")) {
        const logado = localStorage.getItem("logado");
        if (logado !== "true") {
            alert("Faça login para acessar a sua área financeira.");
            window.location.href = "login.html";
        }
    }
}

function mostrarEmpresa() {
    alert("Obsidian Finance é uma plataforma desenvolvida para simplificar o seu controlo financeiro.");
}

function mostrarClientes() {
    alert("Feito para pessoas e pequenas empresas organizarem as suas finanças quotidianas.");
}

/* ================= INICIALIZAÇÃO UNIFICADA ================= */
document.addEventListener("DOMContentLoaded", () => {
    mostrarData();
    verificarLogin();
    mostrarMovimentacoes();
    atualizarSaldo();

    const campoTelefone = document.getElementById("telefone");
    if (campoTelefone) aplicarMascaraTelefone(campoTelefone);

    const campoCpf = document.getElementById("cpf");
    if (campoCpf) aplicarMascaraCPF(campoCpf);
});