"use strict";(()=>{var a={};a.id=790,a.ids=[790],a.modules={399:a=>{a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:a=>{a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},353:(a,e,t)=>{t.r(e),t.d(e,{originalPathname:()=>m,patchFetch:()=>g,requestAsyncStorage:()=>l,routeModule:()=>p,serverHooks:()=>d,staticGenerationAsyncStorage:()=>k});var n={};t.r(n),t.d(n,{POST:()=>u});var r=t(9303),i=t(8716),s=t(670),o=t(7070);async function u(a){try{let{topic:e,contentType:t}=await a.json();if(!e||"string"!=typeof e||!e.trim())return o.NextResponse.json({error:"Topik wajib diisi."},{status:400});let n=process.env.GEMINI_API_KEY;if(!n)return o.NextResponse.json({error:"GEMINI_API_KEY belum diset di environment variables."},{status:500});let r=function(a,e){let t={taktik:"Fokus pada analisis formasi, filosofi pelatih, atau strategi permainan.",berita:"Fokus pada berita transfer, rumor, atau update terkini pemain/klub.",highlight:"Fokus pada review pertandingan yang sudah selesai, momen kunci, dan evaluasi performa.",shorts:"Buat versi SANGAT PENDEK (150-200 kata total) untuk video di bawah 60 detik, satu poin kejut/menarik saja."},n=e&&t[e]?t[e]:"";return`Kamu adalah komentator sepakbola Indonesia yang energik dan berpengetahuan, menulis untuk channel YouTube niche sepakbola.

Buat script video YouTube tentang topik berikut:
TOPIK: ${a}
${n}

Tulis dengan format PERSIS seperti ini (gunakan header dalam kurung siku, jangan diubah):

[JUDUL]
(judul SEO-friendly, maksimal 60 karakter)

[HOOK]
(1-2 kalimat pembuka yang bikin penonton penasaran dalam 5 detik pertama)

[SCRIPT]
(naskah lengkap 700-900 kata untuk video biasa, atau 150-200 kata jika Shorts. Struktur: intro singkat, 3-4 poin konten utama, kesimpulan + ajakan subscribe/comment. Gaya bahasa santai tapi informatif, pakai istilah sepakbola yang tepat, sesekali bahasa gaul yang natural, JANGAN kaku seperti robot.)

[DESKRIPSI]
(deskripsi YouTube 100-150 kata dengan hook di awal, poin-poin konten, dan call-to-action)

[TAGS]
(10-15 tag/hashtag relevan, pisahkan dengan koma)

[THUMBNAIL_TEXT]
(maksimal 5 kata untuk teks di thumbnail, huruf kapital, harus punya daya tarik visual)

Jangan tambahkan komentar, catatan, atau penjelasan di luar format di atas.`}(e,t),i=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${n}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:r}]}],generationConfig:{temperature:.85,maxOutputTokens:2048}})});if(!i.ok){let a=await i.text();return console.error("Gemini API error:",a),o.NextResponse.json({error:"Gagal generate dari Gemini. Coba lagi sebentar lagi."},{status:502})}let s=await i.json(),u=s?.candidates?.[0]?.content?.parts?.[0]?.text;if(!u)return o.NextResponse.json({error:"Gemini tidak mengembalikan hasil. Coba topik lain."},{status:502});let p=function(a){let e=e=>{let t=RegExp(`\\[${e}\\]\\s*([\\s\\S]*?)(?=\\n\\[|$)`,"i"),n=a.match(t);return n?n[1].trim():""},t=e("TAGS").split(",").map(a=>a.trim().replace(/^#/,"")).filter(Boolean);return{title:e("JUDUL"),hook:e("HOOK"),script:e("SCRIPT"),description:e("DESKRIPSI"),tags:t,thumbnailText:e("THUMBNAIL_TEXT")}}(u);return o.NextResponse.json({result:p})}catch(a){return console.error("generate-script error:",a),o.NextResponse.json({error:"Terjadi kesalahan di server."},{status:500})}}let p=new r.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/generate-script/route",pathname:"/api/generate-script",filename:"route",bundlePath:"app/api/generate-script/route"},resolvedPagePath:"/workspaces/Football-content-os/app/api/generate-script/route.ts",nextConfigOutput:"",userland:n}),{requestAsyncStorage:l,staticGenerationAsyncStorage:k,serverHooks:d}=p,m="/api/generate-script/route";function g(){return(0,s.patchFetch)({serverHooks:d,staticGenerationAsyncStorage:k})}}};var e=require("../../../webpack-runtime.js");e.C(a);var t=a=>e(e.s=a),n=e.X(0,[948,972],()=>t(353));module.exports=n})();