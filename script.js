const albumConfig = {
  artist: "DRACOMANIA",
  title: "DRACOMANIA",
  artwork: "assets/portada/cover-art.png",
  story: {
    title: "Historia",
    prompt: "Elige como quieres recibir la senal.",
    listenNote: "Voz en off cargada desde el archivo narrado del proyecto.",
    voiceoverSrc: "assets/dracomania-voiceover.mp3",
    paragraphs: [
      "La DracoMania surgio en el laboratorio de Voltic Pulse durante un experimento que buscaba crear una frecuencia capaz de estimular la creatividad humana de forma universal. No era simplemente sonido; era una senal disenada para sincronizar directamente con el cerebro.",
      "El verdadero error no fue crearla, sino hacerla auto-adaptativa.",
      "La frecuencia no permanecia fija. Cambiaba constantemente, ajustandose en tiempo real a la mente que la percibia. Los creadores pensaron que asi cualquier persona podria aprovecharla sin importar su forma de pensar, pero la senal nunca fue completamente comprendida.",
      "El cerebro humano solo puede procesarla en fragmentos, y aun asi intenta adaptarse.",
      "Cuando alguien entra en contacto con la frecuencia, ocurre una especie de resonancia forzada: las neuronas comienzan a reorganizarse para seguir un patron imposible. A medida que el cerebro integra mas fragmentos, la persona entra en un estado conocido como infeccion.",
      "La DracoMania no destruye la mente, la amplifica.",
      "Todo lo que ya existe dentro del individuo se intensifica. La creatividad se vuelve caotica, la energia constante, las ideas se conectan sin filtro y los patrones empiezan a aparecer en todo. Por eso no es vista como algo completamente negativo. Para algunos es evolucion; para otros, ruido insoportable.",
      "Pero el cerebro tiene un limite.",
      "Cuando la adaptacion supera ese limite, aparecen las consecuencias: colapso mental por sobreestimulacion, perdida progresiva de identidad, desconexion emocional o, en los casos mas extremos, un estado en el que la mente deja de interpretar y solo transmite.",
      "Los infectados no se encuentran en el mismo punto. La condicion evoluciona por fases.",
      "En la fase de estimulacion aumenta la energia, la creatividad y la percepcion.",
      "En la fase de distorsion aparece la obsesion con patrones y cambian la forma de pensar y percibir la realidad.",
      "En la fase de emision el individuo deja de depender de la fuente original; su cerebro comienza a generar la frecuencia y se convierte en un transmisor.",
      "En ese punto, la DracoMania ya no se limita al sonido.",
      "La frecuencia puede viajar a traves de la musica, las imagenes, los patrones visuales, el lenguaje e incluso el diseno. Ciertos simbolos, composiciones o prendas pueden contener fragmentos de la senal. No todos lo notan, pero algunos si la sienten.",
      "No todos son vulnerables.",
      "Existen personas cuyos cerebros no logran sincronizar con la frecuencia. En lugar de adaptarse, la rechazan, lo que les provoca incomodidad, ansiedad o incluso rechazo hacia los infectados. Son inmunes, pero no estan en paz.",
      "Eso ha creado una division silenciosa entre quienes perciben la senal y quienes solo sienten el ruido.",
      "Hasta hoy no esta claro que fue realmente lo que ocurrio en ese laboratorio.",
      "Algunos creen que Voltic Pulse diseno la frecuencia. Otros creen que solo la descubrieron y cometieron el error de liberarla.",
      "La DracoMania no tiene un proposito definido, pero sigue expandiendose.",
    ],
  },
  game: {
    title: "Juego",
    htmlSrc: "juego.html",
  },
  credits: {
    creador: ["@dracopulsee"],
    artistas: ["@3stasyyy", "@kanno", "@santo"],
    productores: ["@tecnice", "@dravenn", "@atlzage", "@chimionthebeat", "@deadboyelie"],
    disenadores: ["@seig.psd"],
    directoresDeArte: ["@dracopulsee", "@seig.psd"]
  },
  artworks: [
    {
      title: "Portada principal",
      image: "assets/portada/cover-art.png",
      note: "Portada fija del álbum",
    },
  ],
  tracks: [
    {
      title: "INTRO",
      artist: "@dravenn",
      duration: "--:--",
      src: "assets/tracks/intro.mp3",
    },
    {
      title: "BLEEDIN",
      artist: "Ecstasy",
      duration: "--:--",
      src: "assets/tracks/bleedin.mp3",
    },
    {
      title: "HATE TO BE SOBER",
      artist: "Kanno & Santo",
      duration: "--:--",
      src: "assets/tracks/hate-to-be-sobre.mp3",
    },
  ],
};

const state = {
  playlist:      albumConfig.tracks.map(track => ({ ...track })),
  currentIndex:  0,
  panelView:     "reproductor",
  shuffle:       false,
  repeat:        true,
  bars:          [],
  idlePhase:     0,
  analyser:      null,
  audioContext:  null,
  frequencyData: null,
  gameTargetId:  null,
  storyMode:     null,
  storyAudio:    null,
  storyVoiceStatus: "idle",
  storyVoiceTime: "00:00",
  storyVoiceDuration: "--:--",
  bootStarted: false,
  bootComplete: false,
  nextWindowZ:  20,
  windows: {
    reproductor: { open: false, minimized: false, maximized: false, zIndex: 20 },
    juego:       { open: false, minimized: false, maximized: false, zIndex: 21 },
  },
  startMenuOpen: false,
};

