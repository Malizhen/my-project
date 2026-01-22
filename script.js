// 获取DOM元素
const notepad = document.getElementById('notepad');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');
const wordCount = document.getElementById('wordCount');
const status = document.getElementById('status');

// 本地存储键名
const STORAGE_KEY = 'notepad_content';

// 自动保存延迟时间（毫秒）
const AUTOSAVE_DELAY = 1000;
let saveTimer = null;

// 页面加载时恢复保存的内容
function loadContent() {
    const savedContent = localStorage.getItem(STORAGE_KEY);
    if (savedContent) {
        notepad.value = savedContent;
        updateWordCount();
        showStatus('已加载保存的内容', 'success');
    }
}

// 保存内容到本地存储
function saveContent() {
    const content = notepad.value;
    localStorage.setItem(STORAGE_KEY, content);
    showStatus('已自动保存', 'success');
}

// 更新字数统计
function updateWordCount() {
    const content = notepad.value;
    const count = content.length;
    wordCount.textContent = count;
}

// 显示状态消息
function showStatus(message, type = 'info') {
    status.textContent = message;

    // 3秒后恢复默认状态
    setTimeout(() => {
        status.textContent = '准备就绪';
    }, 3000);
}

// 清空记事本
function clearNotepad() {
    if (notepad.value.length === 0) {
        showStatus('记事本已是空的', 'info');
        return;
    }

    if (confirm('确定要清空所有内容吗？此操作不可撤销。')) {
        notepad.value = '';
        localStorage.removeItem(STORAGE_KEY);
        updateWordCount();
        showStatus('已清空内容', 'success');
        notepad.focus();
    }
}

// 下载记事本内容为文本文件
function downloadContent() {
    const content = notepad.value;

    if (content.length === 0) {
        showStatus('没有内容可下载', 'warning');
        return;
    }

    // 创建Blob对象
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // 生成文件名（使用当前日期时间）
    const now = new Date();
    const fileName = `记事本_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.txt`;

    link.href = url;
    link.download = fileName;
    link.click();

    // 释放URL对象
    URL.revokeObjectURL(url);

    showStatus('文件已下载', 'success');
}

// 输入时自动保存（防抖）
function handleInput() {
    updateWordCount();

    // 清除之前的计时器
    if (saveTimer) {
        clearTimeout(saveTimer);
    }

    // 设置新的计时器
    saveTimer = setTimeout(() => {
        saveContent();
    }, AUTOSAVE_DELAY);

    showStatus('正在编辑...', 'info');
}

// 键盘快捷键
function handleKeyDown(e) {
    // Ctrl+S 或 Cmd+S - 手动保存
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveContent();
        return;
    }

    // Ctrl+D 或 Cmd+D - 下载
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        downloadContent();
        return;
    }
}

// 事件监听器
notepad.addEventListener('input', handleInput);
notepad.addEventListener('keydown', handleKeyDown);
clearBtn.addEventListener('click', clearNotepad);
downloadBtn.addEventListener('click', downloadContent);

// 页面卸载前保存
window.addEventListener('beforeunload', () => {
    if (notepad.value.length > 0) {
        saveContent();
    }
});

// 初始化
loadContent();

// 提示用户支持的快捷键
console.log('📝 网页记事本快捷键：');
console.log('Ctrl/Cmd + S - 手动保存');
console.log('Ctrl/Cmd + D - 下载内容');
