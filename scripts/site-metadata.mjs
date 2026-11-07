import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {readManifest} from './lab-registry.mjs';
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');

// Only the web distribution receives canonical URLs; standalone exports remain portable.
export async function generateSiteMetadata(directory){
 const manifest=await readManifest(),chapters=manifest.chapters,simulations=manifest.labs.map(lab=>lab.metadata);
 const home=await readFile(new URL('index.html',directory),'utf8');
 const origin=home.match(/<link rel="canonical" href="([^"]+)"/)[1];
 const urls=[origin];
 for(const lab of simulations){
  const file=new URL(lab.href,directory),url=new URL(lab.href,origin).href;
  let html=await readFile(file,'utf8');
  html=html.replace(/<meta\b(?=[^>]*(?:name="description"|property="og:(?:title|description|url|image|type)"))[^>]*>/g,'').replace(/<link\b(?=[^>]*rel="canonical")[^>]*>/g,'');
  const metadata=`<meta name="description" content="${escape(lab.description)}"><link rel="canonical" href="${escape(url)}"><meta property="og:type" content="website"><meta property="og:title" content="${escape(lab.title)} · Praxis"><meta property="og:description" content="${escape(lab.description)}"><meta property="og:url" content="${escape(url)}"><meta property="og:image" content="${escape(new URL(lab.image,origin).href)}">`;
  await writeFile(file,html.replace('</head>',metadata+'</head>'));urls.push(url);
 }
 for(const chapter of chapters){
  const relative=`capitole/${chapter.id}/`,url=new URL(relative,origin).href;
  const labs=simulations.filter(lab=>lab.chapter===chapter.id);
  const description=`Laboratoare interactive de fizică: ${chapter.title}. Explicații și experimente în română și engleză.`;
  const html=`<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(chapter.title)} · Praxis</title><meta name="description" content="${escape(description)}"><link rel="canonical" href="${escape(url)}"><meta property="og:title" content="${escape(chapter.title)} · Praxis"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${escape(url)}"><link rel="stylesheet" href="../../design-system/tokens.css"><link rel="stylesheet" href="../../styles.css"></head><body><main class="chapter-landing" style="max-width:70rem;margin:auto;padding:2rem"><a href="../../?home=1">Bibliotecă / Library</a><h1>${escape(chapter.title)}</h1><p>${escape(description)}</p><a class="button" href="../../?chapter=1#capitol/${chapter.id}">Deschide capitolul interactiv / Open interactive chapter</a>${labs.length?'<ul>'+labs.map(lab=>`<li><h2><a href="../../${escape(lab.href.replace(/^\.\//,''))}">${escape(lab.title)}</a></h2><p>${escape(lab.description)}</p></li>`).join('')+'</ul>':'<p>În pregătire / Coming soon</p>'}</main></body></html>`;
  await mkdir(new URL(relative,directory),{recursive:true});await writeFile(new URL(relative+'index.html',directory),html);urls.push(url);
 }
 await writeFile(new URL('sitemap.xml',directory),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(url=>'<url><loc>'+escape(url)+'</loc></url>').join('')+'</urlset>\n');
 await writeFile(new URL('robots.txt',directory),'User-agent: *\nAllow: /\nSitemap: '+new URL('sitemap.xml',origin).href+'\n');
}
