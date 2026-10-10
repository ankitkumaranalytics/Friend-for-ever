"use strict";

const opening = document.querySelector("#opening");
const mainContent = document.querySelector("#main-content");
const enterButton = document.querySelector("#enterButton");
const skipLink = document.querySelector(".skip-link");
const musicFloat = document.querySelector("#musicFloat");
const proposalMusic = document.querySelector("#proposalMusic");
const filmMusicToggle = document.querySelector("#filmMusicToggle");
const filmMusicStatus = document.querySelector("#filmMusicStatus");
const musicWelcomeStatus = document.querySelector("#musicWelcomeStatus");
const songPlayButton = document.querySelector("#songPlayButton");
const songMusicStatus = document.querySelector("#songMusicStatus");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const heartStage = document.querySelector(".heart-stage");
const heartObject = document.querySelector(".heart-object");
const openingStars = document.querySelector("#openingStars");

if (reducedMotion.matches) {
  document.querySelectorAll("animateMotion").forEach((animation) => animation.remove());
}

if (openingStars) {
  const stars = document.createDocumentFragment();
  for (let index = 0; index < 34; index += 1) {
    const star = document.createElement("span");
    star.className = "opening-star";
    star.setAttribute("aria-hidden", "true");
    star.style.setProperty("--star-x", `${Math.random() * 100}%`);
    star.style.setProperty("--star-y", `${Math.random() * 100}%`);
    star.style.setProperty("--star-delay", `${Math.random() * 5}s`);
    star.style.setProperty("--star-duration", `${3 + Math.random() * 4}s`);
    stars.append(star);
  }
  openingStars.append(stars);
}

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

let musicFadeFrame = 0;

function updateMusicControls() {
  const isPlaying = !proposalMusic.paused
    && !proposalMusic.muted
    && proposalMusic.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
  const icon = isPlaying ? "🎵" : "🔇";
  const label = isPlaying ? "Pause your song" : "Play your song";

  [musicFloat, filmMusicToggle].forEach((control) => {
    control.textContent = icon;
    control.setAttribute("aria-label", label);
    control.setAttribute("aria-pressed", String(isPlaying));
  });
  songPlayButton.setAttribute("aria-pressed", String(isPlaying));
  songPlayButton.textContent = isPlaying ? "Pause our song" : "Play our song";
}

function setMusicStatus(message) {
  [musicWelcomeStatus, songMusicStatus, filmMusicStatus].forEach((status) => {
    status.textContent = message;
    status.hidden = !message;
  });
}

function fadeMusicIn() {
  window.cancelAnimationFrame(musicFadeFrame);
  const startingVolume = proposalMusic.volume;
  const startTime = performance.now();
  const fadeDuration = 2200;

  function step(now) {
    const progress = Math.min((now - startTime) / fadeDuration, 1);
    const easedProgress = 1 - (1 - progress) ** 3;
    proposalMusic.volume = startingVolume + (0.3 - startingVolume) * easedProgress;
    if (progress < 1) {
      musicFadeFrame = window.requestAnimationFrame(step);
    } else {
      musicFadeFrame = 0;
    }
  }

  musicFadeFrame = window.requestAnimationFrame(step);
}

async function startProposalMusic() {
  try {
    await proposalMusic.play();
    fadeMusicIn();
    setMusicStatus("");
    updateMusicControls();
    return true;
  } catch (error) {
    if (error.name === "AbortError") {
      updateMusicControls();
      return false;
    }
    if (error.name !== "NotAllowedError") {
      console.error("Unable to play the provided proposal music.", error);
      setMusicStatus("आपकी दी हुई संगीत फ़ाइल नहीं चल सकी। कृपया फ़ाइल का पथ और फ़ॉर्मैट जाँचें।");
    }
    updateMusicControls();
    return false;
  }
}

async function toggleProposalMusic() {
  if (!proposalMusic.paused && !proposalMusic.muted) {
    window.cancelAnimationFrame(musicFadeFrame);
    musicFadeFrame = 0;
    proposalMusic.pause();
    return;
  }

  const started = await startProposalMusic();
  if (!started && !musicWelcomeStatus.textContent) {
    setMusicStatus("संगीत शुरू नहीं हो सका। कृपया फिर से कोशिश करें।");
  }
}

function showAutoplayWelcome() {
  opening.classList.add("is-autoplay-fallback");
  opening.querySelector("#opening-title").textContent = "एक छोटी-सी कहानी है… ❤️";
  opening.querySelector(".opening-line-two").textContent = "सुनोगी?";
  enterButton.textContent = "▶ शुरू करें";
}

