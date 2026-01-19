// Конфигурация
const CONFIG = {
    freeDeliveryThreshold: 100,
    minOrderAmount: 10,
    maxOrderAmount: 1000,
    deliveryTime: {
        min: '09:00',
        max: '21:00'
    }
};

// Глобальные переменные
let cart = [];
let compareItems = [];
let currentOrderAmount = 0;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initSEOOptimizations();
    initUserBehaviorTracking();
    initABTesting();
    loadCartFromStorage();
    initPerformanceMonitoring();
    
    // Анимация при прокрутке
    initScrollAnimations();
    
    // Инициализация форм
    initForms();
    
    // Инициализация чата
    initChat();
    
    // Инициализация отслеживания позиций
    initPositionTracking();
});

// ==================== SEO ОПТИМИЗАЦИИ ====================

function initSEOOptimizations() {
    // Lazy loading изображений
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
                
                // Отслеживание загрузки изображений
                trackEvent('image_load', {
                    src: img.src,
                    page: window.location.pathname
                });
            }
        });
    }, {
        rootMargin: '50px'
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    // Оптимизация загрузки веб-шрифтов
    const fontObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadFonts();
                fontObserver.disconnect();
            }
        });
    });
    
    fontObserver.observe(document.body);
}

function loadFonts() {
    // Предзагрузка шрифтов
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
}

// ==================== ПОВЕДЕНЧЕСКИЕ ФАКТОРЫ ====================

function initUserBehaviorTracking() {
    // Отслеживание времени на странице
    let pageStartTime = Date.now();
    let activeTime = 0;
    let lastActiveTime = Date.now();
    
    // Отслеживание активности пользователя
    document.addEventListener('mousemove', updateActiveTime);
    document.addEventListener('keypress', updateActiveTime);
    document.addEventListener('click', updateActiveTime);
    document.addEventListener('scroll', updateActiveTime);
    
    function updateActiveTime() {
        const now = Date.now();
        activeTime += (now - lastActiveTime);
        lastActiveTime = now;
    }
    
    // Отправка данных при уходе со страницы
    window.addEventListener('beforeunload', function() {
        const totalTime = Date.now() - pageStartTime;
        const engagementRate = (activeTime / totalTime) * 100;
        
        trackEvent('page_engagement', {
            total_time: Math.round(totalTime / 1000),
            active_time: Math.round(activeTime / 1000),
            engagement_rate: Math.round(engagementRate),
            page_url: window.location.href
        });
    });
    
    // Отслеживание кликов по CTA элементам
    document.querySelectorAll('.btn-primary, .btn-order, .btn-secondary').forEach(button => {
        button.addEventListener('click', function(e) {
            const buttonText = this.textContent.trim();
            const buttonClass = this.className;
            
            trackEvent('cta_click', {
                button_text: buttonText,
                button_class: buttonClass,
                page_url: window.location.href,
                timestamp: new Date().toISOString()
            });
        });
    });
    
    // Отслеживание прокрутки
    let scrollSections = [];
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section, .product-card, .advantage-card');
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top >= 0 && rect.top <= window.innerHeight * 0.8) {
                const sectionId = section.id || section.className;
                if (!scrollSections.includes(sectionId)) {
                    scrollSections.push(sectionId);
                    trackEvent('section_view', {
                        section: sectionId,
                        scroll_position: window.pageYOffset,
                        page_url: window.location.href
                    });
                }
            }
        });
    });
}

// ==================== A/B ТЕСТИРОВАНИЕ ====================

function initABTesting() {
    // Определение группы A/B тестирования
    let abGroup = localStorage.getItem('ab_test_group');
    if (!abGroup) {
        abGroup = Math.random() > 0.5 ? 'A' : 'B';
        localStorage.setItem('ab_test_group', abGroup);
        
        trackEvent('ab_test_assignment', {
            group: abGroup,
            test_name: 'header_variation'
        });
    }
    
    // Применение вариантов A/B тестирования
    applyABTestVariants(abGroup);
}

