const gnb = document.querySelector('.gnb');
const searchForm = document.querySelector('.header-top .search-form');
const scrollTopButton = document.querySelector('.scroll-top');
const updateScrollTopButton = () => {
    scrollTopButton?.classList.toggle('is-visible', window.scrollY > 400);
};
const scrollToTop = (event) => {
    event.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
};

document.querySelectorAll('[data-scroll-top]').forEach((control) => {
    control.addEventListener('click', scrollToTop);
});
scrollTopButton?.addEventListener('click', scrollToTop);
window.addEventListener('scroll', updateScrollTopButton, { passive: true });
updateScrollTopButton();

if (gnb && searchForm) {
    const searchSlot = gnb.querySelector('.gnb-search-slot');
    const category = gnb.querySelector('.category');
    const menuItems = [...category.querySelectorAll(':scope > li')];
    const utility = document.querySelector('.header-top .utility');
    const userMenu = utility?.querySelector('.user-menu');
    const stickyThreshold = gnb.offsetTop;
    const setCategoryWidths = (widths) => {
        menuItems.forEach((item, index) => {
            item.style.setProperty('--category-item-width', `${widths[index]}px`);
        });
    };
    const getNaturalCategoryWidths = () => menuItems.map((item) => {
        const range = document.createRange();
        range.selectNodeContents(item.querySelector('a'));
        return range.getBoundingClientRect().width;
    });

    const updateStickyHeader = () => {
        const isSticky = window.scrollY >= stickyThreshold;
        if (isSticky === gnb.classList.contains('is-sticky')) return;

        setCategoryWidths(menuItems.map((item) => item.getBoundingClientRect().width));
        gnb.classList.toggle('is-sticky', isSticky);

        if (isSticky && searchSlot && searchForm.parentElement !== searchSlot) {
            searchSlot.append(searchForm);
        } else if (!isSticky && utility && searchForm.parentElement !== utility) {
            utility.insertBefore(searchForm, userMenu || null);
        }

        window.requestAnimationFrame(() => {
            const targetWidths = isSticky
                ? Array(menuItems.length).fill(category.clientWidth / menuItems.length)
                : getNaturalCategoryWidths();
            setCategoryWidths(targetWidths);
        });
    };

    window.addEventListener('scroll', updateStickyHeader, { passive: true });
    window.addEventListener('resize', () => {
        const widths = gnb.classList.contains('is-sticky')
            ? Array(menuItems.length).fill(category.clientWidth / menuItems.length)
            : getNaturalCategoryWidths();
        setCategoryWidths(widths);
    });

    updateStickyHeader();
}

if (gnb) {
    const menuItems = [...gnb.querySelectorAll('.category > li')];
    const menuColumns = [...gnb.querySelectorAll('.mega-menu-column')];

    const updateMenuTitlePositions = () => {
        const canAnimate = window.matchMedia('(min-width: 901px)').matches &&
            gnb.classList.contains('is-menu-open') &&
            !gnb.classList.contains('is-sticky');

        menuItems.forEach((item, index) => {
            const anchor = item.querySelector('a');
            if (!canAnimate || !menuColumns[index]) {
                anchor.style.removeProperty('--menu-title-shift');
                return;
            }

            const range = document.createRange();
            range.selectNodeContents(anchor);
            const textWidth = range.getBoundingClientRect().width;
            const baseCenter = item.getBoundingClientRect().left + textWidth / 2;
            const columnRect = menuColumns[index].getBoundingClientRect();
            const targetCenter = columnRect.left + columnRect.width / 2;
            anchor.style.setProperty('--menu-title-shift', `${targetCenter - baseCenter}px`);
        });
    };

    const closeMegaMenu = () => {
        gnb.classList.remove('is-menu-open');
        menuItems.forEach((item) => item.classList.remove('is-active'));
        menuColumns.forEach((column) => column.classList.remove('is-active'));
        updateMenuTitlePositions();
    };

    const openMegaMenu = (index) => {
        const wasOpen = gnb.classList.contains('is-menu-open');
        gnb.classList.add('is-menu-open');
        menuItems.forEach((item, itemIndex) => item.classList.toggle('is-active', itemIndex === index));
        menuColumns.forEach((column, columnIndex) => column.classList.toggle('is-active', columnIndex === index));
        if (!wasOpen) updateMenuTitlePositions();
    };

    gnb.addEventListener('pointermove', (event) => {
        if (!gnb.classList.contains('is-menu-open') || gnb.classList.contains('is-sticky')) return;

        const index = menuColumns.findIndex((column) => {
            const bounds = column.getBoundingClientRect();
            return event.clientX >= bounds.left && event.clientX < bounds.right;
        });
        if (index >= 0 && !menuItems[index].classList.contains('is-active')) {
            openMegaMenu(index);
        }
    });

    menuItems.forEach((item, index) => {
        item.addEventListener('pointerenter', () => {
            if (!gnb.classList.contains('is-menu-open') || gnb.classList.contains('is-sticky')) {
                openMegaMenu(index);
            }
        });
        item.addEventListener('focusin', () => openMegaMenu(index));
    });
    menuColumns.forEach((column, index) => {
        column.addEventListener('pointerenter', () => {
            if (gnb.classList.contains('is-sticky')) openMegaMenu(index);
        });
    });
    gnb.addEventListener('pointerleave', closeMegaMenu);
    gnb.addEventListener('focusout', (event) => {
        if (!gnb.contains(event.relatedTarget)) closeMegaMenu();
    });
    window.addEventListener('resize', updateMenuTitlePositions);
}

