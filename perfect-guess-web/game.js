/**
 * ============================================================
 *  THE PERFECT GUESS  –  game.js
 *  Full game logic, SPA routing, audio, leaderboard, storage
 * ============================================================
 */

'use strict';

/* ─────────────────────────────────────────────────────────────
   CONFIGURATION
───────────────────────────────────────────────────────────── */
const CFG = {
  difficulties: {
    easy:    { label:'Easy',    max:50,   color:'#00E676', emoji:'🟢', pro:false },
    medium:  { label:'Medium',  max:100,  color:'#00D4FF', emoji:'🔵', pro:false },
    hard:    { label:'Hard',    max:500,  color:'#FFB74D', emoji:'🟠', pro:false },
    extreme: { label:'Extreme', max:1000, color:'#FF5252', emoji:'🔴', pro:true  },
  },
  storage: {
    stats: 'tpg_stats_v2',
    lb:    'tpg_lb_v2',
  },
  confetti: {
    colors: ['#6C63FF','#00D4FF','#00E676','#FFB74D','#FF5252','#FFD700','#FF6B9D'],
    count: 65,
  },
  lb: { max: 50 },
};

/* ─────────────────────────────────────────────────────────────
   WEB AUDIO MANAGER
───────────────────────────────────────────────────────────── */
class AudioMgr {
  constructor() {
    this.enabled = true;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch { this.ctx = null; }
  }

  _tone(freq, dur, type = 'sine', vol = 0.28) {
    if (!this.enabled || !this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc  = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + dur);
    } catch { /* silent fail */ }
  }

  click()     { this._tone(600, .06); }
  wrong()     { this._tone(300, .15, 'sawtooth', .2); }
  correct()   { [523,659,784,1047].forEach((f,i) => setTimeout(()=>this._tone(f,.15),i*100)); }
  highscore() { [784,1047,1319,1568,2093].forEach((f,i) => setTimeout(()=>this._tone(f,.18),i*120)); }

  toggle() { this.enabled = !this.enabled; return this.enabled; }
}

/* ─────────────────────────────────────────────────────────────
   LOCAL STORAGE WRAPPER
───────────────────────────────────────────────────────────── */
class Store {
  get(key, def = null) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }
    catch { return def; }
  }
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }
}

/* ─────────────────────────────────────────────────────────────
   LEADERBOARD MANAGER
───────────────────────────────────────────────────────────── */
class LBManager {
  constructor(store) {
    this.store   = store;
    this.entries = store.get(CFG.storage.lb, []);
    if (this.entries.length === 0) this._seed();
  }

  _seed() {
    this.entries = [
      { player:'Alice 🏆',  score:498, difficulty:'hard',   attempts:2,  time:'00:09' },
      { player:'Bob ⚡',    score:497, difficulty:'hard',   attempts:3,  time:'00:17' },
      { player:'Carol 🎯',  score:98,  difficulty:'medium', attempts:2,  time:'00:07' },
      { player:'Dave 🎲',   score:496, difficulty:'hard',   attempts:4,  time:'00:34' },
      { player:'Eve 🌟',    score:95,  difficulty:'medium', attempts:5,  time:'00:28' },
      { player:'Frank 🔥',  score:46,  difficulty:'easy',   attempts:4,  time:'00:22' },
      { player:'Grace 💎',  score:487, difficulty:'hard',   attempts:13, time:'01:25' },
      { player:'Hank 🚀',   score:90,  difficulty:'medium', attempts:10, time:'01:05' },
      { player:'Iris ✨',   score:45,  difficulty:'easy',   attempts:5,  time:'00:31' },
      { player:'Jack 🎪',   score:480, difficulty:'hard',   attempts:20, time:'02:10' },
    ];
    this._save();
  }

  add(entry) {
    this.entries.push(entry);
    this.entries.sort((a, b) => b.score - a.score);
    if (this.entries.length > CFG.lb.max) this.entries.length = CFG.lb.max;
    this._save();
  }

  filter(diff) {
    return diff === 'all'
      ? [...this.entries]
      : this.entries.filter(e => e.difficulty === diff);
  }

  _save() { this.store.set(CFG.storage.lb, this.entries); }
}