function applyABTestVariants(group) {
    const header = document.querySelector('.hero h1');
    const ctaButton = document.querySelector('#mainOrderBtn');
    
    if (group === 'B') {
        // Вариант B: более эмоциональный заголовок
        if (header) header.textContent = "Свежая домашняя выпечка прямо к вашему столу!";
        if (ctaButton) ctaButton.textContent = "🎂 Попробовать сейчас!";
        
        // Изменение цвета CTA кнопки
        if (ctaButton) {
            ctaButton.style.backgroundColor = '#27ae60';
            ctaButton.style.boxShadow = '0 4px 15px rgba(39, 174, 96, 0.3)';
        }
    }
    
    // Вариант A остается по умолчанию
}

function trackABTest(variant) {
    const currentGroup = localStorage.getItem('ab_test_group') || 'A';
    
    trackEvent('ab_test_interaction', {
        variant: variant,
        current_group: currentGroup,
        interaction_type: 'preference_selection',
        timestamp: new Date().toISOString()
    });
    
    // Показ благодарности
    showNotification(`Спасибо за ваш выбор! Вариант "${variant}" сохранен.`);
}

// ==================== КОНВЕРСИЯ И ЗАКАЗЫ ====================

function initForms() {
    // Инициализация всех форм на странице
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
        
        // Валидация в реальном времени
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', validateInput);
            input.addEventListener('input', validateInput);
        });
    });
    
    // Инициализация калькулятора доставки
    const deliveryCalculator = document.querySelector('.calculator-form button');
    if (deliveryCalculator) {
        deliveryCalculator.addEventListener('click', calculateDelivery);
    }
}

function validateInput(e) {
    const input = e.target;
    const value = input.value.trim();
    
    // Очистка предыдущих ошибок
    const errorElement = input.parentElement.querySelector('.error-message');
    if (errorElement) errorElement.remove();
    
    // Валидация телефона
    if (input.type === 'tel' || input.name.includes('phone')) {
        const phoneRegex = /^\+375\s?[0-9]{2}\s?[0-9]{3}\s?[0-9]{2}\s?[0-9]{2}$/;
        if (value && !phoneRegex.test(value)) {
            showInputError(input, 'Введите телефон в формате: +375 __ ______');
            return false;
        }
    }
    
    // Валидация email
    if (input.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
            showInputError(input, 'Введите корректный email адрес');
            return false;
        }
    }
    
    // Валидация имени
    if (input.type === 'text' && input.name.includes('name')) {
        if (value.length < 2) {
            showInputError(input, 'Имя должно содержать минимум 2 символа');
            return false;
        }
    }
    
    return true;
}

function showInputError(input, message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.style.color = '#e74c3c';
    errorElement.style.fontSize = '0.9rem';
    errorElement.style.marginTop = '5px';
    errorElement.textContent = message;
    
    input.parentElement.appendChild(errorElement);
    input.style.borderColor = '#e74c3c';
}

function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    
    // Валидация всех полей
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    
    inputs.forEach(input => {
        if (!validateInput({ target: input })) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showNotification('Пожалуйста, исправьте ошибки в форме', 'error');
        return;
    }
    
    // Сбор данных формы
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Добавление метаданных
    data.timestamp = new Date().toISOString();
    data.page_url = window.location.href;
    data.user_agent = navigator.userAgent;
    
    // Отправка данных (в реальном проекте здесь был бы AJAX запрос)
    console.log('Форма отправлена:', data);
    
    // Отслеживание конверсии
    trackEvent('form_submission', {
        form_type: form.id || 'unknown',
        form_data: data,
        conversion_value: calculateOrderValue(data)
    });
    
    // Показать успешное сообщение
    showNotification('Спасибо за заказ! Мы свяжемся с вами в ближайшее время.', 'success');
    
    // Закрыть модальное окно, если оно есть
    const modal = document.getElementById('orderModal');
    if (modal) modal.style.display = 'none';
    
    // Очистка формы
    form.reset();
    
    // Обновление корзины
    updateCartUI();
}

