document.addEventListener('DOMContentLoaded', function(){
  // Set year in footer
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  const form = document.getElementById('contactForm');
  const feedback = document.getElementById('formFeedback');

  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      feedback.textContent = '';
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();

      if(!name || !email || !message){
        feedback.textContent = 'Please complete all required fields.';
        return;
      }

      // Basic email pattern
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(!emailPattern.test(email)){
        feedback.textContent = 'Please enter a valid email address.';
        return;
      }

      // Send directly to backend (FormSubmit service)
      feedback.textContent = 'Sending your booking...';
      
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if(form.phone && form.phone.value.trim()) formData.append('phone', form.phone.value.trim());
      formData.append('message', message);
      formData.append('_subject', `New booking request from ${name}`);
      formData.append('_captcha', 'false');
      
      fetch('https://formsubmit.co/Letsieteboho7@gmail.com', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if(response.ok){
          feedback.textContent = 'Thanks — your booking has been sent successfully!';
          form.reset();
        } else {
          feedback.textContent = 'Error sending booking. Please try again.';
        }
      })
      .catch(err => {
        console.error(err);
        feedback.textContent = 'Error sending booking. Please try again.';
      });
    });
  }

  // Reveal animations using IntersectionObserver
  (function(){
    const selectors = [
      '.hero-copy',
      '.hero-image',
      '.card',
      '#services h2',
      '#about h2',
      '#testimonials h2',
      '.testimonials blockquote',
      '.contact .form-grid',
      '.footer-inner'
    ];

    const els = Array.from(document.querySelectorAll(selectors.join(',')));
    // Add base reveal class so CSS hides them initially
    els.forEach((el, i)=>{
      el.classList.add('reveal');
      // small data-delay to create a pleasant stagger
      el.setAttribute('data-delay', String((i % 4) + 1));
    });

    if('IntersectionObserver' in window){
      const io = new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){
            entry.target.classList.add('active');
            // start hero float when visible
            if(entry.target.classList.contains('hero-image')) entry.target.classList.add('float');
            io.unobserve(entry.target);
          }
        });
      },{threshold:0.12});

      els.forEach(el=>io.observe(el));
    } else {
      // fallback: reveal all
      els.forEach(el=>{el.classList.add('active'); if(el.classList.contains('hero-image')) el.classList.add('float')});
    }
  })();

  // Sample the header logo image and set CSS accent variables to match
  (function(){
    const img = document.querySelector('.logo-img');
    if(!img) return;

    // Wait for image to load
    function applySampledColors(rgb){
      const [r,g,b] = rgb;
      const toHex = (n) => n.toString(16).padStart(2,'0');
      const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

      // Derive darker shade
      const darker = (v, amt=0.86) => Math.max(0, Math.min(255, Math.round(v*amt)));
      const r2 = darker(r), g2 = darker(g), b2 = darker(b);
      const hexDark = `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`;

      // Derive warm accent by shifting toward orange
      const warm = (v, amt=1.08) => Math.max(0, Math.min(255, Math.round(v*amt)));
      const r3 = Math.min(255, warm(r,1.12));
      const g3 = Math.max(0, Math.round(g*0.78));
      const b3 = Math.max(0, Math.round(b*0.5));
      const hexWarm = `#${toHex(r3)}${toHex(g3)}${toHex(b3)}`;

      document.documentElement.style.setProperty('--accent', hex);
      document.documentElement.style.setProperty('--accent-600', hexDark);
      document.documentElement.style.setProperty('--accent-2', hexWarm);
    }

    function sampleImage(image){
      try{
        const canvas = document.createElement('canvas');
        const w = 40, h = 40;
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, w, h);
        const data = ctx.getImageData(0,0,w,h).data;
        let r=0,g=0,b=0,count=0;
        for(let i=0;i<data.length;i+=4){
          const alpha = data[i+3];
          if(alpha<64) continue; // ignore transparent
          r += data[i]; g += data[i+1]; b += data[i+2]; count++;
        }
        if(count===0) return null;
        r = Math.round(r/count); g = Math.round(g/count); b = Math.round(b/count);
        return [r,g,b];
      }catch(e){
        return null;
      }
    }

    if(img.complete && img.naturalWidth){
      const rgb = sampleImage(img);
      if(rgb) applySampledColors(rgb);
    } else {
      img.addEventListener('load', function(){
        const rgb = sampleImage(img);
        if(rgb) applySampledColors(rgb);
      });
    }
  })();

    // Mobile hamburger toggle
    (function(){
      const hamburger = document.querySelector('.hamburger');
      const mainNav = document.getElementById('mainNav');
      if(!hamburger || !mainNav) return;

      hamburger.addEventListener('click', function(e){
        const expanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', String(!expanded));
        mainNav.classList.toggle('open');
      });

      // Close when clicking outside
      document.addEventListener('click', function(e){
        if(mainNav.classList.contains('open') && !mainNav.contains(e.target) && !hamburger.contains(e.target)){
          mainNav.classList.remove('open');
          hamburger.setAttribute('aria-expanded','false');
        }
      });

      // Close on nav link click (helpful on mobile)
      Array.from(mainNav.querySelectorAll('a')).forEach(a=>a.addEventListener('click', ()=>{
        mainNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded','false');
      }));
    })();
});
