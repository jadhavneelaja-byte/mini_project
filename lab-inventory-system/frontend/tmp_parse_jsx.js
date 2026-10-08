const fs = require('fs');
const parser = require('@babel/parser');

const filePath = './src/components/AdminDashboard.jsx';
const src = fs.readFileSync(filePath, 'utf8');

function canParse(code) {
  try {
    parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });
    return true;
  } catch (e) {
    return false;
  }
}

let low = 0;
let high = src.length;
let lastGood = 0;

while (low <= high) {
  const mid = Math.floor((low + high) / 2);
  const snippet = src.slice(0, mid);
  if (canParse(snippet)) {
    lastGood = mid;
    low = mid + 1;
  } else {
    high = mid - 1;
  }
}

console.log('Last parseable index:', lastGood);
console.log('Context around failure:');
const start = Math.max(0, lastGood - 120);
const end = Math.min(src.length, lastGood + 120);
console.log(src.slice(start, end));
