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
});
