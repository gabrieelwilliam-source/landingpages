/** Original vector drawing; no photograph or third-party sprite is served. */
export default function Avatar({moving=false,jumping=false}:{moving?:boolean;jumping?:boolean}){
 return <svg className={`avatar ${moving?'is-moving':''} ${jumping?'is-jumping':''}`} width="74" height="126" viewBox="0 0 74 126" role="img" aria-label="Gabriel ilustrado: cabelo curto, olhos claros, barba longa e roupa escura">
 <g className="avatar-body" strokeLinecap="round" strokeLinejoin="round">
 <path className="leg leg-left" d="M29 93v22l-5 6h12" fill="none" stroke="#61717e" strokeWidth="9"/>
 <path className="leg leg-right" d="M45 93v22l5 6H38" fill="none" stroke="#435665" strokeWidth="9"/>
 <path d="M24 62h26l8 36H17Z" fill="#263947" stroke="#82919b" strokeWidth="1.5"/>
 <path className="arm arm-left" d="M23 67 15 89" stroke="#61717e" strokeWidth="8"/>
 <path className="arm arm-right" d="m51 67 9 22" stroke="#61717e" strokeWidth="8"/>
 <path d="M28 69h18" stroke="#c5a66b" strokeWidth="2"/>
 </g>
 <path d="M20 27C19 13 25 6 37 6s19 7 18 21l-2 24H22Z" fill="#d1a78b"/>
 <path d="M20 28C16 12 27 3 38 5c15 0 20 12 17 24l-4-12-9-5-14 3Z" fill="#49443f"/>
 <path d="m23 29 9-2m10 0 9 2" stroke="#55463e" strokeWidth="2.5"/>
 <path d="M24 34h9m9 0h9" stroke="#f3f0e8" strokeWidth="3"/>
 <path d="M29 33v2m17-2v2" stroke="#638896" strokeWidth="3"/>
 <path d="m37 34-3 10h5" fill="none" stroke="#ad8168" strokeWidth="1.5"/>
 <path d="m20 40 7 10 10-4 10 4 8-10-2 24-7 13-9 7-10-7-6-15Z" fill="#403b37"/>
 <path d="m28 54 9-3 9 3m-15 8 6 9m8-9-5 13" fill="none" stroke="#73665a" strokeWidth="1.5"/>
 <path d="M31 56h12" stroke="#b18c79" strokeWidth="1.5"/>
 </svg>
}
