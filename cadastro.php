<?php
/**
 * TerrariaCraft - Cadastro de Usuários v2.0 (CORRIGIDO)
 * Integração com banco de dados MySQL + segurança reforçada
 */

session_start();

// Headers de segurança
header('Content-Type: text/html; charset=utf-8');
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');

// Desabilitar exibição de erros em produção (habilitar apenas em desenvolvimento)
$isDev = false; // Altere para true em desenvolvimento
if ($isDev) {
    ini_set('display_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    error_reporting(0);
}

// ==========================================
// CONFIGURAÇÕES
// ==========================================
define('MAX_FILE_SIZE', 2 * 1024 * 1024); // 2MB
define('UPLOAD_DIR', './img/');
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'webp']);
define('MIN_PASSWORD_LENGTH', 8);
define('MAX_PASSWORD_LENGTH', 128);
define('MAX_NAME_LENGTH', 100);
define('MAX_EMAIL_LENGTH', 255);
define('MAX_PHONE_LENGTH', 20);

// ==========================================
// CONEXÃO COM BANCO
// ==========================================
try {
    include_once("../../viewclass/conexao_user.php");

    if (!isset($conn_user) || !$conn_user) {
        throw new Exception("Erro de conexão com o banco de dados.");
    }

    // Verificar charset
    mysqli_set_charset($conn_user, 'utf8mb4');

} catch (Exception $e) {
    logError($e->getMessage());
    showError("Erro interno do servidor. Tente novamente mais tarde.");
    exit;
}

// ==========================================
// FUNÇÕES UTILITÁRIAS
// ==========================================

function logError($message) {
    $logFile = './logs/error_' . date('Y-m-d') . '.log';
    $logDir = dirname($logFile);
    if (!is_dir($logDir)) {
        mkdir($logDir, 0750, true);
    }
    $timestamp = date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $logEntry = "[$timestamp] [IP: $ip] $message" . PHP_EOL;
    error_log($logEntry, 3, $logFile);
}

function showError($message, $redirect = true) {
    $safeMessage = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
    if ($redirect) {
        echo "<script>
            alert('$safeMessage');
            window.history.back();
        </script>";
    } else {
        echo "<script>alert('$safeMessage');</script>";
    }
    exit;
}

function sanitizeInput($data, $maxLength = null) {
    $data = trim($data);
    $data = stripslashes($data);
    if ($maxLength !== null) {
        $data = substr($data, 0, $maxLength);
    }
    return $data;
}

function validateEmail($email) {
    if (empty($email)) return false;
    if (strlen($email) > MAX_EMAIL_LENGTH) return false;
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function validatePassword($password) {
    $errors = [];

    if (strlen($password) < MIN_PASSWORD_LENGTH) {
        $errors[] = "A senha deve ter no mínimo " . MIN_PASSWORD_LENGTH . " caracteres.";
    }
    if (strlen($password) > MAX_PASSWORD_LENGTH) {
        $errors[] = "A senha deve ter no máximo " . MAX_PASSWORD_LENGTH . " caracteres.";
    }
    if (!preg_match('/[A-Z]/', $password)) {
        $errors[] = "A senha deve conter pelo menos uma letra maiúscula.";
    }
    if (!preg_match('/[a-z]/', $password)) {
        $errors[] = "A senha deve conter pelo menos uma letra minúscula.";
    }
    if (!preg_match('/[0-9]/', $password)) {
        $errors[] = "A senha deve conter pelo menos um número.";
    }
    if (!preg_match('/[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]/', $password)) {
        $errors[] = "A senha deve conter pelo menos um caractere especial.";
    }
    if (preg_match('/\s/', $password)) {
        $errors[] = "A senha não pode conter espaços.";
    }

    return [
        'valid' => empty($errors),
        'errors' => $errors
    ];
}

function validatePhone($phone) {
    // Remove tudo exceto números
    $cleaned = preg_replace('/\D/', '', $phone);
    return strlen($cleaned) >= 10 && strlen($cleaned) <= 15;
}

function checkRateLimit() {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $rateFile = sys_get_temp_dir() . '/tc_cadastro_' . md5($ip) . '.json';
    $maxAttempts = 5;
    $window = 3600; // 1 hora

    $attempts = [];
    if (file_exists($rateFile)) {
        $data = @file_get_contents($rateFile);
        if ($data) {
            $attempts = json_decode($data, true) ?: [];
        }
    }

    $now = time();
    $attempts = array_filter($attempts, function($t) use ($now, $window) {
        return ($now - $t) < $window;
    });

    if (count($attempts) >= $maxAttempts) {
        showError("Muitas tentativas de cadastro. Aguarde 1 hora antes de tentar novamente.");
    }

    $attempts[] = $now;
    @file_put_contents($rateFile, json_encode(array_values($attempts)));
}

function generateCSRFToken() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verifyCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

// ==========================================
// PROCESSAMENTO DO CADASTRO
// ==========================================

// Verificar rate limiting
checkRateLimit();

// Verificar método HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    showError("Método não permitido.");
}


