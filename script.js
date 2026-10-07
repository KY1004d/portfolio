"use strict";
const pageEntry = document.documentElement;
const introHeading = document.querySelector('.sidebar-top h2');
const reducePageMotion = matchMedia('(prefers-reduced-motion: reduce)');
let entryFallbackTimer;
function revealPage() {
	clearTimeout(entryFallbackTimer);
	document.removeEventListener('visibilitychange', scheduleEntryFallback);
	pageEntry.classList.remove('page-entering');
}
function scheduleEntryFallback() {
	clearTimeout(entryFallbackTimer);
	if (document.visibilityState === 'visible') {
		entryFallbackTimer = window.setTimeout(() => {
			if (document.visibilityState === 'visible') revealPage();
		}, 1600);
	}
}
if (reducePageMotion.matches) {
	revealPage();
} else {
	introHeading.addEventListener('animationend', (event) => {
		if (event.target.textContent === 'Interfaces') revealPage();
	});
	document.addEventListener('visibilitychange', scheduleEntryFallback);
	scheduleEntryFallback();
}
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
function position(animate = false) { track.classList.toggle('is-animating', animate); track.style.transform = `translateX(${-index * step()}px)`; }
function finish() { clearTimeout(timer); index = count + ((index-count)%count+count)%count; position(); moving = false; document.querySelector('#carousel-status').textContent = `모바일 프로젝트 ${index-count+1} / ${count}`; }
function move(direction) { if(moving) return; moving=true; index += direction; position(!reduced.matches); if(reduced.matches) finish(); else timer = setTimeout(finish,480); }
track.addEventListener('transitionend',event=>{if(event.propertyName==='transform' && moving) finish();});
document.querySelectorAll('[data-direction]').forEach(button=>button.addEventListener('click',()=>move(button.dataset.direction === 'next' ? 1 : -1)));
document.querySelector('.mobile-projects').addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}});
new ResizeObserver(()=>{if(moving)finish();else position();}).observe(viewport);
position();
let isDragging = false, startX = 0, currentTranslate = 0, dragDelta = 0;
track.addEventListener('pointerdown', (e) => { if (e.button !== 0 && e.pointerType === 'mouse') return; if (!e.target.closest('.mobile-card')) return; isDragging = true; startX = e.clientX; currentTranslate = -index * step(); track.classList.remove('is-animating'); track.classList.add('is-dragging'); track.setPointerCapture(e.pointerId); });
track.addEventListener('pointermove', (e) => { if (!isDragging) return; dragDelta = e.clientX - startX; track.style.transform = `translateX(${currentTranslate + dragDelta}px)`; });
const handlePointerUp = (e) => { if (!isDragging) return; isDragging = false; track.classList.remove('is-dragging'); const s = step(); const movedTarget = Math.round((currentTranslate + dragDelta) / -s); const diff = movedTarget - index; if (diff !== 0) { index = movedTarget; position(true); timer = setTimeout(finish, 480); moving = true; } else { position(true); } dragDelta = 0; try { track.releasePointerCapture(e.pointerId); } catch(err) {} };
track.addEventListener('pointerup', handlePointerUp);
track.addEventListener('pointercancel', handlePointerUp);
// 스크롤 방향 / 현재 섹션에 따른 네비게이션 상태.
const nav = document.querySelector('.navigation'); const links = [...nav.querySelectorAll('a')]; const sections = links.map(link=>document.querySelector(link.getAttribute('href'))); let previousY = window.scrollY, scheduled=false; function updateNav(){ const y=window.scrollY; const diff=y-previousY; if(y<=8){ nav.classList.remove('is-scrolled','is-up','is-down'); }else if(Math.abs(diff)>2){ if(diff>0){ nav.classList.add('is-scrolled','is-down'); nav.classList.remove('is-up'); }else{ nav.classList.add('is-scrolled','is-up'); nav.classList.remove('is-down'); } } previousY=y; let active=null; sections.forEach(section=>{if(section && section.getBoundingClientRect().top<=window.innerHeight*.38 && (!active || section.offsetTop>active.offsetTop))active=section;}); links.forEach(link=>{if(active && link.hash==='#'+active.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}); scheduled=false; } window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateNav);}},{passive:true}); updateNav(); document.querySelector('#year').textContent=new Date().getFullYear();
// 네비게이션 섹션 이동 시 부드러운 스크롤을 처리합니다.
links.forEach(link => link.addEventListener('click', (e) => { const targetId = link.getAttribute('href'); if (!targetId.startsWith('#') || targetId === '#') return; const targetSection = document.querySelector(targetId); if (targetSection) { e.preventDefault(); targetSection.scrollIntoView({ behavior: 'smooth' }); } }));
// 프로젝트 카드 호버 시 툴팁 고정 추적 및 오버레이 처리.
document.querySelectorAll('.project-card').forEach(card => { const tooltip = card.querySelector('.tooltip'); if (!tooltip) return; const text = tooltip.textContent.trim(); tooltip.textContent = ''; [...text].forEach((char, i) => { const span = document.createElement('span'); span.className = 'tooltip-char'; span.textContent = char === ' ' ? '\u00A0' : char; span.style.transitionDelay = `${i * 35}ms`; tooltip.appendChild(span); }); let frameId = null; card.addEventListener('mousemove', (e) => { const rect = card.getBoundingClientRect(); const x = e.clientX - rect.left + 10; const y = e.clientY - rect.top + 16; if (frameId) cancelAnimationFrame(frameId); frameId = requestAnimationFrame(() => { tooltip.style.transform = `translate3d(${x}px, ${y}px, 0)`; }); }); });
const projectModal = document.querySelector('#project-modal');
const projectDialog = projectModal.querySelector('.project-dialog');
const modalTitle = projectModal.querySelector('#modal-project-title');
const modalOverviewCopy = projectModal.querySelector('#modal-overview-copy');
const modalContent = projectModal.querySelector('.modal-content');
const modalPlaceholder = projectModal.querySelector('.modal-placeholder');
const modalCloseButton = projectModal.querySelector('.modal-close');
const modalSiteLink = projectModal.querySelector('.modal-site-link');
const modalUpButton = projectModal.querySelector('.modal-up');
const modalLinkTypes = ['site', null, 'site', 'figma', 'figma', null, null];
const modalProjectDetails = [
	{ description: '지역 주민이 필요한 자료와 도서관 소식을 쉽고 빠르게 찾을 수 있도록 정보 구조와 탐색 경험을 개선했습니다.', image: 'photo-1498050108023-c5249f4df085', alt: '웹사이트를 작업하는 노트북 화면' },
	{ description: '제품의 소재와 사용 장면이 잘 전달되도록 상세페이지의 콘텐츠 흐름과 시각적 위계를 구성했습니다.', image: 'photo-1547658719-da2b51169166', alt: '웹 페이지 디자인이 보이는 모니터' },
	{ description: '브랜드의 제품과 혜택을 직관적으로 탐색하고 구매까지 이어갈 수 있도록 자사몰 화면을 재구성했습니다.', image: 'photo-1460925895917-afdab827c52f', alt: '데이터와 서비스 화면이 표시된 디지털 대시보드' },
	{ description: '여행 일정과 숙소 정보를 비교하고 예약하는 주요 흐름을 중심으로 모바일 사용성을 개선했습니다.', image: 'photo-1507238691740-187a5b1d37b8', alt: '모바일 서비스 디자인을 살펴보는 디자이너' },
	{ description: '생성형 AI 서비스의 성격을 시각 언어로 정리하고 다양한 접점에서 일관되게 사용할 수 있는 브랜드 아이덴티티를 설계했습니다.', image: 'photo-1558655146-d09347e92766', alt: '다채로운 그래픽 디자인 작업물' },
	{ description: '텍스트 중심 콘텐츠를 짧은 호흡으로 읽을 수 있도록 핵심 문구와 그래픽 요소를 조합했습니다.', image: 'photo-1519389950473-47ba0277781c', alt: '화면을 함께 살펴보는 팀원들' },
	{ description: '브랜드의 시즌 프로모션과 상품 정보를 빠르게 전달하도록 소셜 미디어용 배너 시리즈를 구성했습니다.', image: 'photo-1497366754035-f200968a6e72', alt: '브랜드 캠페인을 준비하는 업무 공간' }
].map(detail => ({ ...detail, imageUrl: `https://images.unsplash.com/${detail.image}?auto=format&fit=crop&w=1200&h=2700&q=80` }));
let activeProjectCard = null;
let modalCloseTimer;
let returnScrollPosition = { x: 0, y: 0 };
function openProjectModal(card, index) {
	clearTimeout(modalCloseTimer);
	activeProjectCard = card;
	returnScrollPosition = { x: window.scrollX, y: window.scrollY };
	modalTitle.textContent = card.querySelector('.project-title').textContent.trim();
	const detail = modalProjectDetails[index];
	modalOverviewCopy.textContent = detail.description;
	const contentImage = document.createElement('img');
	contentImage.src = detail.imageUrl;
	contentImage.alt = detail.alt;
	modalPlaceholder.replaceChildren(contentImage);
	const linkType = modalLinkTypes[index];
	modalSiteLink.hidden = !linkType;
	modalSiteLink.textContent = linkType === 'figma' ? '피그마 이동' : '사이트 이동';
	modalSiteLink.href = '#';
	modalUpButton.hidden = index >= 5;
	modalContent.scrollTop = 0;
	projectModal.hidden = false;
	projectModal.setAttribute('aria-hidden', 'false');
	requestAnimationFrame(() => {
		projectModal.classList.add('is-open');
		window.setTimeout(() => {
			if (!projectModal.contains(document.activeElement)) modalCloseButton.focus();
		}, 50);
	});
}
function closeProjectModal() {
	if (projectModal.hidden || !projectModal.classList.contains('is-open')) return;
	projectModal.classList.remove('is-open');
	clearTimeout(modalCloseTimer);
	modalCloseTimer = window.setTimeout(() => {
		projectModal.hidden = true;
		projectModal.setAttribute('aria-hidden', 'true');
		activeProjectCard?.focus({ preventScroll: true });
		window.scrollTo(returnScrollPosition.x, returnScrollPosition.y);
		activeProjectCard = null;
	}, reducePageMotion.matches ? 0 : 460);
}
document.querySelectorAll('.project-card').forEach((card, index) => card.addEventListener('click', (event) => {
	event.preventDefault();
	openProjectModal(card, index);
}));
modalCloseButton.addEventListener('click', closeProjectModal);
projectModal.addEventListener('click', (event) => {
	if (event.target === projectModal) closeProjectModal();
});
projectModal.addEventListener('wheel', (event) => {
	if (!event.target.closest('.modal-content')) event.preventDefault();
}, { passive: false });
document.addEventListener('keydown', (event) => {
	if (projectModal.hidden) return;
	if (event.key === 'Escape') {
		event.preventDefault();
		closeProjectModal();
		return;
	}
	if (event.key !== 'Tab') return;
	const focusable = [...projectModal.querySelectorAll('button:not([hidden]), a[href]:not([hidden]), .modal-content[tabindex]')];
	const first = focusable[0];
	const last = focusable[focusable.length - 1];
	if (!projectModal.contains(document.activeElement)) {
		event.preventDefault();
		first.focus();
	} else if (event.shiftKey && document.activeElement === first) {
		event.preventDefault();
		last.focus();
	} else if (!event.shiftKey && document.activeElement === last) {
		event.preventDefault();
		first.focus();
	}
});
modalSiteLink.addEventListener('click', (event) => {
	if (modalSiteLink.getAttribute('href') === '#') event.preventDefault();
});
modalUpButton.addEventListener('click', () => {
	modalContent.scrollTo({ top: 0, behavior: reducePageMotion.matches ? 'auto' : 'smooth' });
});
// 미연결 링크가 페이지 상단으로 이동하지 않게 안내합니다. 실제 href 연결 시 data-unconfigured를 삭제하세요.
let noticeTimer;
document.querySelectorAll('[data-unconfigured]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();const notice=document.querySelector('.notice');notice.textContent=link.dataset.unconfigured;notice.hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>notice.hidden=true,3500);}));