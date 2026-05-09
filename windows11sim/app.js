// Window Management
class WindowManager {
    constructor() {
        this.windows = [];
        this.zIndex = 50;
        this.draggingWindow = null;
        this.draggingOffset = { x: 0, y: 0 };
        this.resizingWindow = null;
        this.taskbarHeight = 60;
    }

    createWindow(app, title, width, height, content) {
        const windowId = `window-${Date.now()}`;
        
        const windowEl = document.createElement('div');
        windowEl.id = windowId;
        windowEl.className = 'window focused';
        windowEl.style.width = width + 'px';
        windowEl.style.height = height + 'px';
        windowEl.style.left = Math.random() * (window.innerWidth - width - 100) + 50 + 'px';
        windowEl.style.top = Math.random() * (window.innerHeight - height - 150) + 50 + 'px';
        windowEl.style.zIndex = this.zIndex++;

        const header = document.createElement('div');
        header.className = 'window-header';
        header.innerHTML = `
            <div class="window-title">${title}</div>
            <div class="window-controls">
                <button class="window-btn minimize" title="Minimize">−</button>
                <button class="window-btn maximize" title="Maximize">◻</button>
                <button class="window-btn close" title="Close">✕</button>
            </div>
        `;

        const contentDiv = document.createElement('div');
        contentDiv.className = `window-content ${app}`;
        contentDiv.innerHTML = content;

        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'window-resize-handle';

        windowEl.appendChild(header);
        windowEl.appendChild(contentDiv);
        windowEl.appendChild(resizeHandle);

        document.getElementById('windowsContainer').appendChild(windowEl);

        // Event listeners
        header.addEventListener('mousedown', (e) => this.startDrag(e, windowId));
        resizeHandle.addEventListener('mousedown', (e) => this.startResize(e, windowId));
        
        const closeBtn = header.querySelector('.close');
        const minimizeBtn = header.querySelector('.minimize');
        const maximizeBtn = header.querySelector('.maximize');

        closeBtn.addEventListener('click', () => this.closeWindow(windowId));
        minimizeBtn.addEventListener('click', () => this.minimizeWindow(windowId));
        maximizeBtn.addEventListener('click', () => this.maximizeWindow(windowId));

        windowEl.addEventListener('mousedown', () => this.focusWindow(windowId));

        this.windows.push({ id: windowId, app, title, minimized: false, maximized: false });
        this.updateTaskbar();
    }

    startDrag(e, windowId) {
        if (e.target.closest('.window-btn')) return;
        this.draggingWindow = windowId;
        const windowEl = document.getElementById(windowId);
        this.draggingOffset.x = e.clientX - windowEl.offsetLeft;
        this.draggingOffset.y = e.clientY - windowEl.offsetTop;
    }

