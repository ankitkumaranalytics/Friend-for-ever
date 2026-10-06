"use strict";

const opening = document.querySelector("#opening");
const mainContent = document.querySelector("#main-content");
const enterButton = document.querySelector("#enterButton");
const skipLink = document.querySelector(".skip-link");
const musicFloat = document.querySelector(".music-float");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const heartStage = document.querySelector(".heart-stage");
const heartObject = document.querySelector(".heart-object");

if (heartStage && heartObject && !reducedMotion.matches && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  heartStage.addEventListener("pointermove", (event) => {
    const bounds = heartStage.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
    heartObject.style.setProperty("--tilt-x", `${vertical * -14}deg`);
    heartObject.style.setProperty("--tilt-y", `${horizontal * 18 - 12}deg`);
  });

  heartStage.addEventListener("pointerleave", () => {
    heartObject.style.removeProperty("--tilt-x");
    heartObject.style.removeProperty("--tilt-y");
  });
}

enterButton.focus();
opening.addEventListener("keydown", (event) => {
  if (event.key === "Tab") {
    event.preventDefault();
    enterButton.focus();
  }
});

function revealVisibleContent() {
  document.querySelectorAll("[data-reveal]").forEach((element) => {
    const bounds = element.getBoundingClientRect();
    if (bounds.top < window.innerHeight * 0.92) {
      element.classList.add("is-visible");
    }
  });
}

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });

  document.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));
} else {
  document.querySelectorAll("[data-reveal]").forEach((element) => element.classList.add("is-visible"));
}

function sendHearts() {
  if (reducedMotion.matches) return;

  const symbols = ["♡", "✦", "✿"];
  for (let index = 0; index < 10; index += 1) {
    const petal = document.createElement("span");
    petal.className = "floating-petal";
    petal.setAttribute("aria-hidden", "true");
    petal.textContent = symbols[index % symbols.length];
    petal.style.setProperty("--petal-x", `${8 + Math.random() * 84}vw`);
    petal.style.setProperty("--petal-delay", `${Math.random() * 0.55}s`);
    document.body.append(petal);
    petal.addEventListener("animationend", () => petal.remove(), { once: true });
  }
}

enterButton.addEventListener("click", () => {
  enterButton.classList.add("is-entering");
  sendHearts();
  window.setTimeout(() => {
    opening.classList.add("opening-gone");
    opening.setAttribute("aria-hidden", "true");
    mainContent.setAttribute("aria-hidden", "false");
    mainContent.inert = false;
    skipLink.inert = false;
    musicFloat.inert = false;
    mainContent.querySelector("#home h1").setAttribute("tabindex", "-1");
    mainContent.querySelector("#home h1").focus({ preventScroll: true });
    revealVisibleContent();
    window.setTimeout(() => opening.remove(), 950);
  }, reducedMotion.matches ? 0 : 320);
});

const progressBar = document.querySelector("#pageProgress");
let progressFrame = 0;
window.addEventListener("scroll", () => {
  if (progressFrame) return;
  progressFrame = window.requestAnimationFrame(() => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = `scaleX(${scrollable > 0 ? window.scrollY / scrollable : 0})`;
    progressFrame = 0;
  });
}, { passive: true });

