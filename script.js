let chapters = [];
let index = {}; // Alphabetical index
let current = {chapter:0, subchapter:null, vachan:0};

async function loadChapters(){
  const files = ['01_lakshan.json','02_aachar.json','03_vichar.json','04_aachar_malika.json','05_vichar_malika.json'];
  for(const f of files){
    const res = await fetch(`chapters/${f}`);
    const data = await res.json();
    chapters.push(data);
    indexVachan(data);
  }
  renderChapters();
  renderAlphabetIndex();
}

function indexVachan(ch){
  if(ch.subchapters){
    ch.subchapters.forEach(sub=>{
      sub.vachan_list.forEach((v,i)=>{
        let c = v.title.charAt(0);
        if(!index[c]) index[c]=[];
        index[c].push({chapter: ch.chapter_title, subchapter: sub.subchapter_title, vachan_index:i, v:v});
      });
    });
  } else {
    ch.vachan_list.forEach((v,i)=>{
      let c = v.title.charAt(0);
      if(!index[c]) index[c]=[];
      index[c].push({chapter: ch.chapter_title, subchapter:null, vachan_index:i, v:v});
    });
  }
}

function renderChapters(){
  const list = document.getElementById('chapter-list'); list.innerHTML='';
  chapters.forEach((ch,i)=>{
    const div = document.createElement('div'); div.textContent = ch.chapter_title;
    div.onclick = ()=>renderVachanList(i,null);
    list.appendChild(div);
    if(ch.subchapters){
      ch.subchapters.forEach((sub,j)=>{
        const sdiv = document.createElement('div'); sdiv.textContent = '  '+sub.subchapter_title;
        sdiv.onclick = ()=>renderVachanList(i,j);
        sdiv.style.marginLeft='15px';
        list.appendChild(sdiv);
      });
    }
  });
}

function renderVachanList(chIdx, subIdx){
  const container = document.getElementById('vachan-list'); container.innerHTML='';
  let vlist = subIdx!==null? chapters[chIdx].subchapters[subIdx].vachan_list : chapters[chIdx].vachan_list;
  vlist.forEach((v,i)=>{
    const box = document.createElement('div'); box.className='vachan-box';
    box.innerHTML = `<div class="vachan">${v.title}</div>
                     <div class="lapika">${v.lapika}</div>
                     <div class="tika">${v.tika}</div>`;
    box.onclick = ()=>openFullScreenVachan(chIdx,subIdx,i);
    container.appendChild(box);
  });
}

function openFullScreenVachan(chIdx, subIdx, vIdx){
  current={chapter:chIdx, subchapter:subIdx, vachan:vIdx};
  const full = document.getElementById('fullscreen-vachan'); full.classList.remove('hidden');
  renderFullscreenContent();
}

function renderFullscreenContent(){
  const full = document.getElementById('fullscreen-vachan');
  const c = current.chapter, s=current.subchapter, v=current.vachan;
  const vobj = s!==null? chapters[c].subchapters[s].vachan_list[v] : chapters[c].vachan_list[v];
  document.getElementById('fullscreen-content').innerHTML =
    `<div class="vachan">${vobj.title}</div>
     <div class="lapika">${vobj.lapika}</div>
     <div class="tika">${vobj.tika}</div>`;
}

document.getElementById('close-fullscreen').onclick = ()=>{document.getElementById('fullscreen-vachan').classList.add('hidden')};
document.getElementById('prev-vachan').onclick = ()=>{navigateVachan(-1)};
document.getElementById('next-vachan').onclick = ()=>{navigateVachan(1)};

function navigateVachan(dir){
  let c=current.chapter, s=current.subchapter, v=current.vachan;
  let list = s!==null? chapters[c].subchapters[s].vachan_list : chapters[c].vachan_list;
  v+=dir;
  if(v<0) return; if(v>=list.length) return;
  current.vachan=v;
  renderFullscreenContent();
}

// Alphabetical Index
function renderAlphabetIndex(){
  const panel = document.getElementById('alphabet-panel'); panel.innerHTML='';
  Object.keys(index).sort().forEach(char=>{
    const btn = document.createElement('button'); btn.textContent=char;
    btn.onclick=()=>renderIndexVachanList(char);
    panel.appendChild(btn);
  });
}

function renderIndexVachanList(char){
  const container = document.getElementById('vachan-list'); container.innerHTML='';
  index[char].forEach(obj=>{
    const box = document.createElement('div'); box.className='vachan-box';
    box.innerHTML = `<div class="vachan">${obj.v.title}</div>
                     <div class="lapika">${obj.v.lapika}</div>
                     <div class="tika">${obj.v.tika}</div>`;
    box.onclick = ()=>openFullScreenVachanByObject(obj);
    container.appendChild(box);
  });
}

function openFullScreenVachanByObject(obj){
  let chIdx=chapters.findIndex(ch=>ch.chapter_title===obj.chapter);
  let subIdx=null;
  if(obj.subchapter){
    subIdx=chapters[chIdx].subchapters.findIndex(s=>s.subchapter_title===obj.subchapter);
  }
  openFullScreenVachan(chIdx, subIdx, obj.vachan_index);
}

loadChapters();
