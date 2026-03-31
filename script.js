// ══════════════════════════════════════════
//  DATA STORE
// ══════════════════════════════════════════
const STORAGE_KEY = 'pst_cricket_data';
 
function loadData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { matches: [], lastSync: null }; }
  catch(e) { return { matches: [], lastSync: null }; }
}
function saveData(d) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }
 
let appData = loadData();
 
// ══════════════════════════════════════════
//  STATS COMPUTE
// ══════════════════════════════════════════
function computeStats() {
  const m = appData.matches;
  if (!m.length) return null;
 
  let runs=0, balls=0, fours=0, sixes=0, outs=0, notOuts=0, hs=0, fifties=0;
  let wickets=0, oversBowled=0, runsConceded=0, maidens=0, fourWktHauls=0;
  let catches=0, stumpings=0, runouts=0, directHits=0;
  let bestW=0, bestR=9999;
 
  m.forEach(match => {
    runs += match.runs || 0;
    balls += match.balls || 0;
    fours += match.fours || 0;
    sixes += match.sixes || 0;
    if (match.dismissed) outs++; else notOuts++;
    if ((match.runs||0) > hs) hs = match.runs||0;
    if ((match.runs||0) >= 50) fifties++;
 
    wickets += match.wickets || 0;
    oversBowled += parseFloat(match.overs || 0);
    runsConceded += match.rc || 0;
    maidens += match.maidens || 0;
    if ((match.wickets||0) >= 4) fourWktHauls++;
    if ((match.wickets||0) > bestW || ((match.wickets||0) === bestW && (match.rc||0) < bestR)) {
      bestW = match.wickets||0; bestR = match.rc||0;
    }
 
    catches += match.catches || 0;
    stumpings += match.stumpings || 0;
    runouts += match.runouts || 0;
    directHits += match.directHits || 0;
  });
 
  const totalInnings = m.length;
  const batAvg = outs > 0 ? (runs / outs) : runs;
  const sr = balls > 0 ? (runs / balls) * 100 : 0;
  const econ = oversBowled > 0 ? (runsConceded / oversBowled) : 0;
  const bowlAvg = wickets > 0 ? (runsConceded / wickets) : 0;
  const bowlSr = wickets > 0 ? ((oversBowled * 6) / wickets) : 0;
  const bdryRuns = fours * 4 + sixes * 6;
  const bdryPct = runs > 0 ? (bdryRuns / runs) * 100 : 0;
  const dotPct = balls > 0 ? ((balls - fours - sixes) / balls) * 100 : 0;
  const halfPct = totalInnings > 0 ? (fifties / totalInnings) * 100 : 0;
  const noPct = totalInnings > 0 ? (notOuts / totalInnings) * 100 : 0;
  const maidenPct = oversBowled > 0 ? (maidens / oversBowled) * 100 : 0;
  const fwktPct = totalInnings > 0 ? (fourWktHauls / totalInnings) * 100 : 0;
  const totalDismissals = catches + stumpings + runouts;
 
  return {
    totalInnings, runs, balls, fours, sixes, outs, notOuts, hs, fifties,
    batAvg, sr, bdryRuns, bdryPct, dotPct, halfPct, noPct,
    wickets, oversBowled, runsConceded, maidens, fourWktHauls,
    bestW, bestR, econ, bowlAvg, bowlSr, maidenPct, fwktPct,
    catches, stumpings, runouts, directHits, totalDismissals
  };
}
 
