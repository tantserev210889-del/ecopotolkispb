<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Check if curl is available
if (!function_exists('curl_init')) {
    http_response_code(500);
    echo json_encode(['error' => 'CURL module is not installed on server']);
    exit;
}

$API_KEY = 'sk-jIp1rDRBSEuGhIXYG4ez43ccHZ5dl8Wt';
$API_URL = 'https://api.proxyapi.ru/anthropic/v1/messages';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['message']) || empty(trim($input['message']))) {
    http_response_code(400);
    echo json_encode(['error' => 'Message is required']);
    exit;
}

$userMessage = trim($input['message']);

$SYSTEM_PROMPT = 'Ты — AI-консультант компании ЭкоПотолкиСПБ. Помогаешь с выбором натяжных потолков: материалы, светильники, расчёты.

МАТЕРИАЛЫ ПОТОЛКОВ:
• Матовый — 350 ₽/м² (классика, скрывает дефекты)
• Сатиновый — 400 ₽/м² (лёгкий блеск, элегантный)
• Глянцевый — 450 ₽/м² (увеличивает пространство, легко моется)
• Цветной — 500 ₽/м² (любой цвет RAL)
• Звёздное небо — 800 ₽/м² (эффект космоса)

СВЕТИЛЬНИКИ И ПРОФИЛИ:
• Точечный GX53 — 350 ₽/шт
• Парящий профиль с LED — +150 ₽/пог.м
• Световая линия LED — 1800 ₽/м

МОНТАЖ И ДОП:
• Монтаж — 200 ₽/м²
• Обход трубы — 300 ₽/шт
• Обход балки — от 500 ₽

СКИДКИ:
• От 20 м² — 5%, от 50 м² — 10%
• Постоянные клиенты — 7%

ФОРМА РАСЧЁТА:
Площадь × (материал + 200 монтаж) + светильники

РЕКОМЕНДАЦИИ:
• Спальня: матовый, парящий профиль
• Кухня: глянцевый, яркое освещение
• Детская: матовый, звёздное небо популярно
• Ванная: глянцевый, влагостойкий

ВАЖНО:
1. Уточни размер комнаты и назначение
2. Предложи 2-3 варианта с расчётом
3. При сложности рекомендуй БЕСПЛАТНЫЙ ЗАМЕР
4. Контакты: +7 (961) 610-11-11';

// Используем Prompt Caching для экономии токенов
// Система промпт будет кэширован и переиспользован на следующих запросах
$requestData = [
    'model' => 'claude-haiku-4-5-20251001',
    'max_tokens' => 1024,  // Снизили до 1024 (Haiku редко нужны длинные ответы)
    'system' => [
        [
            'type' => 'text',
            'text' => $SYSTEM_PROMPT,
            'cache_control' => ['type' => 'ephemeral']  // Кэширует на 5 минут
        ]
    ],
    'messages' => [
        [
            'role' => 'user',
            'content' => $userMessage
        ]
    ]
];

$ch = curl_init($API_URL);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'x-api-key: ' . $API_KEY,
    'anthropic-version: 2023-06-01'
]);

$response = curl_exec($ch);
$curlError = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($curlError) {
    http_response_code(500);
    echo json_encode(['error' => 'CURL error', 'details' => $curlError]);
    exit;
}

if ($response === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Empty response from API']);
    exit;
}

if ($httpCode !== 200) {
    http_response_code(500);
    $errorData = json_decode($response, true);
    echo json_encode([
        'error' => 'API error',
        'http_code' => $httpCode,
        'details' => $errorData ? $errorData : $response
    ]);
    exit;
}

$data = json_decode($response, true);

if (!$data) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid JSON response', 'raw' => substr($response, 0, 200)]);
    exit;
}

if (isset($data['content'][0]['text'])) {
    echo json_encode([
        'success' => true,
        'response' => $data['content'][0]['text']
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid response format', 'data' => $data]);
}
