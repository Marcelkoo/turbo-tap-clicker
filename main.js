// ==UserScript==
// @name         TurboTap Auto Clicker
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  TurboTap Auto Clicker MILK CAPTCHA UPDATE
// @match        https://tap.eclipse.xyz/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    localStorage.removeItem('controlsPosition');

    let isPageTransitioning = false;
    let isCaptchaActive = false;

    function detectPageTransition() {
        window.addEventListener('beforeunload', () => {
            isPageTransitioning = true;
            localStorage.setItem('isTransitioning', 'true');
            if (clickTimeout) {
                clearTimeout(clickTimeout);
            }
        });

        if (localStorage.getItem('isTransitioning') === 'true') {
            localStorage.removeItem('isTransitioning');
        }
    }

    function isCaptchaPresent() {
        return !!document.querySelector('div[role="dialog"][data-sentry-source-file="ModalAutoClickChallenge.tsx"], div[role="dialog"][data-sentry-component="ModalAutoClickChallenge"]');
    }

    function handleCaptcha() {
        if (!isCaptchaPresent()) return false;

        const captchaButton = document.querySelector('button[type="button"][data-sentry-source-file="ModalAutoClickChallenge.tsx"], button[data-sentry-component="Button"][data-sentry-source-file="ModalAutoClickChallenge.tsx"]');
        if (captchaButton) {
            const delay = 3000 + Math.random() * 3000;

            const captchaStatus = document.getElementById('captcha-status');
            if (captchaStatus) {
                captchaStatus.innerHTML = '🤖 Капча: НАЙДЕНА! Ожидание...';
                captchaStatus.style.background = '#9F0B0B';
                captchaStatus.style.fontWeight = 'bold';
            }

            isCaptchaActive = true;
            const wasPaused = isPaused;
            isPaused = true;

            try {
                captchaButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } catch (e) {}

            setTimeout(() => {
                if (isCaptchaPresent()) {
                    simulateRealClick(captchaButton);

                    if (captchaStatus) {
                        captchaStatus.innerHTML = '🤖 Капча: нажимаю кнопку...';

                        setTimeout(() => {
                            if (!isCaptchaPresent()) {
                                captchaStatus.innerHTML = '🤖 Капча: пройдена, ожидание...';
                                captchaStatus.style.background = '#0B979F';

                                const resumeDelay = 3000 + Math.random() * 2000;
                                setTimeout(() => {
                                    isCaptchaActive = false;
                                    isPaused = wasPaused;
                                    captchaStatus.innerHTML = '🤖 Капча: не найдена';
                                    captchaStatus.style.background = '#333';
                                    captchaStatus.style.fontWeight = 'normal';
                                }, resumeDelay);
                            } else {
                                handleCaptcha();
                            }
                        }, 1000);
                    }
                } else {
                    isCaptchaActive = false;
                    isPaused = wasPaused;
                    if (captchaStatus) {
                        captchaStatus.innerHTML = '🤖 Капча: пройдена, ожидание...';
                        captchaStatus.style.background = '#0B979F';

                        const resumeDelay = 3000 + Math.random() * 2000;
                        setTimeout(() => {
                            isCaptchaActive = false;
                            isPaused = wasPaused;
                            captchaStatus.innerHTML = '🤖 Капча: не найдена';
                            captchaStatus.style.background = '#333';
                            captchaStatus.style.fontWeight = 'normal';
                        }, resumeDelay);
                    }
                }
            }, delay);

            return true;
        }

        return false;
    }

    function checkForCaptcha() {
        const isPresent = isCaptchaPresent();

        const captchaStatus = document.getElementById('captcha-status');
        if (captchaStatus) {
            if (isPresent && !isCaptchaActive) {
                captchaStatus.innerHTML = '🤖 Капча: НАЙДЕНА!';
                captchaStatus.style.background = '#9F0B0B';
                captchaStatus.style.fontWeight = 'bold';
                handleCaptcha();
            } else if (!isPresent && !isCaptchaActive) {
                captchaStatus.innerHTML = '🤖 Капча: не найдена';
                captchaStatus.style.background = '#333';
                captchaStatus.style.fontWeight = 'normal';
            }
        }

        return isPresent;
    }

    function waitForElements() {
        return new Promise(resolve => {
            function check() {
                const container = document.querySelector('.row-start-1.grid.place-content-start.justify-center.py-8.md\\:col-span-1');
                const canvas = document.querySelector('canvas');

                if (container && canvas) {
                    resolve({ container, canvas });
                    return true;
                }
                return false;
            }

            if (check()) return;

            const observer = new MutationObserver(mutations => {
                if (check()) {
                    observer.disconnect();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    function createControls() {
        const controlsContainer = document.createElement('div');

        const isAutoClickerOn = localStorage.getItem('autoClickerEnabled') === 'true';

        controlsContainer.style.cssText = `
            margin: 20px;
            padding: 15px;
            border-radius: 12px;
            background: #1a1a1a;
            color: white;
            width: 320px;
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-family: 'Arial', sans-serif;
        `;

        const dragHandle = document.createElement('div');
        dragHandle.style.cssText = `
            width: 100%;
            height: 20px;
            background: #333;
            border-radius: 5px;
            margin-bottom: 10px;
            cursor: ${isAutoClickerOn ? 'not-allowed' : 'move'};
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
        `;
        dragHandle.title = isAutoClickerOn ? 'Выключите скрипт для перемещения' : 'Перетащите, чтобы переместить';

        const dotsContainer = document.createElement('div');
        dotsContainer.id = 'dots-container';

        if (isAutoClickerOn) {
            dotsContainer.textContent = 'Выкл скрипт для переноса';
            dotsContainer.style.cssText = `
                font-size: 11px;
                color: #999;
            `;
        } else {
            for (let i = 0; i < 3; i++) {
                const dot = document.createElement('div');
                dot.style.cssText = `
                    width: 4px;
                    height: 4px;
                    background: #666;
                    border-radius: 50%;
                    margin: 0 2px;
                `;
                dotsContainer.appendChild(dot);
            }
        }

        dragHandle.appendChild(dotsContainer);

        const dragNotification = document.createElement('div');
        dragNotification.id = 'drag-notification';
        dragNotification.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            padding: 8px;
            border-radius: 5px;
            background: rgba(255, 50, 50, 0.9);
            color: white;
            text-align: center;
            font-size: 12px;
            margin-top: 5px;
            display: none;
            z-index: 1001;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        dragNotification.innerHTML = '⚠️ Выключите скрипт для перемещения!';
        controlsContainer.appendChild(dragNotification);

        const toggleButton = document.createElement('button');
        toggleButton.innerHTML = '⏹ Off';
        toggleButton.style.cssText = `
            width: 100%;
            padding: 10px 16px;
            border-radius: 8px;
            background: #0B979F;
            color: white;
            border: none;
            cursor: pointer;
            font-weight: bold;
            opacity: 0.9;
            margin-bottom: 12px;
            transition: all 0.2s ease;
        `;
        toggleButton.onmouseover = () => toggleButton.style.opacity = '1';
        toggleButton.onmouseout = () => toggleButton.style.opacity = '0.9';

        const bullStatus = document.createElement('div');
        bullStatus.id = 'bull-status';
        bullStatus.innerHTML = '🐂 Бык: проверка...';
        bullStatus.style.cssText = `
            width: 100%;
            padding: 8px;
            border-radius: 6px;
            background: #333;
            color: white;
            text-align: center;
            margin-bottom: 12px;
            font-size: 14px;
        `;

        const milkStatus = document.createElement('div');
        milkStatus.id = 'milk-status';
        milkStatus.innerHTML = '🥛 Молоко: не найдено';
        milkStatus.style.cssText = `
            width: 100%;
            padding: 8px;
            border-radius: 6px;
            background: #333;
            color: white;
            text-align: center;
            margin-bottom: 12px;
            font-size: 14px;
        `;

        const milkToggle = document.createElement('div');
        milkToggle.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
            padding: 8px;
            border-radius: 6px;
            background: #333;
        `;

        const milkToggleLabel = document.createElement('span');
        milkToggleLabel.textContent = 'Автоклик молока:';
        milkToggleLabel.style.cssText = `
            font-size: 14px;
        `;

        const milkToggleButton = document.createElement('button');
        const milkAutoClickEnabled = localStorage.getItem('milkAutoClickEnabled') !== 'false';
        milkToggleButton.innerHTML = milkAutoClickEnabled ? '✅ Вкл' : '❌ Выкл';
        milkToggleButton.style.cssText = `
            padding: 5px 10px;
            border-radius: 6px;
            background: ${milkAutoClickEnabled ? '#0B979F' : '#555'};
            color: white;
            border: none;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.2s ease;
        `;
        milkToggleButton.id = 'milk-toggle-button';
        milkToggleButton.onmouseover = () => milkToggleButton.style.opacity = '0.9';
        milkToggleButton.onmouseout = () => milkToggleButton.style.opacity = '1';

        milkToggle.appendChild(milkToggleLabel);
        milkToggle.appendChild(milkToggleButton);

        const fertilizerStatus = document.createElement('div');
        fertilizerStatus.id = 'fertilizer-status';
        fertilizerStatus.innerHTML = '🌱 Удобрение: ожидание';
        fertilizerStatus.style.cssText = `
            width: 100%;
            padding: 8px;
            border-radius: 6px;
            background: #333;
            color: white;
            text-align: center;
            margin-bottom: 12px;
            font-size: 14px;
        `;

        const captchaStatus = document.createElement('div');
        captchaStatus.id = 'captcha-status';
        captchaStatus.innerHTML = '🤖 Капча: не найдена';
        captchaStatus.style.cssText = `
            width: 100%;
            padding: 8px;
            border-radius: 6px;
            background: #333;
            color: white;
            text-align: center;
            margin-bottom: 12px;
            font-size: 14px;
        `;

        const fertilizerToggle = document.createElement('div');
        fertilizerToggle.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
            padding: 8px;
            border-radius: 6px;
            background: #333;
        `;

        const fertilizerToggleLabel = document.createElement('span');
        fertilizerToggleLabel.textContent = 'Покупка бустов:';
        fertilizerToggleLabel.style.cssText = `
            font-size: 14px;
        `;

        const fertilizerToggleButton = document.createElement('button');
        const fertilizerAutoClickEnabled = localStorage.getItem('fertilizerAutoClickEnabled') !== 'false';
        fertilizerToggleButton.innerHTML = fertilizerAutoClickEnabled ? '✅ Вкл' : '❌ Выкл';
        fertilizerToggleButton.style.cssText = `
            padding: 5px 10px;
            border-radius: 6px;
            background: ${fertilizerAutoClickEnabled ? '#0B979F' : '#555'};
            color: white;
            border: none;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.2s ease;
        `;
        fertilizerToggleButton.id = 'fertilizer-toggle-button';
        fertilizerToggleButton.onmouseover = () => fertilizerToggleButton.style.opacity = '0.9';
        fertilizerToggleButton.onmouseout = () => fertilizerToggleButton.style.opacity = '1';

        fertilizerToggle.appendChild(fertilizerToggleLabel);
        fertilizerToggle.appendChild(fertilizerToggleButton);

        const telegramButton = document.createElement('a');
        telegramButton.href = 'http://t.me/marcelkow_crypto';
        telegramButton.target = '_blank';
        telegramButton.style.cssText = `
            display: block;
            width: 100%;
            padding: 10px 16px;
            border-radius: 8px;
            background: #0088cc;
            color: white;
            text-align: center;
            text-decoration: none;
            font-weight: bold;
            margin-top: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        telegramButton.innerHTML = '📱 Telegram Channel';
        telegramButton.onmouseover = () => telegramButton.style.opacity = '0.9';
        telegramButton.onmouseout = () => telegramButton.style.opacity = '1';

        const createInput = (label, defaultMin, defaultMax, storageKey, isTime = false) => {
            const savedValue = localStorage.getItem(storageKey);
            const [min, max] = savedValue ? JSON.parse(savedValue) : [defaultMin, defaultMax];

            const container = document.createElement('div');
            container.style.marginBottom = '12px';

            const labelElement = document.createElement('div');
            labelElement.textContent = `${label} ${isTime ? 'мин' : 'кликов'}`;
            labelElement.style.marginBottom = '6px';
            labelElement.style.fontSize = '14px';

            const inputContainer = document.createElement('div');
            inputContainer.style.display = 'flex';
            inputContainer.style.gap = '8px';

            const minInput = document.createElement('input');
            const maxInput = document.createElement('input');
            [minInput, maxInput].forEach(input => {
                input.type = 'number';
                input.style.cssText = `
                    width: 50%;
                    padding: 6px;
                    border-radius: 6px;
                    border: 1px solid #444;
                    background: #2a2a2a;
                    color: white;
                    font-size: 14px;
                `;
            });

            minInput.value = min;
            maxInput.value = max;

            inputContainer.append(minInput, maxInput);
            container.append(labelElement, inputContainer);

            return { container, minInput, maxInput };
        };

        const shortPauseInputs = createInput('Пауза после', 2000, 4000, 'shortPauseRange');
        const shortPauseTimeInputs = createInput('Время паузы', 1, 2, 'shortPauseTime', true);

        controlsContainer.append(
            dragHandle,
            toggleButton,
            bullStatus,
            milkStatus,
            fertilizerStatus,
            captchaStatus,
            milkToggle,
            fertilizerToggle,
            shortPauseInputs.container,
            shortPauseTimeInputs.container,
            telegramButton
        );

        makeDraggable(controlsContainer, dragHandle);

        return {
            container: controlsContainer,
            toggleButton,
            bullStatus,
            milkStatus,
            fertilizerStatus,
            captchaStatus,
            milkToggleButton,
            fertilizerToggleButton,
            shortPauseInputs,
            shortPauseTimeInputs,
            dragNotification
        };
    }

    function resetPosition(element) {
        element.style.top = '20px';
        element.style.right = '20px';
        element.style.bottom = 'auto';
        element.style.left = 'auto';
        element.style.transform = 'none';

        localStorage.removeItem('controlsPosition');
    }

    function makeDraggable(element, handle) {
        let offsetX, offsetY;
        const dragNotification = document.getElementById('drag-notification');

        handle.addEventListener('mousedown', function(e) {
            if (localStorage.getItem('autoClickerEnabled') === 'true') {
                dragNotification.style.display = 'block';

                setTimeout(() => {
                    dragNotification.style.display = 'none';
                }, 2000);

                return;
            }

            startDrag(e);
        });

        function startDrag(e) {
            e.preventDefault();

            const rect = element.getBoundingClientRect();

            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;


            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', endDrag);
        }

        function drag(e) {
            e.preventDefault();

            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;

            const maxX = window.innerWidth - element.offsetWidth;
            const maxY = window.innerHeight - element.offsetHeight;

            element.style.position = 'fixed';
            element.style.margin = '0';
            element.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
            element.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
            element.style.bottom = 'auto';
            element.style.right = 'auto';
            element.style.transform = 'none';
        }

        function endDrag() {
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', endDrag);
        }
    }

    function getRandomCoordinates(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const radiusX = rect.width * 0.3;
        const radiusY = rect.height * 0.3;

        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random();

        const x = centerX + Math.cos(angle) * radiusX * distance;
        const y = centerY + Math.sin(angle) * radiusY * distance;

        return { x, y };
    }

    function simulateRealClick(element) {
        if (!element) return false;

        try {
            if (typeof element.scrollIntoView === 'function') {
                element.scrollIntoView({ behavior: 'auto', block: 'center' });
            }

            if (typeof element.focus === 'function') {
                element.focus();
            }

            const { x, y } = getRandomCoordinates(element);
            const { x: upX, y: upY } = getRandomCoordinates(element);

            const mouseDown = new MouseEvent('mousedown', {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX: x,
                clientY: y,
                button: 0,
                buttons: 1
            });
            element.dispatchEvent(mouseDown);

            setTimeout(() => {
                const mouseUp = new MouseEvent('mouseup', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    clientX: upX,
                    clientY: upY,
                    button: 0,
                    buttons: 0
                });
                element.dispatchEvent(mouseUp);

                setTimeout(() => {
                    const click = new MouseEvent('click', {
                        view: window,
                        bubbles: true,
                        cancelable: true,
                        clientX: upX,
                        clientY: upY,
                        button: 0,
                        buttons: 0
                    });
                    element.dispatchEvent(click);

                    setTimeout(() => {
                        const elementAtPoint = document.elementFromPoint(upX, upY);
                        if (elementAtPoint && typeof elementAtPoint.click === 'function' && elementAtPoint !== element) {
                            elementAtPoint.click();
                        } else if (elementAtPoint && elementAtPoint !== element) {
                            try {
                                const pointClick = new MouseEvent('click', {
                                    view: window,
                                    bubbles: true,
                                    cancelable: true,
                                    clientX: upX,
                                    clientY: upY
                                });
                                elementAtPoint.dispatchEvent(pointClick);
                            } catch (e) {}
                        }
                    }, 5);

                }, 5 + Math.random() * 10);
            }, 50 + Math.random() * 50);

            return true;
        } catch (error) {
            return false;
        }
    }

    function isBullActive() {
        const sceneDiv = document.querySelector('div[data-sentry-element="unknown"][data-sentry-source-file="Scene.tsx"]');
        if (!sceneDiv) return false;

        return !sceneDiv.classList.contains('cursor-not-allowed') && !sceneDiv.classList.contains('opacity-50');
    }

    function handleMilkAutoClick() {
        const milkAutoClickEnabled = localStorage.getItem('milkAutoClickEnabled') !== 'false';
        if (!milkAutoClickEnabled) return;

        if (!isBullActive()) return;
        if (isCaptchaPresent() || isCaptchaActive) return;

        const milkPopup = document.querySelector('button[data-sentry-component="MilkPopup"]');

        if (milkPopup) {
            const delay = Math.random() * 1000 + 500;

            setTimeout(() => {
                if (!isCaptchaPresent() && !isCaptchaActive) {
                    simulateRealClick(milkPopup);

                    const milkStatus = document.getElementById('milk-status');
                    if (milkStatus) {
                        milkStatus.innerHTML = '🥛 Молоко: СОБРАНО!';
                        milkStatus.style.background = '#0B979F';
                        milkStatus.style.fontWeight = 'bold';

                        setTimeout(() => {
                            milkStatus.innerHTML = '🥛 Молоко: не найдено';
                            milkStatus.style.background = '#333';
                            milkStatus.style.fontWeight = 'normal';
                        }, 2000);
                    }
                }
            }, delay);
        }
    }

    function findFertilizerButton() {
        const buttons = document.querySelectorAll('button[data-sentry-element="TooltipTrigger"]');
        for (const button of buttons) {
            const img = button.querySelector('img[src*="fertilizer.png"]');
            if (!img) continue;

            const clickableDiv = button.querySelector('div.cursor-pointer');
            const notAllowedDiv = button.querySelector('div.cursor-not-allowed');

            if (img && clickableDiv && !notAllowedDiv) {
                if (!button.disabled && !button.classList.contains('cursor-not-allowed')) {
                    return button;
                }
            }
        }
        return null;
    }

    function updateFertilizerStatus(isAvailable) {
        const fertilizerStatus = document.getElementById('fertilizer-status');
        if (fertilizerStatus) {
            if (isAvailable) {
                fertilizerStatus.innerHTML = '🌱 Удобрение: ДОСТУПНО';
                fertilizerStatus.style.background = '#0B979F';
                fertilizerStatus.style.fontWeight = 'bold';
            } else {
                fertilizerStatus.innerHTML = '🌱 Удобрение: ожидание';
                fertilizerStatus.style.background = '#333';
                fertilizerStatus.style.fontWeight = 'normal';
            }
        }
    }

    let isPaused = false;

    function handleFertilizerClick() {
        if (isPaused || isPageTransitioning) {
            updateFertilizerStatus(false);
            return;
        }

        const fertilizerAutoClickEnabled = localStorage.getItem('fertilizerAutoClickEnabled') !== 'false';
        const isMainClickerEnabled = localStorage.getItem('autoClickerEnabled') === 'true';

        if (!fertilizerAutoClickEnabled || !isMainClickerEnabled) return;
        if (!isBullActive()) return;
        if (isCaptchaPresent() || isCaptchaActive) return;

        const fertilizerButton = findFertilizerButton();

        updateFertilizerStatus(!!fertilizerButton);

        if (fertilizerButton) {
            const delay = Math.random() * 1000 + 500;

            setTimeout(() => {
                if (!isPaused && !isPageTransitioning && !isCaptchaPresent() && !isCaptchaActive) {
                    simulateRealClick(fertilizerButton);

                    const fertilizerStatus = document.getElementById('fertilizer-status');
                    if (fertilizerStatus) {
                        fertilizerStatus.innerHTML = '🌱 Удобрение: АКТИВИРОВАНО!';
                        fertilizerStatus.style.background = '#0B979F';
                        fertilizerStatus.style.fontWeight = 'bold';

                        setTimeout(() => {
                            fertilizerStatus.innerHTML = '🌱 Удобрение: ожидание';
                            fertilizerStatus.style.background = '#333';
                            fertilizerStatus.style.fontWeight = 'normal';
                        }, 5000);
                    }
                }
            }, delay);
        }
    }

    function setupMilkObserver() {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BUTTON') {
                            if (node.getAttribute('data-sentry-component') === 'MilkPopup') {
                                handleMilkAutoClick();
                                break;
                            }
                        }
                    }
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        return observer;
    }

    function checkForMilkPopup() {
        const milkPopup = document.querySelector('button[data-sentry-component="MilkPopup"]');

        const milkStatus = document.getElementById('milk-status');
        if (milkStatus) {
            if (milkPopup) {
                milkStatus.innerHTML = '🥛 Молоко: НАЙДЕНО!';
                milkStatus.style.background = '#0B979F';
                milkStatus.style.fontWeight = 'bold';
            } else {
                milkStatus.innerHTML = '🥛 Молоко: не найдено';
                milkStatus.style.background = '#333';
                milkStatus.style.fontWeight = 'normal';
            }
        }

        return milkPopup;
    }

    let clickTimeout = null;

    async function initAutoClicker() {
        detectPageTransition();

        const { container, canvas } = await waitForElements();
        const controls = createControls();

        document.body.appendChild(controls.container);

        let isClicking = localStorage.getItem('autoClickerEnabled') === 'true';
        let clickCount = parseInt(localStorage.getItem('clickCount') || '0');

        checkForCaptcha();

        const milkObserver = setupMilkObserver();

        const milkCheckInterval = setInterval(() => {
            if (isBullActive() && !isPageTransitioning && !isCaptchaPresent() && !isCaptchaActive) {
                const milkPopup = checkForMilkPopup();
                if (milkPopup) {
                    handleMilkAutoClick();
                }
            }
        }, 1000);

        const bullCheckInterval = setInterval(() => {
            const active = isBullActive();
            controls.bullStatus.innerHTML = active ? '🐂 Бык: активен' : '🐂 Бык: неактивен';
            controls.bullStatus.style.background = active ? '#0B979F' : '#555';
            controls.bullStatus.style.fontWeight = active ? 'bold' : 'normal';
        }, 1000);

        controls.milkToggleButton.addEventListener('click', () => {
            const currentState = localStorage.getItem('milkAutoClickEnabled') !== 'false';
            const newState = !currentState;
            localStorage.setItem('milkAutoClickEnabled', newState);

            controls.milkToggleButton.innerHTML = newState ? '✅ Вкл' : '❌ Выкл';
            controls.milkToggleButton.style.background = newState ? '#0B979F' : '#555';
        });

        controls.fertilizerToggleButton.addEventListener('click', () => {
            const currentState = localStorage.getItem('fertilizerAutoClickEnabled') !== 'false';
            const newState = !currentState;
            localStorage.setItem('fertilizerAutoClickEnabled', newState);

            controls.fertilizerToggleButton.innerHTML = newState ? '✅ Вкл' : '❌ Выкл';
            controls.fertilizerToggleButton.style.background = newState ? '#0B979F' : '#555';
        });

        function updateRanges() {
            const shortRange = [
                parseInt(controls.shortPauseInputs.minInput.value),
                parseInt(controls.shortPauseInputs.maxInput.value)
            ];
            const shortPauseTime = [
                parseInt(controls.shortPauseTimeInputs.minInput.value),
                parseInt(controls.shortPauseTimeInputs.maxInput.value)
            ];

            localStorage.setItem('shortPauseRange', JSON.stringify(shortRange));
            localStorage.setItem('shortPauseTime', JSON.stringify(shortPauseTime));
        }

        controls.shortPauseInputs.minInput.onchange = updateRanges;
        controls.shortPauseInputs.maxInput.onchange = updateRanges;
        controls.shortPauseTimeInputs.minInput.onchange = updateRanges;
        controls.shortPauseTimeInputs.maxInput.onchange = updateRanges;

        function performClick() {
            if (!isClicking || isPageTransitioning) return;

            if (!isBullActive()) {
                clickTimeout = setTimeout(performClick, 1000);
                return;
            }

            if (isCaptchaPresent() || isCaptchaActive) {
                clickTimeout = setTimeout(performClick, 1000);
                return;
            }

            const milkPopup = checkForMilkPopup();

            if (milkPopup) {
                const delay = Math.random() * 1000 + 500;
                setTimeout(() => {
                    simulateRealClick(milkPopup);
                    clickTimeout = setTimeout(performClick, 300 + Math.random() * 200);
                }, delay);
                return;
            }

            clickCount++;
            localStorage.setItem('clickCount', clickCount);

            const shortRange = JSON.parse(localStorage.getItem('shortPauseRange') || '[2000, 4000]');
            const shortPauseTime = JSON.parse(localStorage.getItem('shortPauseTime') || '[1, 2]');

            let shortTrigger = parseInt(localStorage.getItem('shortTrigger'));

            if (!shortTrigger) {
                shortTrigger = Math.floor(shortRange[0] + Math.random() * (shortRange[1] - shortRange[0]));
                localStorage.setItem('shortTrigger', shortTrigger);
            }

            simulateRealClick(canvas);

            let pauseTime = 100 + Math.random() * 100;
            let pauseType = '';

            if (clickCount >= shortTrigger) {
                const minMs = shortPauseTime[0] * 60 * 1000;
                const maxMs = shortPauseTime[1] * 60 * 1000;
                pauseTime = minMs + Math.random() * (maxMs - minMs);
                pauseType = '⏸ Пауза';
                localStorage.removeItem('shortTrigger');

                controls.toggleButton.innerHTML = `⏵ On (${pauseType})`;

                isPaused = true;

                setTimeout(() => {
                    clickCount = 0;
                    localStorage.setItem('clickCount', '0');
                    isPaused = false;
                    localStorage.removeItem('controlsPosition');
                    location.reload();
                }, pauseTime);
            }

            clickTimeout = setTimeout(performClick, pauseTime);
        }

        if (isClicking) {
            controls.toggleButton.innerHTML = '⏵ On';
            controls.toggleButton.style.background = '#9F0B0B';
            setTimeout(performClick, 5000);
        }

        controls.toggleButton.addEventListener('click', () => {
            isClicking = !isClicking;
            localStorage.setItem('autoClickerEnabled', isClicking);
            controls.toggleButton.innerHTML = isClicking ? '⏵ On' : '⏹ Off';
            controls.toggleButton.style.background = isClicking ? '#9F0B0B' : '#0B979F';

            const dragHandle = controls.container.querySelector('div');
            if (dragHandle) {
                dragHandle.style.cursor = isClicking ? 'not-allowed' : 'move';
                dragHandle.title = isClicking ? 'Выключите скрипт для перемещения' : 'Перетащите, чтобы переместить';

                const dotsContainer = document.getElementById('dots-container');
                if (dotsContainer) {
                    if (isClicking) {
                        dotsContainer.innerHTML = '';
                        dotsContainer.textContent = 'Выкл скрипт для переноса';
                        dotsContainer.style.cssText = `
                            font-size: 11px;
                            color: #999;
                        `;
                    } else {
                        dotsContainer.innerHTML = '';
                        for (let i = 0; i < 3; i++) {
                            const dot = document.createElement('div');
                            dot.style.cssText = `
                                width: 4px;
                                height: 4px;
                                background: #666;
                                border-radius: 50%;
                                margin: 0 2px;
                                display: inline-block;
                            `;
                            dotsContainer.appendChild(dot);
                        }
                    }
                }
            }

            if (isClicking) {
                clickCount = 0;
                localStorage.setItem('clickCount', '0');
                localStorage.removeItem('shortTrigger');
                isPaused = false;
                performClick();
            } else {
                if (clickTimeout) {
                    clearTimeout(clickTimeout);
                }
                clickCount = 0;
                localStorage.setItem('clickCount', '0');
                localStorage.removeItem('shortTrigger');
                isPaused = false;
            }
        });

        const fertilizerCheckInterval = setInterval(() => {
            if (!isPageTransitioning) {
                handleFertilizerClick();
            }
        }, 10000);

        const captchaCheckInterval = setInterval(() => {
            if (!isPageTransitioning) {
                checkForCaptcha();
            }
        }, 1000);
    }

    initAutoClicker().catch(console.error);
})();
