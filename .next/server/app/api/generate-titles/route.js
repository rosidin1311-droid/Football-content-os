"use strict";(()=>{var e={};e.id=208,e.ids=[208],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},2801:(e,t,a)=>{a.r(t),a.d(t,{originalPathname:()=>m,patchFetch:()=>g,requestAsyncStorage:()=>p,routeModule:()=>u,serverHooks:()=>k,staticGenerationAsyncStorage:()=>d});var r={};a.r(r),a.d(r,{POST:()=>l});var i=a(9303),n=a(8716),s=a(670),o=a(7070);async function l(e){try{let{context:t}=await e.json(),a=process.env.GEMINI_API_KEY;if(!a)return o.NextResponse.json({error:"GEMINI_API_KEY belum diset di environment variables."},{status:500});let r=`Kamu adalah content strategist untuk channel YouTube sepakbola Indonesia.

Berikan 7 ide judul video untuk minggu ini. Pertimbangkan konteks berikut jika ada:
${t&&t.trim()?t.trim():"(tidak ada konteks spesifik, gunakan topik sepakbola yang selalu relevan: taktik, transfer, highlight, dan fakta menarik)"}

Distribusi wajib:
- 3 video kategori TAKTIK (analisis formasi/strategi)
- 2 video kategori BERITA (transfer/rumor)
- 1 video kategori HIGHLIGHT (review pertandingan)
- 1 video kategori SHORTS (klip pendek viral)

Untuk SETIAP judul, tulis dalam format PERSIS berikut, dan pisahkan setiap item dengan baris "---":

[TIPE] taktik | berita | highlight | shorts
[JUDUL] (judul SEO-friendly, maksimal 60 karakter)
[HOOK] (1 kalimat pembuka yang menarik)
---

Jangan tambahkan penjelasan lain di luar format ini.`,i=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${a}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:r}]}],generationConfig:{temperature:.9,maxOutputTokens:1536}})});if(!i.ok){let e=await i.text();return console.error("Gemini API error:",e),o.NextResponse.json({error:"Gagal generate dari Gemini. Coba lagi sebentar lagi."},{status:502})}let n=await i.json(),s=n?.candidates?.[0]?.content?.parts?.[0]?.text;if(!s)return o.NextResponse.json({error:"Gemini tidak mengembalikan hasil."},{status:502});let l=s.split("---").map(e=>e.trim()).filter(Boolean).map(e=>{let t=e.match(/\[TIPE\]\s*(\w+)/i),a=e.match(/\[JUDUL\]\s*([\s\S]*?)(?=\n\[|$)/i),r=e.match(/\[HOOK\]\s*([\s\S]*?)(?=\n\[|$)/i);return{contentType:(t?.[1]||"taktik").toLowerCase().trim(),title:a?.[1]?.trim()||"",hook:r?.[1]?.trim()||""}}).filter(e=>e.title);return o.NextResponse.json({result:l})}catch(e){return console.error("generate-titles error:",e),o.NextResponse.json({error:"Terjadi kesalahan di server."},{status:500})}}let u=new i.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/generate-titles/route",pathname:"/api/generate-titles",filename:"route",bundlePath:"app/api/generate-titles/route"},resolvedPagePath:"/workspaces/Football-content-os/app/api/generate-titles/route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:p,staticGenerationAsyncStorage:d,serverHooks:k}=u,m="/api/generate-titles/route";function g(){return(0,s.patchFetch)({serverHooks:k,staticGenerationAsyncStorage:d})}}};var t=require("../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),r=t.X(0,[948,972],()=>a(2801));module.exports=r})();