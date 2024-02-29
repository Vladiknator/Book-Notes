function updateStars(starNum) {
  console.log(`stars ${starNum}`);
  const stars = ['s1', 's2', 's3', 's4', 's5'];
  let index = 0;
  stars.forEach((e) => {
    const star = document.getElementById(e);
    if (index < starNum) {
      star.classList.add('star-gold');
    } else {
      star.classList.remove('star-gold');
    }
    index += 1;
  });
}

function resetStars() {
  updateStars(document.querySelector('input[name="stars"]:checked').value);
}

window.addEventListener('load', () => {
  resetStars();
});