function calculateOrderValue(orderData) {
    // Расчет стоимости заказа для аналитики
    let total = 0;
    
    if (orderData.product) {
        const prices = {
            'Торт Нежность': 45,
            'Торт Медовый рай': 60,
            'Капкейки Радуга': 20,
            'Шоколадные капкейки': 25,
            'Овсяное печенье': 15,
            'Яблочный пирог': 32
        };
        
        total = prices[orderData.product] || 0;
    }
    
    return total;
}

// ==================== КОРЗИНА И ЗАКАЗЫ ====================

function addToCart(productName, price) {
    // Добавление товара в корзину
    const product = {
        id: generateId(),
        name: productName,
        price: price,
        quantity: 1,
        addedAt: new Date().toISOString()
    };
    
    cart.push(product);
    currentOrderAmount += price;
    
    // Сохранение в localStorage
    saveCartToStorage();
    
    // Показать уведомление
    showCartNotification(product);
    
    // Обновить UI корзины
    updateCartUI();
    
    // Отслеживание добавления в корзину
    trackEvent('add_to_cart', {
        product: productName,
        price: price,
        cart_total: currentOrderAmount,
        free_delivery_left: Math.max(0, CONFIG.freeDeliveryThreshold - currentOrderAmount)
    });
}

function showCartNotification(product) {
    const notification = document.getElementById('cartNotification');
    if (!notification) return;
    
    // Обновление информации о бесплатной доставке
    const amountLeft = Math.max(0, CONFIG.freeDeliveryThreshold - currentOrderAmount);
    document.getElementById('freeDeliveryAmount').textContent = `${amountLeft} BYN`;
    
    // Анимация появления
    notification.style.display = 'block';
    notification.style.animation = 'slideInLeft 0.3s';
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        notification.style.animation = 'slideOutLeft 0.3s';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 300);
    }, 5000);
}

function updateCartUI() {
    // Обновление счетчика корзины в шапке
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = cart.length;
        cartCount.style.display = cart.length > 0 ? 'flex' : 'none';
    }
    
    // Обновление суммы заказа
    const orderTotal = document.getElementById('orderTotal');
    if (orderTotal) {
        orderTotal.textContent = `${currentOrderAmount} BYN`;
    }
    
    // Показ/скрытие уведомления о бесплатной доставке
    const deliveryNotice = document.querySelector('.delivery-notice');
    if (deliveryNotice) {
        if (currentOrderAmount >= CONFIG.freeDeliveryThreshold) {
            deliveryNotice.textContent = '🎉 Поздравляем! У вас бесплатная доставка!';
            deliveryNotice.style.color = '#27ae60';
        } else {
            const amountLeft = CONFIG.freeDeliveryThreshold - currentOrderAmount;
            deliveryNotice.textContent = `🚚 Добавьте еще на ${amountLeft} BYN для бесплатной доставки`;
            deliveryNotice.style.color = '#e74c3c';
        }
    }
}

function saveCartToStorage() {
    localStorage.setItem('sweethomebakery_cart', JSON.stringify(cart));
    localStorage.setItem('sweethomebakery_order_amount', currentOrderAmount.toString());
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('sweethomebakery_cart');
    const savedAmount = localStorage.getItem('sweethomebakery_order_amount');
    
    if (savedCart) {
        cart = JSON.parse(savedCart);
        currentOrderAmount = parseInt(savedAmount) || 0;
        updateCartUI();
    }
}

// ==================== КАЛЬКУЛЯТОР ДОСТАВКИ ====================

