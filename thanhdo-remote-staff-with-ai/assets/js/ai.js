// assets/js/ai.js
// Gọi Ollama để phân tích dữ liệu hệ thống + trò chuyện có ngữ cảnh

const AI = (() => {
  const CONF_KEY = 'td_ai_conf';

  function getConf() {
    const def = {
      baseUrl: 'http://127.0.0.1:11434',
      model: 'llama3.2'   // hoặc model bạn đang dùng: gemma2:9b, qwen2.5..., v.v.
    };

    const saved = Storage.loadJSON(CONF_KEY, null);
    return saved || def;
  }

  function saveConf(conf) {
    Storage.saveJSON(CONF_KEY, conf);
  }

  // Gọi Ollama với danh sách messages (system + history + user)
  async function callOllamaChat(messages) {
    const { baseUrl, model } = getConf();

    const body = {
      model,
      messages,
      stream: false
    };

    const res = await fetch(baseUrl + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error('HTTP ' + res.status);
    }

    const data = await res.json();
    return data?.message?.content || '[Không đọc được phản hồi AI]';
  }

  /**
   * Hỏi AI
   * @param {string} prompt  – câu hỏi hiện tại của user
   * @param {Object} options – { history: [{role, text, ts}, ...] }
   */
  async function ask(prompt, { history = [] } = {}) {
    // Ảnh chụp dữ liệu hệ thống hiện tại
    const snapshot = AISkills.buildSnapshot();

    // System prompt: dạy AI cách cư xử
    const systemContent = `
Bạn là Trợ lý AI nội bộ của Công ty Thành Đô, chuyên phân tích:
- Nhân viên, phòng ban
- Công việc, tiến độ, KPI
- Chấm công, vị trí GPS
- Tính lương, OT

Quy tắc trả lời:
1. Trả lời bằng TIẾNG VIỆT, giọng tự nhiên, thân thiện, xưng "tôi" – "bạn" như đang chat với 1 người.
2. Dựa trên DỮ LIỆU HỆ THỐNG hiện tại (JSON) bên dưới, không bịa số liệu.
3. Khi phân tích, nên:
   - Tóm tắt ngắn gọn 1–2 câu đầu.
   - Nếu cần liệt kê, dùng gạch đầu dòng "-" hoặc số "1., 2., 3." (không dùng **markdown đậm**).
   - Đưa ra nhận xét, gợi ý hành động cụ thể cho quản lý.
4. Nếu dữ liệu không đủ: nói rõ "chưa đủ dữ liệu", đừng tự suy diễn.

Dữ liệu hệ thống ở thời điểm hiện tại (JSON):
${JSON.stringify(snapshot)}
`.trim();

    // Chuyển lịch sử hội thoại thành messages cho model
    const historyMessages = history.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.text || ''
    }));

    const messages = [
      { role: 'system', content: systemContent },
      ...historyMessages,
      { role: 'user', content: prompt }
    ];

    try {
      const answer = await callOllamaChat(messages);
      return answer;
    } catch (err) {
      console.error('AI.ask error:', err);
      const sum = snapshot.taskSummary;
      return [
        '⚠ Tôi không kết nối được đến Ollama nên chỉ tóm tắt nhanh dựa trên dữ liệu hiện có:',
        `- Tổng công việc: ${sum.total}`,
        `- Đã hoàn thành: ${sum.done}`,
        `- Đang làm: ${sum.inprogress}`,
        `- Chưa làm: ${sum.todo}`,
        '',
        'Bạn hãy kiểm tra lại dịch vụ Ollama (URL, model, cấu hình CORS...) rồi thử lại nhé.'
      ].join('\n');
    }
  }

  return { getConf, saveConf, ask };
})();