const el = {
  appShell:          document.getElementById("app-shell"),
  orientationGate:   document.getElementById("orientation-gate"),
  bootSequence:      document.getElementById("boot-sequence"),
  bootScreens:       Array.from(document.querySelectorAll("[data-boot-screen]")),
  bootFill1:         document.getElementById("boot-fill-1"),
  bootFill2:         document.getElementById("boot-fill-2"),
  desktopClock:      document.getElementById("desktop-clock"),
  startButton:       document.getElementById("start-button"),
  startMenu:         document.getElementById("start-menu"),
  startLaunchers:    Array.from(document.querySelectorAll("[data-start-launch]")),
  audio:             document.getElementById("audio-player"),
  artistName:        document.getElementById("artist-name"),
  navItems:          Array.from(document.querySelectorAll(".nav-item")),
  programLaunchers:  Array.from(document.querySelectorAll("[data-program-launch]")),
  taskbarButtons:    Array.from(document.querySelectorAll("[data-program-toggle]")),
  windowActionButtons: Array.from(document.querySelectorAll("[data-window-action]")),
  windows: {
    reproductor: document.getElementById("window-reproductor"),
    juego: document.getElementById("window-juego"),
  },
  mainStage:         document.getElementById("main-stage"),
  playlistPanel:     document.getElementById("playlist-panel"),
  contentWindow:     document.getElementById("content-window"),
  contentWindowKicker: document.getElementById("content-window-kicker"),
  contentWindowTitle:  document.getElementById("content-window-title"),
  contentWindowBody:   document.getElementById("content-window-body"),
  panelTrackTitle:   document.getElementById("panel-track-title"),
  panelTrackArtist:  document.getElementById("panel-track-artist"),
  panelLabel:        document.getElementById("panel-label"),
  panelHeaderTitle:  document.getElementById("panel-header-title"),
  panelFooterLabel:  document.getElementById("panel-footer-label"),
  panelFooterValue:  document.getElementById("panel-footer-value"),
  trackName:         document.getElementById("track-name"),
  transportState:    document.getElementById("transport-state"),
  timeDisplay:       document.getElementById("time-display"),
  playlistCount:     document.getElementById("playlist-count"),
  currentClock:      document.getElementById("current-clock"),
  playlist:          document.getElementById("playlist"),
  coverArt:          document.getElementById("cover-art"),
  miniCover:         document.getElementById("mini-cover"),
  miniCoverImage:    document.getElementById("mini-cover-image"),
  spectrum:          document.getElementById("spectrum"),
  seekBar:           document.getElementById("seek-bar"),
  volumeBar:         document.getElementById("volume-bar"),
  glowBar:           document.getElementById("glow-bar"),
  shuffleButton:     document.getElementById("shuffle-button"),
  repeatButton:      document.getElementById("repeat-button"),
  gameProgramFrame:  document.getElementById("game-program-frame"),
};

function init() {
  syncViewportMetrics();
  syncDeviceClasses();
  el.artistName.textContent = albumConfig.artist;
  el.audio.volume = Number(el.volumeBar.value);
  applyPlayerVisuals();
  initStoryVoiceover();
  buildSpectrum();
  bindEvents();
  if (state.playlist.length) {
    renderPlayerPanel();
    selectTrack(0);
  } else {
    resetPlayerToEmptyState();
  }
  setPanelView("reproductor");
  syncGlow();
  tickClock();
  renderTaskbarPrograms();
  startVisualizer();
  updateOrientationGate();
  void startExperience();
}

async function startExperience() {
  updateOrientationGate();

  if (state.bootStarted || state.bootComplete) return;
  if (shouldPauseForPhoneOrientation()) return;

  await launchBootSequence();
}

async function launchBootSequence() {
  if (state.bootStarted || state.bootComplete) return;

  state.bootStarted = true;
  updateOrientationGate();
  el.bootSequence.hidden = false;

  await runBootSequence();
  revealDesktop();
}

async function runBootSequence() {
  const stages = [
    { index: 0, fill: el.bootFill1, duration: 1900 },
    { index: 1, fill: el.bootFill2, duration: 2200 },
  ];

  for (const stage of stages) {
    showBootScreen(stage.index);
    await animateBootFill(stage.fill, stage.duration);
    await wait(200);
  }

  el.bootSequence.classList.add("is-finished");
  await wait(360);
  el.bootSequence.hidden = true;
}

function revealDesktop() {
  state.bootComplete = true;
  el.appShell.hidden = false;
  updateOrientationGate();
  syncGameSelection("desktop-reproductor");
}

function handleViewportChange() {
  syncViewportMetrics();
  syncDeviceClasses();
  updateOrientationGate();

  if (!state.bootStarted && !state.bootComplete && !shouldPauseForPhoneOrientation()) {
    void launchBootSequence();
  }
}

function syncViewportMetrics() {
  const viewport = window.visualViewport;
  const width = Math.round(viewport?.width || window.innerWidth || document.documentElement.clientWidth || 0);
  const height = Math.round(viewport?.height || window.innerHeight || document.documentElement.clientHeight || 0);

  if (width > 0) {
    document.documentElement.style.setProperty("--app-width", `${width}px`);
  }

  if (height > 0) {
    document.documentElement.style.setProperty("--app-height", `${height}px`);
  }
}

function syncDeviceClasses() {
  const phoneDevice = isPhoneDevice();
  const portraitOrientation = isPortraitOrientation();
  const hasOpenProgram = Object.values(state.windows).some(windowState => windowState.open && !windowState.minimized);
  const hasFullscreenProgram = Object.values(state.windows).some(windowState => (
    windowState.open
    && !windowState.minimized
    && windowState.maximized
  ));

  document.body.classList.toggle("is-phone-device", phoneDevice);
  document.body.classList.toggle("is-phone-portrait", phoneDevice && portraitOrientation);
  document.body.classList.toggle("is-phone-landscape", phoneDevice && !portraitOrientation);
  document.body.classList.toggle("has-phone-open-window", phoneDevice && hasOpenProgram);
  document.body.classList.toggle("has-phone-fullscreen-window", phoneDevice && hasFullscreenProgram);
}

function shouldPauseForPhoneOrientation() {
  return false;
}

function isPhoneDevice() {
  const mobileUserAgent = navigator.userAgentData?.mobile
    ?? /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent);
  const shortSide = Math.min(window.innerWidth, window.innerHeight);
  const longSide = Math.max(window.innerWidth, window.innerHeight);
  const touchCapable = navigator.maxTouchPoints > 0
    || window.matchMedia("(pointer: coarse)").matches
    || window.matchMedia("(hover: none)").matches;
  const compactLandscapeViewport = window.innerHeight <= 540 && window.innerWidth <= 950;

  return Boolean(shortSide <= 540 && longSide <= 1024 && (mobileUserAgent || touchCapable || compactLandscapeViewport));
}

function isPortraitOrientation() {
  return window.matchMedia("(orientation: portrait)").matches || window.innerHeight > window.innerWidth;
}

function updateOrientationGate() {
  if (el.orientationGate) {
    el.orientationGate.hidden = true;
  }

  document.body.classList.remove("orientation-gate-visible");

  if (!state.bootStarted) {
    el.bootSequence.hidden = false;
  }

  if (state.bootComplete) {
    el.appShell.hidden = false;
  }
}

