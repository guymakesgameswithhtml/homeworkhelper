class Window {
    constructor(id, title, app, defaultWidth = 600, defaultHeight = 400) {
        this.id = id;
        this.title = title;
        this.app = app;
        this.x = Math.random() * (window.innerWidth - defaultWidth);
        this.y = Math.random() * (window.innerHeight - defaultHeight - 100);
        this.width = defaultWidth;
        this.height = defaultHeight;
        this.isDragging = false;
        this.isResizing = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.isMinimized = false;
        this.create();
    }

    create() {
        const windowEl = document.createElement('div');
        windowEl.className = 'window focused';
        windowEl.id = this.id;
        windowEl.style.left = this.x + 'px';
        windowEl.style.top = this.y + 'px';
        windowEl.style.width = this.width + 'px';
        windowEl.style.height = this.height + 'px';

        windowEl.innerHTML = `
            <div class="window-header">
                <span class="window-title">${this.title}</span>
                <div class="window-controls">
                    <button class="window-control-btn minimize" title="Minimize">−</button>
                    <button class="window-control-btn maximize" title="Maximize">□</button>
                    <button class="window-control-btn close" title="Close">×</button>
                </div>
            </div>
            <div class="window-content"></div>
            <div class="window-resize-handle"></div>
        `;

        this.element = windowEl;
        this.contentEl = windowEl.querySelector('.window-content');
        this.headerEl = windowEl.querySelector('.window-header');

        this.setupEventListeners();
        this.renderContent();

        document.getElementById('windowsContainer').appendChild(windowEl);
        this.focus();
    }

    setupEventListeners() {
        // Drag window
        this.headerEl.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-controls')) return;
            this.isDragging = true;
            this.dragOffsetX = e.clientX - this.x;
            this.dragOffsetY = e.clientY - this.y;
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.x = e.clientX - this.dragOffsetX;
                this.y = e.clientY - this.dragOffsetY;
                this.element.style.left = this.x + 'px';
                this.element.style.top = this.y + 'px';
            }
            if (this.isResizing) {
                this.width = Math.max(400, e.clientX - this.x);
                this.height = Math.max(250, e.clientY - this.y);
                this.element.style.width = this.width + 'px';
                this.element.style.height = this.height + 'px';
            }
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.isResizing = false;
        });

        // Resize window
        this.element.querySelector('.window-resize-handle').addEventListener('mousedown', () => {
            this.isResizing = true;
        });

        // Window controls
        this.element.querySelector('.minimize').addEventListener('click', () => this.minimize());
        this.element.querySelector('.maximize').addEventListener('click', () => this.maximize());
        this.element.querySelector('.close').addEventListener('click', () => this.close());

        // Focus window on click
        this.element.addEventListener('mousedown', () => this.focus());
    }

    focus() {
        document.querySelectorAll('.window').forEach(w => w.classList.remove('focused'));
        this.element.classList.add('focused');
    }

    minimize() {
        this.isMinimized = !this.isMinimized;
        this.element.style.display = this.isMinimized ? 'none' : 'flex';
    }

    maximize() {
        if (this.element.classList.contains('maximized')) {
            this.element.classList.remove('maximized');
            this.element.style.left = this.x + 'px';
            this.element.style.top = this.y + 'px';
            this.element.style.width = this.width + 'px';
            this.element.style.height = this.height + 'px';
        } else {
            this.element.classList.add('maximized');
            this.element.style.left = '0';
            this.element.style.top = '0';
            this.element.style.width = '100%';
            this.element.style.height = (window.innerHeight - 58) + 'px';
        }
    }

    close() {
        this.element.remove();
    }

    renderContent() {
        switch (this.app) {
            case 'file-explorer':
                this.renderFileExplorer();
                break;
            case 'calculator':
                this.renderCalculator();
                break;
            case 'notepad':
                this.renderNotepad();
                break;
            case 'settings':
                this.renderSettings();
                break;
        }
    }

    renderFileExplorer() {
        const files = [
            { name: 'Documents', icon: '📁' },
            { name: 'Downloads', icon: '📁' },
            { name: 'Pictures', icon: '📁' },
            { name: 'Videos', icon: '📁' },
            { name: 'Music', icon: '🎵' },
            { name: 'Desktop', icon: '📁' },
            { name: 'report.docx', icon: '📄' },
            { name: 'presentation.pptx', icon: '📊' },
        ];

        this.contentEl.innerHTML = `
            <div class="explorer-toolbar">
                <button class="explorer-btn">← Back</button>
                <button class="explorer-btn">→ Forward</button>
                <button class="explorer-btn">⇧ Up</button>
                <button class="explorer-btn">🔄 Refresh</button>
            </div>
            <div class="explorer-address-bar">C:\\ Users \\ User \\ Documents</div>
            <div class="explorer-file-list">
                ${files.map(f => `
                    <div class="explorer-file-item">
                        <span class="file-icon">${f.icon}</span>
                        <span>${f.name}</span>
                    </div>
                `).join('')}
            </div>
        `;

        this.contentEl.querySelectorAll('.explorer-file-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.explorer-file-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
            });
        });
    }

    renderCalculator() {
        const buttons = [
            ['7', '8', '9', '÷'],
            ['4', '5', '6', '×'],
            ['1', '2', '3', '−'],
            ['0', '.', '=', '+'],
            ['C', '←', '%', '√']
        ];

        let display = '0';
        let previousValue = '';
        let operation = '';
        let shouldResetDisplay = false;

        this.contentEl.innerHTML = `
            <div class="calculator-display">0</div>
            <div class="calculator-grid">
                ${buttons.flat().map((btn, idx) => {
                    let className = 'calc-btn';
                    if (['÷', '×', '−', '+'].includes(btn)) className += ' operator';
                    if (btn === '=') className += ' equals';
                    return `<button class="${className}" data-btn="${btn}">${btn}</button>`;
                }).join('')}
            </div>
        `;

        const displayEl = this.contentEl.querySelector('.calculator-display');
        const buttons_els = this.contentEl.querySelectorAll('.calc-btn');

        const updateDisplay = (value) => {
            display = value;
            displayEl.textContent = display;
        };

        buttons_els.forEach(btn => {
            btn.addEventListener('click', () => {
                const value = btn.dataset.btn;

                if (value === 'C') {
                    display = '0';
                    previousValue = '';
                    operation = '';
                    shouldResetDisplay = false;
                    updateDisplay(display);
                } else if (value === '←') {
                    if (display.length > 1) {
                        display = display.slice(0, -1);
                    } else {
                        display = '0';
                    }
                    updateDisplay(display);
                } else if (['÷', '×', '−', '+'].includes(value)) {
                    previousValue = display;
                    operation = value;
                    shouldResetDisplay = true;
                } else if (value === '=') {
                    if (operation && previousValue) {
                        const prev = parseFloat(previousValue);
                        const curr = parseFloat(display);
                        let result;

                        switch (operation) {
                            case '+': result = prev + curr; break;
                            case '−': result = prev - curr; break;
                            case '×': result = prev * curr; break;
                            case '÷': result = curr !== 0 ? prev / curr : 'Error'; break;
                            default: result = curr;
                        }

                        display = typeof result === 'number' ? (result % 1 !== 0 ? result.toFixed(2) : result.toString()) : result;
                        operation = '';
                        previousValue = '';
                        shouldResetDisplay = true;
                        updateDisplay(display);
                    }
                } else if (value === '%') {
                    display = (parseFloat(display) / 100).toString();
                    updateDisplay(display);
                } else if (value === '√') {
                    display = Math.sqrt(parseFloat(display)).toFixed(2);
                    updateDisplay(display);
                } else if (value === '.') {
                    if (!display.includes('.')) {
                        display += '.';
                        updateDisplay(display);
                    }
                } else {
                    if (shouldResetDisplay) {
                        display = value;
                        shouldResetDisplay = false;
                    } else {
                        display = display === '0' ? value : display + value;
                    }
                    updateDisplay(display);
                }
            });
        });
    }

    renderNotepad() {
        this.contentEl.innerHTML = `
            <textarea class="notepad-textarea" placeholder="Start typing..."></textarea>
        `;
    }

    renderSettings() {
        const tabs = ['System', 'Display', 'Sound', 'About'];
        const content = {
            'System': `
                <div class="settings-item">
                    <div class="settings-label">Device Name</div>
                    <div class="settings-value">DESKTOP-WIN11</div>
                </div>
                <div class="settings-item">
                    <div class="settings-label">OS Build</div>
                    <div class="settings-value">22621.1778</div>
                </div>
                <div class="settings-item">
                    <div class="settings-label">Edition</div>
                    <div class="settings-value">Windows 11 Home</div>
                </div>
            `,
            'Display': `
                <div class="settings-item">
                    <div class="settings-label">Brightness</div>
                    <div class="settings-value">100%</div>
                </div>
                <div class="settings-item">
                    <div class="settings-label">Display Resolution</div>
                    <div class="settings-value">1920 × 1080</div>
                </div>
                <div class="settings-item">
                    <div class="settings-label">Refresh Rate</div>
                    <div class="settings-value">60 Hz</div>
                </div>
            `,
            'Sound': `
                <div class="settings-item">
                    <div class="settings-label">Master Volume</div>
                    <div class="settings-value">75%</div>
                </div>
                <div class="settings-item">
                    <div class="settings-label">Speakers</div>
                    <div class="settings-value">Realtek Audio</div>
                </div>
            `,
            'About': `
                <div class="settings-item">
                    <div class="settings-label">Windows 11</div>
                    <div class="settings-value">The latest version of Windows</div>
                </div>
                <div class="settings-item">
                    <div class="settings-label">Version</div>
                    <div class="settings-value">22H2</div>
                </div>
                <div class="settings-item">
                    <div class="settings-label">Copyright</div>
                    <div class="settings-value">© 2024 Microsoft Corporation</div>
                </div>
            `
        };

        this.contentEl.innerHTML = `
            <div class="settings-container">
                <div class="settings-sidebar">
                    ${tabs.map(tab => `
                        <button class="settings-tab ${tab === 'System' ? 'active' : ''}" data-tab="${tab}">
                            ${tab}
                        </button>
                    `).join('')}
                </div>
                <div class="settings-content">
                    ${tabs.map(tab => `
                        <div class="settings-section ${tab === 'System' ? 'active' : ''}" data-section="${tab}">
                            ${content[tab]}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.contentEl.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
                tab.classList.add('active');
                document.querySelector(`[data-section="${tab.dataset.tab}"]`).classList.add('active');
            });
        });
    }
}