function calculateDelivery() {
    const orderAmountInput = document.getElementById('orderAmount');
    const resultDiv = document.getElementById('deliveryResult');
    
    if (!orderAmountInput || !resultDiv) return;
    
    const orderAmount = parseFloat(orderAmountInput.value) || 0;
    
    if (orderAmount < CONFIG.minOrderAmount) {
        resultDiv.innerHTML = `
            <div style="color: #e74c3c;">
                <strong>Минимальный заказ:</strong> ${CONFIG.minOrderAmount} BYN
            </div>
        `;
        return;
    }
    
    let deliveryCost = 5; // Стандартная стоимость доставки
    let deliveryTime = "2 часа";
    
    if (orderAmount >= CONFIG.freeDeliveryThreshold) {
        deliveryCost = 0;
    }
    
    const totalAmount = orderAmount + deliveryCost;
    
    resultDiv.innerHTML = `
        <div style="color: #27ae60;">
            <strong>Расчет стоимости:</strong>
        </div>
        <div style="margin-top: 10px;">
            <div>Стоимость заказа: <strong>${orderAmount.toFixed(2)} BYN</strong></div>
            <div>Стоимость доставки: <strong>${deliveryCost.toFixed(2)} BYN</strong></div>
            <div style="border-top: 1px solid #ddd; margin-top: 10px; padding-top: 10px;">
                <strong>Итого: ${totalAmount.toFixed(2)} BYN</strong>
            </div>
        </div>
        <div style="margin-top: 15px; color: #7f8c8d; font-size: 0.9rem;">
            <i class="fas fa-clock"></i> Время доставки: ${deliveryTime}
        </div>
    `;
    
    // Отслеживание использования калькулятора
    trackEvent('delivery_calculator_used', {
        order_amount: orderAmount,
        delivery_cost: deliveryCost,
        total_amount: totalAmount
    });
}

// ==================== ОНЛАЙН-ЧАТ ====================

function initChat() {
    const chatToggle = document.querySelector('.chat-toggle');
    const chatWindow = document.getElementById('chatWindow');
    
    if (!chatToggle || !chatWindow) return;
    
    // Проверка, был ли чат уже открыт в этой сессии
    const chatWasOpened = sessionStorage.getItem('chat_opened');
    if (!chatWasOpened) {
        // Автоматическое открытие чата через 30 секунд
        setTimeout(() => {
            if (!chatWindow.style.display || chatWindow.style.display === 'none') {
                toggleChat();
                sessionStorage.setItem('chat_opened', 'true');
            }
        }, 30000);
    }
    
    // Инициализация кнопок вопросов
    const questionButtons = document.querySelectorAll('.chat-options button');
    questionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const questionType = this.getAttribute('onclick').match(/selectQuestion\('(.+)'\)/)[1];
            selectQuestion(questionType);
        });
    });
    
    // Инициализация отправки сообщений
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.querySelector('.chat-input button');
    
    if (chatInput && sendButton) {
        sendButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

function toggleChat() {
    const chatWindow = document.getElementById('chatWindow');
    if (!chatWindow) return;
    
    if (chatWindow.style.display === 'block') {
        chatWindow.style.display = 'none';
    } else {
        chatWindow.style.display = 'block';
        
        // Отслеживание открытия чата
        trackEvent('chat_opened', {
            page_url: window.location.href,
            timestamp: new Date().toISOString()
        });
    }
}

function selectQuestion(questionType) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const answers = {
        delivery: {
            question: "Условия доставки",
            answer: "Мы доставляем с 9:00 до 21:00 ежедневно. Бесплатная доставка при заказе от 100 BYN, в остальных случаях - 5 BYN. Среднее время доставки - 2 часа."
        },
        payment: {
            question: "Способы оплаты",
            answer: "Мы принимаем наличные при получении, банковские карты и онлайн-оплату через ЕРИП. Также возможна оплата картой курьеру."
        },
        custom: {
            question: "Торты на заказ",
            answer: "Да, мы делаем торты по индивидуальному дизайну! Присылайте нам фото или описание вашей идеи, и мы подготовим расчет в течение 2 часов."
        }
    };
    
    const qa = answers[questionType];
    if (!qa) return;
    
    // Добавление вопроса пользователя
    addChatMessage(qa.question, 'user');
    
    // Имитация задержки ответа
    setTimeout(() => {
        addChatMessage(qa.answer, 'bot');
        
        // Добавление дополнительных вопросов
        if (questionType === 'custom') {
            setTimeout(() => {
                addChatMessage("Хотите обсудить детали торта? Можете позвонить нам или оставить заявку на сайте.", 'bot');
            }, 500);
        }
    }, 1000);
    
    // Отслеживание вопросов в чате
    trackEvent('chat_question', {
        question_type: questionType,
        question: qa.question,
        page_url: window.location.href
    });
}