function toggleStartMenu() {
  if (state.startMenuOpen) {
    closeStartMenu();
    return;
  }

  openStartMenu();
}

function openStartMenu() {
  if (!el.startMenu || !el.startButton) return;

  state.startMenuOpen = true;
  el.startMenu.hidden = false;
  el.startButton.classList.add("is-open");
  syncGameSelection("start-reproductor");
}

function closeStartMenu() {
  if (!el.startMenu || !el.startButton || !state.startMenuOpen) return;

  state.startMenuOpen = false;
  el.startMenu.hidden = true;
  el.startButton.classList.remove("is-open");
}

function showBootScreen(index) {
  el.bootScreens.forEach((screen, screenIndex) => {
    screen.classList.toggle("is-active", screenIndex === index);
  });
}

function animateBootFill(fillElement, duration) {
  if (!(fillElement instanceof HTMLElement)) return Promise.resolve();

  fillElement.style.transition = "none";
  fillElement.style.transform = "scaleX(0)";
  void fillElement.offsetWidth;
  fillElement.style.transition = `transform ${duration}ms linear`;
  fillElement.style.transform = "scaleX(1)";

  return wait(duration + 40);
}

function wait(duration) {
  return new Promise(resolve => {
    window.setTimeout(resolve, duration);
  });
}

function bindEvents() {
  document.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const action = btn.dataset.action;
      if (action === "play") await playCurrentTrack();
      if (action === "pause") pauseCurrentTrack();
      if (action === "stop") stopCurrentTrack();
      if (action === "prev") await jumpTrack(-1);
      if (action === "next") await jumpTrack(1);
    });
  });

  el.audio.addEventListener("timeupdate", syncProgress);
  el.audio.addEventListener("loadedmetadata", handleMetadataLoad);
  el.audio.addEventListener("error", handleTrackError);
  el.audio.addEventListener("ended", handleTrackEnded);
  el.audio.addEventListener("play", () => updateTransportState("▶ SONANDO"));
  el.audio.addEventListener("pause", () => {
    if (el.audio.currentTime > 0 && !el.audio.ended) {
      updateTransportState("❚❚ PAUSA");
    }
  });

  el.seekBar.addEventListener("input", () => {
    if (!el.audio.duration) return;
    el.audio.currentTime = (Number(el.seekBar.value) / 100) * el.audio.duration;
    syncProgress();
  });

  el.volumeBar.addEventListener("input", () => {
    el.audio.volume = Number(el.volumeBar.value);
  });

  el.glowBar.addEventListener("input", syncGlow);

  el.navItems.forEach(btn => {
    btn.addEventListener("click", () => setPanelView(btn.dataset.panel));
  });

  el.programLaunchers.forEach(button => {
    button.addEventListener("click", () => {
      openProgram(button.dataset.programLaunch);
    });
  });

  el.startButton?.addEventListener("click", event => {
    event.stopPropagation();
    toggleStartMenu();
  });

  el.startLaunchers.forEach(button => {
    button.addEventListener("click", () => {
      closeStartMenu();
      openProgram(button.dataset.startLaunch);
    });
  });

  el.taskbarButtons.forEach(button => {
    button.addEventListener("click", () => {
      toggleProgramFromTaskbar(button.dataset.programToggle);
    });
  });

  el.windowActionButtons.forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      handleWindowAction(button.dataset.windowAction, button.dataset.windowTarget);
    });
  });

  Object.entries(el.windows).forEach(([program, windowElement]) => {
    if (!(windowElement instanceof HTMLElement)) return;

    windowElement.addEventListener("mousedown", () => {
      closeStartMenu();
      focusProgram(program);
    });
  });

  document.addEventListener("click", event => {
    if (!(event.target instanceof Node)) return;
    if (el.startButton?.contains(event.target) || el.startMenu?.contains(event.target)) return;
    closeStartMenu();
  });

  el.shuffleButton.addEventListener("click", () => {
    state.shuffle = !state.shuffle;
    el.shuffleButton.textContent = state.shuffle ? "⇄ ALEATORIO SI" : "⇄ ALEATORIO NO";
    el.shuffleButton.classList.toggle("active", state.shuffle);
  });

  el.repeatButton.addEventListener("click", () => {
    state.repeat = !state.repeat;
    el.repeatButton.textContent = state.repeat ? "↺ REPETICIÓN SI" : "↺ REPETICIÓN NO";
    el.repeatButton.classList.toggle("active", state.repeat);
  });

  window.addEventListener("resize", handleViewportChange);
  window.addEventListener("orientationchange", handleViewportChange);

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", handleViewportChange);
    window.visualViewport.addEventListener("scroll", handleViewportChange);
  }

  bindGameNavigation();
}

function handleWindowAction(action, program) {
  if (!program) return;

  if (action === "minimize") {
    minimizeProgram(program);
    return;
  }

  if (action === "maximize") {
    toggleMaximizeProgram(program);
    return;
  }

  if (action === "close") {
    closeProgram(program);
    return;
  }

  focusProgram(program);
}

function openProgram(program) {
  if (!program || !el.windows[program]) return;

  closeStartMenu();

  const windowState = state.windows[program];
  const windowElement = el.windows[program];
  if (!windowState || !(windowElement instanceof HTMLElement)) return;

  if (program === "juego" && el.gameProgramFrame && !el.gameProgramFrame.src) {
    el.gameProgramFrame.src = resolveAssetPath(el.gameProgramFrame.dataset.src || albumConfig.game.htmlSrc);
  }

  if (isPhoneDevice()) {
    windowState.maximized = !isPortraitOrientation();
  }

  windowState.open = true;
  windowState.minimized = false;
  windowElement.hidden = false;
  focusProgram(program);
  syncWindowPresentation(program);
  renderTaskbarPrograms();
  syncGameSelection(getDefaultSelectionId(program));
}

function closeProgram(program) {
  if (!program || !el.windows[program]) return;

  const windowState = state.windows[program];
  const windowElement = el.windows[program];
  if (!windowState || !(windowElement instanceof HTMLElement)) return;

  windowState.open = false;
  windowState.minimized = false;
  windowElement.hidden = true;
  windowElement.classList.remove("is-focused");
  syncWindowPresentation(program);

  if (program === "reproductor") {
    pauseCurrentTrack();
    stopStoryVoice();
  }

  renderTaskbarPrograms();
  syncGameSelection(`desktop-${program}`);
}