enterButton.addEventListener("click", async () => {
  if (proposalMusic.paused && !(await startProposalMusic())) {
    if (!musicWelcomeStatus.textContent) {
      setMusicStatus("संगीत शुरू नहीं हो सका। कृपया फिर से कोशिश करें।");
    }
    return;
  }

  enterButton.classList.add("is-entering");
  window.setTimeout(() => {
    opening.classList.add("opening-gone");
    opening.setAttribute("aria-hidden", "true");
    document.body.classList.add("cinematic-mode");
    mainContent.setAttribute("aria-hidden", "false");
    mainContent.inert = false;
    skipLink.inert = false;
    musicFloat.inert = false;
    mainContent.querySelector("#home h1").setAttribute("tabindex", "-1");
    mainContent.querySelector("#home h1").focus({ preventScroll: true });
    revealVisibleContent();
    window.setTimeout(() => opening.remove(), reducedMotion.matches ? 0 : 950);
  }, reducedMotion.matches ? 0 : 520);
});

musicFloat.addEventListener("click", toggleProposalMusic);
filmMusicToggle.addEventListener("click", toggleProposalMusic);
songPlayButton.addEventListener("click", toggleProposalMusic);
proposalMusic.addEventListener("playing", updateMusicControls);
proposalMusic.addEventListener("waiting", updateMusicControls);
proposalMusic.addEventListener("pause", updateMusicControls);
proposalMusic.addEventListener("error", () => {
  updateMusicControls();
  setMusicStatus("आपकी दी हुई संगीत फ़ाइल नहीं चल सकी। कृपया फ़ाइल का पथ और फ़ॉर्मैट जाँचें।");
  if (!opening.classList.contains("opening-gone")) showAutoplayWelcome();
});

