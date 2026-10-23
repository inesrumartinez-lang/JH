import * as cheerio from 'cheerio'; import fs from 'fs';
const $=cheerio.load(fs.readFileSync(process.argv[2],'utf8'));
const walk=(el,d)=>{ $(el).children().each((i,c)=>{ const C=$(c);
  const isSec=C.is('section'), isW=C.hasClass('elementor-widget');
  if(isSec||isW||C.hasClass('elementor-column')) {
    const label = isW ? (C.attr('data-element_type')+' '+C.text().replace(/\s+/g,' ').trim().slice(0,50)) : (isSec?'SECTION':'col');
    console.log('  '.repeat(d)+label+' #'+C.attr('data-id')+(C.find('.elementor-menu-anchor').length&&isSec?' [anchor]':''));
    if(!isW) walk(c,d+1);
  } else walk(c,d);
 });};
walk($('body > .elementor').get(0) || $('body').get(0),0);
