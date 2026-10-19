document.addEventListener('DOMContentLoaded', () => {
    const noticeText = document.querySelector('.top-bar__notice-text');
    const rank = document.querySelector('.rank');
    const rankNumber = document.querySelector('.rank__num');
    const rankText = document.querySelector('.rank__text');
    const pageHeader = document.querySelector('header');
    const topBar = document.querySelector('.top-bar');

    const notices = [
        '피오레 통3중 압력솥 안전기준 부적합 상품 회수 안내',
        '풍년살림 신규 회원 가입 시 쿠폰 혜택 안내',
        '공식 온라인몰 주말 한정 무료배송 안내',
        'PN풍년 고객센터 운영시간 안내'
    ];
    const bestRanks = [
        'PN 핸디 전기밥솥 블랑',
        '마레 히트팬 IH',
        '텀블러',
        '꾸노 보닝 토스터+주전자 SET',
        '몽꿈떼 스튜팟',
        '위더스 프레시 밧드',
        'PN 투명 밀폐 쌀통',
        'PN 항균 슈가도마'
    ];

    const rollUp = (element, change) => {
        if (!element) return;

        element.classList.add('is-rolling-out');
        window.setTimeout(() => {
            change();
            element.classList.remove('is-rolling-out');
            element.classList.add('is-rolling-in');
            void element.offsetWidth;
            window.requestAnimationFrame(() => {
                element.classList.remove('is-rolling-in');
                element.classList.add('is-rolling-up');
                window.setTimeout(() => element.classList.remove('is-rolling-up'), 220);
            });
        }, 180);
    };

    let noticeIndex = 0;
    let rankIndex = 0;

    if (noticeText) {
        window.setInterval(() => {
            noticeIndex = (noticeIndex + 1) % notices.length;
            rollUp(noticeText, () => {
                noticeText.textContent = notices[noticeIndex];
            });
        }, 4500);
    }

    if (rank && rankNumber && rankText) {
        window.setInterval(() => {
            rankIndex = (rankIndex + 1) % bestRanks.length;
            rollUp(rank, () => {
                rankNumber.textContent = String(rankIndex + 1);
                rankText.textContent = bestRanks[rankIndex];
            });
        }, 5000);
    }

    if (pageHeader && topBar) {
        let isCompact = false;
        const mainHeader = pageHeader.querySelector('.main-header');
        const defaultMainHeaderHeight = mainHeader?.offsetHeight ?? 0;
        const compactMainHeaderHeight = 7.2 * parseFloat(getComputedStyle(document.documentElement).fontSize);
        const collapseDistance = defaultMainHeaderHeight - compactMainHeaderHeight;

        const updateHeader = () => {
            const enterThreshold = topBar.offsetHeight + 12;
            const exitThreshold = Math.max(0, topBar.offsetHeight - collapseDistance - 8);

            if (!isCompact && window.scrollY > enterThreshold) {
                isCompact = true;
                pageHeader.classList.add('is-scrolled');
            } else if (isCompact && window.scrollY < exitThreshold) {
                isCompact = false;
                pageHeader.classList.remove('is-scrolled');
            }
        };

        window.addEventListener('scroll', updateHeader, { passive: true });
        window.addEventListener('resize', updateHeader);
        updateHeader();
    }

    const backToTop = document.createElement('button');
    backToTop.type = 'button';
    backToTop.className = 'back-to-top';
    backToTop.setAttribute('aria-label', '맨 위로 이동');
    document.body.append(backToTop);

    const updateBackToTop = () => {
        backToTop.classList.toggle('is-visible', window.scrollY > 320);
    };

    backToTop.addEventListener('click', () => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    window.addEventListener('scroll', updateBackToTop, { passive: true });
    updateBackToTop();
});