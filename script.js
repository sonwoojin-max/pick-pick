document.addEventListener('DOMContentLoaded', function() {
  const grid = document.getElementById('grid');
  const nicknameInput = document.getElementById('nickname');
  const msgInput = document.getElementById('pixelMsg');
  const actionBtns = document.getElementById('actionBtns');
  const okBtn = document.getElementById('okBtn');
  const resetBtn = document.getElementById('resetBtn');
  const size = 100; // 100x100 = 10,000 픽셀
  const saved = JSON.parse(localStorage.getItem('pixels') || '{}');
  let isMouseDown = false;
  let dragStart = null;
  let dragEnd = null;
  let dragSelected = new Set();

  // 픽셀 그리드 생성 (초기화)
  grid.innerHTML = '';
  const pixels = [];
  for (let i = 0; i < size * size; i++) {
    const pixel = document.createElement('div');
    pixel.className = 'pixel';
    pixel.dataset.index = i;
    pixel.dataset.x = i % size;
    pixel.dataset.y = Math.floor(i / size);
    pixels.push(pixel);

    if (saved[i]) {
      pixel.style.backgroundColor = saved[i].color;
      pixel.innerHTML = `<span title="${saved[i].owner}">${saved[i].msg}</span>`;
      pixel.style.cursor = 'not-allowed';
    }

    pixel.addEventListener('mousedown', (e) => {
      if (saved[i]) return;
      isMouseDown = true;
      dragStart = { x: parseInt(pixel.dataset.x), y: parseInt(pixel.dataset.y) };
      dragEnd = null;
      clearSelection();
      pixel.classList.add('selected');
      dragSelected.add(pixel);
      e.preventDefault();
    });
    pixel.addEventListener('mouseenter', () => {
      if (isMouseDown && !saved[i]) {
        dragEnd = { x: parseInt(pixel.dataset.x), y: parseInt(pixel.dataset.y) };
        updateSquareSelection();
      }
    });
    pixel.addEventListener('mouseup', () => {
      if (isMouseDown) {
        isMouseDown = false;
        if (dragSelected.size > 0) {
          actionBtns.style.display = '';
        }
      }
    });
    pixel.addEventListener('click', () => {
      if (saved[i]) {
        alert(`이미 소유된 픽셀입니다.\n닉네임: ${saved[i].owner}\n메시지: ${saved[i].msg}`);
        return;
      }
      clearSelection();
      pixel.classList.add('selected');
      dragSelected.add(pixel);
      actionBtns.style.display = '';
    });
    grid.appendChild(pixel);
  }

  document.addEventListener('mouseup', () => {
    if (isMouseDown) {
      isMouseDown = false;
      if (dragSelected.size > 0) {
        actionBtns.style.display = '';
      }
    }
  });
  document.addEventListener('mouseleave', () => {
    isMouseDown = false;
  });

  okBtn.onclick = () => {
    if (dragSelected.size === 0) return;
    // 네 꼭짓점 계산
    const selectedIndexes = Array.from(dragSelected).map(p => parseInt(p.dataset.index));
    const xs = Array.from(dragSelected).map(p => parseInt(p.dataset.x));
    const ys = Array.from(dragSelected).map(p => parseInt(p.dataset.y));
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const size = 100;
    // 1부터 시작하는 번호로 변환
    const topLeft = minY * size + minX + 1;
    const topRight = minY * size + maxX + 1;
    const bottomLeft = maxY * size + minX + 1;
    const bottomRight = maxY * size + maxX + 1;
    alert(`선택된 범위: ${topLeft}, ${topRight}, ${bottomLeft}, ${bottomRight}\n결제문의는 인스타: your_insta_id, 카카오톡: your_kakao_id`);
  };

  resetBtn.onclick = () => {
    clearSelection();
    actionBtns.style.display = 'none';
  };

  function clearSelection() {
    dragSelected.forEach(p => p.classList.remove('selected'));
    dragSelected.clear();
  }

  function updateSquareSelection() {
    clearSelection();
    if (!dragStart || !dragEnd) return;
    // 직사각형 범위 계산
    const x1 = dragStart.x;
    const y1 = dragStart.y;
    const x2 = dragEnd.x;
    const y2 = dragEnd.y;
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (x < 0 || y < 0 || x >= size || y >= size) continue;
        const idx = y * size + x;
        const pixel = pixels[idx];
        if (!pixel.classList.contains('owned')) {
          pixel.classList.add('selected');
          dragSelected.add(pixel);
        }
      }
    }
  }
});
