

document.addEventListener("DOMContentLoaded", () => {

  const counters = document.querySelectorAll('.counter');

counters.forEach(counter => {
    const updateCounter = () => {
        const target = +counter.getAttribute('data-target');
        const current = +counter.innerText.replace(/\D/g, '');
        const increment = Math.ceil(target / 100);

        if (current < target) {
            counter.innerText = current + increment;
            setTimeout(updateCounter, 20);
        } else {
            counter.innerText = target + counter.innerText.replace(/[0-9]/g, '');
        }
    };
    updateCounter();
});


});





// .............................................//.......................................//...............................
document.addEventListener("DOMContentLoaded", () => {

  const achievementSection = document.getElementById("achievementSection");
  const achievementCounters = achievementSection.querySelectorAll(".counter");
  let hasAnimated = false;

  function startAchievementCounters() {
    if (hasAnimated) return;
    hasAnimated = true;

    achievementCounters.forEach(counter => {
      const target = Number(counter.dataset.target);
      const isPercent = counter.innerText.includes("%");
      let count = 0;

      const speed = 100; // government-style smooth speed

      function update() {
        const increment = Math.ceil(target / speed);
        count += increment;

        if (count >= target) {
          counter.innerText = isPercent
            ? target + "%"
            : target + "+";
        } else {
          counter.innerText = isPercent
            ? count + "%"
            : count + "+";
          requestAnimationFrame(update);
        }
      }

      update();
    });
  }

  /* Scroll Trigger */
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      startAchievementCounters();
      observer.disconnect();
    }
  }, { threshold: 0.3 });

  observer.observe(achievementSection);

});




function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('show');
}



