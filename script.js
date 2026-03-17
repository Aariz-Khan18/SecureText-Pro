// Initialize Icons
lucide.createIcons();

// --- THEME LOGIC ---
const themeToggle = document.getElementById('themeToggle');
const htmlEl = document.documentElement;
let isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

function applyTheme() {
  if (isDark) {
    htmlEl.classList.add('dark');
    document.getElementById('themeIcon').setAttribute('data-lucide', 'sun');
  } else {
    htmlEl.classList.remove('dark');
    document.getElementById('themeIcon').setAttribute('data-lucide', 'moon');
  }
  lucide.createIcons();
}

themeToggle.addEventListener('click', () => { isDark = !isDark; applyTheme(); });
applyTheme();

// --- TAB LOGIC ---
function switchTab(tabId) {
  ['password', 'text', 'security'].forEach(id => {
    document.getElementById(`view-${id}`).classList.add('hidden');
    document.getElementById(`tab-${id}`).classList.replace('active-tab', 'inactive-tab');
  });
  document.getElementById(`view-${tabId}`).classList.remove('hidden');
  document.getElementById(`tab-${tabId}`).classList.replace('inactive-tab', 'active-tab');
}

// --- TOAST NOTIFICATION ---
function showToast(message) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').innerText = message;
  toast.classList.add('toast-show');
  setTimeout(() => { toast.classList.remove('toast-show'); }, 2500);
}

function copyToClipboard(inputId) {
  const input = document.getElementById(inputId);
  if (!input.value) return showToast('Nothing to copy!');
  navigator.clipboard.writeText(input.value).then(() => {
    showToast('Copied to Clipboard!');
  });
}

// --- PASSWORD GENERATOR ---
function updateLengthLabel(val) {
  document.getElementById('pwdLengthLabel').innerText = val;
}

function calculateStrength(pwd) {
  let score = 0;
  if(pwd.length > 8) score += 1;
  if(pwd.length > 12) score += 1;
  if(/[A-Z]/.test(pwd)) score += 1;
  if(/[0-9]/.test(pwd)) score += 1;
  if(/[^A-Za-z0-9]/.test(pwd)) score += 1;

  const bar = document.getElementById('strengthBar');
  if(score <= 2) { bar.style.width = '33%'; bar.className = 'h-full transition-all duration-300 bg-red-500'; }
  else if(score <= 4) { bar.style.width = '66%'; bar.className = 'h-full transition-all duration-300 bg-yellow-500'; }
  else { bar.style.width = '100%'; bar.className = 'h-full transition-all duration-300 bg-green-500'; }
}

function generatePassword() {
  const length = document.getElementById('pwdLength').value;
  const upper = document.getElementById('chkUpper').checked;
  const lower = document.getElementById('chkLower').checked;
  const num = document.getElementById('chkNum').checked;
  const sym = document.getElementById('chkSym').checked;
  const amb = document.getElementById('chkAmb').checked;

  let charset = '';
  if (upper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lower) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (num) charset += '0123456789';
  if (sym) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';
  if (amb) charset = charset.replace(/[il1Lo0O]/g, '');

  const output = document.getElementById('pwdOutput');
  if (!charset) { output.value = 'Select at least one option'; return; }

  let newPassword = '';
  const randomValues = new Uint32Array(length);
  window.crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    newPassword += charset[randomValues[i] % charset.length];
  }
  
  output.value = newPassword;
  calculateStrength(newPassword);
}
generatePassword();

// --- TEXT UTILITIES ---
function updateTextStats() {
  const text = document.getElementById('textInputArea').value;
  document.getElementById('charCount').innerText = text.length;
  document.getElementById('wordCount').innerText = text.trim() ? text.trim().split(/\s+/).length : 0;
}

function processText(action) {
  const textArea = document.getElementById('textInputArea');
  let text = textArea.value;
  if(!text) return showToast('Please enter text first!');

  try {
    if (action === 'upper') text = text.toUpperCase();
    if (action === 'lower') text = text.toLowerCase();
    if (action === 'capitalize') text = text.replace(/\b\w/g, c => c.toUpperCase());
    if (action === 'spaces') text = text.replace(/\s+/g, ' ').trim();
    if (action === 'base64enc') text = btoa(text);
    if (action === 'base64dec') text = atob(text);
    if (action === 'urlenc') text = encodeURIComponent(text);
    if (action === 'urldec') text = decodeURIComponent(text);
    
    textArea.value = text;
    updateTextStats();
    showToast('Text Processed!');
  } catch(e) {
    showToast('Invalid format for decoding!');
  }
}

// --- SECURITY TOOLS (HASH) ---
let hashTimeout;
async function createHash(message, algo) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest(algo, msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function executeHashing() {
  const input = document.getElementById('hashInput').value;
  if (!input) {
    document.getElementById('out-sha256').value = '';
    document.getElementById('out-sha512').value = '';
    return;
  }
  document.getElementById('out-sha256').value = await createHash(input, 'SHA-256');
  document.getElementById('out-sha512').value = await createHash(input, 'SHA-512');
}

function debounceGenerateHashes() {
  clearTimeout(hashTimeout);
  hashTimeout = setTimeout(executeHashing, 300);
}