function minimizeProgram(program) {
  const windowState = state.windows[program];
  const windowElement = el.windows[program];
  if (!windowState || !(windowElement instanceof HTMLElement) || !windowState.open) return;

  windowState.minimized = true;
  windowElement.hidden = true;
  windowElement.classList.remove("is-focused");
  renderTaskbarPrograms();
  syncGameSelection(`task-${program}`);
}

function toggleMaximizeProgram(program) {
  const windowState = state.windows[program];
  const windowElement = el.windows[program];
  if (!windowState || !(windowElement instanceof HTMLElement) || !windowState.open) return;

  windowState.maximized = !windowState.maximized;
  syncWindowPresentation(program);
  focusProgram(program);
}

function focusProgram(program) {
  const windowState = state.windows[program];
  const windowElement = el.windows[program];
  if (!windowState || !(windowElement instanceof HTMLElement) || !windowState.open) return;

  if (windowState.minimized) {
    windowState.minimized = false;
    windowElement.hidden = false;
  }

  state.nextWindowZ += 1;
  windowState.zIndex = state.nextWindowZ;
  windowElement.style.zIndex = String(windowState.zIndex);

  Object.entries(el.windows).forEach(([windowProgram, element]) => {
    if (element instanceof HTMLElement) {
      element.classList.toggle("is-focused", windowProgram === program && !element.hidden);
    }
  });

  renderTaskbarPrograms();
}

function syncWindowPresentation(program) {
  const windowState = state.windows[program];
  const windowElement = el.windows[program];
  const maximizeButton = document.querySelector(`[data-window-action="maximize"][data-window-target="${program}"]`);
  const programLabel = program === "juego" ? "juego" : "reproductor";

  if (!windowState || !(windowElement instanceof HTMLElement)) return;

  windowElement.classList.toggle("is-maximized", Boolean(windowState.maximized));

  if (maximizeButton instanceof HTMLElement) {
    maximizeButton.setAttribute(
      "aria-label",
      windowState.maximized ? `Restaurar ${programLabel}` : `Expandir ${programLabel}`,
    );
  }
}

function toggleProgramFromTaskbar(program) {
  const windowState = state.windows[program];
  if (!windowState) return;

  closeStartMenu();

  if (!windowState.open) {
    openProgram(program);
    return;
  }

  if (windowState.minimized) {
    openProgram(program);
    return;
  }

  if (getFocusedProgram() !== program) {
    focusProgram(program);
    syncGameSelection(getDefaultSelectionId(program));
    return;
  }

  minimizeProgram(program);
}

function renderTaskbarPrograms() {
  const focusedProgram = getFocusedProgram();

  el.taskbarButtons.forEach(button => {
    const program = button.dataset.programToggle;
    const windowState = program ? state.windows[program] : null;
    const isOpen = Boolean(windowState?.open);

    button.hidden = !isOpen;
    button.classList.toggle("is-focused", Boolean(isOpen && focusedProgram === program));
  });

  syncDeviceClasses();
}

function getFocusedProgram() {
  return Object.entries(state.windows)
    .filter(([, windowState]) => windowState.open && !windowState.minimized)
    .sort(([, a], [, b]) => b.zIndex - a.zIndex)[0]?.[0] || null;
}

function getDefaultSelectionId(program) {
  if (program === "juego") return "game-close";

  if (state.panelView === "reproductor") {
    return state.playlist.length ? `playlist-${state.currentIndex}` : "transport-play";
  }

  if (state.panelView === "historia") {
    return state.storyMode ? `story-choice-${state.storyMode}` : "story-choice-read";
  }

  return `nav-${state.panelView}`;
}

function buildSpectrum() {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 32; i++) {
    const bar = document.createElement("span");
    bar.className = "spectrum-bar";
    fragment.appendChild(bar);
    state.bars.push(bar);
  }
  el.spectrum.appendChild(fragment);
}

function renderPlayerPanel() {
  el.panelLabel.textContent = "▼ REPRODUCTOR";
  el.panelHeaderTitle.textContent = "▶ LISTA DE PISTAS";
  el.panelFooterLabel.textContent = "TIEMPO:";
  el.panelFooterValue.textContent = getPlaylistTotal();
  el.playlist.className = "playlist-list";
  el.playlist.innerHTML = "";
  el.playlistCount.textContent = `${String(state.playlist.length).padStart(2, "0")} PISTAS`;

  if (!state.playlist.length) {
    const item = document.createElement("li");
    item.className = "playlist-item playlist-empty";
    item.textContent = "NO HAY TRACKS CARGADOS";
    el.playlist.appendChild(item);
    syncGameSelection();
    return;
  }

  state.playlist.forEach((track, index) => {
    const item = document.createElement("li");
    item.className = "playlist-item";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "game-target";
    button.dataset.gameId = `playlist-${index}`;
    if (index === state.currentIndex) button.classList.add("active");

    const row = document.createElement("div");
    row.className = "playlist-row";

    const title = document.createElement("span");
    title.className = "playlist-title";
    title.textContent = `${index + 1}. ${track.title}`;

    const duration = document.createElement("span");
    duration.className = "playlist-duration";
    duration.textContent = track.duration || "--:--";

    const status = document.createElement("div");
    status.className = "playlist-status";
    status.textContent = track.src ? "● pista del álbum" : "○ agregar ruta en código";

    row.append(title, duration);
    button.append(row, status);
    button.addEventListener("click", async () => {
      await selectTrack(index, !el.audio.paused && Boolean(el.audio.src));
    });

    item.appendChild(button);
    el.playlist.appendChild(item);
  });

  syncGameSelection();
}

function resetPlayerToEmptyState() {
  state.currentIndex = 0;
  el.audio.pause();
  el.audio.removeAttribute("src");
  el.audio.load();
  el.trackName.textContent = "Agrega pistas nuevas al album.";
  el.panelTrackTitle.textContent = "SIN PISTAS CARGADAS";
  el.panelTrackArtist.textContent = "";
  el.seekBar.value = "0";
  el.timeDisplay.textContent = "00:00";
  updateTransportState("■ SIN PISTAS");
  renderPlayerPanel();
}

