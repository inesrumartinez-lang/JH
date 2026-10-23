import * as cheerio from 'cheerio'; import fs from 'fs';
const $=cheerio.load(fs.readFileSync(process.argv[2],'utf8'));
let n=0;
$('section.elementor-inner-section').each((i,s)=>{ if(n++>Number(process.argv[3]||8)) return;
 const S=$(s);
 console.log('---',i,'anchor=',S.find('.elementor-menu-anchor').attr('id')||'',
  '\n heads=',S.find('.elementor-heading-title').map((j,e)=>$(e).text().trim()).get(),
  '\n texts=',S.find('.elementor-text-editor').map((j,e)=>$(e).text().trim().slice(0,90)).get(),
  '\n links=',S.find('a').map((j,e)=>$(e).attr('href')).get(),
  '\n imgs=',S.find('img').map((j,e)=>$(e).attr('src')).get());
});
