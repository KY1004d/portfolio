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
let pointerDrag = null;
let suppressCardClick = false;
let clickSuppressionTimer;
viewport.addEventListener('pointerdown', event => {
	if (event.button !== 0 || !event.target.closest('.mobile-card img')) return;
	if (moving) finish();
	pointerDrag = { id: event.pointerId, startX: event.clientX, startIndex: index, currentIndex: index, dragged: false };
});
viewport.addEventListener('pointermove', event => {
	if (!pointerDrag || event.pointerId !== pointerDrag.id) return;
	const deltaX = event.clientX - pointerDrag.startX;
	if (!pointerDrag.dragged && Math.abs(deltaX) < 6) return;
	if (!pointerDrag.dragged) {
		pointerDrag.dragged = true;
		track.classList.add('is-dragging');
		track.setPointerCapture(event.pointerId);
	}
	const rawIndex = pointerDrag.startIndex - deltaX / step();
	pointerDrag.currentIndex = count + ((rawIndex - count) % count + count) % count;
	track.style.transform = `translateX(${-pointerDrag.currentIndex * step()}px)`;
});
function endPointerDrag(event) {
	if (!pointerDrag || (event && event.pointerId !== pointerDrag.id)) return;
	const drag = pointerDrag;
	pointerDrag = null;
	if (track.hasPointerCapture(drag.id)) track.releasePointerCapture(drag.id);
	if (!drag.dragged) return;
	track.classList.remove('is-dragging');
	suppressCardClick = true;
	clearTimeout(clickSuppressionTimer);
	clickSuppressionTimer = setTimeout(() => { suppressCardClick = false; }, 0);
	index = Math.round(drag.currentIndex);
	index = count + ((index - count) % count + count) % count;
	moving = true;
	position(!reduced.matches);
	if (reduced.matches) finish();
	else timer = setTimeout(finish, 480);
}
viewport.addEventListener('pointerup', endPointerDrag);
viewport.addEventListener('pointercancel', endPointerDrag);
document.querySelectorAll('[data-direction]').forEach(button=>button.addEventListener('click',()=>move(button.dataset.direction === 'next' ? 1 : -1)));
document.querySelector('.mobile-projects').addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}});
new ResizeObserver(()=>{if(moving)finish();else position();}).observe(viewport);
position();
const mobileImagePreview = document.querySelector('#mobile-image-preview');
const mobilePreviewStage = mobileImagePreview.querySelector('.mobile-image-preview-stage');
const mobilePreviewImage = mobileImagePreview.querySelector('.mobile-image-preview-image');
let mobilePreviewTrigger = null;
let mobilePreviewCloseTimer;
function openMobileImagePreview(image) {
	clearTimeout(mobilePreviewCloseTimer);
	mobilePreviewTrigger = image;
	mobilePreviewImage.src = image.currentSrc || image.src;
	mobilePreviewImage.alt = image.alt;
	mobileImagePreview.hidden = false;
	mobileImagePreview.setAttribute('aria-hidden', 'false');
	requestAnimationFrame(() => {
		mobileImagePreview.classList.add('is-open');
		mobilePreviewStage.focus({ preventScroll: true });
	});
}
function closeMobileImagePreview() {
	if (mobileImagePreview.hidden || !mobileImagePreview.classList.contains('is-open')) return;
	mobileImagePreview.classList.remove('is-open');
	clearTimeout(mobilePreviewCloseTimer);
	mobilePreviewCloseTimer = window.setTimeout(() => {
		mobileImagePreview.hidden = true;
		mobileImagePreview.setAttribute('aria-hidden', 'true');
		mobilePreviewTrigger?.focus({ preventScroll: true });
		mobilePreviewTrigger = null;
	}, reducePageMotion.matches ? 0 : 300);
}
track.addEventListener('click', (event) => {
	if (suppressCardClick) { event.preventDefault(); event.stopPropagation(); suppressCardClick = false; clearTimeout(clickSuppressionTimer); return; }
	const image = event.target.closest('.mobile-card img');
	if (!image) return;
	openMobileImagePreview(image);
});
track.addEventListener('keydown', (event) => {
	if (!event.target.matches('.mobile-card img') || (event.key !== 'Enter' && event.key !== ' ')) return;
	event.preventDefault();
	openMobileImagePreview(event.target);
});
mobileImagePreview.addEventListener('click', (event) => {
	if (event.target !== mobilePreviewImage) closeMobileImagePreview();
});
mobileImagePreview.addEventListener('wheel', (event) => event.preventDefault(), { passive: false });
document.addEventListener('keydown', (event) => {
	if (!mobileImagePreview.hidden && event.key === 'Escape') {
		event.preventDefault();
		closeMobileImagePreview();
	}
});
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
const modalPlanLink = projectModal.querySelector('.modal-plan-link');
const modalSiteLink = projectModal.querySelector('.modal-site-link');
const modalUpButton = projectModal.querySelector('.modal-up');
const modalProjectActions = [
	{ plan: './assets/projects/banwol/banwol_plan.pdf', site: './assets/projects/banwol/web/index.html', up: true },
	{ plan: './assets/projects/amante/amante_plan.pdf', up: true },
	{ plan: './assets/projects/poongnyun/pn_plan.pdf', site: './assets/projects/poongnyun/web/index.html', up: true },
	{ site: 'https://www.figma.com/design/5DU8NSbO4BcT4DW8Bg0ha3/%EC%95%84%EA%B3%A0%EB%8B%A4-%EC%9D%B8%ED%84%B0%EB%A0%89%EC%85%98?node-id=110-656&t=QDTwNJwTKwoCSYFX-1', siteLabel: '피그마 이동', up: true },
	{ site: 'https://whitt1201.cafe24.com/', up: true },
	{ up: true },
	{ up: true },
	{},
	{},
	{}
];
const projectImagePaths = (folder, prefix, count) => Array.from({ length: count }, (_, index) => `./assets/projects/${folder}/${prefix}${String(index + 1).padStart(2, '0')}.webp`);
const modalProjectDetails = [
	{ description: '기존의 복잡한 메뉴 구조와 노후화된 GUI를 정돈하여, 지역 주민들이 필요한 정보에 쉽고 빠르게 접근할 수 있도록 사용성과 접근성을 개선했습니다. <span class="banp">UI/UX 기획 및 디자인을 <b>단독으로 진행</b></span>했으며, <span class="banp"><b>AI를 적극적으로 활용</b>한 퍼블리싱 및 프론트엔드 코딩</span> 결과물은<br>꼼꼼한 검수와 오류 수정 및 보완 과정을 거쳐 완성했습니다.', images: projectImagePaths('banwol', 'ban', 2), background: '#F3F4F5', captionsAfter: ['자료검색 > 추천도서'] },
	{ description: '아망떼만의 여름 차렵이불 제품이 가진 고유의 매력을 직관적으로 전달하는 데 중점을 두었습니다. 또한, 고급스러운 분위기와 무드에 맞춰<br>시각적 일관성을 확보하고, 미적 완성도를 높여 고객의 시선을 사로잡는 상세페이지 디자인을 완성했습니다.<br><span class="banp">사용된 제품 이미지의 대부분은 <b>AI를 적극적으로 활용</b>해 제작되었습니다.</span>', images: projectImagePaths('amante', 'amante', 14) },
	{ description: '단조롭던 비주얼과 제품 소구점이 미흡했던 정보 구조를 개편하여, 구매 전환과 브랜드 각인에 최적화된 콘텐츠 흐름을 구축했습니다. 풍년살림 특유의 친근하면서도 신뢰감 있는 연출을 통해 브랜드 가치가 자연스럽게 전달되도록 구현했습니다. <span class="banp">UI/UX 기획 및 디자인은 <b>단독으로 진행</b></span>했으며, <span class="banp">퍼블리싱/프론트엔드 코딩은 <b>AI를 적극적으로 활용</b>하여</span> 꼼꼼한 검수와 오류 수정 및 보완 과정을 거쳐 완성했습니다.', images: projectImagePaths('poongnyun', 'pn', 3), background: '#F3F4F5', captionsAfter: ['Home > 베스트', 'Home > 풍년살림'] },
	{ description: '사용자 리서치를 바탕으로 기존 앱의 UX 취약점을 보완하고, 예약 탐색 흐름이 매끄럽게 이어지도록 레이아웃을 다듬었습니다. 직관적인 UI 요소로 정보의 명확성을 향상시키는 한편, 브랜드 고유의 톤앤매너를 시각화한 GUI 디자인으로 완성도 높은 사용자 경험을 구현했습니다.', images: projectImagePaths('agoda', 'agoda_', 16) },
	{ description: 'Cafe24 플랫폼의 무료 템플릿을 기반으로 오리지널 커피 브랜드 AUBE의 온라인 쇼핑몰을 제작했습니다. 생성형 AI로 브랜드 컨셉에 맞는<br>비주얼 이미지를 직접 연출·생성하여 메인 배너로 활용했으며, 기존 템플릿 구조를 커스텀화하여 브랜드 감성을 살렸습니다.', images: projectImagePaths('aube', 'aube', 1) },
	{ description: '프리미엄 모션데스크의 기능성과 디자인 가치를 전달하는 상세페이지입니다. <span class="banp"><br>메인 제품과 세부 디테일 컷 이미지들은 모두 <b>AI 툴을 적극적으로 활용</b>해 구성한</span> 후, 보정과 편집을 거쳐 제작되었습니다.<br>제품의 주요 특징과 셀링 포인트를 자연스럽게 다룬 스토리텔링형 레이아웃으로 기획 및 제작했습니다.', images: projectImagePaths('mdesk', 'desk', 6) },
	{ description: 'AI 기술이 급변하는 시대적 트렌드에 맞춰 차세대 AI 생성형 플랫폼 미레브의 미래지향적 브랜드 가치를 구축했습니다.<br>플랫폼이 추구하는 핵심 비전과 지향점을 직관적이고 세련된 심볼로 형상화하여, 브랜드 고유의 정체성이 돋보이도록 디자인했습니다.', images: projectImagePaths('mireve', 'mireve_', 7) },
	{ description: '도파민 중심의 미디어에서 벗어나 독서와 아날로그 취향을 공유하는 MZ세대의 새로운 트렌드 <span class="txtp">텍스트힙</span>을 소개하는 컨텐츠입니다.<br>흥미를 끌 수 있는 메시지 흐름을 잡고, 가독성 높은 레이아웃과 감각적인 비주얼을 더해 주제가 직관적으로 보이도록 작업했습니다.', layout: 'horizontal', background: '#768ED0', images: projectImagePaths('texthip', 'texthip', 8) },
	{ description: '최근 F&B 업계의 핵심 트렌드인 헬시플레저에 착안하여 기획한 메가커피 가상 신제품 프로모션입니다. 제로 칼로리라는 제품 특성에 맞춰 청량하고 신선한 브랜드 이미지를 구축하였으며, <span class="banp"><b>AI 기반의 브레인스토밍과 비주얼 생성</b>을 적극 활용해</span><br>다채로운 배리에이션의 배너 디자인을 완성했습니다.', layout: 'horizontal', background: '#F3CF97', images: projectImagePaths('megacoffee', 'mega', 6) },
	{ description: '시즌 프로모션, 할인 행사, 문화 공연 등 다양한 목적에 맞춰 제작된 오리지널 그래픽 포스터 시리즈입니다. 각 주제와 컨셉에 어울리는 컬러, 타이포그래피, 비주얼 요소를 활용하여 전달하고자 하는 핵심 메시지가 소비자에게 명확하게 전달되도록 레이아웃을 구성했습니다.', layout: 'poster', background: '#F6F6F6', images: ['./assets/projects/poster/poster01.webp', './assets/projects/poster/poster02.png', './assets/projects/poster/poster03.webp', './assets/projects/poster/poster04.jpg', './assets/projects/poster/poster05.png', './assets/projects/poster/poster06.png', './assets/projects/poster/poster07.webp', './assets/projects/poster/poster08.webp', './assets/projects/poster/poster09.webp'] }
].map(detail => detail.image ? ({ ...detail, imageUrl: `https://images.unsplash.com/${detail.image}?auto=format&fit=crop&w=1200&h=2700&q=80` }) : detail);
let activeProjectCard = null;
let modalCloseTimer;
let returnScrollPosition = { x: 0, y: 0 };
function openProjectModal(card, index) {
	clearTimeout(modalCloseTimer);
	activeProjectCard = card;
	returnScrollPosition = { x: window.scrollX, y: window.scrollY };
	modalTitle.textContent = card.querySelector('.project-title').textContent.trim();
	const detail = modalProjectDetails[index];
	modalOverviewCopy.innerHTML = detail.description;
	const isHorizontalGallery = detail.layout === 'horizontal' || detail.layout === 'poster';
	const isPosterGallery = detail.layout === 'poster';
	modalPlaceholder.classList.toggle('is-banwol', index === 0);
	modalPlaceholder.classList.toggle('is-amante', index === 1);
	modalPlaceholder.classList.toggle('is-mdesk', index === 5);
	modalPlaceholder.classList.toggle('is-poongnyun', index === 2);
	modalPlaceholder.classList.toggle('is-poster-gallery', isPosterGallery);
	modalContent.classList.toggle('is-horizontal-gallery', isHorizontalGallery);
	modalPlaceholder.classList.toggle('is-horizontal-gallery', isHorizontalGallery);
	modalPlaceholder.style.backgroundColor = detail.background || '';
	const imagePaths = detail.images || [detail.imageUrl];
	const contentElements = imagePaths.flatMap((imagePath, imageIndex) => {
		const image = document.createElement('img');
		image.src = imagePath;
		image.alt = detail.alt || `${modalTitle.textContent} 상세 이미지 ${imageIndex + 1}`;
		if (isHorizontalGallery) image.className = 'modal-gallery-card';
		const elements = [image];
		const caption = detail.captionsAfter?.[imageIndex];
		if (caption) {
			const captionElement = document.createElement('p');
			captionElement.className = 'modal-image-caption';
			captionElement.textContent = caption;
			elements.push(captionElement);
		}
		return elements;
	});
	if (isPosterGallery) {
		const posterRow = document.createElement('div');
		posterRow.className = 'modal-poster-row';
		posterRow.append(...contentElements);
		modalPlaceholder.replaceChildren(posterRow);
	} else {
		modalPlaceholder.replaceChildren(...contentElements);
	}
	const actions = modalProjectActions[index] || {};
	modalPlanLink.hidden = !actions.plan;
	modalPlanLink.href = actions.plan || '#none';
	modalSiteLink.hidden = !actions.site;
	modalSiteLink.textContent = actions.siteLabel || '사이트 이동';
	modalSiteLink.href = actions.site || '#none';
	modalUpButton.hidden = !actions.up;
	projectModal.hidden = false;
	projectModal.setAttribute('aria-hidden', 'false');
	modalContent.scrollTop = 0;
	modalContent.scrollLeft = 0;
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
modalContent.addEventListener('wheel', (event) => {
	if (!modalContent.classList.contains('is-horizontal-gallery') || event.deltaY === 0) return;
	event.preventDefault();
	modalContent.scrollLeft += event.deltaY;
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
	if (modalSiteLink.getAttribute('href') === '#none') event.preventDefault();
});
modalPlanLink.addEventListener('click', (event) => {
	if (modalPlanLink.getAttribute('href') === '#none') event.preventDefault();
});
modalUpButton.addEventListener('click', () => {
	modalContent.scrollTo({ top: 0, behavior: reducePageMotion.matches ? 'auto' : 'smooth' });
});
// 미연결 링크가 페이지 상단으로 이동하지 않게 안내합니다. 실제 href 연결 시 data-unconfigured를 삭제하세요.
let noticeTimer;
document.querySelectorAll('[data-unconfigured]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();const notice=document.querySelector('.notice');notice.textContent=link.dataset.unconfigured;notice.hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>notice.hidden=true,3500);}));
