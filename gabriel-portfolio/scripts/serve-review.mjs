import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,dirname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(process.argv[2]||resolve(dirname(fileURLToPath(import.meta.url)),'../.next-pages'));
const prefix='/Site-zAIon/gabriel';
const port=Number(process.argv[3]||8080);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.txt':'text/plain','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.glb':'model/gltf-binary','.ico':'image/x-icon'};
await stat(resolve(root,'index.html'));
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/'||url.pathname===prefix){res.writeHead(302,{Location:prefix+'/'});res.end();return;}
  if(!url.pathname.startsWith(prefix+'/'))throw new Error('outside prefix');
  let path=resolve(root,'.'+decodeURIComponent(url.pathname.slice(prefix.length)));
  if(path!==root&&!path.startsWith(root+sep))throw new Error('outside root');
  if((await stat(path)).isDirectory())path=resolve(path,'index.html');
  res.setHeader('Content-Type',mime[extname(path)]||'application/octet-stream');
  res.setHeader('Cache-Control','no-store');res.end(await readFile(path));
 }catch{res.statusCode=404;res.end('Arquivo não encontrado');}
});
server.listen(port,'127.0.0.1',()=>{
 console.log(`Revisão local pronta: http://127.0.0.1:${server.address().port}${prefix}/`);
 console.log('Sem publicação. Ctrl+C encerra o servidor.');
});