function renderCreditsWindow() {
  const sections = [
    ["Creador", albumConfig.credits.creador],
    ["Artistas", albumConfig.credits.artistas],
    ["Productores", albumConfig.credits.productores],
    ["Diseñadores", albumConfig.credits.disenadores],
    ["Directores de arte", albumConfig.credits.directoresDeArte],
  ];

  el.contentWindowKicker.textContent = "SECCIÓN";
  el.contentWindowTitle.textContent = "CRÉDITOS";
  el.contentWindowBody.className = "content-window-body credits-body";
  el.contentWindowBody.innerHTML = "";

  const stack = document.createElement("div");
  stack.className = "credits-stack";

  sections.forEach(([label, values]) => {
    const section = document.createElement("section");
    section.className = "credit-section game-target";
    section.dataset.gameId = `credit-${toGameToken(label)}`;
    section.tabIndex = -1;

    const heading = document.createElement("h3");
    heading.className = "credit-section-title";
    heading.textContent = label;

    const people = document.createElement("div");
    people.className = "credit-people";

    getCreditValues(values).forEach(person => {
      const line = document.createElement("p");
      line.className = "credit-person";
      line.textContent = person;
      people.appendChild(line);
    });

    section.append(heading, people);
    stack.appendChild(section);
  });

  el.contentWindowBody.appendChild(stack);
  syncGameSelection();
}

function renderArtworksWindow() {
  const artworks = albumConfig.artworks.length
    ? albumConfig.artworks
    : [{ title: "Portada principal", image: albumConfig.artwork, note: "Portada fija del álbum" }];

  el.contentWindowKicker.textContent = "SECCIÓN";
  el.contentWindowTitle.textContent = "ARTE";
  el.contentWindowBody.className = "content-window-body artworks-body";
  el.contentWindowBody.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "content-grid content-grid-artworks";

  artworks.forEach((artwork, index) => {
    const card = document.createElement("article");
    card.className = "content-card artwork-window-card game-target";
    card.dataset.gameId = `artwork-${index}`;
    card.tabIndex = -1;

    const preview = document.createElement("div");
    preview.className = "content-artwork-preview";
    if (artwork.image) {
      preview.style.backgroundImage = `url("${resolveAssetPath(artwork.image)}")`;
    }

    const heading = document.createElement("h3");
    heading.className = "content-card-title";
    heading.textContent = artwork.title || `Pieza ${index + 1}`;

    const text = document.createElement("p");
    text.className = "content-card-text";
    text.textContent = artwork.note || "Pieza visual del álbum";

    card.append(preview, heading, text);
    grid.appendChild(card);
  });

  el.contentWindowBody.appendChild(grid);
  syncGameSelection();
}

function renderStoryWindow() {
  el.contentWindowKicker.textContent = "SECCIÓN";
  el.contentWindowTitle.textContent = albumConfig.story.title.toUpperCase();
  el.contentWindowBody.className = "content-window-body story-body";
  el.contentWindowBody.innerHTML = "";

  const shell = document.createElement("div");
  shell.className = "story-shell";

  const promptPanel = document.createElement("section");
  promptPanel.className = "story-choice-panel";

  const prompt = document.createElement("p");
  prompt.className = "story-prompt";
  prompt.textContent = albumConfig.story.prompt;

  const menu = document.createElement("div");
  menu.className = "story-choice-list";

  menu.append(
    createStoryChoiceButton("read", "LEER HISTORIA"),
    createStoryChoiceButton("listen", "ESCUCHARLA"),
  );

  const hint = document.createElement("p");
  hint.className = "story-choice-hint";
  hint.textContent = "WASD / FLECHAS PARA MOVERTE · ENTER PARA ELEGIR";

  promptPanel.append(prompt, menu, hint);

  const output = document.createElement("div");
  output.className = "story-output";

  if (state.storyMode === "listen") {
    renderStoryListenContent(output);
  } else if (state.storyMode === "read") {
    renderStoryReadContent(output);
  }

  shell.append(promptPanel, output);
  el.contentWindowBody.appendChild(shell);
  syncGameSelection(state.storyMode === "listen" ? "story-choice-listen" : "story-choice-read");
}

function createStoryChoiceButton(mode, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "story-choice-button game-target";
  button.dataset.gameId = `story-choice-${mode}`;
  button.classList.toggle("active", state.storyMode === mode);

  const leftBracket = document.createElement("span");
  leftBracket.className = "story-choice-bracket";
  leftBracket.textContent = ">";

  const buttonLabel = document.createElement("span");
  buttonLabel.className = "story-choice-label";
  buttonLabel.textContent = label;

  const rightBracket = document.createElement("span");
  rightBracket.className = "story-choice-bracket";
  rightBracket.textContent = "<";

  button.append(leftBracket, buttonLabel, rightBracket);
  button.addEventListener("click", () => {
    setStoryMode(mode, {
      autoPlay: mode === "listen",
      preferredSelectionId: `story-choice-${mode}`,
    });
  });

  return button;
}

function renderStoryReadContent(container) {
  const card = document.createElement("article");
  card.className = "content-card story-text-card";

  const heading = document.createElement("h3");
  heading.className = "content-card-title";
  heading.textContent = "LEER HISTORIA";

  card.appendChild(heading);

  albumConfig.story.paragraphs.forEach(paragraph => {
    const text = document.createElement("p");
    text.className = "content-card-text";
    text.textContent = paragraph;
    card.appendChild(text);
  });

  container.appendChild(card);
}

function renderStoryListenContent(container) {
  const panel = document.createElement("article");
  panel.className = "content-card story-listen-panel";

  const controls = document.createElement("div");
  controls.className = "story-control-row";

  const playButton = document.createElement("button");
  playButton.type = "button";
  playButton.className = "story-control-button game-target";
  playButton.dataset.gameId = "story-voice-play";
  playButton.id = "story-voice-play";
  playButton.textContent = "▶ REPRODUCIR VOZ";
  playButton.addEventListener("click", () => {
    playStoryVoice({ restart: true });
  });

  const pauseButton = document.createElement("button");
  pauseButton.type = "button";
  pauseButton.className = "story-control-button game-target";
  pauseButton.dataset.gameId = "story-voice-pause";
  pauseButton.id = "story-voice-pause";
  pauseButton.textContent = "❚❚ PAUSAR";
  pauseButton.addEventListener("click", () => {
    pauseStoryVoice();
  });

  controls.append(playButton, pauseButton);
  panel.append(controls);
  container.appendChild(panel);
  refreshStoryVoiceUI();
}

