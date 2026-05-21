function togglePassword() {

    const input = document.getElementById("cdsenha");

    if (input.type === "password") {

        input.type = "text";

    } else {

        input.type = "password";

    }

}

function updatePasswordStrength(password) {

    const checks = {

        length: password.length >= 8,

        uppercase: /[A-Z]/.test(password),

        lowercase: /[a-z]/.test(password),

        number: /[0-9]/.test(password),

        special: /[^A-Za-z0-9]/.test(password)

    };

    updateRequirement(
        "req-length",
        checks.length,
        "Pelo menos 8 caracteres"
    );

    updateRequirement(
        "req-uppercase",
        checks.uppercase,
        "Uma letra maiúscula"
    );

    updateRequirement(
        "req-lowercase",
        checks.lowercase,
        "Uma letra minúscula"
    );

    updateRequirement(
        "req-number",
        checks.number,
        "Um número"
    );

    updateRequirement(
        "req-special",
        checks.special,
        "Um caractere especial"
    );

    updateStrengthBar(checks);

}

function updateRequirement(id, valid, text) {

    const element = document.getElementById(id);

    if (valid) {

        element.innerHTML = "✅ " + text;

        element.style.color = "#4ade80";

    } else {

        element.innerHTML = "⬜ " + text;

        element.style.color = "#64748b";

    }

}

function updateStrengthBar(checks) {

    const strengthBar =
        document.getElementById("strengthBar");

    const strengthText =
        document.getElementById("strengthText");

    let score = 0;

    Object.values(checks).forEach(check => {

        if (check) score++;

    });

    let width = "0%";
    let color = "#ef4444";
    let text = "FRACA";

    if (score === 1 || score === 2) {

        width = "25%";
        color = "#ef4444";
        text = "FRACA";

    }

    else if (score === 3) {

        width = "50%";
        color = "#facc15";
        text = "MÉDIA";

    }

    else if (score === 4) {

        width = "75%";
        color = "#60a5fa";
        text = "BOA";

    }

    else if (score === 5) {

        width = "100%";
        color = "#4ade80";
        text = "FORTE";

    }

    strengthBar.style.width = width;

    strengthBar.style.background = color;

    strengthText.innerHTML =
        "Força: " + text;

    strengthText.style.color = color;

}