function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    
    if (!chatInput || !chatMessages) return;
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Добавление сообщения пользователя
    addChatMessage(message, 'user');
    chatInput.value = '';
    
    // Имитация ответа бота
    setTimeout(() => {
        const botResponse = getBotResponse(message);
        addChatMessage(botResponse, 'bot');
    }, 1500);
    
    // Отслеживание сообщений в чате
    trackEvent('chat_message', {
        message: message,
        direction: 'outgoing',
        page_url: window.location.href
    });
}

function addChatMessage(text, sender) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.textContent = text;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getBotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('цена') || lowerMessage.includes('стоимость')) {
        return "Цены на наши десерты указаны в каталоге. Могу помочь подобрать что-то по вашему бюджету!";
    } else if (lowerMessage.includes('время') || lowerMessage.includes('когда')) {
        return "Мы работаем с 9:00 до 21:00 ежедневно. Доставку можно заказать на любое удобное время в этом интервале.";
    } else if (lowerMessage.includes('заказ') || lowerMessage.includes('оформить')) {
        return "Чтобы оформить заказ, выберите товары в каталоге и нажмите 'Заказать'. Или можете позвонить нам по телефону +375 (33) 875-10-74";
    } else {
        return "Спасибо за ваш вопрос! Чтобы получить точную информацию, рекомендую позвонить нам по телефону +375 (33) 875-10-74 или оставить заявку на сайте.";
    }
}

// ==================== ОТЗЫВЫ И ОБРАТНАЯ СВЯЗЬ ====================

function showReviewForm() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h3>Оставить отзыв</h3>
            <form onsubmit="submitReview(event)">
                <input type="text" placeholder="Ваше имя" required>
                <div class="rating-input">
                    <span>Оценка:</span>
                    <div class="stars-selector">
                        <i class="far fa-star" onclick="setRating(1)"></i>
                        <i class="far fa-star" onclick="setRating(2)"></i>
                        <i class="far fa-star" onclick="setRating(3)"></i>
                        <i class="far fa-star" onclick="setRating(4)"></i>
                        <i class="far fa-star" onclick="setRating(5)"></i>
                    </div>
                    <input type="hidden" id="reviewRating" value="5">
                </div>
                <textarea placeholder="Ваш отзыв..." required rows="4"></textarea>
                <button type="submit" class="btn-primary">Отправить отзыв</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

function setRating(rating) {
    const stars = document.querySelectorAll('.stars-selector i');
    const ratingInput = document.getElementById('reviewRating');
    
    stars.forEach((star, index) => {
        if (index < rating) {
            star.className = 'fas fa-star';
            star.style.color = '#f1c40f';
        } else {
            star.className = 'far fa-star';
            star.style.color = '#ddd';
        }
    });
    
    ratingInput.value = rating;
}

function submitReview(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const review = {
        name: formData.get('name'),
        rating: parseInt(formData.get('rating')),
        text: formData.get('text'),
        date: new Date().toISOString(),
        verified: false
    };
    
    // В реальном проекте здесь был бы AJAX запрос
    console.log('Отзыв отправлен:', review);
    
    // Отслеживание отзыва
    trackEvent('review_submitted', {
        rating: review.rating,
        has_text: review.text.length > 0,
        page_url: window.location.href
    });
    
    showNotification('Спасибо за ваш отзыв! После модерации он появится на сайте.', 'success');
    form.parentElement.parentElement.remove();
}