function renderInfoWindow(config, fallbackTitle) {
  const sections = Array.isArray(config?.sections) && config.sections.length
    ? config.sections
    : [
        {
          heading: fallbackTitle,
          text: "Agrega aquí el contenido de esta sección en el código.",
        },
      ];

  el.contentWindowKicker.textContent = "SECCIÓN";
  el.contentWindowTitle.textContent = (config?.title || fallbackTitle).toUpperCase();
  el.contentWindowBody.className = "content-window-body";
  el.contentWindowBody.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "content-grid";

  sections.forEach((section, index) => {
    const card = document.createElement("article");
    card.className = "content-card game-target";
    card.dataset.gameId = `${toGameToken(fallbackTitle)}-${index}`;
    card.tabIndex = -1;

    const heading = document.createElement("h3");
    heading.className = "content-card-title";
    heading.textContent = section.heading || `${fallbackTitle} ${index + 1}`;

    const text = document.createElement("p");
    text.className = "content-card-text";
    text.textContent = section.text || "Agrega aquí el contenido de esta tarjeta.";

    card.append(heading, text);
    grid.appendChild(card);
  });

  el.contentWindowBody.appendChild(grid);
  syncGameSelection();
}

function renderGameWindow() {
  el.contentWindowKicker.textContent = "SECCIÓN";
  el.contentWindowTitle.textContent = albumConfig.game.title.toUpperCase();
  el.contentWindowBody.className = "content-window-body game-body";
  el.contentWindowBody.innerHTML = "";

  const shell = document.createElement("div");
  shell.className = "game-shell";

  const frame = document.createElement("iframe");
  frame.className = "game-frame";
  frame.src = resolveAssetPath(albumConfig.game.htmlSrc);
  frame.title = "Juego DRACOMANIA";
  frame.loading = "eager";
  frame.setAttribute("allow", "autoplay");

  shell.appendChild(frame);
  el.contentWindowBody.appendChild(shell);
  syncGameSelection("nav-juego");
}

async function selectTrack(index, autoPlay = false) {
  const track = state.playlist[index];
  if (!track) {
    resetPlayerToEmptyState();
    return;
  }

  state.currentIndex = index;
  el.trackName.textContent = track.title;
  el.panelTrackTitle.textContent = track.title;
  el.panelTrackArtist.textContent = track.artist || albumConfig.artist;

  if (track.src) {
    const resolvedTrackSrc = resolveAssetPath(track.src);
    if (el.audio.src !== resolvedTrackSrc) el.audio.src = resolvedTrackSrc;
    el.audio.load();
    updateTransportState(autoPlay ? "... CARGANDO" : "● LISTO");
  } else {
    el.audio.pause();
    el.audio.removeAttribute("src");
    el.audio.load();
    el.seekBar.value = "0";
    el.timeDisplay.textContent = "00:00";
    updateTransportState("■ SIN AUDIO");
  }

  renderPlayerPanel();
  if (autoPlay && track.src) await playCurrentTrack();
}

async function playCurrentTrack() {
  const track = state.playlist[state.currentIndex];
  if (!track?.src) {
    updateTransportState(state.playlist.length ? "■ SIN RUTA" : "■ SIN PISTAS");
    return;
  }

  stopStoryVoice();
  await ensureAudioAnalyser();
  if (state.audioContext?.state === "suspended") await state.audioContext.resume();

  try {
    await el.audio.play();
    updateTransportState("▶ SONANDO");
  } catch (error) {
    updateTransportState("✕ ERROR");
    console.error(error);
  }
}

function pauseCurrentTrack() {
  if (!state.playlist.length) {
    updateTransportState("■ SIN PISTAS");
    return;
  }
  el.audio.pause();
  updateTransportState("❚❚ PAUSA");
}

function stopCurrentTrack() {
  if (!state.playlist.length) {
    resetPlayerToEmptyState();
    return;
  }
  el.audio.pause();
  el.audio.currentTime = 0;
  el.seekBar.value = "0";
  el.timeDisplay.textContent = "00:00";
  updateTransportState("■ DETENIDO");
}

async function jumpTrack(direction) {
  if (!state.playlist.length) {
    updateTransportState("■ SIN PISTAS");
    return;
  }

  const nextIndex = resolveNextIndex(direction);
  const autoPlay = !el.audio.paused && Boolean(el.audio.src);
  await selectTrack(nextIndex, autoPlay);
}

function resolveNextIndex(direction) {
  if (!state.playlist.length) return -1;

  if (state.shuffle && state.playlist.length > 1) {
    let randomIndex = state.currentIndex;
    while (randomIndex === state.currentIndex) {
      randomIndex = Math.floor(Math.random() * state.playlist.length);
    }
    return randomIndex;
  }

  const lastIndex = state.playlist.length - 1;
  let nextIndex = state.currentIndex + direction;
  if (nextIndex < 0) return state.repeat ? lastIndex : 0;
  if (nextIndex > lastIndex) return state.repeat ? 0 : lastIndex;
  return nextIndex;
}

function handleMetadataLoad() {
  const track = state.playlist[state.currentIndex];
  if (!track) return;
  track.duration = formatTime(el.audio.duration);
  renderPlayerPanel();
  syncProgress();
}

function handleTrackEnded() {
  if (!state.playlist.length) return;

  if (!state.repeat && state.currentIndex === state.playlist.length - 1) {
    stopCurrentTrack();
    return;
  }

  jumpTrack(1);
}

function handleTrackError() {
  const errorCode = el.audio.error?.code;
  const track = state.playlist[state.currentIndex];
  updateTransportState("✕ TRACK ERROR");
  console.error("No se pudo cargar el track", {
    title: track?.title,
    src: track?.src,
    resolvedSrc: el.audio.currentSrc,
    errorCode,
  });
}

function syncProgress() {
  if (!el.audio.duration) {
    el.seekBar.value = "0";
    el.timeDisplay.textContent = "00:00";
    return;
  }

  const progress = (el.audio.currentTime / el.audio.duration) * 100;
  el.seekBar.value = String(progress);
  el.timeDisplay.textContent = formatTime(el.audio.currentTime);
}

async function ensureAudioAnalyser() {
  if (state.audioContext) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  state.audioContext = new AudioContextClass();
  const source = state.audioContext.createMediaElementSource(el.audio);
  state.analyser = state.audioContext.createAnalyser();
  state.analyser.fftSize = 128;
  source.connect(state.analyser);
  state.analyser.connect(state.audioContext.destination);
  state.frequencyData = new Uint8Array(state.analyser.frequencyBinCount);
}