// ══════════════════════════════════════════
//  UI UPDATE
// ══════════════════════════════════════════
function set(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function pct(id, val) { const el = document.getElementById(id); if (el) el.style.width = Math.min(Math.max(val, 0), 100) + '%'; }
function fmt(n, dec=1) { return isNaN(n) || n === Infinity ? '0' : parseFloat(n).toFixed(dec); }
 
function updateUI() {
  const s = computeStats();
  const n = appData.matches.length;
 
  // Quick stats (hero)
  set('qs-matches', n || '—');
  set('qs-runs', s ? s.runs : '—');
  set('qs-wickets', s ? s.wickets : '—');
  set('qs-avg', s ? fmt(s.batAvg) : '—');
  set('qs-econ', s ? fmt(s.econ) : '—');
  set('qs-catches', s ? s.catches : '—');
 
  if (!s) return;
 
  // BATTING
  set('b-innings', s.totalInnings);
  set('b-runs', s.runs);
  set('b-hs', s.hs);
  set('b-avg', fmt(s.batAvg));
  set('b-sr', fmt(s.sr));
  set('b-50s', s.fifties);
  set('b-fours', s.fours);
  set('b-sixes', s.sixes);
  set('bdry-pct', Math.round(s.bdryPct) + '%'); pct('bdry-fill', s.bdryPct);
  set('dot-pct', Math.round(s.dotPct) + '%'); pct('dot-fill', s.dotPct);
  set('half-pct', Math.round(s.halfPct) + '%'); pct('half-fill', s.halfPct);
  set('no-pct', Math.round(s.noPct) + '%'); pct('no-fill', s.noPct);
  set('bi-balls', s.balls);
  set('bi-bdry', s.fours + ' + ' + s.sixes + ' = ' + (s.fours + s.sixes));
  set('bi-bdry-runs', s.bdryRuns + ' runs');
  set('bi-no', s.notOuts);
  set('bi-miles', s.fifties + ' fifties');
 
  // BOWLING
  set('bl-best-fig', s.bestW + '/' + (s.bestW > 0 ? s.bestR : '—'));
  set('bl-best-desc', s.bestW > 0 ? `${s.bestW} wickets ${s.bestR} runs — career best performance!` : 'Pehla match karo aur figures yahan aayenge.');
  set('bl-wickets', s.wickets);
  set('bl-overs', fmt(s.oversBowled));
  set('bl-econ', fmt(s.econ));
  set('bl-avg', fmt(s.bowlAvg));
  set('bl-sr', fmt(s.bowlSr));
  set('bl-maidens', s.maidens);
  set('bl-4wkt', s.fourWktHauls);
  set('bl-runs-c', s.runsConceded);
  set('maiden-pct', Math.round(s.maidenPct) + '%'); pct('maiden-fill', s.maidenPct);
  set('fwkt-pct', Math.round(s.fwktPct) + '%'); pct('fwkt-fill', s.fwktPct);
  set('bli-balls', Math.round(s.oversBowled * 6));
  set('bli-rpw', s.wickets > 0 ? fmt(s.runsConceded / s.wickets) : '—');
  set('bli-bpw', s.wickets > 0 ? fmt((s.oversBowled * 6) / s.wickets) : '—');
  set('bli-4wkt', s.fourWktHauls);
 
  // FIELDING
  set('f-catches', s.catches);
  set('f-runouts', s.runouts);
  set('f-direct', s.directHits);
  set('f-stumpings', s.stumpings);
  set('f-total', s.totalDismissals);
  set('f-per-match', n > 0 ? fmt(s.totalDismissals / n) : '0.0');
 
  renderMatches();
}
 
// ══════════════════════════════════════════
//  RENDER MATCH TABLE
// ══════════════════════════════════════════
function renderMatches() {
  const tbody = document.getElementById('matchTbody');
  if (!appData.matches.length) {
    tbody.innerHTML = '<tr><td colspan="12" style="text-align:center;color:var(--muted);padding:32px;">Koi match nahi — neeche add karo.</td></tr>';
    return;
  }
  tbody.innerHTML = appData.matches.slice().reverse().map((m, i) => {
    const num = appData.matches.length - i;
    const econ = m.overs > 0 ? fmt(m.rc / m.overs) : '—';
    return `<tr>
      <td class="muted">${num}</td>
      <td>${m.date || '—'}</td>
      <td>${m.opp || '—'}</td>
      <td>${m.format || 'T20'}</td>
      <td class="green">${m.runs ?? 0}</td>
      <td>${m.balls ?? 0}</td>
      <td class="gold">${m.fours ?? 0}</td>
      <td class="gold">${m.sixes ?? 0}</td>
      <td class="green">${m.wickets ?? 0}</td>
      <td>${m.overs ?? 0}</td>
      <td>${econ}</td>
      <td>${m.catches ?? 0}</td>
    </tr>`;
  }).join('');
}
 
// ══════════════════════════════════════════
//  ADD MATCH
// ══════════════════════════════════════════
function addMatch() {
  const g = id => document.getElementById(id);
  const runs = parseInt(g('f-runs').value) || 0;
  const balls = parseInt(g('f-balls').value) || 0;
  const overs = parseFloat(g('f-overs').value) || 0;
  const rc = parseInt(g('f-rc').value) || 0;
 
  const match = {
    opp: g('f-opp').value || 'Unknown',
    date: g('f-date').value || new Date().toISOString().split('T')[0],
    format: g('f-format').value,
    runs, balls,
    fours: parseInt(g('f-fours').value) || 0,
    sixes: parseInt(g('f-sixes').value) || 0,
    dismissed: runs >= 0 && balls > 0,
    wickets: parseInt(g('f-wickets').value) || 0,
    overs, rc,
    maidens: parseInt(g('f-maidens').value) || 0,
    catches: parseInt(g('f-catches-inp').value) || 0,
    stumpings: 0, runouts: 0, directHits: 0
  };
 
  appData.matches.push(match);
  saveData(appData);
  updateUI();
 
  // Clear form
  ['f-opp','f-runs','f-balls','f-fours','f-sixes','f-wickets','f-overs','f-rc','f-maidens','f-catches-inp'].forEach(id => { g(id).value = ''; });
  g('f-date').value = '';
 
  // Scroll to matches
  document.getElementById('matches').scrollIntoView({ behavior: 'smooth' });
}
 
// ══════════════════════════════════════════
//  SYNC BAR — CricHeroes auto-sync message
// ══════════════════════════════════════════
function updateSyncTime() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });
  document.getElementById('lastSyncTime').textContent = 'Last sync: ' + timeStr;
}
 
// Simulate live sync every 5 min
updateSyncTime();
setInterval(updateSyncTime, 300000);
 
// ══════════════════════════════════════════
//  HAMBURGER MENU
// ══════════════════════════════════════════
function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}
 
// ══════════════════════════════════════════
//  SCROLL ANIMATIONS
// ══════════════════════════════════════════
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
 
// Active nav on scroll
const sections = document.querySelectorAll('section[id], div.hero');
const navLinks = document.querySelectorAll('nav a');
window.addEventListener('scroll', () => {
  let cur = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) cur = s.id; });
  navLinks.forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('href') === '#' + cur || (cur === '' && a.getAttribute('href') === '#')) a.classList.add('active');
  });
});
 
// ══════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════
updateUI();