proposalMusic.volume = 0;
startProposalMusic().then((started) => {
  if (!started) showAutoplayWelcome();
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

memoryGalleryGrid.addEventListener("click", (event) => {
  const card = event.target.closest(".gallery-card");
  if (!card) return;

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

function addGalleryMedia(file) {
  if (!file || (!file.type.startsWith("image/") && !file.type.startsWith("video/"))) return;

  const objectUrl = URL.createObjectURL(file);
  const figure = document.createElement("figure");
  figure.className = "gallery-card";

  if (file.type.startsWith("video/")) {
    figure.classList.add("gallery-card-video");
    const video = document.createElement("video");
    video.src = objectUrl;
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.setAttribute("aria-label", `Play ${file.name}`);
    figure.append(video);
  } else {
    const img = document.createElement("img");
    img.src = objectUrl;
    img.alt = file.name;
    img.loading = "lazy";
    img.decoding = "async";
    figure.append(img);
  }

  const caption = document.createElement("figcaption");
  caption.textContent = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");
  figure.append(caption);
  memoryGalleryGrid.append(figure);
}

memoryUpload.addEventListener("change", (event) => {
  const files = Array.from(event.target.files || []);
  files.forEach(addGalleryMedia);
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

const proposalExperience = document.querySelector("#proposalExperience");
const closeProposal = document.querySelector("#closeProposal");
const filmImage = document.querySelector("#filmImage");
const filmImageError = document.querySelector("#filmImageError");
const filmContent = document.querySelector("#filmContent");
const filmActions = document.querySelector("#filmActions");
const filmProgress = document.querySelector("#filmProgress");
const filmSignoff = document.querySelector("#filmSignoff");
const filmParticles = document.querySelector("#filmParticles");
const filmPhotos = [
  "photos/IMG_20261003_005724_175.jpg",
  "photos/IMG_20260928_003549_724.jpg",
  "photos/IMG_20260928_003431_731.jpg",
  "photos/IMG_20261007_123831_357.jpg",
  "photos/IMG-20261007-WA0009.jpg"
];
const filmMemories = [
  "एक मुलाकात…",
  "कुछ बातें…",
  "ढेर सारी मुस्कुराहटें…",
  "और धीरे-धीरे…"
];
const filmStages = [
  {
    type: "opening",
    image: filmPhotos[0],
    heading: "तुम मेरी ज़िंदगी में कब इतनी ख़ास बन गईं, पता ही नहीं चला…",
    paragraphs: ["बस इतना पता है कि अब मेरी हर खुशी में कहीं न कहीं तुम होती हो। ❤️"],
    next: "आगे बढ़ें"
  },
  ...filmMemories.map((heading, index) => ({
    type: "memory",
    image: filmPhotos[index + 1],
    heading,
    paragraphs: [],
    next: "आगे बढ़ें"
  })),
  {
    type: "memory",
    image: filmPhotos[4],
    heading: "तुम मेरी सबसे खूबसूरत आदत बन गईं। ❤️",
    paragraphs: [],
    next: "आगे बढ़ें"
  },
  {
    type: "sunset",
    image: "photos/IMG-20261002-WA0026.jpg",
    heading: "जैसे ढलता हुआ सूरज पूरे आसमान को अपने रंग में रंग देता है…",
    paragraphs: ["वैसे ही तुमने मेरी ज़िंदगी को अपने प्यार के रंग में रंग दिया। ❤️"],
    next: "आगे बढ़ें"
  },
  {
    type: "feelings",
    image: null,
    heading: "मैंने तुममें सिर्फ अपना प्यार नहीं देखा…",
    paragraphs: [
      "मैंने अपना सुकून देखा।",
      "अपनी खुशी देखी।",
      "और अपना आने वाला कल भी।"
    ],
    next: "एक आख़िरी बात…"
  },
  {
    type: "proposal-build",
    image: null,
    heading: "आज तुमसे एक सवाल पूछना है…",
    paragraphs: [
      "क्या तुम सिर्फ मेरी आज की खुशी बनोगी…",
      "या मेरी आने वाली हर सुबह का हिस्सा भी? ❤️"
    ],
    next: "आगे बढ़ें"
  },
  {
    type: "proposal",
    image: null,
    heading: "क्या तुम मेरे साथ हमेशा रहोगी?",
    paragraphs: []
  },
  {
    type: "celebration",
    image: filmPhotos[4],
    heading: "तो फिर…",
    paragraphs: [
      "आज से एक नई कहानी शुरू करते हैं। ❤️",
      "जिसमें कोई perfect ending नहीं चाहिए…",
      "बस हर chapter में तुम मेरे साथ रहो। 🫶",
      "I Love You ❤️"
    ],
    next: "हमेशा की ओर →"
  },
  {
    type: "response",
    image: null,
    heading: "बिल्कुल… कोई जल्दी नहीं।",
    paragraphs: [
      "तुम्हारी feelings और तुम्हारे समय—दोनों की मैं इज़्ज़त करता हूँ।",
      "जब भी तुम तैयार हो, मैं यहीं हूँ। ❤️"
    ],
    next: "हमारी कहानी आगे बढ़ाएँ →"
  },
  {
    type: "finale",
    image: "photos/IMG_20261003_005819_200.jpg",
    heading: "I Love You ❤️",
    paragraphs: [
      "मुझे नहीं पता हमारी कहानी कितनी लंबी होगी…",
      "बस इतना चाहता हूँ कि जब भी अपनी ज़िंदगी के खूबसूरत पलों को याद करूँ, हर याद में तुम मेरे साथ हो। ❤️",
      "आज, कल और हर आने वाले कल में।",
      "— तुम्हारा ❤️"
    ]
  }
];
let filmStageIndex = 0;
let proposalReturnFocus = null;
let proposalPreviousOverflow = "";
let proposalOutcome = null;
let filmImageRequest = 0;
let filmActionTimer = 0;
let filmActionAvailableAt = 0;
function addFilmAction(label, action, variant = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `film-button${variant ? ` ${variant}` : ""}`;
  button.dataset.filmAction = action;
  button.textContent = label;
  filmActions.append(button);
  return button;
}

function setFilmImage(src) {
  const requestId = ++filmImageRequest;
  filmImageError.hidden = true;
  filmImage.classList.add("is-changing");
  if (!src) {
    filmImage.removeAttribute("src");
    filmImage.classList.remove("is-changing");
    filmImage.onload = null;
    filmImage.onerror = null;
    return;
  }

  filmImage.onload = () => {
    if (requestId === filmImageRequest) filmImage.classList.remove("is-changing");
  };
  filmImage.onerror = () => {
    if (requestId !== filmImageRequest) return;
    filmImage.classList.remove("is-changing");
    filmImageError.hidden = false;
  };
  filmImage.src = src;
  if (filmImage.complete && filmImage.naturalWidth > 0) {
    filmImage.classList.remove("is-changing");
  }
}

function renderFilmStage(index) {
  filmStageIndex = index;
  filmActionAvailableAt = performance.now() + 750;
  const stage = filmStages[index];
  if (!stage) return;

  proposalExperience.dataset.filmScene = stage.type;
  window.clearTimeout(filmActionTimer);
  filmActionTimer = 0;
  filmContent.replaceChildren();
  filmContent.classList.remove("film-animate");
  filmContent.offsetWidth;
  filmContent.classList.add("film-animate");
  filmActions.replaceChildren();
  filmSignoff.hidden = stage.type !== "finale";
  filmProgress.style.setProperty("--film-progress", `${((index + 1) / filmStages.length) * 100}%`);
  setFilmImage(stage.image);

  const heading = document.createElement("h2");
  heading.id = "film-heading";
  heading.className = "film-heading";
  heading.textContent = stage.heading;
  filmContent.append(heading);

  const paragraphs = stage.type === "finale" && proposalOutcome === "think"
    ? [
      "मुझे नहीं पता हमारी कहानी कितनी लंबी होगी…",
      "बस इतना चाहता हूँ कि जब भी अपनी ज़िंदगी के खूबसूरत पलों को याद करूँ, हर याद में अपनापन हो। ❤️",
      "तुम्हारी feelings और तुम्हारे समय की मैं इज़्ज़त करता हूँ।",
      "— तुम्हारा ❤️"
    ]
    : stage.paragraphs;

  paragraphs.forEach((text, paragraphIndex) => {
    const paragraph = document.createElement("p");
    const isSequentialLine = stage.type === "feelings" || stage.type === "proposal-build";
    paragraph.className = `film-paragraph${isSequentialLine ? " film-feeling-line" : ""}`;
    if (isSequentialLine) {
      paragraph.style.setProperty("--line-delay", `${(paragraphIndex + 1) * 2.2}s`);
    }
    paragraph.textContent = text;
    filmContent.append(paragraph);
  });

  if (stage.type === "proposal") {
    addFilmAction("हाँ, हमेशा", "accept", "film-button-yes");
    addFilmAction("मुझे सोचने दो", "think", "film-button-think");
    return;
  }

  if (stage.type === "finale") {
    addFilmAction("शुरू से फिर देखें", "restart", "film-button-think");
    addFilmAction("वापस अपनी कहानी पर", "close", "film-button-yes");
    return;
  }

  if ((stage.type === "feelings" || stage.type === "proposal-build") && !reducedMotion.matches) {
    if (stage.type === "proposal-build") {
      filmActionTimer = window.setTimeout(() => {
        if (proposalExperience.open && filmStageIndex === index) {
          renderFilmStage(index + 1);
        }
      }, 6500);
      return;
    }

    filmActionTimer = window.setTimeout(() => {
      if (proposalExperience.open && filmStageIndex === index) {
        addFilmAction(stage.next, "continue");
      }
    }, 6800);
    return;
  }

  addFilmAction(stage.next, "continue", stage.type === "response" ? "film-button-think" : "");
}

function createCelebration() {
  if (reducedMotion.matches) return;

  const petals = document.createDocumentFragment();
  const symbols = ["✿", "✧", "♡", "❀"];
  for (let index = 0; index < 24; index += 1) {
    const petal = document.createElement("span");
    petal.className = "film-petal";
    petal.textContent = symbols[index % symbols.length];
    petal.style.setProperty("--petal-x", `${Math.random() * 100}%`);
    petal.style.setProperty("--petal-delay", `${Math.random() * 1.3}s`);
    petal.style.setProperty("--petal-duration", `${3.3 + Math.random() * 1.7}s`);
    petals.append(petal);
  }
  filmParticles.replaceChildren(petals);
}

function openProposalExperience(button) {
  proposalReturnFocus = button;
  proposalPreviousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  proposalOutcome = null;
  filmMusicStatus.textContent = "";
  filmParticles.replaceChildren();
  proposalExperience.showModal();
  renderFilmStage(0);
  closeProposal.focus();
  if (!reducedMotion.matches) {
    filmPhotos.forEach((src) => {
      const preload = new Image();
      preload.src = src;
    });
  }
}

document.querySelectorAll("[data-open-proposal]").forEach((button) => {
  button.addEventListener("click", () => openProposalExperience(button));
});

closeProposal.addEventListener("click", () => proposalExperience.close());

proposalExperience.addEventListener("close", () => {
  window.clearTimeout(filmActionTimer);
  filmActionTimer = 0;
  document.body.style.overflow = proposalPreviousOverflow;
  filmParticles.replaceChildren();
  if (proposalReturnFocus instanceof HTMLElement) proposalReturnFocus.focus();
});

filmActions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-film-action]");
  if (!button || performance.now() < filmActionAvailableAt) return;

  switch (button.dataset.filmAction) {
    case "continue":
      renderFilmStage(
        proposalOutcome === "yes"
          && filmStages[filmStageIndex].type === "celebration"
          ? filmStages.length - 1
          : filmStageIndex + 1
      );
      break;
    case "accept":
      proposalOutcome = "yes";
      renderFilmStage(filmStageIndex + 1);
      createCelebration();
      break;
    case "think":
      proposalOutcome = "think";
      renderFilmStage(filmStages.findIndex((stage) => stage.type === "response"));
      break;
    case "restart":
      proposalOutcome = null;
      filmParticles.replaceChildren();
      renderFilmStage(0);
      break;
    case "close":
      proposalExperience.close();
      break;
  }
});

filmContent.addEventListener("animationend", (event) => {
  if (event.target.classList.contains("film-feeling-line")) {
    event.target.classList.add("is-visible");
  }
});
