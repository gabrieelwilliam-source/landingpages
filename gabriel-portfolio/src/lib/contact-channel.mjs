/** Only an explicitly configured public HTTPS/mailto/tel channel is allowed. */
export function contactChannel(value){
 if(typeof value!=='string'||!value.trim())return null;
 try{const url=new URL(value);if(url.username||url.password)return null;return ['https:','mailto:','tel:'].includes(url.protocol)?url.href:null;}catch{return null;}
}