function sendFeedback() {
    const feedbackText = document.getElementById('feedbackText');
    if (!feedbackText || !feedbackText.value.trim()) {
        showNotification('Пожалуйста, введите ваше предложение', 'error');
        return;
    }
    
    const feedback = {
        text: feedbackText.value.trim(),
        page_url: window.location.href,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent
    };
    
    // В реальном проекте здесь был бы AJAX запрос
    console.log('Обратная связь:', feedback);
    
    trackEvent('feedback_submitted', {
        has_text: true,
        text_length: feedback.text.length,
        page_url: window.location.href
    });
    
    showNotification('Спасибо за ваше предложение! Мы его обязательно рассмотрим.', 'success');
    feedbackText.value = '';
}

function reportError() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h3>Сообщить об ошибке</h3>
            <form onsubmit="submitErrorReport(event)">
                <select required>
                    <option value="">Тип ошибки</option>
                    <option value="typo">Опечатка в тексте</option>
                    <option value="broken_link">Не работает ссылка</option>
                    <option value="display">Проблема с отображением</option>
                    <option value="other">Другое</option>
                </select>
                <textarea placeholder="Опишите ошибку..." required rows="4"></textarea>
                <input type="url" placeholder="Ссылка на страницу с ошибкой">
                <button type="submit" class="btn-primary">Отправить отчет</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

function submitErrorReport(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const report = {
        type: formData.get('type'),
        description: formData.get('description'),
        url: formData.get('url') || window.location.href,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent
    };
    
    // В реальном проекте здесь был бы AJAX запрос
    console.log('Отчет об ошибке:', report);
    
    trackEvent('error_reported', {
        error_type: report.type,
        page_url: report.url,
        has_description: report.description.length > 0
    });
    
    showNotification('Спасибо за вашу помощь! Мы исправим ошибку в ближайшее время.', 'success');
    form.parentElement.parentElement.remove();
}

// ==================== ПОДПИСКА НА РАССЫЛКУ ====================

function subscribeNewsletter(e) {
    e.preventDefault();
    const form = e.target;
    const emailInput = document.getElementById('newsletterEmail');
    
    if (!emailInput || !emailInput.value.trim()) {
        showNotification('Пожалуйста, введите email адрес', 'error');
        return;
    }
    
    const email = emailInput.value.trim();
    
    // Простая валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Пожалуйста, введите корректный email адрес', 'error');
        return;
    }
    
    const subscription = {
        email: email,
        subscribed_at: new Date().toISOString(),
        source: 'website_footer',
        page_url: window.location.href
    };
    
    // В реальном проекте здесь был бы AJAX запрос
    console.log('Подписка на рассылку:', subscription);
    
    trackEvent('newsletter_subscription', {
        email: email,
        source: 'footer',
        page_url: window.location.href
    });
    
    showNotification('Спасибо за подписку! Проверьте вашу почту для подтверждения.', 'success');
    form.reset();
}

// ==================== СРАВНЕНИЕ ТОВАРОВ ====================

function compareProduct(productName) {
    if (compareItems.includes(productName)) {
        // Удаление из сравнения
        compareItems = compareItems.filter(item => item !== productName);
        showNotification(`${productName} удален из сравнения`, 'info');
    } else {
        // Добавление в сравнение
        if (compareItems.length >= 4) {
            showNotification('Можно сравнивать не более 4 товаров', 'error');
            return;
        }
        compareItems.push(productName);
        showNotification(`${productName} добавлен в сравнение`, 'success');
    }
    
    updateCompareWidget();
    
    // Отслеживание сравнения
    trackEvent('product_comparison', {
        action: compareItems.includes(productName) ? 'add' : 'remove',
        product: productName,
        compare_count: compareItems.length
    });
}

