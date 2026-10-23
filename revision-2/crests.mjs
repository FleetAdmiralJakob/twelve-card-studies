// Small, separate emblems keep the illustrated footer clear of editable fields.
const symbols={
 valor:'<path d="m13 14 7-4 7 4-2 5 3 7-8 10-8-10 3-7Z"/><path d="m14 18 4 2m8-2-4 2m-6 8 4 3 4-3m-4-6v6M10 13l4-4m12 0 4 4"/>',
 frost:'<path d="m7 29 8-17 6 11 4-7 9 13H7Zm4-7 4 2 3-3m3 2 4 3 3-3M12 33l8-5 8 5"/>',
 blaze:'<path d="M20 8c3 10 12 13 10 20-2 13-21 13-21 1 0-5 5-9 4-14 5 4 4 9 6 10 5-5 3-10 1-17Z"/><path d="M21 25c6 6 4 10-1 10-6 0-5-6-2-9l2 4Z"/>',
 volt:'<path fill="COLOR" d="m23 9-12 17h8l-2 13 14-20h-9Z"/><path d="m9 15-3 10 6 9m20-19 3 10-6 9"/>',
 rivera:'<path d="M20 35c4-7 4-13 0-18m0 0c-8-9-13-2-13 3 4-4 8-5 13-3Zm0 0c7-10 13-4 14 0-5-3-9-3-14 0Zm0 0c-4-1-9 2-8 7 2-3 5-5 8-7Zm0 0c7-4 10 2 9 7-2-4-5-6-9-7Zm0 0c0-9-5-11-7-10M15 36h13"/>',
 nexus:'<path d="m10 10 20 24m-1-24L10 34M7 29l8 7m11 0 8-7M8 9l7 3-3 5-4-8Zm24 0-7 3 3 5 4-8Z"/>',
 silvah:'<path d="M20 36V16m0 7-8-6m8 10 9-8M13 35h14"/><path d="M20 10c-5-6-9-1-8 3-8-1-9 9-2 10-3 7 6 8 10 3 4 5 13 4 10-3 7-1 6-11-2-10 1-4-3-9-8-3Z"/>',
 aurum:'<path d="m7 16 13-7 13 7H7Zm2 3h22M9 34h22M7 37h26M12 20v12m6-12v12m5-12v12m5-12v12"/>',
 drift:'<path d="m9 14 5 4 5-7-2 13 9-11-2 13 8-4-5 11-7-6-8 7 3-11-8 2Zm2 22 20-8M9 10l3 2m18-2-3 4"/>',
 majestic:'<path d="m20 9 4 10 11 1-8 7 2 11-9-6-9 6 2-11-8-7 11-1Z"/><path d="m20 17 3 7-3 5-3-5Z"/>',
 legacy:'<path d="M11 23C5 9 31 5 32 20l-11-3-7 4v14h-5V23Zm5-4c10-3 13 2 13 5l-6 2v10h-5V24l8-1M13 11l-3-4m6 3-1-5m5 4V4m5 6 2-5"/>',
 prism:'<path d="m8 16 6-6h12l7 6-13 21L8 16Zm0 0h25M14 10l6 27 6-27M8 16l12-6 13 6"/>',
};
export function crest(theme,color){return `<span class="card-crest" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="40" height="44" viewBox="0 0 40 44" fill="none" stroke="${color}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path fill="${theme==='aurum'?'#f4efdf':'#080b13'}" d="M3 7Q13 7 20 2Q27 7 37 7L34 29Q29 37 20 42Q11 37 6 29Z"/><path opacity=".5" d="M6 10Q14 10 20 5Q26 10 34 10L31 28Q27 34 20 38Q13 34 9 28Z"/>${symbols[theme].replaceAll('COLOR',color)}</svg></span>`}
