document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.visual__slide');
    const dots = document.querySelectorAll('.visual__dot');
    const prevBtn = document.querySelector('.slider-btn--prev');
    const nextBtn = document.querySelector('.slider-btn--next');

    let currentIndex = 0;
    const totalSlides = slides.length;

    // 슬라이드 이동 함수
    function goToSlide(index) {
        // 인덱스 범위 지정 (처음 <-> 끝 순환)
        if (index < 0) {
            currentIndex = totalSlides - 1;
        } else if (index >= totalSlides) {
            currentIndex = 0;
        } else {
            currentIndex = index;
        }

        // 모든 슬라이드 및 도트 활성화 클래스 제거
        slides.forEach(slide => slide.classList.remove('visual__slide--active'));
        dots.forEach(dot => dot.classList.remove('visual__dot--active'));

        // 현재 선택된 슬라이드 및 도트 활성화
        slides[currentIndex].classList.add('visual__slide--active');
        dots[currentIndex].classList.add('visual__dot--active');
    }

    // 이전 버튼 클릭
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            goToSlide(currentIndex - 1);
        });
    }

    // 다음 버튼 클릭
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            goToSlide(currentIndex + 1);
        });
    }

    // 인디케이터(도트) 클릭
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
        });
    });

    if (totalSlides > 1) {
        window.setInterval(() => goToSlide(currentIndex + 1), 5000);
    }

    const bestGoodsWrap = document.querySelector('.best-items__viewport');
    const bestGoods = document.querySelector('.best-items__goods');
    const bestCards = bestGoods?.querySelectorAll('.product-card') ?? [];
    const bestPrevBtn = document.querySelector('.slider-btn--prev-best');
    const bestNextBtn = document.querySelector('.slider-btn--next-best');

    if (bestGoodsWrap && bestGoods && bestCards.length > 1 && bestPrevBtn && bestNextBtn) {
        const updateBestButtons = () => {
            const maxScroll = bestGoodsWrap.scrollWidth - bestGoodsWrap.clientWidth;
            bestPrevBtn.disabled = bestGoodsWrap.scrollLeft <= 1;
            bestNextBtn.disabled = bestGoodsWrap.scrollLeft >= maxScroll - 1;
        };

        const moveBestGoods = direction => {
            const cardStep = bestCards[1].offsetLeft - bestCards[0].offsetLeft;
            bestGoodsWrap.scrollBy({ left: direction * cardStep, behavior: 'smooth' });
        };

        bestPrevBtn.addEventListener('click', () => moveBestGoods(-1));
        bestNextBtn.addEventListener('click', () => moveBestGoods(1));
        bestGoodsWrap.addEventListener('scroll', updateBestButtons);
        window.addEventListener('resize', updateBestButtons);
        updateBestButtons();
    }

    const hotdealTimer = document.querySelector('.hotdeal__timer');
    if (hotdealTimer) {
        let remainingSeconds = 19 * 60 * 60 + 57 * 60 + 20;

        const renderHotdealTime = () => {
            const hours = Math.floor(remainingSeconds / 3600);
            const minutes = Math.floor((remainingSeconds % 3600) / 60);
            const seconds = remainingSeconds % 60;
            hotdealTimer.textContent = [hours, minutes, seconds]
                .map(value => String(value).padStart(2, '0'))
                .join(':');
        };

        renderHotdealTime();
        window.setInterval(() => {
            if (remainingSeconds > 0) {
                remainingSeconds -= 1;
                renderHotdealTime();
            }
        }, 1000);
    }
});