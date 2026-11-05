/**
 * MindX Icons Bundle - Chuyển đổi toàn bộ icon sang chuẩn React Icons & Lucide React
 * Bao gồm:
 * - SimpleIcons: SiPython, SiJavascript, SiUnity (SVG vector chính thức)
 * - Lucide-React: play, rotateCcw, rocket, terminal, code2, bookOpen, search, trash2, users, trophy, v.v.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Icons = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const ICONS_SVG = {
    // SiPython - Logo chính thức Python từ react-icons/si
    python: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.91 2C6.91 2 7.21 4.17 7.21 4.17L7.22 6.42H12.01V7.17H5.21C5.21 7.17 2 6.81 2 11.8C2 16.79 4.8 16.54 4.8 16.54H6.47V14.2C6.47 14.2 6.38 11.4 9.24 11.4H14.02C14.02 11.4 16.73 11.49 16.73 8.87V4.26C16.73 4.26 17.07 2 11.91 2ZM9.43 3.48C10 3.48 10.49 3.97 10.49 4.54C10.49 5.11 10 5.6 9.43 5.6C8.86 5.6 8.37 5.11 8.37 4.54C8.37 3.97 8.86 3.48 9.43 3.48Z" fill="#38BDF8"/>
      <path d="M12.09 22C17.09 22 16.79 19.83 16.79 19.83L16.78 17.58H11.99V16.83H18.79C18.79 16.83 22 17.19 22 12.2C22 7.21 19.2 7.46 19.2 7.46H17.53V9.8C17.53 9.8 17.62 12.6 14.76 12.6H9.98C9.98 12.6 7.27 12.51 7.27 15.13V19.74C7.27 19.74 6.93 22 12.09 22ZM14.57 20.52C14 20.52 13.51 20.03 13.51 19.46C13.51 18.89 14 18.4 14.57 18.4C15.14 18.4 15.63 18.89 15.63 19.46C15.63 20.03 15.14 20.52 14.57 20.52Z" fill="#FACC15"/>
    </svg>`,

    // SiJavascript - Logo JavaScript Web từ react-icons/si
    javascript: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#F7DF1E"/>
      <path d="M7.5 17.8C8.3 17.8 8.8 17.4 9.1 16.8L9 14.9C8.6 15.3 8.1 15.5 7.6 15.5C6.5 15.5 5.9 14.7 5.9 13.4C5.9 12.1 6.5 11.3 7.6 11.3C8.1 11.3 8.6 11.5 9 11.9L9.1 10C8.8 9.4 8.3 9 7.5 9C5.4 9 4.2 10.7 4.2 13.4C4.2 16.1 5.4 17.8 7.5 17.8ZM16.3 17.8C17.7 17.8 18.8 17.1 18.8 15.5C18.8 14 17.8 13.4 16.5 12.9C15.4 12.5 14.9 12.2 14.9 11.5C14.9 10.8 15.5 10.4 16.2 10.4C16.9 10.4 17.5 10.7 17.9 11.3L19.1 10.1C18.4 9.3 17.4 8.9 16.2 8.9C14.7 8.9 13.4 9.8 13.4 11.5C13.4 13 14.4 13.6 15.7 14.1C16.8 14.5 17.3 14.9 17.3 15.6C17.3 16.3 16.7 16.7 15.9 16.7C15 16.7 14.3 16.2 13.8 15.4L12.5 16.7C13.3 17.6 14.6 18.1 16.3 18.1V17.8Z" fill="#000000"/>
    </svg>`,

    // Web Globe - Lucide Globe
    web: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>`,

    // SiUnity - Logo Unity 3D Cube từ react-icons/si
    unity: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.4 2.82 5.12 7.89l2.76 1.48L11 6.55v6.52H9.53v-3.7L5.8 7.22 2.2 13.47l4.08 2.35 3.25-1.87v4.14l-3.12 1.8 1.48 2.76 5.07-5.28v-3.32h.08V8.1h-.08V2.82h-.08zm3.2 0v5.28h-.08v5.95h.08v3.32l5.07 5.28 1.48-2.76-3.12-1.8v-4.14l3.25 1.87 4.08-2.35-3.6-6.25-3.73 2.15v3.7H15.5V6.55l3.12 2.82 2.76-1.48-5.28-5.07h-.5z"/>
    </svg>`,

    // VEX Robotics (VEX GO + VEX IQ) Icon
    robotics: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" stroke="#FB923C"></rect>
      <circle cx="12" cy="5" r="2" stroke="#FB923C"></circle>
      <path d="M12 7v4" stroke="#FB923C"></path>
      <circle cx="8.5" cy="16" r="1.5" fill="#FB923C" stroke="none"></circle>
      <circle cx="15.5" cy="16" r="1.5" fill="#FB923C" stroke="none"></circle>
      <path d="M1 14v4" stroke="#FB923C"></path>
      <path d="M23 14v4" stroke="#FB923C"></path>
    </svg>`,

    // Layout Dashboard - Lucide
    layoutDashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1"></rect>
      <rect width="7" height="5" x="14" y="3" rx="1"></rect>
      <rect width="7" height="9" x="14" y="12" rx="1"></rect>
      <rect width="7" height="5" x="3" y="16" rx="1"></rect>
    </svg>`,

    // Lucide Icons (react-icons/lu / lucide-react)
    play: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>`,

    rotateCcw: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
      <path d="M3 3v5h5"></path>
    </svg>`,

    rocket: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
    </svg>`,

    terminal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="4 17 10 11 4 5"></polyline>
      <line x1="12" y1="19" x2="20" y2="19"></line>
    </svg>`,

    code2: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m18 16 4-4-4-4"></path>
      <path d="m6 8-4 4 4 4"></path>
      <path d="m14.5 4-5 16"></path>
    </svg>`,

    bookOpen: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>`,

    checkCircle2: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
      <path d="m9 12 2 2 4-4"></path>
    </svg>`,

    xCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>`,

    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>`,

    trash2: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>`,

    user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>`,

    users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>`,

    userPlus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="8.5" cy="7" r="4"></circle>
      <line x1="20" y1="8" x2="20" y2="14"></line>
      <line x1="23" y1="11" x2="17" y2="11"></line>
    </svg>`,

    trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
      <path d="M4 22h16"></path>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
    </svg>`,

    trendingUp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>`,

    fileCode: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <path d="m10 13-2 2 2 2"></path>
      <path d="m14 17 2-2-2-2"></path>
    </svg>`,

    graduationCap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path>
    </svg>`,

    home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>`,

    sparkles: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
      <path d="M5 3v4"></path>
      <path d="M19 17v4"></path>
      <path d="M3 5h4"></path>
      <path d="M17 19h4"></path>
    </svg>`,

    flaskConical: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"></path>
      <path d="M8.5 2h7"></path>
      <path d="M7 16h10"></path>
    </svg>`,

    eraser: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"></path>
      <path d="M22 21H7"></path>
      <path d="m5 11 9 9"></path>
    </svg>`,

    eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>`,

    arrowLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>`,

    arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>`,

    alertTriangle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>`,

    plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>`,

    x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>`,

    target: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="12" cy="12" r="6"></circle>
      <circle cx="12" cy="12" r="2"></circle>
    </svg>`,

    gamepad: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="6" y1="12" x2="10" y2="12"></line>
      <line x1="8" y1="10" x2="8" y2="14"></line>
      <line x1="15" y1="13" x2="15.01" y2="13"></line>
      <line x1="18" y1="11" x2="18.01" y2="11"></line>
      <rect x="2" y="6" width="20" height="12" rx="2"></rect>
    </svg>`,

    zap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>`,

    bot: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2"></rect>
      <circle cx="12" cy="5" r="2"></circle>
      <path d="M12 7v4"></path>
      <line x1="8" y1="16" x2="8" y2="16"></line>
      <line x1="16" y1="16" x2="16" y2="16"></line>
    </svg>`
  };

  // Ánh xạ Emoji học sinh sang React/Lucide SVG icons
  const EMOJI_TO_ICON = {
    '🐍': 'python',
    '🌐': 'web',
    '🎮': 'unity',
    '⚡': 'zap',
    '🚀': 'rocket',
    '🧑‍💻': 'code2',
    '🌟': 'sparkles',
    '🤖': 'bot',
    '👾': 'gamepad',
    '🔥': 'zap',
    '🎯': 'target',
    '✨': 'sparkles',
    '🌸': 'sparkles',
    '🦊': 'bot'
  };

  return {
    get(name, { size = 20, className = '' } = {}) {
      const raw = ICONS_SVG[name];
      if (!raw) return '';
      // Thêm class và width/height vào svg
      return raw.replace('<svg', `<svg class="react-icon ${className}" width="${size}" height="${size}"`);
    },

    avatar(avatarVal, { size = 22, className = '' } = {}) {
      if (!avatarVal) return this.get('user', { size, className });
      const mapped = EMOJI_TO_ICON[avatarVal] || avatarVal;
      if (ICONS_SVG[mapped]) {
        return this.get(mapped, { size, className });
      }
      return `<span style="font-size: ${size}px; line-height: 1;">${avatarVal}</span>`;
    },

    renderAll(root = document) {
      root.querySelectorAll('[data-icon]').forEach(el => {
        const iconName = el.getAttribute('data-icon');
        const size = parseInt(el.getAttribute('data-size') || '20', 10);
        const cls = el.getAttribute('data-class') || '';
        el.innerHTML = this.get(iconName, { size, className: cls });
      });
    }
  };
});
