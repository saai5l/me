const API = 'http://localhost:3000';
const REFRESH_MS = 60_000;

const BOOT = [
  '> kernel: initializing profile module...',
  '> net: connecting to discord gateway...',
  '> cache: warming identity store...',
  '> api: fetching user manifest...',
  '> api: resolving guild data...',
  '> renderer: building store grid...',
  '> ui: applying glass pipeline...',
  '> visitor: counter initialized.',
  '> theme: preference restored.',
  '[✓] system ready.',
];

let audioContext = null;

function initAudioContext() {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Audio context not supported');
    }
  }
}

function playTypeSound() {
  if (!audioContext) initAudioContext();
  if (!audioContext) return;

  try {
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.frequency.value = 800 + Math.random() * 200;
    osc.type = 'sine';

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.start(now);
    osc.stop(now + 0.08);
  } catch (e) {
  }
}

function playSuccessSound() {
  if (!audioContext) initAudioContext();
  if (!audioContext) return;

  try {
    const now = audioContext.currentTime;
    const notes = [523.25, 659.25, 783.99];

    notes.forEach((freq, index) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.frequency.value = freq;
      osc.type = 'sine';

      const startTime = now + (index * 0.05);
      gain.gain.setValueAtTime(0.08, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

      osc.start(startTime);
      osc.stop(startTime + 0.15);
    });
  } catch (e) {
  }
}

function runLoader(onDone) {
  const body = document.getElementById('ldBody');
  const prog = document.getElementById('ldProg');
  const pct = document.getElementById('ldPct');
  const el = document.getElementById('loader');
  const total = BOOT.length;
  let i = 0;

  function tick() {
    if (i >= total) {
      playSuccessSound();
      setTimeout(() => {
        el.classList.add('hide');
        setTimeout(onDone, 920);
      }, 1350);
      return;
    }

    const prev = body.querySelector('.ld-line.on');
    if (prev) prev.classList.replace('on', 'old');

    const line = document.createElement('div');
    line.className = 'ld-line';
    line.textContent = BOOT[i];
    body.appendChild(line);
    requestAnimationFrame(() => requestAnimationFrame(() => line.classList.add('on')));

    const p = Math.round(((i + 1) / total) * 100);
    prog.style.width = p + '%';
    pct.textContent = p + '%';

    playTypeSound();
    i++;
    setTimeout(tick, 190 + Math.random() * 100);
  }
  tick();
}

function initCanvas(color) {
  const canvas = document.getElementById('bannerCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function makeParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + .5,
      vx: (Math.random() - .5) * .4,
      vy: (Math.random() - .5) * .4,
      a: Math.random(),
    };
  }

  resize();
  for (let i = 0; i < 60; i++) particles.push(makeParticle());
  window.addEventListener('resize', resize);
  window.telfaz = window.telfaz || {};
  window.telfaz.store = window.telfaz.store || {};

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const baseColor = color || (isDark ? '#ffffff' : '#000000');

  function hex2rgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  }

  const [r, g, b] = hex2rgb(baseColor.length === 7 ? baseColor : '#888888');

  function draw() {
    ctx.clearRect(0, 0, W, H);


    ctx.strokeStyle = `rgba(${r},${g},${b},0.04)`;
    ctx.lineWidth = 1;
    const step = 36;
    for (let x = 0; x < W; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }


    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${p.a * 0.5})`;
      ctx.fill();
    });


    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 80) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - d / 80) * 0.08})`;
          ctx.lineWidth = .5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }
  draw();
}

function initTheme() {
  document.documentElement.setAttribute('data-theme', 'dark');
  localStorage.setItem('theme', 'dark');

  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.style.display = 'none';
  }
}

function getOrCreateDeviceId() {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = 'device_' + crypto.randomUUID?.() || `dev_${Date.now()}`;
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}

async function initVisitor() {
  const deviceId = getOrCreateDeviceId();

  try {
    const response = await fetch(API + '/api/visitor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId })
    });

    if (response.ok) {
      const data = await response.json();

      const el = document.getElementById('visitorCount');
      if (el) {
        el.textContent = (data.count || 0).toLocaleString('en');
      }
    }

  } catch (e) {
    console.warn('[VISITOR API] Error:', e.message);

    let count = parseInt(localStorage.getItem('visitor_count') || '0', 10);
    count += 2;

    localStorage.setItem('visitor_count', count);

    const el = document.getElementById('visitorCount');
    if (el) {
      el.textContent = count.toLocaleString('en');
    }
  }
}