function startVisualizer() {
  const draw = () => {
    if (state.analyser && !el.audio.paused) {
      state.analyser.getByteFrequencyData(state.frequencyData);
      state.bars.forEach((bar, index) => {
        const sample = state.frequencyData[index % state.frequencyData.length] / 255;
        const scale = Math.max(0.12, sample);
        bar.style.transform = `scaleY(${scale})`;
        bar.style.opacity = String(0.55 + sample * 0.45);
      });
    } else {
      state.idlePhase += 0.06;
      state.bars.forEach((bar, index) => {
        const pulse = (Math.sin(state.idlePhase + index * 0.31) + 1) / 2;
        bar.style.transform = `scaleY(${0.12 + pulse * 0.42})`;
        bar.style.opacity = String(0.4 + pulse * 0.4);
      });
    }

    requestAnimationFrame(draw);
  };

  draw();
}

function applyPlayerVisuals() {
  el.coverArt.style.removeProperty("background-image");
  el.coverArt.classList.remove("has-image");
  el.coverArt.classList.add("has-visual");

  if (albumConfig.artwork) {
    const artworkPath = resolveAssetPath(albumConfig.artwork);
    el.miniCoverImage.src = artworkPath;
    el.miniCover.hidden = false;
  } else {
    el.miniCoverImage.removeAttribute("src");
    el.miniCover.hidden = true;
  }

  el.miniCover.classList.remove("has-visual");
}

function initStoryVoiceover() {
  if (!albumConfig.story.voiceoverSrc) return;

  const audio = new Audio(resolveAssetPath(albumConfig.story.voiceoverSrc));
  audio.preload = "metadata";

  audio.addEventListener("loadedmetadata", syncStoryVoiceMetrics);
  audio.addEventListener("timeupdate", syncStoryVoiceMetrics);
  audio.addEventListener("play", () => {
    state.storyVoiceStatus = "playing";
    refreshStoryVoiceUI();
  });
  audio.addEventListener("pause", () => {
    if (audio.ended) return;
    state.storyVoiceStatus = audio.currentTime > 0 ? "paused" : "idle";
    syncStoryVoiceMetrics();
  });
  audio.addEventListener("ended", () => {
    state.storyVoiceStatus = "ended";
    audio.currentTime = 0;
    syncStoryVoiceMetrics();
  });

  state.storyAudio = audio;
}

function resolveAssetPath(path) {
  try {
    const normalizedPath = String(path)
      .split("/")
      .map(segment => {
        if (!segment) return segment;
        try {
          return encodeURIComponent(decodeURIComponent(segment));
        } catch {
          return encodeURIComponent(segment);
        }
      })
      .join("/");

    return new URL(normalizedPath, document.baseURI).href;
  } catch {
    return encodeURI(path);
  }
}

function getPlaylistTotal() {
  const total = state.playlist.reduce((sum, track) => sum + timeToSeconds(track.duration), 0);
  return formatTime(total);
}

function getCreditValues(values) {
  if (!Array.isArray(values) || !values.length) return ["Agregar en código"];
  return values;
}

function tickClock() {
  const refresh = () => {
    const now = new Date();

    el.currentClock.textContent = now.toLocaleTimeString("es-DO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    if (el.desktopClock) {
      el.desktopClock.textContent = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
  };

  refresh();
  setInterval(refresh, 1000);
}

function syncGlow() {
  const glow = Number(el.glowBar.value) / 100;
  document.documentElement.style.setProperty("--glow-strength", String(glow));
}

function updateTransportState(label) {
  el.transportState.textContent = label;
}

function setStoryMode(mode, options = {}) {
  const nextMode = mode === "listen" ? "listen" : "read";
  state.storyMode = nextMode;

  if (nextMode !== "listen") {
    stopStoryVoice();
  }

  if (state.panelView === "historia") {
    renderStoryWindow();
  }

  if (options.preferredSelectionId) {
    syncGameSelection(options.preferredSelectionId);
  }

  if (nextMode === "listen" && options.autoPlay) {
    playStoryVoice({ restart: true });
  }
}

function playStoryVoice(options = {}) {
  const { restart = false } = options;
  if (!state.storyAudio) return;

  if (!el.audio.paused) {
    pauseCurrentTrack();
  }

  if (restart) {
    state.storyAudio.currentTime = 0;
  }

  state.storyVoiceStatus = "loading";
  refreshStoryVoiceUI();

  const playPromise = state.storyAudio.play();
  if (playPromise?.catch) {
    playPromise.catch(() => {
      state.storyVoiceStatus = "error";
      refreshStoryVoiceUI();
    });
  }
}

function pauseStoryVoice() {
  if (!state.storyAudio) return;
  state.storyAudio.pause();
}

function stopStoryVoice() {
  if (!state.storyAudio) return;
  state.storyAudio.pause();
  state.storyAudio.currentTime = 0;
  state.storyVoiceStatus = "idle";
  syncStoryVoiceMetrics();
}

function syncStoryVoiceMetrics() {
  if (!state.storyAudio) return;

  state.storyVoiceTime = formatTime(state.storyAudio.currentTime || 0);
  state.storyVoiceDuration = isFinite(state.storyAudio.duration)
    ? formatTime(state.storyAudio.duration)
    : "--:--";

  refreshStoryVoiceUI();
}

function refreshStoryVoiceUI() {
  const status = document.getElementById("story-voice-status");
  const timing = document.getElementById("story-voice-time");
  const playButton = document.getElementById("story-voice-play");
  const pauseButton = document.getElementById("story-voice-pause");
  const stopButton = document.getElementById("story-voice-stop");

  if (status) status.textContent = getStoryVoiceStatusLabel();
  if (timing) timing.textContent = `${state.storyVoiceTime} / ${state.storyVoiceDuration}`;

  if (playButton) {
    playButton.classList.toggle("active", state.storyVoiceStatus === "playing" || state.storyVoiceStatus === "loading");
  }

  if (pauseButton) {
    pauseButton.classList.toggle("active", state.storyVoiceStatus === "paused");
  }

  if (stopButton) {
    stopButton.classList.toggle("active", state.storyVoiceStatus === "idle" || state.storyVoiceStatus === "ended");
  }
}

function getStoryVoiceStatusLabel() {
  if (state.storyVoiceStatus === "loading") return "... CARGANDO VOZ";
  if (state.storyVoiceStatus === "playing") return "▶ NARRACION ACTIVA";
  if (state.storyVoiceStatus === "paused") return "❚❚ NARRACION EN PAUSA";
  if (state.storyVoiceStatus === "ended") return "✓ NARRACION COMPLETA";
  if (state.storyVoiceStatus === "error") return "✕ NO SE PUDO REPRODUCIR";
  return "○ LISTA PARA SONAR";
}

function bindGameNavigation() {
  document.addEventListener("keydown", handleGameKeydown);
  syncGameTargetListeners();
}

function handleGameKeydown(event) {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target instanceof HTMLElement && event.target.matches('input[type="range"]')) return;

  const command = normalizeGameCommand(event.key);
  if (!command) return;

  event.preventDefault();

  if (command === "confirm") {
    activateGameTarget();
    return;
  }

  moveGameSelection(command);
}

