// assets/js/ai_ui.js
// UI cho tab AI (Admin) – dạng bong bóng chat + history + typing

const AIUI = (() => {
  const KEY = 'td_ai_chatlog_v1';

  function load() {
    return Storage.loadJSON(KEY, []);
  }

  function save(log) {
    Storage.saveJSON(KEY, log);
  }

  function push(entry) {
    const log = load();
    log.push(entry);
    save(log);
    return log;
  }

  function remove(index) {
    const log = load();
    if (index >= 0 && index < log.length) {
      log.splice(index, 1);
      save(log);
    }
    return log;
  }

  function clear() {
    save([]);
  }

  return { load, save, push, remove, clear };
})();

// ------- Helpers hiển thị -------

function formatTime(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch (_) {
    return '';
  }
}

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatAIText(text) {
  if (!text) return '';
  const escaped = escapeHTML(text.trim());
  const cleaned = escaped.replace(/\*\*/g, ''); // bỏ ** nếu model vẫn trả ra
  return cleaned
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

function renderChatBubble(msg, index) {
  const isUser = msg.role === 'user';
  const avatar = isUser ? '👤' : '🤖';
  const who = isUser ? 'Bạn' : 'Trợ lý AI';
  const clsRow = isUser ? 'ai-row ai-row-user' : 'ai-row';
  const clsBubble = isUser ? 'ai-bubble ai-bubble-user' : 'ai-bubble ai-bubble-assistant';

  return `
    <div class="${clsRow}">
      <div class="ai-avatar">${avatar}</div>
      <div class="ai-bubble-wrap">
        <div class="ai-msg-meta">
          <span>${who}</span>
          <span>${formatTime(msg.ts)}</span>
          <button class="ai-delete" title="Xoá đoạn này" onclick="deleteAIMessage(${index})">✕</button>
        </div>
        <div class="${clsBubble}">${formatAIText(msg.text || '')}</div>
      </div>
    </div>
  `;
}

function renderChatLog() {
  const box = document.getElementById('chatlog');
  if (!box) return;

  const log = AIUI.load();
  if (!log.length) {
    box.innerHTML = `
      <div class="ai-empty">
        Chưa có hội thoại nào. Hãy thử hỏi:
        <br><br>
        <code>“Phân tích KPI theo phòng ban tuần này?”</code><br>
        <code>“Nhân viên nào chưa check-in 3 ngày gần nhất?”</code>
      </div>`;
    return;
  }

  box.innerHTML = log.map((m, i) => renderChatBubble(m, i)).join('');
  box.scrollTop = box.scrollHeight;
}

function scrollChatToBottom() {
  const box = document.getElementById('chatlog');
  if (!box) return;
  box.scrollTop = box.scrollHeight;
}

// Hiện / ẩn trạng thái AI đang suy nghĩ
function showAIThinking(on) {
  const el = document.getElementById('ai_thinking');
  if (!el) return;
  if (on) el.classList.remove('hidden');
  else el.classList.add('hidden');
}

// ------- Actions -------

// Gửi prompt tới AI
async function onSendAI(ev) {
  if (ev) ev.preventDefault();
  const input = document.getElementById('ai_input');
  if (!input) return false;

  const text = input.value.trim();
  if (!text) return false;

  // Lưu message của user
  AIUI.push({ role: 'user', text, ts: Date.now() });
  renderChatLog();
  input.value = '';
  scrollChatToBottom();

  // Lấy lịch sử hội thoại (vài tin gần nhất)
  const history = AIUI.load().slice(-8);

  // Bật trạng thái "đang suy nghĩ"
  showAIThinking(true);

  let reply = '';
  try {
    reply = await AI.ask(text, { history });
  } catch (err) {
    console.error(err);
    reply = '⚠ Không kết nối được AI. Vui lòng kiểm tra lại Ollama / cấu hình.';
  } finally {
    // Dù thành công hay lỗi cũng tắt trạng thái typing
    showAIThinking(false);
  }

  // Lưu message của trợ lý
  AIUI.push({ role: 'assistant', text: reply, ts: Date.now() });
  renderChatLog();
  scrollChatToBottom();
  return false;
}

// Gợi ý nhanh: chỉ set text vào ô input
function quickAsk(prompt) {
  const input = document.getElementById('ai_input');
  if (!input) return false;
  input.value = prompt;
  input.focus();
  return false;
}

// Chèn ngữ cảnh hệ thống vào ô input (nếu muốn)
function insertQuickPrompt() {
  const input = document.getElementById('ai_input');
  if (!input) return false;
  const template =
    'Hãy phân tích tổng quan về nhân viên, công việc, chấm công và lương của công ty Thành Đô dựa trên dữ liệu hiện tại. ' +
    'Sau đó đưa ra 3–5 đề xuất hành động ưu tiên cho tuần tới.';
  input.value = template;
  input.focus();
  return false;
}

// Xoá 1 message
function deleteAIMessage(index) {
  AIUI.remove(index);
  renderChatLog();
}

// Xoá toàn bộ hội thoại
function clearAIChat() {
  if (!confirm('Xoá toàn bộ hội thoại với AI?')) return;
  AIUI.clear();
  renderChatLog();
}

// Xuất log ra file JSON
function exportAILog() {
  const log = AIUI.load();
  const blob = new Blob([JSON.stringify(log, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'thanhdo_ai_chat_log.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Lưu cấu hình từ panel
function saveAIConfFromPanel(ev) {
  if (ev) ev.preventDefault();
  const baseInput = document.getElementById('ai_base');
  const modelInput = document.getElementById('ai_model');
  const baseUrl = baseInput ? baseInput.value.trim() : 'http://127.0.0.1:11434';
  const model = modelInput ? modelInput.value.trim() : 'llama3.2';

  AI.saveConf({ baseUrl, model });
  alert('Đã lưu cấu hình AI');
  const panel = document.getElementById('ai_config_panel');
  if (panel) panel.classList.add('hidden');
}

// Bật/tắt panel cấu hình AI
function toggleAIConfigPanel(ev) {
  if (ev) ev.stopPropagation();
  const panel = document.getElementById('ai_config_panel');
  if (!panel) return;

  if (panel.classList.contains('hidden')) {
    const conf = AI.getConf ? AI.getConf() : { baseUrl: 'http://127.0.0.1:11434', model: 'llama3.2' };
    const baseInput = document.getElementById('ai_base');
    const modelInput = document.getElementById('ai_model');
    if (baseInput) baseInput.value = conf.baseUrl || '';
    if (modelInput) modelInput.value = conf.model || '';
    panel.classList.remove('hidden');
  } else {
    panel.classList.add('hidden');
  }
}

// Nhấn Enter để gửi chat (Shift+Enter để xuống dòng)
document.addEventListener("keydown", function (e) {
  const input = document.getElementById("ai_input");
  if (!input) return;

  if (document.activeElement === input) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendAI(e);
      return false;
    }
  }
});
function addAiMessage(html) {
  const box = document.querySelector('#ai-chat-log');
  box.insertAdjacentHTML('beforeend', html);
  scrollChatToBottom(); // <<< thêm dòng này
}

function addUserMessage(html) {
  const box = document.querySelector('#ai-chat-log');
  box.insertAdjacentHTML('beforeend', html);
  scrollChatToBottom(); // <<< thêm luôn
}
function appendAiChunk(text) {
  const last = document.querySelector('#ai-chat-log .msg.ai:last-child .msg-text');
  if (!last) return;
  last.textContent += text;
  scrollChatToBottom();   // <<< mỗi chunk kéo nhẹ xuống
}
function enableAutoScroll() {
  const box = document.querySelector('#ai-chat-log');
  if (!box) return;

  const observer = new MutationObserver(() => {
    scrollChatToBottom();
  });

  observer.observe(box, { childList: true, subtree: true });
}

// Gọi sau khi render xong view AI:
enableAutoScroll();
function scrollChatToBottom() {
  const box = document.querySelector('#ai-chat-log'); // đổi lại id theo bạn
  if (!box) return;
  // Nếu người dùng kéo lên đọc lịch sử thì không kéo nữa
  const isNearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
  if (!isNearBottom) return;

  box.scrollTop = box.scrollHeight;
}

  /**
   * Hỏi AI
   * @param {string} prompt  – câu hỏi hiện tại của user
   * @param {Object} options – { history: [{role, text, ts}, ...] }
   */
  async function ask(prompt, { history = [] } = {}) {
    const snapshot = AISkills.buildSnapshot();

    // ⚙ System prompt đã SIẾT yêu cầu:
    // - Bắt buộc dựa vào JSON, không đoán số
    // - Luôn có phần "Kết luận & đề xuất" với 3–5 gợi ý
    const systemPrompt = `
Bạn là Trợ lý AI nội bộ của Công ty Thành Đô.
Nhiệm vụ của bạn là phân tích dữ liệu nhân sự – công việc – chấm công – lương trong hệ thống và tư vấn cho quản lý.

QUY TẮC TRẢ LỜI (RẤT QUAN TRỌNG):
1. Trả lời bằng TIẾNG VIỆT, giọng tự nhiên, thân thiện, xưng "tôi" – "bạn".
2. Tất cả con số (số lượng nhân viên, số công việc, số ngày công, tổng lương...) PHẢI lấy trực tiếp từ JSON dữ liệu bên dưới.
   - Không được tự đoán hoặc bịa số.
   - Nếu không tìm thấy dữ liệu cần thiết trong JSON, hãy nói rõ: "Chưa đủ dữ liệu để kết luận (thiếu ...)".
3. Khi phân tích, nên trình bày theo 2 phần:
   - Phần 1: Tóm tắt và phân tích ngắn gọn 2–4 đoạn, dùng gạch đầu dòng đơn giản "-" hoặc "1., 2., 3.".
   - Phần 2 (BẮT BUỘC): "Kết luận và đề xuất:" với 3–5 ý hành động CỤ THỂ cho quản lý,
     ví dụ: "1. Gọi trao đổi trực tiếp với A về tình hình công việc", "2. Tăng cường theo dõi chấm công của phòng Kinh doanh", ...
4. Không dùng markdown đậm (** **), không dùng bảng phức tạp.
5. Nếu câu hỏi không liên quan đến hệ thống nhân sự/chấm công/lương của Thành Đô, hãy trả lời ngắn gọn và nhắc người dùng tập trung vào ngữ cảnh hệ thống.

DỮ LIỆU HỆ THỐNG HIỆN TẠI (JSON):
${JSON.stringify(snapshot)}
    `.trim();
  };

// =============================
// BONG BÓNG CHAT AI NỔI GÓC PHẢI
// =============================

function initFloatingAIWidget() {
  const root = document.getElementById('aiFloatRoot');
  if (!root) return;

  root.innerHTML = `
    <div id="aiFloatBtn" class="ai-float-btn" onclick="toggleFloatingAI()">
      🤖
    </div>
    <div id="aiFloatPanel" class="ai-float-panel hidden" onclick="event.stopPropagation()">
      <div class="ai-float-header">
        <span>AI Thành Đô</span>
        <button class="ai-float-close" onclick="toggleFloatingAI()">✕</button>
      </div>
      <div id="ai_floating_chatlog" class="ai-float-chatlog"></div>
      <form class="ai-float-form" onsubmit="return onSendAIFloating(event)">
        <textarea id="ai_floating_input" rows="2" placeholder="Hỏi nhanh về nhân viên, công việc, chấm công..."></textarea>
        <button class="btn primary" type="submit">Gửi</button>
      </form>
    </div>
  `;

  // click ra ngoài thì đóng panel
  document.addEventListener('click', (e) => {
    const panel = document.getElementById('aiFloatPanel');
    const btn = document.getElementById('aiFloatBtn');
    if (!panel || !btn) return;
    if (!panel.contains(e.target) && !btn.contains(e.target)) {
      panel.classList.add('hidden');
    }
  });
}

function toggleFloatingAI() {
  const panel = document.getElementById('aiFloatPanel');
  if (!panel) return;
  const isHidden = panel.classList.contains('hidden');
  if (isHidden) {
    panel.classList.remove('hidden');
    renderFloatingChatLog();
  } else {
    panel.classList.add('hidden');
  }
}

function renderFloatingChatLog() {
  const box = document.getElementById('ai_floating_chatlog');
  if (!box) return;
  const log = AIUI.load();
  if (!log.length) {
    box.innerHTML = '<div class="ai-empty">Chưa có hội thoại. Hãy thử hỏi: "Tóm tắt nhanh tình hình nhân sự hôm nay?"</div>';
    return;
  }
  box.innerHTML = log.map((m, i) => renderChatBubble(m, i)).join('');
  box.scrollTop = box.scrollHeight;
}

async function onSendAIFloating(ev) {
  if (ev) ev.preventDefault();
  const input = document.getElementById('ai_floating_input');
  if (!input) return false;

  const text = input.value.trim();
  if (!text) return false;

  // lưu message user
  AIUI.push({ role: 'user', text, ts: Date.now() });
  renderFloatingChatLog();
  input.value = '';

  const history = AIUI.load().slice(-8);

  let reply = '';
  try {
    reply = await AI.ask(text, { history });
  } catch (e) {
    console.error(e);
    reply = '⚠ Không kết nối được AI. Vui lòng kiểm tra lại Ollama / cấu hình.';
  }

  // lưu message AI
  AIUI.push({ role: 'assistant', text: reply, ts: Date.now() });
  renderFloatingChatLog();
  return false;
}
