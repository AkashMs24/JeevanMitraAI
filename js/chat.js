'use strict';

/* ── CHAT STATE ── */
let messages = [];

/* ── SEND MESSAGE ── */
async function sendMessage() {
const input = document.getElementById('chat-input');
const text = input.value.trim();
if (!text) return;

addMessage(text, 'user');
input.value = '';

// If no API key → demo response
if (!window._groqKey) {
addMessage(getDemoResponse(text), 'bot');
return;
}

try {
const reply = await callGroq(text);
addMessage(reply, 'bot');
} catch (err) {
addMessage('❌ Error: ' + err.message, 'bot');
}
}

/* ── ADD MESSAGE TO UI ── */
function addMessage(text, type) {
const box = document.getElementById('chat-messages');
if (!box) return;

const div = document.createElement('div');
div.className = 'msg ' + type;
div.innerHTML = text;

box.appendChild(div);
box.scrollTop = box.scrollHeight;
}

/* ── GROQ API CALL ── */
async function callGroq(prompt) {
const res = await fetch(window.GROQ_API, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Authorization': `Bearer ${window._groqKey}`
},
body: JSON.stringify({
model: window.MODELS[0],
messages: [
{
role: 'system',
content: 'You are JeevanMitra AI, a smart farming assistant. Answer only agriculture-related queries.'
},
{
role: 'user',
content: prompt
}
]
})
});

if (!res.ok) {
throw new Error('API request failed');
}

const data = await res.json();
return data.choices?.[0]?.message?.content || 'No response';
}

/* ── DEMO MODE RESPONSE ── */
function getDemoResponse(q) {
q = q.toLowerCase();

if (q.includes('crop') || q.includes('grow')) {
return '🌱 Based on general conditions, crops like rice, maize, or cotton can be suitable.';
}

if (q.includes('disease')) {
return '🔍 Upload a leaf image to detect plant diseases.';
}

if (q.includes('yield')) {
return '📊 Provide NPK and area details to estimate crop yield.';
}

if (q.includes('price')) {
return '💰 Market prices vary daily. Check the Market tab for updates.';
}

return '🌿 I can help with crops, yield, diseases, and prices!';
}

/* ── ENTER KEY SUPPORT ── */
document.addEventListener('DOMContentLoaded', () => {
const input = document.getElementById('chat-input');
if (input) {
input.addEventListener('keypress', e => {
if (e.key === 'Enter') sendMessage();
});
}
});

/* ── EXPOSE ── */
window.sendMessage = sendMessage;
