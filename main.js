(function() {
    // DOM elements
    const passwordOutput = document.getElementById('passwordOutput');
    const lengthSlider = document.getElementById('lengthSlider');
    const lengthDisplay = document.getElementById('lengthDisplay');
    const uppercaseCheck = document.getElementById('uppercase');
    const lowercaseCheck = document.getElementById('lowercase');
    const numbersCheck = document.getElementById('numbers');
    const symbolsCheck = document.getElementById('symbols');
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const strengthIndicator = document.getElementById('strengthIndicator');

    // Conjuntos de caracteres
    const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const LOWER = 'abcdefghijklmnopqrstuvwxyz';
    const NUMBERS = '0123456789';
    const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    // Atualiza o display do comprimento
    function updateLengthDisplay() {
        lengthDisplay.textContent = lengthSlider.value;
    }

    // Gera senha com base nas opções
    function generatePassword() {
        let chars = '';
        if (uppercaseCheck.checked) chars += UPPER;
        if (lowercaseCheck.checked) chars += LOWER;
        if (numbersCheck.checked) chars += NUMBERS;
        if (symbolsCheck.checked) chars += SYMBOLS;

        // Se nenhum conjunto estiver marcado, usar lowercase como fallback (boa prática)
        if (chars === '') {
            chars = LOWER;
            lowercaseCheck.checked = true;
        }

        const length = parseInt(lengthSlider.value, 10);
        let password = '';

        // Garantir que a senha contenha pelo menos um caractere de cada tipo selecionado (boa prática)
        const selectedSets = [];
        if (uppercaseCheck.checked) selectedSets.push(UPPER);
        if (lowercaseCheck.checked) selectedSets.push(LOWER);
        if (numbersCheck.checked) selectedSets.push(NUMBERS);
        if (symbolsCheck.checked) selectedSets.push(SYMBOLS);

        // Se mais de um conjunto estiver selecionado, garante que cada tipo apareça
        if (selectedSets.length > 0) {
            for (let set of selectedSets) {
                const randomIndex = Math.floor(Math.random() * set.length);
                password += set[randomIndex];
            }
        }

        // Preenche o restante com caracteres aleatórios de todos os conjuntos
        while (password.length < length) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            password += chars[randomIndex];
        }

        // Embaralha a senha para não ficar com a "ordem" dos conjuntos
        password = shuffleString(password);
        
        // Corta caso o comprimento seja menor (por segurança, mas não deve acontecer)
        if (password.length > length) {
            password = password.slice(0, length);
        }

        return password;
    }

    // Embaralhador Fisher-Yates
    function shuffleString(str) {
        const arr = str.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.join('');
    }

    // Calcula força com base no comprimento e diversidade
    function calculateStrength(password) {
        const length = password.length;
        let hasUpper = /[A-Z]/.test(password);
        let hasLower = /[a-z]/.test(password);
        let hasNumber = /[0-9]/.test(password);
        let hasSymbol = /[^A-Za-z0-9]/.test(password);
        
        let typesCount = 0;
        if (hasUpper) typesCount++;
        if (hasLower) typesCount++;
        if (hasNumber) typesCount++;
        if (hasSymbol) typesCount++;

        // Critérios de força baseados em NIST/boas práticas
        if (length >= 16 && typesCount === 4) return '🔒 Forte';
        if (length >= 12 && typesCount >= 3) return '🟡 Média';
        if (length >= 8 && typesCount >= 2) return '🟠 Fraca';
        return '🔴 Muito Fraca';
    }

    // Atualiza a força e exibe
    function updateStrength(password) {
        const strength = calculateStrength(password);
        strengthIndicator.textContent = strength;
    }

    // Atualiza a senha e a interface
    function refreshPassword() {
        const newPassword = generatePassword();
        passwordOutput.value = newPassword;
        updateStrength(newPassword);
    }

    // Event listener para o slider
    lengthSlider.addEventListener('input', function() {
        updateLengthDisplay();
        refreshPassword();
    });

    // Event listeners para checkboxes
    const checkboxes = [uppercaseCheck, lowercaseCheck, numbersCheck, symbolsCheck];
    checkboxes.forEach(cb => {
        cb.addEventListener('change', function() {
            // Se nenhum checkbox estiver marcado, marca lowercase por padrão (boa prática)
            if (!uppercaseCheck.checked && !lowercaseCheck.checked && !numbersCheck.checked && !symbolsCheck.checked) {
                lowercaseCheck.checked = true;
            }
            refreshPassword();
        });
    });

    // Botão gerar
    generateBtn.addEventListener('click', function(e) {
        e.preventDefault();
        refreshPassword();
        // feedback visual
        generateBtn.style.transform = 'scale(0.96)';
        setTimeout(() => generateBtn.style.transform = '', 120);
    });

    // Copiar senha
    copyBtn.addEventListener('click', function() {
        const password = passwordOutput.value;
        if (!password || password === '') {
            refreshPassword();
            navigator.clipboard?.writeText(passwordOutput.value).catch(() => {});
            copyBtn.style.color = '#8effb2';
            setTimeout(() => copyBtn.style.color = '', 400);
            return;
        }
        navigator.clipboard?.writeText(password).then(() => {
            copyBtn.style.color = '#8effb2';
            setTimeout(() => copyBtn.style.color = '', 400);
        }).catch(() => {
            passwordOutput.select();
            document.execCommand('copy');
            copyBtn.style.color = '#8effb2';
            setTimeout(() => copyBtn.style.color = '', 400);
        });
    });

    // Inicialização
    (function init() {
        updateLengthDisplay();
        const initialPassword = generatePassword();
        passwordOutput.value = initialPassword;
        updateStrength(initialPassword);
    })();

    // Atalho: Enter no campo de senha para gerar (boa prática)
    passwordOutput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            refreshPassword();
        }
    });

    // Ao clicar no display, seleciona o texto (boa prática de UX)
    passwordOutput.addEventListener('click', function() {
        this.select();
    });

})();