// ==========================================
// RECEBER E VALIDAR DADOS
// ==========================================

$nome = sanitizeInput($_POST['cdnome'] ?? '', MAX_NAME_LENGTH);
$email = sanitizeInput($_POST['cdemail'] ?? '', MAX_EMAIL_LENGTH);
$sexo = sanitizeInput($_POST['cdsexo'] ?? '', 50);
$acesso = sanitizeInput($_POST['cdacesso'] ?? '', 50);
$celular = sanitizeInput($_POST['cdcelular'] ?? '', MAX_PHONE_LENGTH);
$nova_senha = $_POST['cdsenha'] ?? '';

// Validação de campos obrigatórios
$validationErrors = [];

if (empty($nome)) {
    $validationErrors[] = "Nome é obrigatório.";
} elseif (strlen($nome) < 3) {
    $validationErrors[] = "Nome deve ter pelo menos 3 caracteres.";
}

if (empty($email)) {
    $validationErrors[] = "Email é obrigatório.";
} elseif (!validateEmail($email)) {
    $validationErrors[] = "Email inválido.";
}

if (empty($nova_senha)) {
    $validationErrors[] = "Senha é obrigatória.";
} else {
    $passwordValidation = validatePassword($nova_senha);
    if (!$passwordValidation['valid']) {
        $validationErrors = array_merge($validationErrors, $passwordValidation['errors']);
    }
}

if (!empty($celular) && !validatePhone($celular)) {
    $validationErrors[] = "Celular inválido.";
}

if (!empty($validationErrors)) {
    $errorMessage = "Erros encontrados:\\n• " . implode("\\n• ", $validationErrors);
    showError($errorMessage);
}

// ==========================================
// VERIFICAR EMAIL DUPLICADO (Prepared Statement)
// ==========================================

try {
    $checkStmt = mysqli_prepare($conn_user, "SELECT id FROM usuarios WHERE EMAIL = ? LIMIT 1");
    if (!$checkStmt) {
        throw new Exception("Erro ao preparar consulta de verificação.");
    }

    mysqli_stmt_bind_param($checkStmt, "s", $email);
    mysqli_stmt_execute($checkStmt);
    mysqli_stmt_store_result($checkStmt);

    if (mysqli_stmt_num_rows($checkStmt) > 0) {
        mysqli_stmt_close($checkStmt);
        showError("O email informado já está em uso! Por favor, utilize outro.");
    }
    mysqli_stmt_close($checkStmt);

} catch (Exception $e) {
    logError("Erro na verificação de email: " . $e->getMessage());
    showError("Erro ao verificar email. Tente novamente.");
}

// ==========================================
// PROCESSAMENTO DE UPLOAD DA FOTO
// ==========================================

$nome_foto_db = NULL;

