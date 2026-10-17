// Turn Astra logo redraws into site tiles.
// Usage (sharp isn't a project dependency; install it in a temp folder):
//   mkdir -p $TEMP/imgtools && cd $TEMP/imgtools && npm i --no-save --ignore-scripts sharp@0.33.5
//   NODE_PATH=$TEMP/imgtools/node_modules node tools/ingest-logo-redraws.cjs .
// Reads design/logo-redraws/<slug>.(png|jpg|webp), where <slug> is the file name in dist/opponents.json,
// and writes dist/opponents/<slug>.png: trimmed, fitted into 224px, centered on a 256px white square.
const sharp=require('sharp'),fs=require('fs'),path=require('path');const [,,root]=process.argv;
const inDir=root+'/design/logo-redraws',dist=root+'/dist',opp=JSON.parse(fs.readFileSync(dist+'/opponents.json','utf8'));
const bySlug=Object.fromEntries(Object.entries(opp).map(([n,v])=>[path.basename(v.file,'.png'),n]));
(async()=>{for(const f of fs.readdirSync(inDir).filter(f=>/\.(png|jpe?g|webp)$/i.test(f))){
 const slug=f.replace(/\.[^.]+$/,''),name=bySlug[slug];if(!name){console.log('SKIP (no school with this file name):',f);continue}
 const flat=await sharp(inDir+'/'+f).flatten({background:'#fff'}).png().toBuffer();
 const t=await sharp(flat).trim({background:'#ffffff',threshold:28}).toBuffer({resolveWithObject:true});
 const {width:w,height:h}=t.info,k=Math.min(224/w,224/h);
 const inner=await sharp(t.data).resize(Math.round(w*k),Math.round(h*k),{kernel:'lanczos3'}).png().toBuffer();
 await sharp({create:{width:256,height:256,channels:3,background:'#fff'}}).composite([{input:inner,gravity:'center'}]).png({compressionLevel:9,palette:true,quality:92}).toFile(dist+'/opponents/'+slug+'.png');
 opp[name].redrawn=true;console.log('updated',name,`(${w}x${h} source)`);}
fs.writeFileSync(dist+'/opponents.json',JSON.stringify(opp,null,2)+'\n');})();
