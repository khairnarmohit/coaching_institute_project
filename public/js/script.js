

document.addEventListener("DOMContentLoaded", () => {

  const counters = document.querySelectorAll(".counter");

  counters.forEach(counter => {
    const target = Number(counter.dataset.target);
    const isPercent = counter.innerText.includes("%");
    let count = 0;

    const speed = 80; // lower = faster

    function updateCounter() {
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
        requestAnimationFrame(updateCounter);
      }
    }

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