    startResize(e, windowId) {
        this.resizingWindow = windowId;
        const windowEl = document.getElementById(windowId);
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = windowEl.offsetWidth;
        const startHeight = windowEl.offsetHeight;

        const onMouseMove = (e) => {
            if (!this.resizingWindow) return;
            const newWidth = Math.max(320, startWidth + (e.clientX - startX));
            const newHeight = Math.max(240, startHeight + (e.clientY - startY));
            windowEl.style.width = newWidth + 'px';
            windowEl.style.height = newHeight + 'px';
        };

        const onMouseUp = () => {
            this.resizingWindow = null;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    closeWindow(windowId) {
        const windowEl = document.getElementById(windowId);
        windowEl.style.animation = 'windowOpen 0.2s ease reverse';
        setTimeout(() => {
            windowEl.remove();
            this.windows = this.windows.filter(w => w.id !== windowId);
            this.updateTaskbar();
        }, 200);
    }

    minimizeWindow(windowId) {
        const window = this.windows.find(w => w.id === windowId);
        const windowEl = document.getElementById(windowId);
        
        if (window.minimized) {
            windowEl.style.display = 'flex';
            window.minimized = false;
        } else {
            windowEl.style.display = 'none';
            window.minimized = true;
        }
        this.updateTaskbar();
    }

    maximizeWindow(windowId) {
        const window = this.windows.find(w => w.id === windowId);
        const windowEl = document.getElementById(windowId);
        
        if (window.maximized) {
            windowEl.style.width = window.originalWidth;
            windowEl.style.height = window.originalHeight;
            windowEl.style.left = window.originalLeft;
            windowEl.style.top = window.originalTop;
            windowEl.style.borderRadius = '8px';
            window.maximized = false;
        } else {
            window.originalWidth = windowEl.style.width;
            window.originalHeight = windowEl.style.height;
            window.originalLeft = windowEl.style.left;
            window.originalTop = windowEl.style.top;
            windowEl.style.width = '100%';
            windowEl.style.height = `calc(100% - ${this.taskbarHeight}px)`;
            windowEl.style.left = '0';
            windowEl.style.top = '0';
            windowEl.style.borderRadius = '0';
            window.maximized = true;
        }
        this.updateTaskbar();
    }

    focusWindow(windowId) {
        document.querySelectorAll('.window').forEach(w => w.classList.remove('focused'));
        const windowEl = document.getElementById(windowId);
        if (windowEl) {
            windowEl.classList.add('focused');
            windowEl.style.zIndex = this.zIndex++;
        }
    }

    updateTaskbar() {
        const taskbarApps = document.querySelector('.taskbar-apps');
        taskbarApps.innerHTML = '';
        
        this.windows.forEach(w => {
            const btn = document.createElement('button');
            btn.className = 'taskbar-icon';
            btn.title = w.title;
            
            const icon = this.getAppIcon(w.app);
            btn.innerHTML = icon;
            
            btn.addEventListener('click', () => {
                const windowEl = document.getElementById(w.id);
                if (w.minimized) {
                    windowEl.style.display = 'flex';
                    w.minimized = false;
                } else {
                    windowEl.style.display = 'none';
                    w.minimized = true;
                }
                this.updateTaskbar();
            });
            
            taskbarApps.appendChild(btn);
        });
    }

    getAppIcon(app) {
        const icons = {
            'file-explorer': '<svg viewBox="0 0 24 24"><path d="M3 3 L12 3 L13 5 L21 5 L21 19 Q21 21 19 21 L5 21 Q3 21 3 19 Z" fill="currentColor"/></svg>',
            'calculator': '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor"/></svg>',
            'notepad': '<svg viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="1" fill="currentColor"/></svg>',
            'settings': '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" fill="currentColor"/><circle cx="12" cy="4" r="1.5" fill="currentColor"/><circle cx="12" cy="20" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="20" cy="12" r="1.5" fill="currentColor"/></svg>'
        };
        return icons[app] || icons['file-explorer'];
    }
}

// Global window manager
const windowManager = new WindowManager();

// Drag window
document.addEventListener('mousemove', (e) => {
    if (windowManager.draggingWindow) {
        const windowEl = document.getElementById(windowManager.draggingWindow);
        const newX = e.clientX - windowManager.draggingOffset.x;
        const newY = e.clientY - windowManager.draggingOffset.y;
        
        windowEl.style.left = Math.max(0, Math.min(newX, window.innerWidth - windowEl.offsetWidth)) + 'px';
        windowEl.style.top = Math.max(0, Math.min(newY, window.innerHeight - windowEl.offsetHeight - 60)) + 'px';
    }
});

document.addEventListener('mouseup', () => {
    windowManager.draggingWindow = null;
});

// App Launchers
function launchApp(app) {
    const apps = {
        'file-explorer': {
            title: 'File Explorer',
            width: 600,
            height: 450,
            content: createFileExplorerContent()
        },
        'calculator': {
            title: 'Calculator',
            width: 340,
            height: 500,
            content: createCalculatorContent()
        },
        'notepad': {
            title: 'Notepad',
            width: 800,
            height: 500,
            content: createNotepadContent()
        },
        'settings': {
            title: 'Settings',
            width: 700,
            height: 600,
            content: createSettingsContent()
        }
    };

    if (apps[app]) {
        const appData = apps[app];
        windowManager.createWindow(app, appData.title, appData.width, appData.height, appData.content);
        
        setTimeout(() => {
            if (app === 'calculator') initCalculator();
            if (app === 'notepad') initNotepad();
            if (app === 'file-explorer') initFileExplorer();
            if (app === 'settings') initSettings();
        }, 100);
    }
}

// File Explorer
function createFileExplorerContent() {
    return `
        <div class="file-explorer">
            <div class="file-toolbar">
                <button>← Back</button>
                <button>→ Forward</button>
                <button>⇧ Up</button>
                <input type="text" class="file-path" value="C:\\Users\\YourName\\Documents" readonly>
            </div>
            <div class="file-list">
                <div class="file-item"><span class="file-icon">📁</span> <span>Desktop</span></div>
                <div class="file-item"><span class="file-icon">📁</span> <span>Downloads</span></div>
                <div class="file-item"><span class="file-icon">📁</span> <span>Documents</span></div>
                <div class="file-item"><span class="file-icon">📁</span> <span>Pictures</span></div>
                <div class="file-item"><span class="file-icon">📁</span> <span>Videos</span></div>
                <div class="file-item"><span class="file-icon">📁</span> <span>Music</span></div>
                <div class="file-item"><span class="file-icon">📄</span> <span>README.txt</span></div>
                <div class="file-item"><span class="file-icon">📄</span> <span>notes.docx</span></div>
                <div class="file-item"><span class="file-icon">📷</span> <span>vacation.jpg</span></div>
                <div class="file-item"><span class="file-icon">🎵</span> <span>song.mp3</span></div>
                <div class="file-item"><span class="file-icon">🎬</span> <span>movie.mp4</span></div>
            </div>
        </div>
    `;
}

function initFileExplorer() {
    document.querySelectorAll('.file-item').forEach(item => {
        item.addEventListener('click', function(e) {
            document.querySelectorAll('.file-item').forEach(el => el.style.background = '');
            this.style.background = 'rgba(0, 120, 212, 0.2)';
        });
        
        item.addEventListener('dblclick', function() {
            const name = this.querySelector('span:last-child').textContent.trim();
            const icon = this.querySelector('.file-icon').textContent;
            if (icon === '📁') {
                alert(`Opening folder: ${name}`);
            } else {
                alert(`Opening file: ${name}`);
            }
        });
    });
}

// Calculator
function createCalculatorContent() {
    return `
        <div class="calc-display" id="calcDisplay">0</div>
        <div class="calc-buttons">
            <button class="calc-btn clear">AC</button>
            <button class="calc-btn operator">(</button>
            <button class="calc-btn operator">)</button>
            <button class="calc-btn operator">÷</button>
            
            <button class="calc-btn">7</button>
            <button class="calc-btn">8</button>
            <button class="calc-btn">9</button>
            <button class="calc-btn operator">×</button>
            
            <button class="calc-btn">4</button>
            <button class="calc-btn">5</button>
            <button class="calc-btn">6</button>
            <button class="calc-btn operator">−</button>
            
            <button class="calc-btn">1</button>
            <button class="calc-btn">2</button>
            <button class="calc-btn">3</button>
            <button class="calc-btn operator">+</button>
            
            <button class="calc-btn">0</button>
            <button class="calc-btn">.</button>
            <button class="calc-btn operator">%</button>
            <button class="calc-btn equals">=</button>
        </div>
    `;
}

function initCalculator() {
    let display = document.getElementById('calcDisplay');
    let currentValue = '0';
    let previousValue = '';
    let operation = null;
    let shouldResetDisplay = false;

    const updateDisplay = () => {
        display.textContent = currentValue.length > 16 ? currentValue.substring(0, 16) : currentValue;
    };

    document.querySelectorAll('.calc-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const value = this.textContent;

            if (this.classList.contains('clear')) {
                currentValue = '0';
                previousValue = '';
                operation = null;
                shouldResetDisplay = false;
            } else if (this.classList.contains('equals')) {
                if (operation && previousValue) {
                    const prev = parseFloat(previousValue);
                    const curr = parseFloat(currentValue);
                    let result = 0;

                    switch(operation) {
                        case '+': result = prev + curr; break;
                        case '−': result = prev - curr; break;
                        case '×': result = prev * curr; break;
                        case '÷': result = curr !== 0 ? prev / curr : 0; break;
                        case '%': result = prev % curr; break;
                    }

                    currentValue = result.toString();
                    previousValue = '';
                    operation = null;
                    shouldResetDisplay = true;
                }
            } else if (this.classList.contains('operator')) {
                if (operation && !shouldResetDisplay) {
                    const prev = parseFloat(previousValue);
                    const curr = parseFloat(currentValue);
                    let result = 0;

                    switch(operation) {
                        case '+': result = prev + curr; break;
                        case '−': result = prev - curr; break;
                        case '×': result = prev * curr; break;
                        case '÷': result = curr !== 0 ? prev / curr : 0; break;
                        case '%': result = prev % curr; break;
                    }

                    currentValue = result.toString();
                }

                previousValue = currentValue;
                operation = value;
                shouldResetDisplay = true;
            } else {
                if (shouldResetDisplay) {
                    currentValue = value;
                    shouldResetDisplay = false;
                } else {
                    currentValue = currentValue === '0' ? value : currentValue + value;
                }
            }

            updateDisplay();
        });
    });
}