/* ─────────────────────────────────────────────────────────────
   TIMER
───────────────────────────────────────────────────────────── */
class Timer {
  constructor(onTick) {
    this.onTick = onTick;
    this._id    = null;
    this.start0 = 0;
    this.elapsed= 0;
    this.running= false;
  }

  start() {
    this.stop();
    this.start0 = Date.now();
    this.elapsed = 0;
    this.running = true;
    this._id = setInterval(() => {
      this.elapsed = Math.floor((Date.now() - this.start0) / 1000);
      this.onTick(this._fmt(this.elapsed));
    }, 1000);
  }

  stop() {
    if (this._id) { clearInterval(this._id); this._id = null; }
    if (this.running) this.elapsed = Math.floor((Date.now() - this.start0) / 1000);
    this.running = false;
  }

  _fmt(s) {
    return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  }

  get formatted() { return this._fmt(this.elapsed); }
}

/* ─────────────────────────────────────────────────────────────
   CONFETTI
───────────────────────────────────────────────────────────── */
function fireConfetti(container) {
  const { colors, count } = CFG.confetti;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'conf-piece';
    const size = Math.random() * 9 + 4;
    el.style.cssText = `
      left:${Math.random()*100}%;
      width:${size}px; height:${size}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      border-radius:${Math.random()>.5 ? '50%' : '3px'};
      animation-duration:${(Math.random()*1.5+1).toFixed(2)}s;
      animation-delay:${(Math.random()*.45).toFixed(2)}s;
    `;
    container.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

/* ─────────────────────────────────────────────────────────────
   HERO CANVAS  (falling numbers)
───────────────────────────────────────────────────────────── */
class HeroFX {
  constructor(canvas) {
    this.c   = canvas;
    this.ctx = canvas.getContext('2d');
    this.cols = [];
    this._resize();
    this._raf = null;
    window.addEventListener('resize', () => this._resize());
    this._loop();
  }

  _resize() {
    this.c.width  = this.c.parentElement.offsetWidth;
    this.c.height = this.c.parentElement.offsetHeight;
    const n = Math.floor(this.c.width / 22);
    this.cols = Array(n).fill(0).map(() => Math.random() * this.c.height);
  }

  _loop() {
    const { ctx, c } = this;
    ctx.fillStyle = 'rgba(8,11,20,.06)';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.font = '13px monospace';

    this.cols.forEach((y, i) => {
      const bright = Math.random() > .94;
      ctx.fillStyle = bright ? `rgba(108,99,255,1)` : `rgba(108,99,255,.28)`;
      ctx.fillText(Math.floor(Math.random()*999)+1, i*22, y);
      this.cols[i] = y > c.height && Math.random() > .975 ? 0 : y + 22;
    });

    this._raf = requestAnimationFrame(() => this._loop());
  }

  destroy() { if (this._raf) cancelAnimationFrame(this._raf); }
}

/* ─────────────────────────────────────────────────────────────
   COUNTER ANIMATION
───────────────────────────────────────────────────────────── */
function countTo(el, target, ms = 1600) {
  const t0 = performance.now();
  const step = now => {
    const p = Math.min((now - t0) / ms, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(ease * target).toLocaleString();
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ─────────────────────────────────────────────────────────────
   MAIN APPLICATION
───────────────────────────────────────────────────────────── */
class App {
  constructor() {
    // Services
    this.audio = new AudioMgr();
    this.store = new Store();
    this.lb    = new LBManager(this.store);
    this.timer = new Timer(t => this._el('stat-timer').textContent = t);

    // Persistent stats
    this.stats = this.store.get(CFG.storage.stats, {
      played:0, won:0, bestScore:0
    });

    // Session / game state
    this.diff        = 'medium';
    this.maxRange    = 100;
    this.secret      = 0;
    this.attempts    = 0;
    this.active      = false;
    this.history     = [];
    this.sesPlayed   = 0;
    this.sesWon      = 0;
    this.lbFilter    = 'all';
    this.section     = 'home';
    this.heroFX      = null;

    this._bindEvents();
    this._initHero();
    this._observeCounters();
    this.navigate('home');
  }

  /* ── Helpers ─────────────────────────────────────────── */
  _el(id) { return document.getElementById(id); }

  _setText(id, val) {
    const el = this._el(id);
    if (el) el.textContent = val;
  }

  /* ── Routing ─────────────────────────────────────────── */
  navigate(sec) {
    document.querySelectorAll('.section')
      .forEach(s => s.classList.remove('active'));

    const target = this._el(`sec-${sec}`);
    if (target) target.classList.add('active');
    this.section = sec;

    // Nav active links
    document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(a => {
      a.classList.toggle('active', a.dataset.sec === sec);
    });

    if (sec === 'play') {
      if (!this.active) this.newGame();
      this._updateGamePanel();
      setTimeout(() => this._el('guess-input')?.focus(), 100);
    }
    if (sec === 'leaderboard') {
      this._renderLB('all');
      this._updateLBSidebar();
    }

    window.scrollTo({ top:0, behavior:'smooth' });
  }

  /* ── Difficulty ──────────────────────────────────────── */
  selectDiff(key) {
    const cfg = CFG.difficulties[key];
    if (!cfg) return;
    if (cfg.pro) { this.navigate('premium'); return; }

    this.diff = key;
    this.maxRange = cfg.max;

    // Highlight button
    document.querySelectorAll('.diff-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.diff === key);
    });

    // Update badge
    const badge = this._el('diff-badge');
    if (badge) {
      badge.textContent = cfg.label;
      badge.style.cssText = `
        background:${cfg.color}22;
        border-color:${cfg.color}66;
        color:${cfg.color};
      `;
    }

    this._el('input-range').textContent = `Range: 1 – ${cfg.max}`;
    this.audio.click();
    this.newGame();
  }

  /* ── New Game ────────────────────────────────────────── */
  newGame() {
    this.audio.click();
    const cfg = CFG.difficulties[this.diff];
    this.maxRange = cfg.max;
    this.secret   = Math.floor(Math.random() * cfg.max) + 1;
    this.attempts = 0;
    this.active   = true;
    this.history  = [];

    this.stats.played++;
    this.sesPlayed++;

    this._setFeedback(`🎲 Game started! Guess a number between 1 and ${cfg.max}.`,'neutral');
    this._setProgress(0);
    this._clearHistory();
    this._setText('stat-attempts','0');
    this._setText('stat-score','—');
    this._el('g-subtitle').textContent = `Guess a number between 1 and ${cfg.max}`;
    this._el('input-range').textContent = `Range: 1 – ${cfg.max}`;

    const inp = this._el('guess-input');
    if (inp) { inp.value = ''; inp.focus(); }

    this.timer.start();
    this._updateGamePanel();
    this.store.set(CFG.storage.stats, this.stats);
  }

  /* ── Submit Guess ────────────────────────────────────── */
  submitGuess() {
    if (!this.active) {
      this._setFeedback('⚠️ Start a new game first!', 'warning'); return;
    }

    const inp = this._el('guess-input');
    const raw = inp?.value.trim();

    if (!raw) {
      this._setFeedback('⚠️ Please enter a number first.', 'warning');
      this._shake(); return;
    }

    const n = parseInt(raw, 10);

    if (isNaN(n) || !Number.isInteger(n)) {
      this._setFeedback('⚠️ Only whole numbers are allowed.', 'warning');
      this._shake(); return;
    }

    if (n < 1 || n > this.maxRange) {
      this._setFeedback(`⚠️ Enter a number between 1 and ${this.maxRange}.`, 'warning');
      this._shake(); return;
    }

    this.attempts++;
    this._setText('stat-attempts', this.attempts);
    if (inp) inp.value = '';

    if (n === this.secret) {
      this._onWin();
    } else {
      this.audio.wrong();
      const dir = n < this.secret ? 'up' : 'down';
      this._setFeedback(
        dir === 'up' ? '📈 Try a Higher Number!' : '📉 Try a Lower Number!',
        'danger'
      );
      this._addHistory(n, dir);
      this._progressFromGuess(n);
    }

    if (inp) inp.focus();
  }

  /* ── Win ─────────────────────────────────────────────── */
  _onWin() {
    this.timer.stop();
    this.active = false;
    this.stats.won++;
    this.sesWon++;

    const score    = Math.max(0, this.maxRange - this.attempts);
    const newBest  = score > this.stats.bestScore;

    if (newBest) {
      this.stats.bestScore = score;
      this.audio.highscore();
    } else {
      this.audio.correct();
    }

    this._setProgress(100);
    this._addHistory(this.secret, 'win');

    const msg = newBest
      ? '🎉 Correct! 🏆 NEW HIGH SCORE!'
      : '🎉 Congratulations! You guessed it correctly!';
    this._setFeedback(msg, 'success');

    this.lb.add({
      player: 'You 🎯',
      score,
      difficulty: this.diff,
      attempts:   this.attempts,
      time:       this.timer.formatted,
      ts:         Date.now(),
    });

    this.store.set(CFG.storage.stats, this.stats);
    this._updateGamePanel();

    setTimeout(() => this._showWinModal(score, newBest), 380);
  }

  /* ── Win Modal ───────────────────────────────────────── */
  _showWinModal(score, newBest) {
    this._setText('win-number',   this.secret);
    this._setText('win-attempts', this.attempts);
    this._setText('win-time',     this.timer.formatted);
    this._setText('win-score',    score);
    this._setText('win-title', newBest ? '🏆 New High Score!' : '🎉 You Win!');

    const rb = this._el('record-banner');
    if (rb) rb.classList.toggle('hidden', !newBest);

    // Confetti
    const cc = this._el('modal-confetti');
    if (cc) fireConfetti(cc);

    openModal('win-modal');
  }

  /* ── Reset Score ─────────────────────────────────────── */
  resetScore() {
    if (!confirm('Reset your best score to 0?')) return;
    this.stats.bestScore = 0;
    this.store.set(CFG.storage.stats, this.stats);
    this._updateGamePanel();
    this._setFeedback('🔄 High score reset.', 'neutral');
  }

  /* ── Sound Toggle ────────────────────────────────────── */
  toggleSound() {
    const on = this.audio.toggle();
    const btn = document.querySelector('[data-action="sound"]');
    if (btn) btn.textContent = on ? '🔊 Sound' : '🔇 Muted';
  }

  /* ── Leaderboard ─────────────────────────────────────── */
  filterLB(diff) {
    this.lbFilter = diff;
    document.querySelectorAll('.lb-filter').forEach(b => {
      b.classList.toggle('active', b.dataset.diff === diff);
    });
    this._renderLB(diff);
  }

  _renderLB(diff) {
    const tbody  = this._el('lb-tbody');
    if (!tbody) return;
    const rows   = this.lb.filter(diff);
    const medals = ['🥇','🥈','🥉'];

    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="lb-empty">No scores yet — be the first! 🏆</td></tr>`;
      return;
    }

    tbody.innerHTML = rows.map((e, i) => {
      const rankCls  = i < 3 ? ['gold','silver','bronze'][i] : '';
      const rankDisp = i < 3 ? medals[i] : `#${i+1}`;
      return `<tr>
        <td><span class="lb-rank ${rankCls}">${rankDisp}</span></td>
        <td>${e.player}</td>
        <td><span class="lb-score">${e.score}</span></td>
        <td><span class="lb-diff ${e.difficulty}">${e.difficulty}</span></td>
        <td>${e.attempts}</td>
        <td>${e.time}</td>
      </tr>`;
    }).join('');
  }

  _updateLBSidebar() {
    const wr = this.stats.played
      ? Math.round(this.stats.won / this.stats.played * 100) + '%'
      : '0%';
    this._setText('lb-pb',      this.stats.bestScore);
    this._setText('lb-played',  this.stats.played);
    this._setText('lb-won',     this.stats.won);
    this._setText('lb-winrate', wr);
    this._setText('lb-best',    this.stats.bestScore);
  }

  /* ── Payment Modal ───────────────────────────────────── */
  showPayment(plan) {
    const names  = { pro:'Pro', enterprise:'Enterprise' };
    const prices = { pro:'$4.99', enterprise:'$19.99' };
    this._setText('pay-plan-name',  names[plan]  || 'Pro');
    this._setText('pay-plan-price', prices[plan] || '$4.99');
    openModal('pay-modal');
  }

  /* ── UI helpers ──────────────────────────────────────── */
  _updateGamePanel() {
    const wr = this.sesPlayed
      ? Math.round(this.sesWon / this.sesPlayed * 100) + '%'
      : '0%';
    this._setText('stat-best',    this.stats.bestScore);
    this._setText('stat-played',  this.sesPlayed);
    this._setText('stat-won',     this.sesWon);
    this._setText('stat-winrate', wr);
    this._setText('stat-attempts',this.attempts);
  }

  _setFeedback(msg, type = 'neutral') {
    const box  = this._el('feedback-box');
    const text = this._el('feedback-text');
    if (!box || !text) return;
    text.textContent = msg;
    box.className = 'feedback-box ' + (type !== 'neutral' ? type : '');
  }

  _setProgress(pct) {
    const fill  = this._el('prog-fill');
    const label = this._el('prog-pct');
    if (fill) {
      fill.style.width = `${pct}%`;
      fill.style.background =
        pct < 40  ? 'var(--danger)'  :
        pct < 70  ? 'var(--warning)' :
                    'var(--success)';
    }
    if (label) label.textContent = `${Math.round(pct)}%`;
  }

  _progressFromGuess(g) {
    const dist = Math.abs(g - this.secret);
    const pct  = Math.max(0, Math.round((1 - dist / this.maxRange) * 100));
    this._setProgress(pct);
  }

  _addHistory(guess, type) {
    const container = this._el('g-history');
    if (!container) return;
    const empty = container.querySelector('.g-empty');
    if (empty) empty.remove();

    const hints = { up:'↑ Go Higher', down:'↓ Go Lower', win:'✓ Correct!' };
    const div = document.createElement('div');
    div.className = `g-entry ${type}`;
    div.innerHTML = `
      <span class="g-num">#${this.attempts} → ${guess}</span>
      <span class="g-hint">${hints[type]||''}</span>
    `;
    container.insertBefore(div, container.firstChild);
  }

  _clearHistory() {
    const c = this._el('g-history');
    if (c) c.innerHTML = '<p class="g-empty">No guesses yet</p>';
  }

  _shake() {
    const inp = this._el('guess-input');
    if (!inp) return;
    inp.classList.remove('shake');
    void inp.offsetWidth; // reflow
    inp.classList.add('shake');
  }

  /* ── Event bindings ──────────────────────────────────── */
  _bindEvents() {
    // Enter → submit, Escape → close modals
    document.addEventListener('keydown', e => {
      if (e.key === 'Enter' && this.section === 'play') this.submitGuess();
      if (e.key === 'Escape') {
        document.querySelectorAll('.overlay.open').forEach(m => m.classList.remove('open'));
      }
    });

    // Hamburger
    const hb = document.getElementById('hamburger');
    if (hb) hb.addEventListener('click', () => {
      document.getElementById('mobile-nav')?.classList.toggle('open');
    });

    // Prevent non-numeric input in guess field
    const inp = this._el('guess-input');
    if (inp) {
      inp.addEventListener('input', () => {
        inp.value = inp.value.replace(/[^0-9]/g, '');
      });
    }
  }

  /* ── Hero canvas init ────────────────────────────────── */
  _initHero() {
    const canvas = this._el('heroCanvas');
    if (canvas) {
      // Defer slightly so layout is settled
      setTimeout(() => { this.heroFX = new HeroFX(canvas); }, 50);
    }
  }

  /* ── Intersection observer for hero counters ─────────── */
  _observeCounters() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const target = parseInt(e.target.dataset.count, 10);
          countTo(e.target, target);
          obs.unobserve(e.target);
        }
      });
    }, { threshold:.5 });

    document.querySelectorAll('[data-count]').forEach(el => obs.observe(el));
  }
}

/* ─────────────────────────────────────────────────────────────
   GLOBAL HELPERS  (called by inline HTML onclick)
───────────────────────────────────────────────────────────── */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}
function closeMobileNav() {
  document.getElementById('mobile-nav')?.classList.remove('open');
}

/* ─────────────────────────────────────────────────────────────
   BOOT
───────────────────────────────────────────────────────────── */
let app;
document.addEventListener('DOMContentLoaded', () => { app = new App(); });
