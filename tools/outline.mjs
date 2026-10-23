import * as cheerio from 'cheerio'; import fs from 'fs';
const $=cheerio.load(fs.readFileSync(process.argv[2],'utf8'));
$('#gtx-trans, .gtx-trans-icon, [id^=gt-], .skiptranslate, script, style').remove();
$('section.elementor-top-section').each((i,s)=>{
  const S=$(s); if(S.parents('section.elementor-top-section').length) return;
  if(S.closest('header,footer,.elementor-location-header,.elementor-location-footer').length) return;
  const bg=(S.attr('style')||'')+(S.attr('data-settings')||'');
  console.log(`\n#SECTION ${i} id=${S.attr('data-id')} ${bg.slice(0,80)}`);
  S.find('.elementor-heading-title, .elementor-text-editor, .elementor-icon-box-title, .elementor-icon-box-description, .elementor-button-text, img, .elementor-image-box-title, .elementor-image-box-description, .elementor-blockquote, .elementor-testimonial-content, .elementor-counter-number-wrapper, .elementor-tab-title, .elementor-tab-content').each((j,e)=>{
    if(e.name==='img') return console.log('[IMG '+$(e).attr('src')+']');
    const c=($(e).attr('class')||'').split(' ')[0].replace('elementor-','');
    const txt=c==='text-editor'||c==='tab-content'? $(e).html().replace(/\s+/g,' ').trim() : $(e).text().replace(/\s+/g,' ').trim();
    console.log(`<${c}> ${txt}`);
  });
});