// Notepad
function createNotepadContent() {
    return `
        <div class="notepad">
            <div class="notepad-toolbar">
                <button>📋 Copy</button>
                <button>✂️ Cut</button>
                <button>📌 Paste</button>
                <button>🔍 Find</button>
                <button>🔄 Replace</button>
            </div>
            <textarea class="notepad-textarea" placeholder="Start typing..."></textarea>
        </div>
    `;
}

function initNotepad() {
    const textarea = document.querySelector('.notepad-textarea');
    let savedContent = localStorage.getItem('notepad-content') || '';
    textarea.value = savedContent;

    textarea.addEventListener('input', () => {
        localStorage.setItem('notepad-content', textarea.value);
    });

    document.querySelectorAll('.notepad-toolbar button').forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.textContent;
            if (text.includes('Copy')) document.execCommand('copy');
            if (text.includes('Cut')) document.execCommand('cut');
            if (text.includes('Paste')) document.execCommand('paste');
        });
    });
}

// Settings
function createSettingsContent() {
    return `
        <div class="settings">
            <div class="settings-tabs">
                <button class="settings-tab active" data-tab="system">System</button>
                <button class="settings-tab" data-tab="display">Display</button>
                <button class="settings-tab" data-tab="sound">Sound</button>
                <button class="settings-tab" data-tab="about">About</button>
            </div>
            <div class="settings-content">
                <div id="system-tab" class="settings-section-content">
                    <div class="settings-section">
                        <div class="settings-section-title">Device Name</div>
                        <div class="settings-item">
                            <span class="settings-item-label">Computer Name:</span>
                            <input type="text" value="DESKTOP-USER" style="border: 1px solid #ccc; padding: 6px; border-radius: 4px;">
                        </div>
                    </div>
                    <div class="settings-section">
                        <div class="settings-section-title">Windows Activation</div>
                        <div class="settings-item">
                            <span class="settings-item-label">Activation Status:</span>
                            <span style="color: green; font-weight: bold;">✓ Activated</span>
                        </div>
                    </div>
                    <div class="settings-section">
                        <div class="settings-section-title">Storage</div>
                        <div class="settings-item">
                            <span class="settings-item-label">System Drive (C:):</span>
                            <span>256 GB / 512 GB</span>
                        </div>
                    </div>
                </div>
                
                <div id="display-tab" class="settings-section-content" style="display:none;">
                    <div class="settings-section">
                        <div class="settings-section-title">Brightness & Color</div>
                        <div class="settings-item">
                            <span class="settings-item-label">Brightness:</span>
                            <input type="range" min="0" max="100" value="75" style="width: 150px;">
                        </div>
                    </div>
                    <div class="settings-section">
                        <div class="settings-section-title">Display Settings</div>
                        <div class="settings-item">
                            <span class="settings-item-label">Night Light:</span>
                            <div class="settings-toggle" onclick="this.classList.toggle('active')"></div>
                        </div>
                        <div class="settings-item">
                            <span class="settings-item-label">Resolution:</span>
                            <span>1920 x 1080</span>
                        </div>
                    </div>
                </div>
                
                <div id="sound-tab" class="settings-section-content" style="display:none;">
                    <div class="settings-section">
                        <div class="settings-section-title">Volume</div>
                        <div class="settings-item">
                            <span class="settings-item-label">Master Volume:</span>
                            <input type="range" min="0" max="100" value="70" style="width: 150px;">
                        </div>
                    </div>
                    <div class="settings-section">
                        <div class="settings-section-title">Sound Options</div>
                        <div class="settings-item">
                            <span class="settings-item-label">Mute System Sounds:</span>
                            <div class="settings-toggle"></div>
                        </div>
                    </div>
                </div>
                
                <div id="about-tab" class="settings-section-content" style="display:none;">
                    <div class="settings-section">
                        <div class="settings-section-title">Windows 11 Information</div>
                        <div class="settings-item">
                            <span class="settings-item-label">Version:</span>
                            <span>23H2</span>
                        </div>
                        <div class="settings-item">
                            <span class="settings-item-label">OS Build:</span>
                            <span>22631.3737</span>
                        </div>
                        <div class="settings-item">
                            <span class="settings-item-label">Installation Date:</span>
                            <span>2026-05-09</span>
                        </div>
                        <div class="settings-item">
                            <span class="settings-item-label">System Type:</span>
                            <span>64-bit Operating System</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function initSettings() {
    const tabs = document.querySelectorAll('.settings-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.settings-section-content').forEach(content => {
                content.style.display = 'none';
            });
            
            document.getElementById(this.dataset.tab + '-tab').style.display = 'block';
        });
    });
}

// Start Menu & Desktop Events
document.getElementById('startBtn').addEventListener('click', () => {
    const menu = document.getElementById('startMenu');
    menu.classList.toggle('active');
});

document.querySelector('.close-start-menu').addEventListener('click', () => {
    document.getElementById('startMenu').classList.remove('active');
});

document.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('dblclick', function() {
        const app = this.dataset.app;
        launchApp(app);
        document.getElementById('startMenu').classList.remove('active');
    });
});

document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
        const app = this.dataset.app;
        launchApp(app);
        document.getElementById('startMenu').classList.remove('active');
    });
});

// Clock Update
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('clock').textContent = hours + ':' + minutes;
}

setInterval(updateClock, 1000);
updateClock();

// Context Menu
document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.desktop-background')) {
        e.preventDefault();
        const menu = document.getElementById('contextMenu');
        menu.classList.add('active');
        menu.style.left = e.clientX + 'px';
        menu.style.top = e.clientY + 'px';
    }
});

document.addEventListener('click', () => {
    document.getElementById('contextMenu').classList.remove('active');
    document.getElementById('startMenu').classList.remove('active');
});

document.querySelectorAll('.context-item').forEach(item => {
    item.addEventListener('click', function() {
        const action = this.dataset.action;
        if (action === 'refresh') location.reload();
        if (action === 'about') alert('Windows 11 Simulator v1.0\nMade with HTML, CSS & JavaScript');
        document.getElementById('contextMenu').classList.remove('active');
    });
});