const sweetMessage = document.querySelector("#sweetMessage");
document.querySelectorAll(".sweet-item").forEach((button) => {
  button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", () => {
    document.querySelectorAll(".sweet-item").forEach((item) => {
      const selected = item === button;
      item.classList.toggle("is-selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    sweetMessage.textContent = button.dataset.message;
  });
});

const surpriseButton = document.querySelector("#surpriseButton");
const sweetSurprise = document.querySelector("#sweetSurprise");
surpriseButton.addEventListener("click", () => {
  const isOpen = surpriseButton.getAttribute("aria-expanded") === "true";
  surpriseButton.setAttribute("aria-expanded", String(!isOpen));
  sweetSurprise.hidden = isOpen;
  surpriseButton.innerHTML = isOpen
    ? 'Open your sweet surprise <span aria-hidden="true">✳</span>'
    : 'Close the sweet surprise <span aria-hidden="true">×</span>';
});

const memoryLightbox = document.querySelector("#memoryLightbox");
const lightboxMedia = document.querySelector("#lightboxMedia");
const openMemory = document.querySelector("#openMemory");
const closeMemory = document.querySelector("#closeMemory");
const memoryUpload = document.querySelector("#memoryUpload");
const memoryGalleryGrid = document.querySelector("#memoryGalleryGrid");

function openMemoryLightbox({ type = "image", src, alt = "Memory media", poster = "" }) {
  const mediaWrapper = lightboxMedia;
  mediaWrapper.innerHTML = "";

  if (type === "video") {
    const video = document.createElement("video");
    video.src = src;
    video.controls = true;
    video.playsInline = true;
    video.autoplay = false;
    video.preload = "metadata";
    if (poster) video.poster = poster;
    mediaWrapper.append(video);
  } else {
    const image = document.createElement("img");
    image.src = src;
    image.alt = alt;
    mediaWrapper.append(image);
  }

  memoryLightbox.showModal();
  closeMemory.focus();
}

openMemory.addEventListener("click", () => {
  openMemoryLightbox({
    type: "image",
    src: "photos/IMG_20261003_005819_200.jpg",
    alt: "A photo she shared with me"
  });
});

closeMemory.addEventListener("click", () => memoryLightbox.close());
memoryLightbox.addEventListener("cancel", (event) => {
  event.preventDefault();
  memoryLightbox.close();
});
memoryLightbox.addEventListener("keydown", (event) => {
  if (event.key === "Escape") memoryLightbox.close();
});
memoryLightbox.addEventListener("close", () => {
  const currentFocus = document.activeElement;
  if (currentFocus && currentFocus !== document.body) {
    openMemory.focus();
  }
});
memoryLightbox.addEventListener("click", (event) => {
  if (event.target === memoryLightbox) memoryLightbox.close();
});

memoryGalleryGrid.querySelectorAll(".gallery-card").forEach((card) => {
  card.addEventListener("click", (event) => {
    const video = card.querySelector("video");
    if (video) {
      if (event.target === video || video.contains(event.target)) return;

      openMemoryLightbox({
        type: "video",
        src: video.querySelector("source")?.src || video.src,
        poster: video.poster,
        alt: "Our video memory"
      });
      return;
    }

    const image = card.querySelector("img");
    if (image) {
      openMemoryLightbox({
        type: "image",
        src: image.src,
        alt: image.alt || "Memory image"
      });
    }
  });
});

const answerCopy = {
  "of-course": "Yes—together, one step at a time. ♡",
  "lets-see": "One day at a time. We'll keep moving forward together.",
  maybe: "That's okay. We'll keep talking and take things as they come."
};
const answerResponse = document.querySelector("#answerResponse");

document.querySelectorAll(".answer-button").forEach((button) => {
  button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", () => {
    document.querySelectorAll(".answer-button").forEach((option) => {
      option.setAttribute("aria-pressed", String(option === button));
    });
    answerResponse.textContent = answerCopy[button.dataset.answer];
  });
});

const secretOverlay = document.querySelector("#secretOverlay");
const secretHeart = document.querySelector("#secretHeart");
const closeSecret = document.querySelector("#closeSecret");
let secretClicks = 0;
let secretReturnFocus = null;

function addGalleryImage(file) {
  if (!file || !file.type.startsWith("image/")) return;

  const objectUrl = URL.createObjectURL(file);
  const figure = document.createElement("figure");
  figure.className = "gallery-card";

  const img = document.createElement("img");
  img.src = objectUrl;
  img.alt = file.name;
  img.loading = "lazy";

  const caption = document.createElement("figcaption");
  caption.textContent = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");

  figure.append(img, caption);
  memoryGalleryGrid.prepend(figure);
}

memoryUpload.addEventListener("change", (event) => {
  const files = Array.from(event.target.files || []);
  files.forEach(addGalleryImage);
  event.target.value = "";
});

function closeSecretNote() {
  secretOverlay.hidden = true;
  document.body.style.removeProperty("overflow");
  if (secretReturnFocus instanceof HTMLElement) secretReturnFocus.focus();
}

secretHeart.addEventListener("click", () => {
  secretClicks += 1;
  if (secretClicks < 5) return;

  secretClicks = 0;
  secretReturnFocus = secretHeart;
  secretOverlay.hidden = false;
  document.body.style.overflow = "hidden";
  closeSecret.focus();
});

closeSecret.addEventListener("click", closeSecretNote);
secretOverlay.addEventListener("click", (event) => {
  if (event.target === secretOverlay) closeSecretNote();
});
secretOverlay.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSecretNote();
    return;
  }

  if (event.key !== "Tab") return;
  const buttons = [closeSecret];
  if (event.shiftKey && document.activeElement === buttons[0]) {
    event.preventDefault();
    buttons[buttons.length - 1].focus();
  } else if (!event.shiftKey && document.activeElement === buttons[buttons.length - 1]) {
    event.preventDefault();
    buttons[0].focus();
  }
});