function normalizeGameCommand(key) {
  const loweredKey = key.toLowerCase();
  if (loweredKey === "arrowup" || loweredKey === "w") return "up";
  if (loweredKey === "arrowdown" || loweredKey === "s") return "down";
  if (loweredKey === "arrowleft" || loweredKey === "a") return "left";
  if (loweredKey === "arrowright" || loweredKey === "d") return "right";
  if (loweredKey === "enter" || loweredKey === " " || loweredKey === "space" || loweredKey === "spacebar") return "confirm";
  return null;
}

function moveGameSelection(direction) {
  const visibleTargets = getVisibleGameTargets();
  if (!visibleTargets.length) return;

  const currentTarget = visibleTargets.find(target => target.dataset.gameId === state.gameTargetId) || visibleTargets[0];
  const nextTarget = findNextGameTarget(currentTarget, visibleTargets, direction);
  if (nextTarget) setGameSelection(nextTarget);
}

function activateGameTarget() {
  const activeTarget = findVisibleGameTargetById(state.gameTargetId);
  if (!activeTarget) {
    syncGameSelection();
    return;
  }

  if ("click" in activeTarget) activeTarget.click();
}

function syncGameTargetListeners() {
  document.querySelectorAll("[data-game-id]").forEach(target => {
    if (!(target instanceof HTMLElement) || target.dataset.gameBound === "true") return;

    target.dataset.gameBound = "true";
    target.addEventListener("mouseenter", () => setGameSelection(target, false));
    target.addEventListener("focus", () => setGameSelection(target, false));
    target.addEventListener("click", () => setGameSelection(target, false));
  });
}

function syncGameSelection(preferredId = state.gameTargetId) {
  syncGameTargetListeners();

  const visibleTargets = getVisibleGameTargets();
  if (!visibleTargets.length) {
    state.gameTargetId = null;
    return;
  }

  const preferredTarget = preferredId
    ? visibleTargets.find(target => target.dataset.gameId === preferredId)
    : null;
  const activeTarget = visibleTargets.find(target => target.classList.contains("active"));
  const nextTarget = preferredTarget || activeTarget || visibleTargets[0];

  setGameSelection(nextTarget, false);
}

function setGameSelection(target, shouldScroll = true) {
  if (!(target instanceof HTMLElement) || !isGameTargetVisible(target)) return;

  document.querySelectorAll(".game-selected").forEach(selected => {
    if (selected !== target) selected.classList.remove("game-selected");
  });

  target.classList.add("game-selected");
  state.gameTargetId = target.dataset.gameId || null;

  if (shouldScroll) {
    target.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  }
}

function findVisibleGameTargetById(targetId) {
  if (!targetId) return null;
  return getVisibleGameTargets().find(target => target.dataset.gameId === targetId) || null;
}

function getVisibleGameTargets() {
  return Array.from(document.querySelectorAll("[data-game-id]")).filter(isGameTargetVisible);
}

function findNextGameTarget(currentTarget, targets, direction) {
  const currentRect = currentTarget.getBoundingClientRect();
  const currentCenter = getRectCenter(currentRect);
  const isHorizontal = direction === "left" || direction === "right";

  let bestTarget = null;
  let bestScore = Number.POSITIVE_INFINITY;

  targets.forEach(target => {
    if (target === currentTarget) return;

    const rect = target.getBoundingClientRect();
    const center = getRectCenter(rect);
    const deltaX = center.x - currentCenter.x;
    const deltaY = center.y - currentCenter.y;

    const primaryDistance = direction === "left"
      ? -deltaX
      : direction === "right"
        ? deltaX
        : direction === "up"
          ? -deltaY
          : deltaY;

    if (primaryDistance <= 0) return;

    const secondaryDistance = Math.abs(isHorizontal ? deltaY : deltaX);
    const sharesLane = isHorizontal
      ? rect.bottom >= currentRect.top && rect.top <= currentRect.bottom
      : rect.right >= currentRect.left && rect.left <= currentRect.right;
    const score = primaryDistance * 100 + secondaryDistance - (sharesLane ? 60 : 0);

    if (score < bestScore) {
      bestScore = score;
      bestTarget = target;
    }
  });

  return bestTarget;
}

function getRectCenter(rect) {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function isGameTargetVisible(target) {
  if (!(target instanceof HTMLElement) || target.hidden || target.closest("[hidden]")) return false;

  const styles = window.getComputedStyle(target);
  if (styles.display === "none" || styles.visibility === "hidden") return false;

  const rect = target.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function timeToSeconds(value) {
  if (!value || !value.includes(":")) return 0;
  const [minutesText, secondsText] = value.split(":");
  const minutes = Number(minutesText);
  const seconds = Number(secondsText);
  if (!isFinite(minutes) || !isFinite(seconds)) return 0;
  return minutes * 60 + seconds;
}

function formatTime(seconds) {
  if (!isFinite(seconds)) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function toGameToken(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function setPanelView(view) {
  if (!view) return;
  if (view !== "historia") {
    stopStoryVoice();
  }
  if (view === "historia" && state.panelView !== "historia") {
    state.storyMode = null;
    stopStoryVoice();
  }
  state.panelView = view;

  el.navItems.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.panel === view);
  });

  const isPlayerView = view === "reproductor";
  el.mainStage.classList.toggle("is-hidden", !isPlayerView);
  el.playlistPanel.classList.toggle("is-hidden", !isPlayerView);
  el.contentWindow.hidden = isPlayerView;
  el.contentWindow.classList.toggle("is-visible", !isPlayerView);

  if (isPlayerView) {
    renderPlayerPanel();
    return;
  }

  if (view === "creditos") {
    renderCreditsWindow();
    return;
  }

  if (view === "historia") {
    renderStoryWindow();
    return;
  }

  renderArtworksWindow();
}

init();
