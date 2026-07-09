const fs = require('fs');

const filePath = 'F:/asset_management/ams-frontend/src/Page/AssetStatus/InStock/InStock.jsx';
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(
  'assetType: item.grInventoryProduct?.product?.category?.name || "NA",',
  'assetType: item.grInventoryProduct?.category?.name || item.grInventoryProduct?.product?.category?.name || "NA",'
);

content = content.replace(
  'make: item.grInventoryProduct?.product?.brand?.name || "NA",',
  'make: item.grInventoryProduct?.brand?.name || item.grInventoryProduct?.product?.brand?.name || "NA",'
);

content = content.replace(
  'model: item.grInventoryProduct?.product?.name || "NA",',
  'model: item.grInventoryProduct?.product?.name || item.modelName || "NA",'
);

fs.writeFileSync(filePath, content);
console.log('Fixed InStock.jsx');
