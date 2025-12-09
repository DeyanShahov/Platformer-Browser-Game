// Функция за зареждане на икона от спрайт шита
// Параметри според описанието: 5 реда, 10 колони, маргин 30, размер икона 65x65, разстояние между редове 25, между колони 1

const SPRITE_ROWS = 5;
const SPRITE_COLS = 10;
const MARGIN = 30;
const ICON_SIZE = 65;
const ROW_SPACING = 25;
const COL_SPACING = 1;

// Функция за изчисляване на позицията на иконата (ред и колона започват от 1)
function getIconPosition(row, col) {
  const x = MARGIN + (col - 1) * (ICON_SIZE + COL_SPACING);
  const y = MARGIN + (row - 1) * (ICON_SIZE + ROW_SPACING);
  return { x, y };
}

// Функция за зареждане на иконата в canvas
function loadSkillIcon(row, col) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    //img.src = 'Swordsman-Skill-Icons.webp';
    img.src = 'Assets/Swordsman-Skill-Icons.webp';
    img.onload = () => {
      const { x, y } = getIconPosition(row, col);
      const canvas = document.createElement('canvas');
      canvas.width = ICON_SIZE;
      canvas.height = ICON_SIZE;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, x, y, ICON_SIZE, ICON_SIZE, 0, 0, ICON_SIZE, ICON_SIZE);
      resolve(canvas);
    };
    img.onerror = reject;
  });
}

// Пример за използване (коментиран, за да не се изпълнява автоматично)
// loadSkillIcon(2, 4).then(canvas => {
//   document.body.appendChild(canvas);
// }).catch(console.error);
