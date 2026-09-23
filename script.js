"use strict";
// 양쪽에 원본 5개씩 복제: 매 이동 종료 후 동일한 원본 위치로 순간 복귀합니다.
document.querySelector('.logo-link').addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
const track = document.querySelector('.carousel-track');
const viewport = document.querySelector('.carousel-viewport');
const originals = [...track.children];
const count = originals.length;
const cloneSlide = node => { const clone = node.cloneNode(true); clone.setAttribute('aria-hidden','true'); clone.removeAttribute('role'); clone.querySelectorAll('a,button,input,[tabindex]').forEach(el => el.tabIndex = -1); return clone; };
track.prepend(...originals.map(cloneSlide));
track.append(...originals.map(cloneSlide));
let index = count, moving = false, timer;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const step = () => originals[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 0);
function position(animate = false) { track.style.transition = animate ? 'transform 420ms cubic-bezier(.22,.68,0,1)' : 'none'; track.style.transform = `translateX(${-index * step()}px)`; }
function finish() { clearTimeout(timer); index = count + ((index-count)%count+count)%count; position(); moving = false; document.querySelector('#carousel-status').textContent = `모바일 프로젝트 ${index-count+1} / ${count}`; }
function move(direction) { if(moving) return; moving=true; index += direction; position(!reduced.matches); if(reduced.matches) finish(); else timer = setTimeout(finish,480); }
track.addEventListener('transitionend',event=>{if(event.propertyName==='transform' && moving) finish();});
document.querySelectorAll('[data-direction]').forEach(button=>button.addEventListener('click',()=>move(button.dataset.direction === 'next' ? 1 : -1)));
document.querySelector('.mobile-projects').addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}});
new ResizeObserver(()=>{if(moving)finish();else position();}).observe(viewport);
position();
let isDragging = false, startX = 0, currentTranslate = 0, dragDelta = 0;
track.addEventListener('pointerdown', (e) => { if (e.button !== 0 && e.pointerType === 'mouse') return; if (!e.target.closest('.mobile-card')) return; isDragging = true; startX = e.clientX; currentTranslate = -index * step(); track.style.transition = 'none'; track.setPointerCapture(e.pointerId); });
track.addEventListener('pointermove', (e) => { if (!isDragging) return; dragDelta = e.clientX - startX; track.style.transform = `translateX(${currentTranslate + dragDelta}px)`; });
const handlePointerUp = (e) => { if (!isDragging) return; isDragging = false; const s = step(); const movedTarget = Math.round((currentTranslate + dragDelta) / -s); const diff = movedTarget - index; if (diff !== 0) { index = movedTarget; position(true); timer = setTimeout(finish, 480); moving = true; } else { position(true); } dragDelta = 0; try { track.releasePointerCapture(e.pointerId); } catch(err) {} };
track.addEventListener('pointerup', handlePointerUp);
track.addEventListener('pointercancel', handlePointerUp);
// 스크롤 방향 / 현재 섹션에 따른 네비게이션 상태.
const nav = document.querySelector('.navigation'); const links = [...nav.querySelectorAll('a')]; const sections = links.map(link=>document.querySelector(link.getAttribute('href'))); let previousY = window.scrollY, scheduled=false; function updateNav(){ const y=window.scrollY; const diff=y-previousY; if(y<=8){ nav.classList.remove('is-scrolled','is-up','is-down'); }else if(Math.abs(diff)>2){ if(diff>0){ nav.classList.add('is-scrolled','is-down'); nav.classList.remove('is-up'); }else{ nav.classList.add('is-scrolled','is-up'); nav.classList.remove('is-down'); } } previousY=y; let active=null; sections.forEach(section=>{if(section && section.getBoundingClientRect().top<=window.innerHeight*.38 && (!active || section.offsetTop>active.offsetTop))active=section;}); links.forEach(link=>{if(active && link.hash==='#'+active.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}); scheduled=false; } window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateNav);}},{passive:true}); updateNav(); document.querySelector('#year').textContent=new Date().getFullYear();
// 네비게이션 섹션 이동 시 부드러운 스크롤을 처리합니다.
links.forEach(link => link.addEventListener('click', (e) => { const targetId = link.getAttribute('href'); if (!targetId.startsWith('#') || targetId === '#') return; const targetSection = document.querySelector(targetId); if (targetSection) { e.preventDefault(); targetSection.scrollIntoView({ behavior: 'smooth' }); } }));
// 프로젝트 카드 호버 시 툴팁 고정 추적 및 오버레이 처리.
document.querySelectorAll('.project-card').forEach(card => { const tooltip = card.querySelector('.tooltip'); if (!tooltip) return; const text = tooltip.textContent.trim(); tooltip.textContent = ''; [...text].forEach((char, i) => { const span = document.createElement('span'); span.className = 'tooltip-char'; span.textContent = char === ' ' ? '\u00A0' : char; span.style.transitionDelay = `${i * 35}ms`; tooltip.appendChild(span); }); let frameId = null; card.addEventListener('mousemove', (e) => { const rect = card.getBoundingClientRect(); const x = e.clientX - rect.left + 10; const y = e.clientY - rect.top + 16; if (frameId) cancelAnimationFrame(frameId); frameId = requestAnimationFrame(() => { tooltip.style.transform = `translate3d(${x}px, ${y}px, 0)`; }); }); });
// 미연결 링크가 페이지 상단으로 이동하지 않게 안내합니다. 실제 href 연결 시 data-unconfigured를 삭제하세요.
let noticeTimer;
document.querySelectorAll('[data-unconfigured]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();const notice=document.querySelector('.notice');notice.textContent=link.dataset.unconfigured;notice.hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>notice.hidden=true,3500);}));