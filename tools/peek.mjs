import * as cheerio from 'cheerio'; import fs from 'fs';
const $=cheerio.load(fs.readFileSync(process.argv[2],'utf8'));
console.log(eval(process.argv[3]));
