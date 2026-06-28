/* Bienvenido al Script de mi Portafolio :]
   Toda la interactividad del sitio está organizada por bloques.
   Cada bloque es independiente: puedes borrar uno sin romper los demás. */

document.addEventListener('DOMContentLoaded', () => {

  /* Bloque de utilidades y deteción de entorno*/
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (isTouchDevice) {
    // En móviles/tablets deja el cursor del sistema normal.
    document.body.classList.add('touch-device');
  }

  /* 
     Iconos de Lucide.
     Esta parte, renderiza todos los <i data-lucide="..."> como SVG. */
  if (window.lucide) {
    lucide.createIcons();
  }

  /* ---------------------------------------------------------------
     2. AÑO ACTUAL EN EL FOOTER
  --------------------------------------------------------------- */
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* =================================================================
     3. CURSOR PERSONALIZADO
     - cursorDot: punto que sigue al mouse con precisión.
     - cursorRing: anillo con "lag" (interpolación) para sensación
       elástica. Cambia de tamaño/color sobre elementos [data-cursor].
  ================================================================= */
  if (!isTouchDevice) {
    const cursorDot  = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX  = mouseX;
    let ringY  = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    // Bucle de animación: el anillo "persigue" al punto con suavizado (lerp).
    function animateRing() {
      const ease = 0.18;
      ringX += (mouseX - ringX) * ease;
      ringY += (mouseY - ringY) * ease;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Estado "hover": cualquier elemento marcado con data-cursor
    // agranda el anillo y lo tiñe de dorado.
    document.querySelectorAll('[data-cursor]').forEach((el) => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('is-hovering'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('is-hovering'));
    });

    // Estado "press": feedback visual al hacer clic.
    window.addEventListener('mousedown', () => cursorRing.classList.add('is-pressing'));
    window.addEventListener('mouseup',   () => cursorRing.classList.remove('is-pressing'));

    // Ocultar el cursor personalizado si el mouse sale de la ventana.
    document.addEventListener('mouseleave', () => document.body.classList.add('cursor-hidden'));
    document.addEventListener('mouseenter', () => document.body.classList.remove('cursor-hidden'));
  }


  /* =================================================================
     4. FONDO ANIMADO — formas geométricas tipo "constelación"
     Dibuja puntos que flotan suavemente y se conectan con líneas
     finas cuando están cerca, generando un fondo vivo pero discreto.
  ================================================================= */
  const canvas = document.getElementById('bg-canvas');

  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let width, height, points;

    // Cantidad de puntos proporcional al tamaño de pantalla
    // (más densidad en monitores grandes, más ligero en móviles).
    function getPointCount() {
      const area = window.innerWidth * window.innerHeight;
      return Math.min(70, Math.max(24, Math.floor(area / 28000)));
    }

    function createPoints() {
      const count = getPointCount();
      points = Array.from({ length: count }, () => ({
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        amplitude: 18 + Math.random() * 38,
        phase: Math.random() * Math.PI * 2,
        speed: 0.08 + Math.random() * 0.12,
        radius: 1 + Math.random() * 1.4,
      }));
    }

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      createPoints();
    }
    resize();
    window.addEventListener('resize', resize);

    const LINK_DISTANCE = 150; // distancia máxima para dibujar una línea entre dos puntos

    function draw(t) {
      ctx.clearRect(0, 0, width, height);

      // Posición actual de cada punto (oscilación suave en X e Y).
      const current = points.map((p) => ({
        x: p.baseX + Math.cos(t * p.speed + p.phase) * p.amplitude,
        y: p.baseY + Math.sin(t * p.speed + p.phase) * p.amplitude,
        radius: p.radius,
      }));

      // Líneas de conexión (estilo "circuito"), muy sutiles.
      for (let i = 0; i < current.length; i++) {
        for (let j = i + 1; j < current.length; j++) {
          const dx = current[i].x - current[j].x;
          const dy = current[i].y - current[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DISTANCE) {
            const opacity = (1 - dist / LINK_DISTANCE) * 0.12;
            ctx.strokeStyle = `rgba(205, 160, 57, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(current[i].x, current[i].y);
            ctx.lineTo(current[j].x, current[j].y);
            ctx.stroke();
          }
        }
      }

      // Puntos.
      current.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(243, 241, 236, 0.18)';
        ctx.fill();
      });
    }

    let rafId;
    function loop(timestamp) {
      draw(timestamp / 1000);
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);

    // Pausa la animación cuando la pestaña no está visible (ahorra batería/CPU).
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        rafId = requestAnimationFrame(loop);
      }
    });
  }


  /* =================================================================
     5. HEADER — fondo más opaco al hacer scroll
  ================================================================= */
  const header = document.getElementById('site-header');
  function updateHeaderOnScroll() {
    if (window.scrollY > 40) {
      header.classList.add('bg-ink/90', 'border-line');
      header.classList.remove('bg-ink/60', 'border-line/60');
    } else {
      header.classList.add('bg-ink/60', 'border-line/60');
      header.classList.remove('bg-ink/90', 'border-line');
    }
  }
  updateHeaderOnScroll();
  window.addEventListener('scroll', updateHeaderOnScroll, { passive: true });


  /* =================================================================
     6. MENÚ MÓVIL (hamburguesa animada)
  ================================================================= */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  function openMobileMenu() {
    mobileMenu.classList.add('is-open');
    menuToggle.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Cerrar menú');
    document.body.style.overflow = 'hidden'; // evita scroll de fondo
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('is-open');
    menuToggle.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menú');
    document.body.style.overflow = '';
  }

  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.contains('is-open') ? closeMobileMenu() : openMobileMenu();
  });

  // Cierra el menú al elegir un enlace.
  document.querySelectorAll('[data-nav-mobile]').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Cierra el menú con la tecla Escape.
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });


  /* =================================================================
     7. ANIMACIONES DE ENTRADA (scroll-reveal)
     Cualquier elemento con la clase .reveal aparece con fade-in +
     slide-up cuando entra en el viewport. El hero se anima apenas
     carga la página (sin esperar scroll), con un pequeño desfase
     entre elementos para un efecto escalonado.
  ================================================================= */
  const revealEls = document.querySelectorAll('.reveal');

  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add('in-view'));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    revealEls.forEach((el) => observer.observe(el));

    // Animación de entrada inmediata para el hero (sección #inicio),
    // con un pequeño retraso escalonado entre cada elemento.
    const heroReveals = document.querySelectorAll('#inicio .reveal');
    heroReveals.forEach((el, i) => {
      setTimeout(() => el.classList.add('in-view'), 120 + i * 110);
    });
  }


  /* =================================================================
     8. ENLACE ACTIVO EN LA NAVEGACIÓN
     Resalta en dorado el enlace del header correspondiente a la
     sección visible mientras el usuario hace scroll.
  ================================================================= */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('[data-nav]');

  if (sections.length && navLinks.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((link) => {
              link.classList.toggle(
                'active',
                link.getAttribute('href') === `#${entry.target.id}`
              );
            });
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px' } // se activa cuando la sección cruza el centro de la pantalla
    );

    sections.forEach((section) => navObserver.observe(section));
  }

});