function updateCompareWidget() {
    const widget = document.getElementById('compareWidget');
    const count = document.getElementById('compareCount');
    const items = document.getElementById('compareItems');
    
    if (!widget || !count || !items) return;
    
    count.textContent = compareItems.length;
    items.innerHTML = '';
    
    if (compareItems.length > 0) {
        widget.style.display = 'block';
        
        compareItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'compare-item';
            itemDiv.innerHTML = `
                <span>${item}</span>
                <button onclick="compareProduct('${item}')">×</button>
            `;
            items.appendChild(itemDiv);
        });
    } else {
        widget.style.display = 'none';
    }
}

function clearCompare() {
    compareItems = [];
    updateCompareWidget();
    showNotification('Список сравнения очищен', 'info');
}

function showCompareTable() {
    if (compareItems.length === 0) {
        showNotification('Добавьте товары для сравнения', 'error');
        return;
    }
    
    const modal = document.getElementById('compareModal');
    const table = document.getElementById('compareTable');
    
    if (!modal || !table) return;
    
    // Создание таблицы сравнения
    table.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Характеристика</th>
                    ${compareItems.map(item => `<th>${item}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Цена</td>
                    ${compareItems.map(item => `<td>${getProductPrice(item)} BYN</td>`).join('')}
                </tr>
                <tr>
                    <td>Вес</td>
                    ${compareItems.map(item => `<td>${getProductWeight(item)}</td>`).join('')}
                </tr>
                <tr>
                    <td>Рейтинг</td>
                    ${compareItems.map(item => `<td>${getProductRating(item)}</td>`).join('')}
                </tr>
            </tbody>
        </table>
    `;
    
    modal.style.display = 'block';
    
    // Отслеживание просмотра сравнения
    trackEvent('compare_view', {
        products: compareItems,
        count: compareItems.length
    });
}

function closeCompareModal() {
    const modal = document.getElementById('compareModal');
    if (modal) modal.style.display = 'none';
}

function getProductPrice(productName) {
    const prices = {
        'Торт Нежность': 45,
        'Торт Медовый рай': 60,
        'Капкейки Радуга': 20,
        'Шоколадные капкейки': 25,
        'Овсяное печенье': 15,
        'Яблочный пирог': 32
    };
    
    return prices[productName] || '—';
}

function getProductWeight(productName) {
    const weights = {
        'Торт Нежность': '1.5 кг',
        'Торт Медовый рай': '2 кг',
        'Капкейки Радуга': '6 шт',
        'Шоколадные капкейки': '4 шт',
        'Овсяное печенье': '350 г',
        'Яблочный пирог': '1 кг'
    };
    
    return weights[productName] || '—';
}

function getProductRating(productName) {
    const ratings = {
        'Торт Нежность': '4.9/5',
        'Торт Медовый рай': '4.8/5',
        'Капкейки Радуга': '4.5/5',
        'Шоколадные капкейки': '4.7/5',
        'Овсяное печенье': '4.9/5',
        'Яблочный пирог': '4.6/5'
    };
    
    return ratings[productName] || '—';
}

// ==================== МОНИТОРИНГ ПОЗИЦИЙ ====================

function initPositionTracking() {
    // Симуляция отслеживания позиций в поиске
    // В реальном проекте здесь было бы API для получения позиций
    
    const positionItems = document.querySelectorAll('.position-item');
    if (positionItems.length === 0) return;
    
    // Обновление позиций каждые 30 секунд (симуляция)
    setInterval(() => {
        positionItems.forEach(item => {
            const positionSpan = item.querySelector('.position');
            if (positionSpan) {
                const currentPos = parseInt(positionSpan.textContent);
                const change = Math.random() > 0.5 ? 1 : -1;
                const newPos = Math.max(1, Math.min(50, currentPos + change));
                
                positionSpan.textContent = `${newPos} место`;
                
                if (newPos < currentPos) {
                    positionSpan.style.color = '#27ae60';
                } else if (newPos > currentPos) {
                    positionSpan.style.color = '#e74c3c';
                } else {
                    positionSpan.style.color = '#f39c12';
                }
            }
        });
    }, 30000);
}

// ==================== АНИМАЦИИ И UI ====================

function initScrollAnimations() {
    // Анимация шапки при скролле
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Анимация появления элементов при скролле
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Наблюдение за элементами для анимации
    document.querySelectorAll('section, .product-card, .advantage-card').forEach(el => {
        observer.observe(el);
    });
}

function initPerformanceMonitoring() {
    // Отслеживание метрик производительности
    if ('performance' in window) {
        window.addEventListener('load', function() {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    trackEvent('performance_metrics', {
                        load_time: perfData.loadEventEnd - perfData.startTime,
                        dom_content_loaded: perfData.domContentLoadedEventEnd - perfData.startTime,
                        first_paint: getFirstPaint(),
                        page: window.location.pathname
                    });
                }
            }, 0);
        });
    }
}

