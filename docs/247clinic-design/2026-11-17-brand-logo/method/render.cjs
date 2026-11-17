// usage: node render.cjs in.svg out.png width [bg]
const path=require('path');
const sharp=require(path.join('D:/Healthcare international group/247clinic-v4/node_modules/sharp'));
const [,,inp,out,w,bg]=process.argv;
(async()=>{
  let img=sharp(inp,{density:300}).resize({width:parseInt(w)});
  if(bg) img=img.flatten({background:bg});
  await img.png().toFile(out);
  console.log('ok',out);
})().catch(e=>{console.error(e);process.exit(1)});