function initMusicPlayer() {
  const player = document.getElementById('musicPlayer');
  const playBtn = document.getElementById('musicPlayBtn');
  const progressSlider = document.getElementById('musicProgress');
  const volumeSlider = document.getElementById('musicVolume');
  const timeDisplay = document.getElementById('musicTime');

  player.src = './music.mp3';
  player.volume = 0.05;
  player.muted = false;

  let autoPlayAttempted = false;

  const tryAutoPlay = async () => {
    if (autoPlayAttempted) return;
    autoPlayAttempted = true;
    try {
      await player.play();
    } catch (e) {
    }
  };

  tryAutoPlay();

  function handleFirstUserInteraction(e) {
    if (playBtn.contains(e.target) || volumeBtn.contains(e.target) || progressSlider.contains(e.target) || volumeSlider.contains(e.target)) {
      document.removeEventListener('click', handleFirstUserInteraction);
      return;
    }
    if (player.paused) {
      player.play().catch(() => {});
    }
    document.removeEventListener('click', handleFirstUserInteraction);
  }
  document.addEventListener('click', handleFirstUserInteraction, { once: false });

  playBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    try {
      if (player.paused) {
        await player.play();
      } else {
        player.pause();
      }
    } catch (err) {
      console.log('[MUSIC ERROR]', err);
    }
  });

  player.addEventListener('play', () => {
    playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
  });

  player.addEventListener('pause', () => {
    playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
  });

  player.addEventListener('timeupdate', () => {
    const progress = (player.currentTime / player.duration) * 100 || 0;
    progressSlider.value = progress;

    const minutes = Math.floor(player.currentTime / 60);
    const seconds = Math.floor(player.currentTime % 60);

    timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  progressSlider.addEventListener('input', (e) => {
    const time = (e.target.value / 100) * player.duration;
    player.currentTime = time;
  });

  volumeSlider.addEventListener('input', (e) => {
    player.volume = e.target.value / 100;
  });

  player.addEventListener('ended', () => {
    progressSlider.value = 0;
    timeDisplay.textContent = '0:00';
  });
}

async function apiFetch(path) {
  try {
    const r = await fetch(API + path);
    if (!r.ok) throw new Error(r.status);
    return r.json();
  } catch (e) {
    console.warn('[API]', path, e.message);
    return null;
  }
}

const STATUS_MAP = {
  online: 'Online',
  idle: 'Idle',
  dnd: 'Do Not Disturb',
  offline: 'Offline',
};

function renderProfile(d) {
  if (!d) return;


  const avatar = document.getElementById('pfAvatar');
  const spinner = document.getElementById('pfSpinner');
  if (d.avatar) {
    avatar.src = d.avatar;
    avatar.onload = () => spinner.classList.add('gone');
    avatar.onerror = () => { spinner.innerHTML = '<i class="fa-solid fa-user"></i>'; };
  } else {
    spinner.innerHTML = '<i class="fa-solid fa-user"></i>';
  }


  const banner = document.getElementById('pfBanner');
  if (d.banner) {
    banner.style.backgroundImage = `url(${d.banner})`;
    banner.style.backgroundSize = 'cover';
    banner.style.backgroundPosition = 'center';
    document.getElementById('bannerCanvas').style.display = 'none';
  } else {
    initCanvas(d.banner_color || null);
  }


  document.getElementById('pfName').textContent = d.display_name || d.username || '???';
  const tag = document.getElementById('pfTag');
  tag.textContent = d.discriminator ? `#${d.discriminator}` : `@${d.username}`;


  document.getElementById('pfBio').textContent = d.bio || 'No bio provided.';


  const status = d.status || 'offline';
  const statusText = d.custom_status || STATUS_MAP[status] || status;
  const pill = document.getElementById('pfStatusPill');
  const ring = document.getElementById('pfStatusRing');
  pill.dataset.s = status;
  ring.dataset.s = status;
  document.getElementById('pfStatusText').textContent = statusText;


  if (d.custom_status) {
    const actEl = document.getElementById('pfActivity');
    actEl.style.display = 'flex';
    document.getElementById('pfActivityText').textContent = d.custom_status;
  }


  if (d.socials) {
    const { discord_server, twitter, kick } = d.socials;
    const sd = document.getElementById('socialDiscord');
    const sx = document.getElementById('socialX');
    const sk = document.getElementById('socialKick');

    if (discord_server) sd.href = discord_server; else sd.style.display = 'none';
    if (twitter) sx.href = twitter; else sx.style.display = 'none';
    if (kick) sk.href = kick; else sk.style.display = 'none';
  }
}

const STORE_STATUS_LABELS = {
  available: 'Available',
  soon: 'Coming Soon',
  closed: 'Closed',
};

function renderStores(stores) {
  const grid = document.getElementById('storesGrid');
  const badge = document.getElementById('storesBadge');
  grid.innerHTML = '';
  badge.textContent = stores.length;

  const tpl = document.getElementById('storeTpl');

  stores.forEach(s => {
    const node = tpl.content.cloneNode(true);


    const bannerImg = node.querySelector('.sc-banner-img');
    if (s.banner) { bannerImg.src = s.banner; bannerImg.alt = s.name; }
    else { bannerImg.remove(); }


    const stTag = node.querySelector('.sc-status-tag');
    stTag.textContent = STORE_STATUS_LABELS[s.status] || s.status;
    stTag.classList.add(s.status || 'available');


    const icon = node.querySelector('.sc-icon');
    icon.src = s.icon || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name || 'S')}&background=111&color=fff&size=52&bold=true`;
    icon.alt = s.name;


    const ownerAv = node.querySelector('.sc-owner-av');
    const ownerName = node.querySelector('.sc-owner-name');
    if (s.owner) {
      ownerAv.src = s.owner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.owner.display_name || 'O')}&background=111&color=fff&size=20`;
      ownerAv.alt = s.owner.display_name;
      ownerName.textContent = s.owner.display_name || s.owner.username;
    } else {
      node.querySelector('.sc-owner-block').style.display = 'none';
    }


    node.querySelector('.sc-name').textContent = s.name || 'Unnamed Store';
    node.querySelector('.sc-desc').textContent = s.description || 'No description provided.';


    node.querySelector('.sc-members-val').textContent =
      (s.member_count || 0).toLocaleString('en') + ' members';
    node.querySelector('.sc-id-tag').textContent =
      '#' + (s.server_id?.slice(-6) || '000000');


    const btn = node.querySelector('.sc-visit-btn');
    if (s.status !== 'available' || !s.invite_url) {
      btn.classList.add('off');
      btn.removeAttribute('href');
    } else {
      btn.href = s.invite_url;
    }

    grid.appendChild(node);
  });
}