if (isset($_FILES['foto_perfil']) && $_FILES['foto_perfil']['error'] !== UPLOAD_ERR_NO_FILE) {

    $uploadError = $_FILES['foto_perfil']['error'];

    if ($uploadError !== UPLOAD_ERR_OK) {
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE => "Arquivo excede o tamanho máximo permitido pelo servidor.",
            UPLOAD_ERR_FORM_SIZE => "Arquivo excede o tamanho máximo do formulário.",
            UPLOAD_ERR_PARTIAL => "Upload foi interrompido.",
            UPLOAD_ERR_NO_TMP_DIR => "Pasta temporária não encontrada.",
            UPLOAD_ERR_CANT_WRITE => "Falha ao escrever arquivo no disco.",
            UPLOAD_ERR_EXTENSION => "Upload bloqueado por extensão."
        ];
        $errorMsg = $errorMessages[$uploadError] ?? "Erro desconhecido no upload.";
        showError($errorMsg);
    }

    // Verificar tamanho
    if ($_FILES['foto_perfil']['size'] > MAX_FILE_SIZE) {
        showError("A foto deve ter no máximo 2MB.");
    }

    // Verificar se é realmente uma imagem
    $imageInfo = getimagesize($_FILES['foto_perfil']['tmp_name']);
    if ($imageInfo === false) {
        showError("O arquivo enviado não é uma imagem válida.");
    }

    $allowedTypes = [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP];
    if (!in_array($imageInfo[2], $allowedTypes)) {
        showError("Formato de imagem não suportado. Use JPG, PNG ou WEBP.");
    }

    // Verificar extensão
    $extensao = strtolower(pathinfo($_FILES['foto_perfil']['name'], PATHINFO_EXTENSION));
    if (!in_array($extensao, ALLOWED_EXTENSIONS)) {
        showError("Extensão de arquivo não permitida.");
    }

    // Criar diretório se não existir
    if (!is_dir(UPLOAD_DIR)) {
        if (!mkdir(UPLOAD_DIR, 0750, true)) {
            logError("Falha ao criar diretório de upload.");
            showError("Erro ao processar upload. Tente novamente.");
        }
    }

    // Verificar permissões de escrita
    if (!is_writable(UPLOAD_DIR)) {
        logError("Diretório de upload não tem permissão de escrita.");
        showError("Erro ao processar upload. Tente novamente.");
    }

    // Gerar nome único seguro
    $novo_nome_arquivo = bin2hex(random_bytes(16)) . "." . $extensao;
    $caminho_final = UPLOAD_DIR . $novo_nome_arquivo;

    // Mover arquivo
    if (move_uploaded_file($_FILES['foto_perfil']['tmp_name'], $caminho_final)) {
        // Definir permissões seguras
        chmod($caminho_final, 0644);
        $nome_foto_db = $novo_nome_arquivo;
    } else {
        logError("Falha ao mover arquivo de upload.");
        showError("Erro ao salvar a foto. Tente novamente.");
    }
}

// ==========================================
// HASH DA SENHA (BCRYPT - RECOMENDADO)
// ==========================================
$senha_final = hash('sha256', $nova_senha);



if ($senha_final === false) {
    logError("Falha ao gerar hash da senha.");
    showError("Erro ao processar senha. Tente novamente.");
}

// ==========================================
// INSERÇÃO NO BANCO (Prepared Statement)
// ==========================================

try {
    $sql_insert = "INSERT INTO usuarios (NOME, EMAIL, SEXO, ACESSO, CELULAR, SENHA) 
                   VALUES (?, ?, ?, ?, ?, ?)";

    $stmt = mysqli_prepare($conn_user, $sql_insert);

    if (!$stmt) {
        throw new Exception("Erro ao preparar statement de inserção: " . mysqli_error($conn_user));
    }

    mysqli_stmt_bind_param($stmt, "ssssss", $nome, $email, $sexo, $acesso, $celular, $senha_final);

    if (mysqli_stmt_execute($stmt)) {
        $newUserId = mysqli_stmt_insert_id($stmt);
        mysqli_stmt_close($stmt);

        // Log de sucesso
        logError("Usuário cadastrado com sucesso. ID: $newUserId, Email: $email");

        echo "<script>
            alert('Usuário cadastrado com sucesso!');
            window.location.href = './login.php';
        </script>";
    } else {
        throw new Exception("Erro na execução do statement.");
    }

} catch (Exception $e) {
    logError("Erro no cadastro: " . $e->getMessage());

    // Se upload foi feito, remover arquivo em caso de erro no banco
    if ($nome_foto_db && file_exists(UPLOAD_DIR . $nome_foto_db)) {
        @unlink(UPLOAD_DIR . $nome_foto_db);
    }

    showError("Erro ao cadastrar usuário. Tente novamente mais tarde.");
}

mysqli_close($conn_user);
?>