const visualCarousel = document.querySelector('[data-visual-carousel]');

if (visualCarousel) {
    const image = visualCarousel.querySelector('.visual-slide-image');
    const dots = [...visualCarousel.querySelectorAll('[data-slide-to]')];
    let activeSlide = 0;
    let imageTimer;
    let autoplayTimer;
    let pointerOver = false;
    let focusWithin = false;

    const showSlide = (index) => {
        activeSlide = (index + dots.length) % dots.length;
        window.clearTimeout(imageTimer);
        image.classList.add('is-changing');
        imageTimer = window.setTimeout(() => {
            image.src = `./img/visual0${activeSlide + 1}.jpg`;
            image.classList.remove('is-changing');
        }, 120);
        dots.forEach((dot, dotIndex) => {
            const isActive = dotIndex === activeSlide;
            dot.classList.toggle('active', isActive);
            if (isActive) dot.setAttribute('aria-current', 'true');
            else dot.removeAttribute('aria-current');
        });
    };

    const updateAutoplay = () => {
        window.clearTimeout(autoplayTimer);
        if (document.hidden || pointerOver || focusWithin) return;
        autoplayTimer = window.setTimeout(() => {
            showSlide(activeSlide + 1);
            updateAutoplay();
        }, 5000);
    };

    const changeSlide = (index) => {
        showSlide(index);
        updateAutoplay();
    };

    visualCarousel.querySelector('[data-slide-prev]')?.addEventListener('click', () => changeSlide(activeSlide - 1));
    visualCarousel.querySelector('[data-slide-next]')?.addEventListener('click', () => changeSlide(activeSlide + 1));
    dots.forEach((dot, index) => dot.addEventListener('click', () => changeSlide(index)));
    visualCarousel.addEventListener('pointerenter', () => {
        pointerOver = true;
        updateAutoplay();
    });
    visualCarousel.addEventListener('pointerleave', () => {
        pointerOver = false;
        updateAutoplay();
    });
    visualCarousel.addEventListener('focusin', () => {
        focusWithin = true;
        updateAutoplay();
    });
    visualCarousel.addEventListener('focusout', (event) => {
        if (!visualCarousel.contains(event.relatedTarget)) {
            focusWithin = false;
            updateAutoplay();
        }
    });
    document.addEventListener('visibilitychange', updateAutoplay);
    updateAutoplay();
}

const setupBookCarousel = (sectionSelector, listSelector, itemSelector) => {
    const section = document.querySelector(sectionSelector);
    const viewport = section?.querySelector('.book-slider-viewport');
    const list = viewport?.querySelector(listSelector);
    if (!section || !viewport || !list) return;

    const items = [...list.querySelectorAll(itemSelector)];
    if (items.length < 2) return;

    let itemStep = 0;
    let currentIndex = 0;

    const measureItemStep = () => {
        itemStep = items[1].getBoundingClientRect().left - items[0].getBoundingClientRect().left;
    };

    const getItemScrollLeft = (index) => {
        const viewportLeft = viewport.getBoundingClientRect().left;
        return viewport.scrollLeft + items[index].getBoundingClientRect().left - viewportLeft;
    };

    const rebuildTrack = () => {
        list.querySelectorAll('[data-loop-clone]').forEach((clone) => clone.remove());
        measureItemStep();
        if (!itemStep) return;
        viewport.scrollLeft = getItemScrollLeft(currentIndex);
    };

    rebuildTrack();

    const previous = section.querySelector('[data-slide-prev]');
    const next = section.querySelector('[data-slide-next]');
    const updateButtons = () => {
        if (previous) {
            previous.disabled = currentIndex === 0;
            previous.style.cursor = currentIndex === 0 ? 'default' : '';
        }
    };
    const move = (direction) => {
        const lastIndex = items.length - 1;
        if (direction < 0 && currentIndex === 0) return;

        const isWrappingForward = direction > 0 && currentIndex === lastIndex;
        currentIndex = isWrappingForward ? 0 : currentIndex + direction;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        viewport.scrollTo({
            left: getItemScrollLeft(currentIndex),
            behavior: isWrappingForward || reduceMotion ? 'auto' : 'smooth'
        });
        updateButtons();
    };

    previous?.addEventListener('click', () => move(-1));
    next?.addEventListener('click', () => move(1));
    viewport.addEventListener('scrollend', () => {
        const viewportLeft = viewport.getBoundingClientRect().left;
        currentIndex = items.reduce((nearestIndex, item, index) => {
            const nearestDistance = Math.abs(items[nearestIndex].getBoundingClientRect().left - viewportLeft);
            const itemDistance = Math.abs(item.getBoundingClientRect().left - viewportLeft);
            return itemDistance < nearestDistance ? index : nearestIndex;
        }, 0);
        updateButtons();
    });
    window.addEventListener('resize', () => {
        rebuildTrack();
        updateButtons();
    });
    updateButtons();
};

setupBookCarousel('.today-book', '.book-list', '.book-item');
setupBookCarousel('.new-book', '.new-book-list', '.new-book-item');
setupBookCarousel('.rec-book', '.rec-book-list', '.rec-book-item');
