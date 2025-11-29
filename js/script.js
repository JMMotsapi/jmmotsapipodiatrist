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
    // Sampling is opt-in: only run when <html data-sample-colors="true"> is set.
    const shouldSample = document.documentElement.getAttribute('data-sample-colors') === 'true';
    if(!shouldSample){
      console.info('Color sampling disabled (data-sample-colors not set to true).');
      return;
    }

    const img = document.querySelector('.logo-img');
    if(!img) return;

    // Only attempt canvas sampling when the image is same-origin to avoid CORS/tainting issues
    try{
      const imgUrl = new URL(img.getAttribute('src'), location.href);
      if(imgUrl.origin !== location.origin){
        console.warn('Logo image is not same-origin; skipping color sampling to avoid canvas tainting.', imgUrl.origin);
        return; // don't attempt sampling across origins
      }
    }catch(e){
      // If URL parsing fails, skip sampling to be safe
      console.warn('Failed to parse logo URL — skipping sampling.', e);
      return;
    }

    function toHex(n){ return n.toString(16).padStart(2,'0'); }

    function applySampledColors(rgb, bgRgb){
      const [r,g,b] = rgb;
      const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

      // darker shade
      const darker = (v, amt=0.86) => Math.max(0, Math.min(255, Math.round(v*amt)));
      const hexDark = `#${toHex(darker(r))}${toHex(darker(g))}${toHex(darker(b))}`;

      // light complementary tint
      const tint = (v, amt=1.12) => Math.max(0, Math.min(255, Math.round(v*amt)));
      const hexTint = `#${toHex(tint(r))}${toHex(Math.round(g*0.92))}${toHex(Math.round(b*0.9))}`;

      document.documentElement.style.setProperty('--accent', hex);
      document.documentElement.style.setProperty('--accent-600', hexDark);
      document.documentElement.style.setProperty('--accent-2', hexTint);

      // If we were able to sample a background color, set header bg
      if(Array.isArray(bgRgb)){
        const [br,bg,bb] = bgRgb;
        const hexBg = `#${toHex(br)}${toHex(bg)}${toHex(bb)}`;
        document.documentElement.style.setProperty('--header-bg', hexBg);
      }
    }

    function sampleImageAverage(image){
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
          if(alpha<64) continue;
          r += data[i]; g += data[i+1]; b += data[i+2]; count++;
        }
        if(count===0) return null;
        return [Math.round(r/count), Math.round(g/count), Math.round(b/count)];
      }catch(e){ return null; }
    }

    // Try to sample a likely background pixel (top-left area) to capture the gray box
    function sampleBackgroundPixel(image){
      try{
        const canvas = document.createElement('canvas');
        const w = 80, h = 40; // wider to capture header-area background
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, w, h);
        const imgData = ctx.getImageData(0,0,w,h).data;
        // scan rows near top and around center for a non-transparent pixel
        for(let y=2;y<10;y++){
          for(let x=2;x<w-2;x+=4){
            const idx = (y*w + x)*4;
            const a = imgData[idx+3];
            if(a>200){
              const r = imgData[idx], g = imgData[idx+1], b = imgData[idx+2];
              // ignore pure white or pure black
              if(!(r>250 && g>250 && b>250) && !(r<10 && g<10 && b<10)) return [r,g,b];
            }
          }
        }
        // fallback: sample center-left area
        for(let y=Math.floor(h/4); y<Math.floor(h/2); y++){
          for(let x=2;x<10;x++){
            const idx = (y*w + x)*4;
            const a = imgData[idx+3];
            if(a>200){ const r=imgData[idx], g=imgData[idx+1], b=imgData[idx+2]; return [r,g,b]; }
          }
        }
        return null;
      }catch(e){ return null; }
    }

    function handleImage(image){
      const avg = sampleImageAverage(image);
      const bg = sampleBackgroundPixel(image) || avg;
      // Only apply sampled colors when we have a valid average and it's not low-chroma (gray)
      if(Array.isArray(avg) && avg.length === 3){
        const [r,g,b] = avg;
        const chroma = Math.max(r,g,b) - Math.min(r,g,b);
        // If chroma is very low the sampled color is near-gray; ignore it to preserve theme
        if(chroma < 18){
          console.info('Sampled logo color is low-chroma (near-gray); skipping sampled theme to preserve brand colors.');
          return;
        }
        applySampledColors(avg, bg);
      } else {
        console.info('Logo sampling returned no usable average color; keeping default theme variables.');
      }
    }

    if(img.complete && img.naturalWidth){ handleImage(img); }
    else img.addEventListener('load', function(){ handleImage(img); });
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
