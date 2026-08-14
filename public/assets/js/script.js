function togglePasswordVisibility(eye) {
  const input = eye.previousElementSibling; // Mendapatkan input yang sesuai
  const currentSrc = eye.getAttribute("src");

  if (currentSrc === "../assets/icons/eye-off.svg") {
      eye.setAttribute("src", "../assets/icons/eye.svg"); // Mengubah ikon menjadi eye-on
      input.setAttribute("type", "text"); // Mengubah tipe input menjadi text
  } else {
      eye.setAttribute("src", "../assets/icons/eye-off.svg"); // Mengubah ikon menjadi eye-off
      input.setAttribute("type", "password"); // Mengubah tipe input menjadi password
  }
}

let currentIndex = 0;
const slidesContainer = document.getElementById("slides");
const slides = document.querySelectorAll(".slides img");
const totalSlides = slides.length;

function carousel() {
  currentIndex = (currentIndex + 1) % totalSlides;
  const offset = -currentIndex * 100;
  slidesContainer.style.transform = `translateX(${offset}%)`;
}

function registTransition() {
  const container = document.getElementById("ads-area");
  if (
    container.style.transform === "translateX(0px)" ||
    container.style.transform === ""
  ) {
    container.style.transform = "translateX(-100%)";
  } else {
    container.style.transform = "translateX(0)";
  }
}

function PopUp() {
  const popUps = document.querySelectorAll(".popUp");
  popUps.forEach((popUp) => {
    if (popUp.style.display === "none" || popUp.style.display === "") {
      popUp.style.display = "flex";
    } else {
      popUp.style.display = "none";
    }
  });
}

function sidebarToggle() {
  const sidebar = document.getElementById("sidebar");
  sidebar.style.display = "flex";
  if (sidebar.style.width === "0px" || sidebar.style.width === "") {
    sidebar.style.width = "220px";
  } else {
    sidebar.style.width = "0px";
  }
}

function adminSidebarToggle() {
  document
    .getElementById("toggle-sidebar")
    .addEventListener("click", function () {
      console.log("clicked");
      const sidebar = document.getElementById("sidebar");
      const content = document.getElementById("main-content");
      sidebar.classList.toggle("toggled");
      content.classList.toggle("toggled");
    });
}

function duplicateElement(numberOfDuplicate) {
  let numberOfDuplicates = numberOfDuplicate;
  const elementContainer = document.getElementById("elementContainer");
  const originalElement = elementContainer.querySelector(".element");

  for (let i = 0; i < numberOfDuplicates - 1; i++) {
    const newCard = originalElement.cloneNode(true);
    elementContainer.appendChild(newCard);
  }
}
