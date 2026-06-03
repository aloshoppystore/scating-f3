// Kids' Inline Fitness Skates Fit3 - Apple-style Experience Engine

document.addEventListener('DOMContentLoaded', () => {

  // Image preloading configuration
  const frameCount = 240;
  const images = [];
  let loadedCount = 0;
  
  // State object to track active frame for GSAP scrub
  const animationState = { frame: 0 };
  
  // Configured Skates Colorways
  const colorways = {
    'grey-red': {
      name: 'Grey / Red (Original)',
      image: 'images/skates_grey_red.png',
      primaryColor: '#e11d48',
      hoverColor: '#be123c'
    },
    'blue-yellow': {
      name: 'Ocean Blue / Yellow',
      image: 'images/skates_blue_yellow.png',
      primaryColor: '#0284c7',
      hoverColor: '#0369a1'
    },
    'pink-purple': {
      name: 'Candy Pink / Purple',
      image: 'images/skates_pink_purple.png',
      primaryColor: '#db2777',
      hoverColor: '#be185d'
    },
    'black-green': {
      name: 'Sleek Black / Neon Green',
      image: 'images/skates_black_green.png',
      primaryColor: '#22c55e',
      hoverColor: '#16a34a'
    }
  };

  // State Management
  let selectedColor = 'grey-red';
  let selectedSize = '';
  let cart = JSON.parse(localStorage.getItem('fit3_cart')) || [];

  // ==========================================
  // DOM ELEMENTS
  // ==========================================
  const canvas = document.getElementById('hero-canvas');
  const context = canvas ? canvas.getContext('2d') : null;
  const mainImage = document.getElementById('main-product-image');
  const colorSelect = document.getElementById('color-select');
  const selectedColorName = document.getElementById('selected-color-name');
  const swatchCircles = document.querySelectorAll('.swatch-circle');
  const thumbBtns = document.querySelectorAll('.thumb-btn');
  
  const sizeSelect = document.getElementById('size-select');
  const sizeBlockBtns = document.querySelectorAll('.size-block-btn');
  
  const sizeGuideModal = document.getElementById('size-guide-modal');
  const openSizeGuideBtn = document.getElementById('open-size-guide-btn');
  const closeSizeGuideBtn = document.getElementById('close-size-guide-btn');
  
  const faqCards = document.querySelectorAll('.faq-card');
  const timelineStepItems = document.querySelectorAll('.timeline-step-item');
  
  const footerCtaBtn = document.getElementById('footer-cta-btn');
  const completeKitBtn = document.getElementById('complete-kit-btn');
  
  // Cart DOM
  const cartToggleBtn = document.getElementById('cart-toggle-btn');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartCount = document.getElementById('cart-count');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartActiveList = document.getElementById('cart-active-list');
  const cartItemsList = document.getElementById('cart-items-list');
  const emptyCartView = document.getElementById('empty-cart-view');
  const cartFooterView = document.getElementById('cart-footer-view');
  const cartSubtotal = document.getElementById('cart-subtotal');
  const cartGrandTotal = document.getElementById('cart-grand-total');
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  const checkoutBtn = document.getElementById('checkout-btn');
  const cartContinueShopping = document.getElementById('cart-continue-shopping');
  const shippingNameInput = document.getElementById('shipping-name');
  const shippingPhoneInput = document.getElementById('shipping-phone');
  const shippingAddressInput = document.getElementById('shipping-address');
  const toastContainer = document.getElementById('toast-container');

  // ==========================================
  // FRAME PRELOADER
  // ==========================================
  if (canvas && context) {
    preloadHeroSequence();
  } else {
    console.error("Canvas element not found in DOM.");
  }

  function preloadHeroSequence() {
    const progressText = document.getElementById('load-progress');
    const progressBar = document.getElementById('load-progress-bar');
    const loaderOverlay = document.getElementById('hero-loader');

    function handleFrameLoad() {
      loadedCount++;
      const percent = Math.round((loadedCount / frameCount) * 100);
      
      if (progressText) progressText.textContent = `Loading Skates... ${percent}%`;
      if (progressBar) progressBar.style.width = `${percent}%`;

      // Draw initial frames as they load to prevent flash on fast scrolls
      if (loadedCount === 1) {
        resizeCanvas();
      }

      if (loadedCount === frameCount) {
        // Complete preload
        setTimeout(() => {
          if (loaderOverlay) {
            loaderOverlay.style.opacity = '0';
            setTimeout(() => {
              loaderOverlay.style.display = 'none';
            }, 600);
          }
          // Initialize timelines once everything is loaded
          initGSAPScrollScrub();
        }, 400);
      }
    }

    // Load frames from public folder
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.onload = handleFrameLoad;
      img.onerror = () => {
        console.error(`Error loading hero frame: ezgif-frame-${i.toString().padStart(3, '0')}.png`);
        handleFrameLoad(); // still increment to avoid locking loader
      };
      img.src = `public/herosection/ezgif-frame-${i.toString().padStart(3, '0')}.png`;
      images.push(img);
    }
  }

  // ==========================================
  // CANVAS RESIZE & DRAW
  // ==========================================
  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    renderFrame(animationState.frame);
  }

  function renderFrame(frameIdx) {
    if (!canvas || !context) return;
    const img = images[frameIdx];
    if (!img || !img.complete) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Dynamic scale-to-fill aspect math
    const imgRatio = img.width / img.height;
    const canvasRatio = canvas.width / canvas.height;

    let drawWidth, drawHeight, drawX, drawY;

    if (canvasRatio > imgRatio) {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgRatio;
      drawX = 0;
      drawY = (canvas.height - drawHeight) / 2;
    } else {
      drawHeight = canvas.height;
      drawWidth = canvas.height * imgRatio;
      drawX = (canvas.width - drawWidth) / 2;
      drawY = 0;
    }

    context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  }

  // ==========================================
  // GSAP SCROLL SCRUBTIMELINES
  // ==========================================
  function initGSAPScrollScrub() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn("GSAP libraries not loaded. Scroll animations disabled.");
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Initial resize call and listener
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 1. Scrub frames on scroll
    gsap.to(animationState, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        trigger: ".hero-canvas-track",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3
      },
      onUpdate: () => renderFrame(animationState.frame)
    });

    // 2. Staggered text overlay animations
    const tlText = gsap.timeline({
      scrollTrigger: {
        trigger: ".hero-canvas-track",
        start: "top top",
        end: "bottom bottom",
        scrub: true
      }
    });

    // Animate Text Slides
    // Slide 1 (Welcome) starts visible, slides out
    tlText.to(".slide-1", { opacity: 0, y: -45, duration: 1.5 }, 0);

    // Slide 2 (Sizes) fades in at 20%, fades out at 40%
    tlText.fromTo(".slide-2", { opacity: 0, y: 45 }, { opacity: 1, y: 0, duration: 1.5 }, 2);
    tlText.to(".slide-2", { opacity: 0, y: -45, duration: 1.5 }, 4.5);

    // Slide 3 (Rubber Wheels) fades in at 50%, fades out at 70%
    tlText.fromTo(".slide-3", { opacity: 0, y: 45 }, { opacity: 1, y: 0, duration: 1.5 }, 6);
    tlText.to(".slide-3", { opacity: 0, y: -45, duration: 1.5 }, 8.5);

    // Slide 4 (Closure system) fades in at 80% to the end
    tlText.fromTo(".slide-4", { opacity: 0, y: 45 }, { opacity: 1, y: 0, duration: 1.5 }, 10);
    tlText.to(".slide-4", { opacity: 0, y: -45, duration: 1.5 }, 12.5);

    // Hide Scroll Prompt near bottom of hero
    gsap.to(".canvas-sticky-container .scroll-prompt", {
      opacity: 0,
      y: 10,
      scrollTrigger: {
        trigger: ".hero-canvas-track",
        start: "top -5%",
        end: "top -15%",
        scrub: true
      }
    });

    // 3. Immersive benefits story visual swaps
    const panels = document.querySelectorAll(".narrative-panel");
    const cards = document.querySelectorAll(".story-image-card");

    panels.forEach((panel, index) => {
      ScrollTrigger.create({
        trigger: panel,
        start: "top center",
        end: "bottom center",
        onEnter: () => activateStoryCard(index + 1),
        onEnterBack: () => activateStoryCard(index + 1)
      });
    });

    function activateStoryCard(storyId) {
      cards.forEach(card => {
        if (parseInt(card.dataset.story) === storyId) {
          card.classList.add("active");
        } else {
          card.classList.remove("active");
        }
      });
    }

    // 4. Reveal specs on scroll
    gsap.from(".specs-table-container", {
      scrollTrigger: {
        trigger: "#specifications",
        start: "top 80%",
        toggleActions: "play none none none"
      },
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power3.out"
    });

    // 5. Reveal FAQ list on scroll
    gsap.from(".faq-list", {
      scrollTrigger: {
        trigger: "#faq",
        start: "top 80%",
        toggleActions: "play none none none"
      },
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power3.out"
    });
  }

  // ==========================================
  // CONFIGURATOR COLOR SWAPPER
  // ==========================================
  function updateColorway(colorKey) {
    if (!colorways[colorKey]) return;
    selectedColor = colorKey;
    const config = colorways[colorKey];

    // Update configurator image
    mainImage.src = config.image;
    mainImage.alt = `Kids' Inline Fitness Skates Fit3 - ${config.name}`;

    // Update label text
    selectedColorName.textContent = config.name;

    // Sync select dropdown mapper
    colorSelect.value = colorKey;

    // Swatches active class
    swatchCircles.forEach(circle => {
      if (circle.dataset.value === colorKey) {
        circle.classList.add('active');
      } else {
        circle.classList.remove('active');
      }
    });

    // Thumbnails active class
    thumbBtns.forEach(btn => {
      if (btn.dataset.color === colorKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Dynamically adjust theme main primary accents
    document.documentElement.style.setProperty('--color-primary', config.primaryColor);
    document.documentElement.style.setProperty('--color-primary-hover', config.hoverColor);
    
    // Scale bounce on main image update
    gsap.fromTo(mainImage, 
      { scale: 0.95, opacity: 0.8 }, 
      { scale: 1, opacity: 1, duration: 0.4, ease: "power2.out" }
    );
  }

  colorSelect.addEventListener('change', (e) => {
    updateColorway(e.target.value);
  });

  swatchCircles.forEach(circle => {
    circle.addEventListener('click', () => {
      updateColorway(circle.dataset.value);
    });
  });

  thumbBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      updateColorway(btn.dataset.color);
    });
  });


  // ==========================================
  // CONFIGURATOR SIZE SWAPPER
  // ==========================================
  function updateSize(sizeValue) {
    selectedSize = sizeValue;
    sizeSelect.value = sizeValue;

    // Blocks active class
    sizeBlockBtns.forEach(btn => {
      if (btn.dataset.value === sizeValue) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  sizeSelect.addEventListener('change', (e) => {
    updateSize(e.target.value);
  });

  sizeBlockBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      updateSize(btn.dataset.value);
    });
  });


  // ==========================================
  // SIZE GUIDE MODAL
  // ==========================================
  function toggleSizeGuide(show) {
    if (show) {
      sizeGuideModal.classList.add('active');
    } else {
      sizeGuideModal.classList.remove('active');
    }
  }

  openSizeGuideBtn.addEventListener('click', () => toggleSizeGuide(true));
  closeSizeGuideBtn.addEventListener('click', () => toggleSizeGuide(false));
  sizeGuideModal.addEventListener('click', (e) => {
    if (e.target === sizeGuideModal) toggleSizeGuide(false);
  });


  // ==========================================
  // ADJUSTMENT TIMELINE STEPS
  // ==========================================
  timelineStepItems.forEach(item => {
    item.addEventListener('click', () => {
      timelineStepItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      const stepId = item.dataset.step;
      const adjustImage = document.getElementById('adjust-stage-image');
      if (stepId === '1') {
        adjustImage.style.transform = 'scale(1) rotate(0deg)';
      } else if (stepId === '2') {
        adjustImage.style.transform = 'scale(1.06) rotate(1.5deg)';
      } else if (stepId === '3') {
        adjustImage.style.transform = 'scale(1) rotate(-1deg)';
      }
    });
  });


  // ==========================================
  // FAQ ACCORDIONS
  // ==========================================
  faqCards.forEach(card => {
    const trigger = card.querySelector('.faq-trigger');
    const answer = card.querySelector('.faq-panel-body');

    trigger.addEventListener('click', () => {
      const isActive = card.classList.contains('active');
      
      faqCards.forEach(fc => {
        fc.classList.remove('active');
        fc.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
        fc.querySelector('.faq-panel-body').style.maxHeight = null;
      });

      if (!isActive) {
        card.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });


  // ==========================================
  // BOTTOM CTA LINKBACK
  // ==========================================
  footerCtaBtn.addEventListener('click', () => {
    const configSection = document.getElementById('configure');
    configSection.scrollIntoView({ behavior: 'smooth' });
    
    setTimeout(() => {
      const sizeOptionBox = sizeSelect.parentElement;
      sizeOptionBox.style.outline = '2.5px solid var(--color-primary)';
      sizeOptionBox.style.borderRadius = 'var(--radius-md)';
      sizeOptionBox.style.transition = 'outline 0.3s ease';
      
      setTimeout(() => {
        sizeOptionBox.style.outline = '2.5px solid transparent';
      }, 1500);
    }, 850);
  });

  completeKitBtn.addEventListener('click', () => {
    const specSection = document.getElementById('specifications');
    specSection.scrollIntoView({ behavior: 'smooth' });
    showToast("Review the technical upgrading options to complete your kit!");
  });


  // ==========================================
  // TOAST NOTIFICATIONS
  // ==========================================
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg class="toast-success-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 11 12 14 22 4"/></svg>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toastContainer.removeChild(toast);
      }, 300);
    }, 3500);
  }


  // ==========================================
  // SHOPPING CART DRAWER SYSTEM
  // ==========================================
  function updateCartUI() {
    localStorage.setItem('fit3_cart', JSON.stringify(cart));
    
    const totalCount = cart.reduce((accum, item) => accum + item.quantity, 0);
    cartCount.textContent = totalCount;

    if (cart.length === 0) {
      emptyCartView.style.display = 'flex';
      cartActiveList.style.display = 'none';
      cartFooterView.style.display = 'none';
    } else {
      emptyCartView.style.display = 'none';
      cartActiveList.style.display = 'block';
      cartFooterView.style.display = 'flex';

      cartItemsList.innerHTML = '';
      let subtotalVal = 0;

      cart.forEach((item, index) => {
        const itemSum = item.price * item.quantity;
        subtotalVal += itemSum;

        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';
        cartItemDiv.innerHTML = `
          <div class="cart-item-img">
            <img src="${item.image}" alt="${item.name}">
          </div>
          <div class="cart-item-details">
            <h4 class="cart-item-title">${item.name}</h4>
            <p class="cart-item-options">Colour: ${item.colorName} | Size: ${item.size}</p>
            <div class="cart-item-price-row">
              <span class="cart-item-price">₹${itemSum.toLocaleString('en-IN')}</span>
              <button class="remove-item-btn" data-index="${index}">Remove</button>
            </div>
          </div>
        `;
        cartItemsList.appendChild(cartItemDiv);
      });

      cartSubtotal.textContent = `₹${subtotalVal.toLocaleString('en-IN')}`;
      cartGrandTotal.textContent = `₹${subtotalVal.toLocaleString('en-IN')}`;

      const removeBtns = cartItemsList.querySelectorAll('.remove-item-btn');
      removeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.target.dataset.index);
          cart.splice(idx, 1);
          updateCartUI();
          showToast("Item removed from cart");
        });
      });
    }
  }

  function toggleCartDrawer(show) {
    if (show) {
      cartOverlay.classList.add('active');
    } else {
      cartOverlay.classList.remove('active');
    }
  }

  cartToggleBtn.addEventListener('click', () => toggleCartDrawer(true));
  cartCloseBtn.addEventListener('click', () => toggleCartDrawer(false));
  cartContinueShopping.addEventListener('click', () => toggleCartDrawer(false));
  cartOverlay.addEventListener('click', (e) => {
    if (e.target === cartOverlay) toggleCartDrawer(false);
  });

  // Add to Cart Click
  addToCartBtn.addEventListener('click', () => {
    if (!selectedSize) {
      showToast("Please choose a shoe size first!");
      
      const sizeBox = sizeSelect.parentElement;
      sizeBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      setTimeout(() => {
        sizeBox.style.outline = '2.5px solid var(--color-primary)';
        sizeBox.style.borderRadius = 'var(--radius-md)';
        sizeBox.style.transition = 'outline 0.3s ease';
        setTimeout(() => {
          sizeBox.style.outline = '2.5px solid transparent';
        }, 1500);
      }, 500);
      return;
    }

    const config = colorways[selectedColor];
    const newItem = {
      id: `fit3-canvas-${selectedColor}-${selectedSize.replace(/\s+/g, '-').toLowerCase()}`,
      name: "Kids' Inline Fitness Skates Fit3",
      price: 3299,
      color: selectedColor,
      colorName: config.name.split(' ')[0],
      size: selectedSize,
      image: config.image,
      quantity: 1
    };

    const duplicateIndex = cart.findIndex(item => item.id === newItem.id);
    if (duplicateIndex > -1) {
      cart[duplicateIndex].quantity += 1;
    } else {
      cart.push(newItem);
    }

    updateCartUI();
    toggleCartDrawer(true);
    showToast(`Added Skates (Size ${selectedSize}) to cart!`);
  });

  // Complete checkout form click
  checkoutBtn.addEventListener('click', () => {
    if (!shippingNameInput.value.trim()) {
      shippingNameInput.focus();
      showToast("Please enter your name.");
      return;
    }
    if (!shippingPhoneInput.value.trim() || shippingPhoneInput.value.length < 10) {
      shippingPhoneInput.focus();
      showToast("Please enter a valid mobile number.");
      return;
    }
    if (!shippingAddressInput.value.trim()) {
      shippingAddressInput.focus();
      showToast("Please enter a shipping address.");
      return;
    }

    checkoutBtn.disabled = true;
    checkoutBtn.textContent = "Processing order...";

    setTimeout(() => {
      const orderParentName = shippingNameInput.value.trim();
      
      cart = [];
      updateCartUI();
      toggleCartDrawer(false);
      
      shippingNameInput.value = '';
      shippingPhoneInput.value = '';
      shippingAddressInput.value = '';
      
      checkoutBtn.disabled = false;
      checkoutBtn.textContent = "Complete Checkout (₹1,099 Now)";

      alert(`🎉 Thank you, ${orderParentName}! Your order has been placed successfully!\n\nPayable amount: ₹1,099 via the secure link sent to your number. The rest ₹2,200 is due on Cash on Delivery.\n\nWe will send tracking details shortly!`);
      showToast("Order Placed successfully! Thank you!");
    }, 1500);
  });

  // Initial UI draw
  updateCartUI();
  console.log("Fit3 Skates Apple-style Canvas Engine fully running.");
});