class Windows11Simulator {
    constructor() {
        this.windows = new Map();
        this.windowCounter = 0;
        this.setupEventListeners();
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    setupEventListeners() {
        // Start menu
        document.getElementById('startBtn').addEventListener('click', () => {
            document.getElementById('startMenu').classList.toggle('active');
        });

        document.querySelector('.close-start-menu').addEventListener('click', () => {
            document.getElementById('startMenu').classList.remove('active');
        });

        document.getElementById('startMenu').addEventListener('click', (e) => {
            if (e.target.closest('.menu-item')) {
                const app = e.target.closest('.menu-item').dataset.app;
                this.openApp(app);
                document.getElementById('startMenu').classList.remove('active');
            }
        });

        // Desktop icons
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.addEventListener('dblclick', () => {
                const app = icon.dataset.app;
                this.openApp(app);
            });
        });

        // Taskbar icons
        document.querySelectorAll('.taskbar-icon').forEach(icon => {
            icon.addEventListener('click', () => {
                const app = icon.dataset.app;
                this.openApp(app);
            });
        });

        // Context menu
        document.addEventListener('contextmenu', (e) => {
            if (e.target === document.querySelector('.desktop-background') || e.target === document.body) {
                e.preventDefault();
                const menu = document.getElementById('contextMenu');
                menu.style.left = e.clientX + 'px';
                menu.style.top = e.clientY + 'px';
                menu.classList.add('active');
            }
        });

        document.addEventListener('click', () => {
            document.getElementById('contextMenu').classList.remove('active');
            document.getElementById('startMenu').classList.remove('active');
        });
    }

    openApp(app) {
        const titles = {
            'file-explorer': 'File Explorer',
            'calculator': 'Calculator',
            'notepad': 'Notepad',
            'settings': 'Settings'
        };

        const sizes = {
            'file-explorer': [700, 500],
            'calculator': [350, 450],
            'notepad': [600, 400],
            'settings': [800, 500]
        };

        const title = titles[app];
        const [width, height] = sizes[app] || [600, 400];
        const windowId = `window-${app}-${this.windowCounter++}`;

        const window = new Window(windowId, title, app, width, height);
        this.windows.set(windowId, window);
    }

    updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        document.getElementById('clock').textContent = `${hours}:${minutes}`;
    }
}

// Initialize simulator
const simulator = new Windows11Simulator();

// Add custom CSS for maximized windows
const style = document.createElement('style');
style.textContent = `
    .window.maximized {
        border-radius: 0;
    }
    
    .window.maximized .window-header {
        border-radius: 0;
    }
`;
document.head.appendChild(style);