function getFirstPaint() {
    // Получение метрики First Paint
    let firstPaint = 0;
    if (window.performance) {
        const perfEntries = performance.getEntriesByType('paint');
        if (perfEntries && perfEntries.length > 0) {
            firstPaint = perfEntries[0].startTime;
        }
    }
    return firstPaint;
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

function showNotification(message, type = 'info') {
    // Создание уведомления
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Стили уведомления
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        min-width: 300px;
        max-width: 400px;
        animation: slideInRight 0.3s;
    `;
    
    // Цвета по типу
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        info: '#3498db',
        warning: '#f39c12'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Кнопка закрытия
    notification.querySelector('button').style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 25px;
        height: 25px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    document.body.appendChild(notification);
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
    
    // Добавление CSS анимаций
    if (!document.querySelector('#notification-animations')) {
        const style = document.createElement('style');
        style.id = 'notification-animations';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            @keyframes slideOutLeft {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(-100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function trackEvent(eventName, eventData = {}) {
    // В реальном проекте здесь была бы интеграция с Яндекс.Метрикой/Google Analytics
    console.log(`[Analytics] ${eventName}:`, eventData);
    
    // Пример отправки в Яндекс.Метрику
    if (typeof ym !== 'undefined') {
        ym(96587456, 'reachGoal', eventName, eventData);
    }
    
    // Пример отправки в Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }
    
    // Сохранение событий в localStorage для отладки
    const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    events.push({
        name: eventName,
        data: eventData,
        timestamp: new Date().toISOString()
    });
    
    // Ограничение истории событий
    if (events.length > 100) {
        events.shift();
    }
    
    localStorage.setItem('analytics_events', JSON.stringify(events));
}

function toggleFaq(button) {
    const answer = button.nextElementSibling;
    button.classList.toggle('active');
    answer.classList.toggle('show');
}

function shareCatalog(platform) {
    const title = document.title;
    const url = window.location.href;
    const text = 'Посмотрите каталог домашней выпечки SweetHomeBakery!';
    
    const shareUrls = {
        vk: `https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&description=${encodeURIComponent(text)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title + ' ' + text)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    };
    
    if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        
        // Отслеживание шаринга
        trackEvent('social_share', {
            platform: platform,
            content_type: 'catalog',
            page_url: url
        });
    }
}

// Экспорт функций для глобального использования
window.toggleChat = toggleChat;
window.selectQuestion = selectQuestion;
window.sendMessage = sendMessage;
window.calculateDelivery = calculateDelivery;
window.addToCart = addToCart;
window.showReviewForm = showReviewForm;
window.setRating = setRating;
window.submitReview = submitReview;
window.sendFeedback = sendFeedback;
window.reportError = submitErrorReport;
window.subscribeNewsletter = subscribeNewsletter;
window.compareProduct = compareProduct;
window.clearCompare = clearCompare;
window.showCompareTable = showCompareTable;
window.closeCompareModal = closeCompareModal;
window.toggleFaq = toggleFaq;
window.shareCatalog = shareCatalog;
window.trackABTest = trackABTest;