function loadDemo() {
  renderProfile({
    username: 'sa_ia5l',
    display_name: 'Saif Mohamed',
    discriminator: null,
    bio: 'Been here, grown here, proud to call it home Saudi.',
    status: 'online',
    custom_status: 'Developer',
    avatar: 'images/221.png',
    banner: 'images/Community21.png',
    banner_color: '#cab3b4',
    socials: {
      discord_server: 'https://discord.gg/pev',
      twitter: 'https://x.com/sa_ai5l',
      kick: 'https://kick.com/sai-f2',
    },
  });
 
  renderStores([
    {
      server_id: '1487141857791181001',
      name: 'Pevix Development',
      description: 'Crafting the future of FiveM.',
      status: 'available',
      invite_url: 'https://discord.gg/pev',
      member_count: 21,
      icon: 'images/logo2.png',
      banner: 'images/ww).png',
      owner: { display_name: 'Owner', avatar: 'images/proprietorship.png', },
    },
    {
      server_id: '1496948179617189909 ',
      name: 'Community',
      description: 'Join the experience. Play, connect, belong.',
      status: 'soon',
      invite_url: '',
      member_count: 0,
      icon: 'images/ServerLog.png',
      banner: 'images/Community.png',
      owner: { display_name: 'Owner', avatar: 'images/proprietorship.png', },
    },
  ]);
}

async function loadData() {
  const [profile, stores] = await Promise.all([
    apiFetch('/api/profile'),
    apiFetch('/api/stores'),
  ]);
  if (profile) renderProfile(profile);
  if (stores) renderStores(stores);
  if (!profile && !stores) loadDemo();
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initVisitor();
  //initMusicPlayer();

  runLoader(async () => {
    document.getElementById('main').classList.add('show');


    try {
      const h = await fetch(API + '/health', { signal: AbortSignal.timeout(2500) });
      if (h.ok) {
        await loadData();
        setInterval(loadData, REFRESH_MS);
        return;
      }
    } catch { }


    loadDemo();
  });
});
