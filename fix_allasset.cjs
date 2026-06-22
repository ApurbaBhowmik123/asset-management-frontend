const fs = require('fs');
let c = fs.readFileSync('src/Page/AssetStatus/AllAsset/AllAsset.jsx', 'utf8');

const lines = c.split('\n');

// We need to delete lines 64-70 (0-indexed 64-70 would be lines 65-71)
// Wait, the error is at line 71.
// Let's just find the exact text using regex.
c = c.replace(/DialogContentText,[\s\S]*?Collapse,[\s\S]*?\} from "@mui\/material";/, '}));');

fs.writeFileSync('src/Page/AssetStatus/AllAsset/AllAsset.jsx', c);
console.log('Fixed AllAsset.jsx!');
