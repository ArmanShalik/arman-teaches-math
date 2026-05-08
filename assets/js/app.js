/* ═══════════════════════════════════════════════════════════════
   MathLab Education — Main Application
   Handles data loading, rendering, navigation, and scroll spy.
   ═══════════════════════════════════════════════════════════════ */

const ML = (function () {

  /* ── Data Layer ─────────────────────────────────────────────── */
  const data = {
    STORAGE_KEY: 'mathlab_site_data',

    load() {
      try {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Deep merge saved data with defaults (handles new fields added later)
          return this._merge(JSON.parse(JSON.stringify(window.ML_DEFAULT_DATA)), parsed);
        }
      } catch (e) { console.warn('MathLab: Could not load saved data, using defaults.', e); }
      return JSON.parse(JSON.stringify(window.ML_DEFAULT_DATA));
    },

    save(d) {
      try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(d)); }
      catch (e) { console.error('MathLab: Could not save data.', e); }
    },

    _merge(target, source) {
      for (const key of Object.keys(source)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          target[key] = this._merge(target[key] || {}, source[key]);
        } else {
          target[key] = source[key];
        }
      }
      return target;
    },

    reset() {
      localStorage.removeItem(this.STORAGE_KEY);
      return JSON.parse(JSON.stringify(window.ML_DEFAULT_DATA));
    }
  };

  /* ── State ──────────────────────────────────────────────────── */
  let _data = data.load();
  let _activeVideoPlaylist = 'pl0';

  /* ── Helpers ────────────────────────────────────────────────── */
  function h(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function gdrive(url) {
    if (!url) return '';
    const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (m) return `https://drive.google.com/uc?export=view&id=${m[1]}`;
    return url;
  }
  function fmtDate(d) {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return d; }
  }
  function uid() {
    return Math.random().toString(36).slice(2, 9);
  }

  /* ── Nav Config ─────────────────────────────────────────────── */
  const NAV_ITEMS = [
    { group: 'About Arman' },
    { id: 's-hero',          num: '01', label: 'Profile',             key: 'profile' },
    { id: 's-experience',    num: '02', label: 'Experience',          key: 'experience' },
    { id: 's-qualifications',num: '03', label: 'Qualifications',      key: 'qualifications' },
    { group: 'Classes' },
    { id: 's-workflow',      num: '04', label: 'How It Works',        key: 'workflow' },
    { id: 's-timetable',     num: '05', label: 'Timetable',           key: 'timetable' },
    { id: 's-locations',     num: '06', label: 'Locations',           key: 'locations' },
    { group: 'Join Us' },
    { id: 's-fees',          num: '07', label: 'Fee Structure',       key: 'fees' },
    { id: 's-enrollment',    num: '08', label: 'Enrollment',          key: 'enrollment' },
    { group: 'Updates' },
    { id: 's-announcements', num: '09', label: 'Announcements',       key: 'announcements', badge: 'new', badgeClass: 'sb-badge-new' },
    { id: 's-videos',        num: '10', label: 'Free Video Lessons',  key: 'videos', badge: 'free', badgeClass: 'sb-badge-hot' }
  ];

  /* ── Render Sidebar ─────────────────────────────────────────── */
  function renderSidebar() {
    const nav = document.getElementById('sidebarNav');
    const wb = document.getElementById('sbWhatsApp');
    const ft = document.getElementById('sbFooterText');
    if (wb) wb.href = `https://wa.me/${_data.meta.whatsapp}?text=${encodeURIComponent(_data.enrollment.whatsappMessage || '')}`;
    if (ft) ft.textContent = _data.meta.footerText;

    let html = '';
    for (const item of NAV_ITEMS) {
      if (item.group) {
        html += `<div class="sb-group">${h(item.group)}</div>`;
      } else {
        const sectionArchived = _data[item.key] && _data[item.key].archived;
        const archivedMark = sectionArchived ? ' style="opacity:.4;text-decoration:line-through"' : '';
        const badge = item.badge ? `<span class="sb-badge ${item.badgeClass}">${item.badge}</span>` : '';
        html += `<div class="sb-item" data-target="${item.id}"${archivedMark}>
          <span class="sb-item-num">${item.num}</span>
          <span class="sb-item-dot"></span>
          <span>${h(item.label)}</span>
          ${badge}
        </div>`;
      }
    }
    nav.innerHTML = html;

    // Click to scroll
    nav.querySelectorAll('.sb-item').forEach(el => {
      el.addEventListener('click', () => {
        const target = document.getElementById(el.dataset.target);
        if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        if (window.innerWidth < 900) ML.nav.toggleMobile(false);
      });
    });
  }

  /* ── Render All Sections ────────────────────────────────────── */
  function renderAll() {
    const container = document.getElementById('sectionsContainer');
    container.innerHTML = '';
    container.appendChild(renderHero());
    container.appendChild(renderExperience());
    container.appendChild(renderQualifications());
    container.appendChild(renderWorkflow());
    container.appendChild(renderTimetable());
    container.appendChild(renderLocations());
    container.appendChild(renderFees());
    container.appendChild(renderEnrollment());
    container.appendChild(renderAnnouncements());
    container.appendChild(renderVideos());
    renderFooter();
    initScrollSpy();
    ML.embed.initVideoThumbs();
  }

  function sectionWrapper(id, content, adminControls = '') {
    return `<div class="section" id="${id}">
      <div class="section-admin-controls" data-section="${id}">${adminControls}</div>
      ${content}
    </div>`;
  }

  function sectionHdr(num, title, desc, tags = '') {
    return `<div class="section-hdr">
      <div class="section-num">${num}</div>
      <div class="section-info">
        <h2>${title}</h2>
        ${desc ? `<p>${desc}</p>` : ''}
        ${tags ? `<div class="section-tags">${tags}</div>` : ''}
      </div>
    </div>`;
  }

  function adminBtn(label, action, cls = 'edit') {
    return `<button class="admin-ctrl-btn ${cls}" onclick="${action}">${label}</button>`;
  }

  /* ── Hero / Profile ─────────────────────────────────────────── */
  function renderHero() {
    const d = _data.profile;
    const m = _data.meta;
    const photoUrl = gdrive(d.photoUrl);
    const photo = photoUrl
      ? `<img src="${h(photoUrl)}" alt="${h(d.name)}" class="hero-photo" loading="lazy">`
      : `<div class="hero-photo-placeholder">
           <div class="ph-icon">👨‍🏫</div>
           <p>Your photo here<br><span style="color:var(--txt-d);font-size:.65rem">Add via Admin Mode</span></p>
         </div>`;

    const stats = d.stats.map(s =>
      `<div class="hero-stat">
        <span class="hero-stat-val">${h(s.value)}</span>
        <span class="hero-stat-lbl">${h(s.label)}</span>
      </div>`).join('');

    const subjects = d.subjects.map(s =>
      `<span class="pill pill-gd">${h(s)}</span>`).join('');

    const waUrl = `https://wa.me/${m.whatsapp}?text=${encodeURIComponent(_data.enrollment.whatsappMessage || '')}`;

    const archivedNotice = d.archived ? `<div class="archived-notice">⚠ This section is archived</div>` : '';
    const adminCtrl = adminBtn('✎ Edit Profile', `ML.admin.editSection('profile')`);

    const section = document.createElement('div');
    section.innerHTML = `<div class="section" id="s-hero" style="padding:0;${d.archived ? 'opacity:.5' : ''}">
      <div class="section-admin-controls">${adminCtrl}</div>
      ${archivedNotice}
      <div class="hero-inner">
        <div class="hero-content">
          <div class="hero-glow"></div>
          <div class="hero-eyebrow">MathLab Education</div>
          <h1 class="hero-name">Arman<br><span>${h(d.title.split('&')[0].trim())}</span><br>&amp; ${d.title.split('&')[1] ? d.title.split('&')[1].trim() : 'Educator'}</h1>
          <div class="hero-title">${h(d.subtitle)}</div>
          <p class="hero-bio">${h(d.bio)}</p>
          <div class="hero-stats">${stats}</div>
          <div class="hero-subjects">${subjects}</div>
          <div class="hero-actions">
            <a href="${h(waUrl)}" class="btn-gold" target="_blank" rel="noopener">
              📲 Enroll via WhatsApp
            </a>
            <a href="mailto:${h(m.email)}" class="btn-outline">✉ Email Arman</a>
          </div>
        </div>
        <div class="hero-photo-col">${photo}</div>
      </div>
    </div>`;
    return section.firstElementChild;
  }

  /* ── Experience ─────────────────────────────────────────────── */
  function renderExperience() {
    const d = _data.experience;
    const items = d.items.filter(x => !x.archived || ML.admin.isActive());
    const timelineItems = items.map(item => {
      const isArchived = item.archived;
      return `<div class="timeline-item">
        <div class="tl-card ${isArchived ? 'item-archived' : ''}" data-id="${item.id}">
          <div class="tl-role">${h(item.role)}</div>
          <div class="tl-org">${h(item.organization)}</div>
          <div class="tl-period">
            ${h(item.period)}
            ${item.current ? '<span class="tl-current">● CURRENT</span>' : ''}
          </div>
          <div class="tl-desc">${h(item.description)}</div>
          <div class="item-admin-controls">
            ${adminBtn('Edit', `ML.admin.editItem('experience','${item.id}')`)}
            ${isArchived
              ? adminBtn('Restore', `ML.admin.restoreItem('experience','${item.id}')`, 'restore')
              : adminBtn('Archive', `ML.admin.archiveItem('experience','${item.id}')`, 'archive')}
            ${adminBtn('Delete', `ML.admin.deleteItem('experience','${item.id}')`,'item-ctrl-btn delete')}
          </div>
        </div>
      </div>`;
    }).join('');

    const adminCtrl = [
      adminBtn('✎ Edit', `ML.admin.editSection('experience')`),
      adminBtn('+ Add', `ML.admin.addItem('experience')`, 'add'),
      d.archived ? adminBtn('↺ Restore', `ML.admin.restoreSection('experience')`, 'restore')
                 : adminBtn('◉ Archive', `ML.admin.archiveSection('experience')`, 'archive')
    ].join('');

    const el = document.createElement('div');
    el.innerHTML = sectionWrapper('s-experience',
      sectionHdr('02', 'Experience', 'Teaching background and professional history',
        `<span class="stag stag-gd">${d.items.filter(x => x.current).length} Current</span>
         <span class="stag stag-b">${d.items.length} Roles</span>`) +
      (d.archived ? `<div class="archived-notice">⚠ Section archived</div>` : '') +
      `<div class="timeline">${timelineItems || '<div class="empty-state"><div class="empty-state-icon">📋</div>No experience entries yet. Add one via Admin Mode.</div>'}</div>`,
      adminCtrl);
    return el.firstElementChild;
  }

  /* ── Qualifications ─────────────────────────────────────────── */
  function renderQualifications() {
    const d = _data.qualifications;
    const typeLabels = { degree: 'Degree', diploma: 'Diploma / PG', certification: 'Certification' };
    const items = d.items.filter(x => !x.archived || ML.admin.isActive());
    const cards = items.map(item => `
      <div class="qual-card ${item.archived ? 'item-archived' : ''}" data-type="${h(item.type)}" data-id="${item.id}">
        <div class="qual-type">${typeLabels[item.type] || h(item.type)}</div>
        <div class="qual-title">${h(item.title)}</div>
        <div class="qual-institution">${h(item.institution)}</div>
        <div class="qual-year">${h(item.year)}</div>
        <div class="item-admin-controls">
          ${adminBtn('Edit', `ML.admin.editItem('qualifications','${item.id}')`)}
          ${item.archived
            ? adminBtn('Restore', `ML.admin.restoreItem('qualifications','${item.id}')`, 'restore')
            : adminBtn('Archive', `ML.admin.archiveItem('qualifications','${item.id}')`, 'archive')}
          ${adminBtn('Delete', `ML.admin.deleteItem('qualifications','${item.id}')`, 'item-ctrl-btn delete')}
        </div>
      </div>`).join('');

    const adminCtrl = [
      adminBtn('✎ Edit', `ML.admin.editSection('qualifications')`),
      adminBtn('+ Add', `ML.admin.addItem('qualifications')`, 'add'),
      d.archived ? adminBtn('↺ Restore', `ML.admin.restoreSection('qualifications')`, 'restore')
                 : adminBtn('◉ Archive', `ML.admin.archiveSection('qualifications')`, 'archive')
    ].join('');

    const el = document.createElement('div');
    el.innerHTML = sectionWrapper('s-qualifications',
      sectionHdr('03', 'Qualifications', 'Academic credentials and professional certifications',
        `<span class="stag stag-gd">Degree</span><span class="stag stag-b">Diploma</span><span class="stag stag-g">Certifications</span>`) +
      (d.archived ? `<div class="archived-notice">⚠ Section archived</div>` : '') +
      `<div class="qual-grid">${cards || '<div class="empty-state"><div class="empty-state-icon">🎓</div>No qualifications added yet.</div>'}</div>`,
      adminCtrl);
    return el.firstElementChild;
  }

  /* ── Workflow ───────────────────────────────────────────────── */
  function renderWorkflow() {
    const d = _data.workflow;
    const steps = d.steps.filter(x => !x.archived || ML.admin.isActive());
    const cards = steps.map(s => `
      <div class="wf-card ${s.archived ? 'item-archived' : ''}" data-step="${h(s.step)}" data-id="${s.id}">
        <span class="wf-icon">${s.icon}</span>
        <div class="wf-step">Step ${h(s.step)}</div>
        <div class="wf-title">${h(s.title)}</div>
        <div class="wf-desc">${h(s.description)}</div>
        <div class="item-admin-controls">
          ${adminBtn('Edit', `ML.admin.editItem('workflow','${s.id}')`)}
          ${s.archived
            ? adminBtn('Restore', `ML.admin.restoreItem('workflow','${s.id}')`, 'restore')
            : adminBtn('Archive', `ML.admin.archiveItem('workflow','${s.id}')`, 'archive')}
          ${adminBtn('Delete', `ML.admin.deleteItem('workflow','${s.id}')`, 'item-ctrl-btn delete')}
        </div>
      </div>`).join('');

    const adminCtrl = [
      adminBtn('✎ Edit Intro', `ML.admin.editSection('workflow')`),
      adminBtn('+ Add Step', `ML.admin.addItem('workflow')`, 'add'),
      d.archived ? adminBtn('↺ Restore', `ML.admin.restoreSection('workflow')`, 'restore')
                 : adminBtn('◉ Archive', `ML.admin.archiveSection('workflow')`, 'archive')
    ].join('');

    const el = document.createElement('div');
    el.innerHTML = sectionWrapper('s-workflow',
      sectionHdr('04', 'How It Works', 'The MathLab learning journey — from assessment to exam success',
        `<span class="stag stag-g">${steps.length} Steps</span><span class="stag stag-b">Personalised</span>`) +
      (d.archived ? `<div class="archived-notice">⚠ Section archived</div>` : '') +
      `<p class="workflow-intro">${h(d.intro)}</p>
       <div class="workflow-grid">${cards}</div>`,
      adminCtrl);
    return el.firstElementChild;
  }

  /* ── Timetable ──────────────────────────────────────────────── */
  function renderTimetable() {
    const d = _data.timetable;
    const rows = d.rows.filter(x => !x.archived || ML.admin.isActive());

    const tableRows = rows.map(row => {
      const loc = _data.locations.items.find(l => l.id === row.locationId);
      const locName = loc ? loc.name : (row.locationId || '—');
      const locBtn = loc && !loc.archived
        ? `<button class="tt-location-link" onclick="ML.render.highlightLocation('${loc.id}')">${h(locName)}</button>`
        : `<span style="color:var(--txt-m)">${h(locName)}</span>`;
      return `<tr class="${row.archived ? 'item-archived' : ''}" data-id="${row.id}">
        <td>${h(row.day)}</td>
        <td>${h(row.time)}</td>
        <td>${h(row.subject)}</td>
        <td>${h(row.level)}</td>
        <td><span class="tt-type tt-type-${row.type.toLowerCase()}">${h(row.type)}</span></td>
        <td>${locBtn}</td>
        <td>${row.limited ? '<span class="tt-limited">★ LIMITED</span>' : '<span style="color:var(--green);font-size:.8rem">Available</span>'}</td>
        ${ML.admin.isActive() ? `<td>
          ${adminBtn('Edit', `ML.admin.editItem('timetable','${row.id}')`)}&nbsp;
          ${row.archived
            ? adminBtn('Restore', `ML.admin.restoreItem('timetable','${row.id}')`, 'restore')
            : adminBtn('Archive', `ML.admin.archiveItem('timetable','${row.id}')`, 'archive')}&nbsp;
          ${adminBtn('Del', `ML.admin.deleteItem('timetable','${row.id}')`, 'item-ctrl-btn delete')}
        </td>` : ''}
      </tr>`;
    }).join('');

    const adminHdr = ML.admin.isActive() ? '<th>Actions</th>' : '';
    const adminCtrl = [
      adminBtn('✎ Edit Note', `ML.admin.editSection('timetable')`),
      adminBtn('+ Add Row', `ML.admin.addItem('timetable')`, 'add'),
      d.archived ? adminBtn('↺ Restore', `ML.admin.restoreSection('timetable')`, 'restore')
                 : adminBtn('◉ Archive', `ML.admin.archiveSection('timetable')`, 'archive')
    ].join('');

    const el = document.createElement('div');
    el.innerHTML = sectionWrapper('s-timetable',
      sectionHdr('05', 'Class Timetable', 'All available class slots — click a location to see details',
        `<span class="stag stag-b">Weekly Schedule</span><span class="stag stag-gd">All Levels</span>`) +
      (d.archived ? `<div class="archived-notice">⚠ Section archived</div>` : '') +
      `<div class="tt-note">${h(d.note)}</div>
       <div class="tbl-wrap">
         <table class="tbl">
           <thead><tr>
             <th>Day</th><th>Time</th><th>Subject</th><th>Level</th>
             <th>Type</th><th>Location</th><th>Availability</th>${adminHdr}
           </tr></thead>
           <tbody>${tableRows}</tbody>
         </table>
       </div>`,
      adminCtrl);
    return el.firstElementChild;
  }

  /* ── Locations ──────────────────────────────────────────────── */
  function renderLocations() {
    const d = _data.locations;
    const items = d.items.filter(x => !x.archived || ML.admin.isActive());
    const cards = items.map(item => {
      const mapLink = item.mapUrl
        ? `<a href="${h(item.mapUrl)}" target="_blank" rel="noopener" class="loc-map-link">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
             View on Map
           </a>`
        : `<span style="color:var(--txt-d);font-size:.8rem;font-family:var(--mono)">Online — no physical location</span>`;
      const facs = item.facilities.map(f => `<span class="loc-fac">${h(f)}</span>`).join('');
      return `<div class="loc-card ${item.archived ? 'item-archived' : ''}" data-color="${h(item.color)}" id="loc-card-${item.id}" data-id="${item.id}">
        <div class="loc-type">${h(item.type)}</div>
        <div class="loc-name">${h(item.name)}</div>
        <div class="loc-address">${h(item.address)}</div>
        <div class="loc-facilities">${facs}</div>
        ${mapLink}
        <div class="item-admin-controls">
          ${adminBtn('Edit', `ML.admin.editItem('locations','${item.id}')`)}
          ${item.archived
            ? adminBtn('Restore', `ML.admin.restoreItem('locations','${item.id}')`, 'restore')
            : adminBtn('Archive', `ML.admin.archiveItem('locations','${item.id}')`, 'archive')}
          ${adminBtn('Delete', `ML.admin.deleteItem('locations','${item.id}')`, 'item-ctrl-btn delete')}
        </div>
      </div>`;
    }).join('');

    const adminCtrl = [
      adminBtn('+ Add Location', `ML.admin.addItem('locations')`, 'add'),
      d.archived ? adminBtn('↺ Restore', `ML.admin.restoreSection('locations')`, 'restore')
                 : adminBtn('◉ Archive', `ML.admin.archiveSection('locations')`, 'archive')
    ].join('');

    const el = document.createElement('div');
    el.innerHTML = sectionWrapper('s-locations',
      sectionHdr('06', 'Locations', 'Where MathLab Education classes take place',
        `<span class="stag stag-gd">${items.filter(x => x.type !== 'Online').length} Physical</span><span class="stag stag-g">Online Available</span>`) +
      (d.archived ? `<div class="archived-notice">⚠ Section archived</div>` : '') +
      `<div class="loc-grid">${cards || '<div class="empty-state"><div class="empty-state-icon">📍</div>No locations added yet.</div>'}</div>`,
      adminCtrl);
    return el.firstElementChild;
  }

  /* ── Fees ───────────────────────────────────────────────────── */
  function renderFees() {
    const d = _data.fees;
    const waUrl = `https://wa.me/${_data.meta.whatsapp}?text=${encodeURIComponent(_data.enrollment.whatsappMessage || '')}`;
    const cards = d.packages.filter(p => !p.archived || ML.admin.isActive()).map(pkg => {
      const features = pkg.features.map(f => `<li>${h(f)}</li>`).join('');
      return `<div class="fee-card ${pkg.highlight ? 'highlighted' : ''} ${pkg.archived ? 'item-archived' : ''}" data-id="${pkg.id}">
        ${pkg.badge ? `<div class="fee-badge">${h(pkg.badge)}</div>` : ''}
        <div class="fee-name">${h(pkg.name)}</div>
        <div class="fee-price">
          <span class="fee-currency">${h(d.currency)}</span>
          <span class="fee-amount">${h(pkg.priceMonthly)}</span>
          <span class="fee-period">/month</span>
        </div>
        <div class="fee-sessions">${h(pkg.sessions)} &middot; ${h(pkg.duration)}</div>
        <ul class="fee-features">${features}</ul>
        <a href="${h(waUrl)}" target="_blank" rel="noopener" class="fee-enroll-btn">Enroll Now →</a>
        <div class="item-admin-controls">
          ${adminBtn('Edit', `ML.admin.editItem('fees','${pkg.id}')`)}
          ${pkg.archived
            ? adminBtn('Restore', `ML.admin.restoreItem('fees','${pkg.id}')`, 'restore')
            : adminBtn('Archive', `ML.admin.archiveItem('fees','${pkg.id}')`, 'archive')}
          ${adminBtn('Delete', `ML.admin.deleteItem('fees','${pkg.id}')`, 'item-ctrl-btn delete')}
        </div>
      </div>`;
    }).join('');

    const adminCtrl = [
      adminBtn('✎ Edit Note', `ML.admin.editSection('fees')`),
      adminBtn('+ Add Package', `ML.admin.addItem('fees')`, 'add'),
      d.archived ? adminBtn('↺ Restore', `ML.admin.restoreSection('fees')`, 'restore')
                 : adminBtn('◉ Archive', `ML.admin.archiveSection('fees')`, 'archive')
    ].join('');

    const el = document.createElement('div');
    el.innerHTML = sectionWrapper('s-fees',
      sectionHdr('07', 'Fee Structure', 'Transparent pricing for all class types',
        `<span class="stag stag-gd">No Hidden Fees</span><span class="stag stag-g">Free Assessment</span>`) +
      (d.archived ? `<div class="archived-notice">⚠ Section archived</div>` : '') +
      `<div class="fee-note">${h(d.note)}</div>
       <div class="fee-grid">${cards}</div>`,
      adminCtrl);
    return el.firstElementChild;
  }

  /* ── Enrollment ─────────────────────────────────────────────── */
  function renderEnrollment() {
    const d = _data.enrollment;
    const m = _data.meta;
    const waUrl = `https://wa.me/${m.whatsapp}?text=${encodeURIComponent(d.whatsappMessage || '')}`;

    const steps = d.steps.filter(x => !x.archived || ML.admin.isActive()).map(s => {
      const actionHtml = s.action && s.actionUrl
        ? `<div class="enroll-step-action">
             <a href="${h(s.actionUrl === '#whatsapp' ? waUrl : s.actionUrl)}"
                ${s.actionUrl === '#whatsapp' ? 'target="_blank" rel="noopener"' : ''}>${h(s.action)}</a>
           </div>` : '';
      return `<div class="enroll-step ${s.archived ? 'item-archived' : ''}" data-id="${s.id}">
        <div class="enroll-step-num">${h(s.step)}</div>
        <div class="enroll-step-body">
          <div class="enroll-step-title">${h(s.title)}</div>
          <div class="enroll-step-desc">${h(s.description)}</div>
          ${actionHtml}
          <div class="item-admin-controls">
            ${adminBtn('Edit', `ML.admin.editItem('enrollment','${s.id}')`)}
            ${s.archived
              ? adminBtn('Restore', `ML.admin.restoreItem('enrollment','${s.id}')`, 'restore')
              : adminBtn('Archive', `ML.admin.archiveItem('enrollment','${s.id}')`, 'archive')}
            ${adminBtn('Delete', `ML.admin.deleteItem('enrollment','${s.id}')`, 'item-ctrl-btn delete')}
          </div>
        </div>
      </div>`;
    }).join('');

    const adminCtrl = [
      adminBtn('✎ Edit', `ML.admin.editSection('enrollment')`),
      adminBtn('+ Add Step', `ML.admin.addItem('enrollment')`, 'add'),
      d.archived ? adminBtn('↺ Restore', `ML.admin.restoreSection('enrollment')`, 'restore')
                 : adminBtn('◉ Archive', `ML.admin.archiveSection('enrollment')`, 'archive')
    ].join('');

    const el = document.createElement('div');
    el.innerHTML = sectionWrapper('s-enrollment',
      sectionHdr('08', 'Enrollment Process', 'How to join MathLab Education — five easy steps',
        `<span class="stag stag-g">Free Assessment</span><span class="stag stag-b">Flexible Start</span>`) +
      (d.archived ? `<div class="archived-notice">⚠ Section archived</div>` : '') +
      `<p class="enroll-intro">${h(d.intro)}</p>
       <div class="enroll-steps">${steps}</div>
       <div class="sub">Contact Us Directly</div>
       <div class="contact-cards" id="contactCards"></div>`,
      adminCtrl);
    const section = el.firstElementChild;
    // Render contact cards
    const cc = section.querySelector('#contactCards');
    if (cc) {
      cc.innerHTML = `
        <a href="${h(waUrl)}" target="_blank" rel="noopener" class="contact-card">
          <span class="contact-card-icon">📲</span>
          <div class="contact-card-info">
            <div class="contact-card-type">WhatsApp</div>
            <div class="contact-card-val">${h(m.whatsapp)}</div>
          </div>
        </a>
        <a href="tel:${h(m.phone)}" class="contact-card">
          <span class="contact-card-icon">📞</span>
          <div class="contact-card-info">
            <div class="contact-card-type">Phone</div>
            <div class="contact-card-val">${h(m.phone)}</div>
          </div>
        </a>
        <a href="mailto:${h(m.email)}" class="contact-card">
          <span class="contact-card-icon">✉</span>
          <div class="contact-card-info">
            <div class="contact-card-type">Email</div>
            <div class="contact-card-val">${h(m.email)}</div>
          </div>
        </a>`;
    }
    return section;
  }

  /* ── Announcements ──────────────────────────────────────────── */
  function renderAnnouncements() {
    const d = _data.announcements;
    const items = d.items
      .filter(x => !x.archived || ML.admin.isActive())
      .sort((a, b) => (b.pinned - a.pinned) || (new Date(b.date) - new Date(a.date)));

    const cards = items.map(item => {
      const imgUrl = gdrive(item.imageUrl);
      const imgHtml = imgUrl
        ? `<img src="${h(imgUrl)}" alt="${h(item.title)}" class="ann-img" loading="lazy">`
        : `<div class="ann-img-placeholder"><div class="ph-label">📢</div><span>Announcement Image</span><span style="font-size:.6rem;color:var(--txt-d)">Add via Admin Mode</span></div>`;
      return `<div class="ann-card ${item.pinned ? 'pinned' : ''} ${item.archived ? 'item-archived' : ''}" data-id="${item.id}">
        <div class="ann-img-wrap" data-ratio="${h(item.aspectRatio)}">
          ${imgHtml}
          ${item.pinned ? '<div class="ann-pin-badge">📌 PINNED</div>' : ''}
        </div>
        <div class="ann-body">
          <div class="ann-date">${fmtDate(item.date)}</div>
          <div class="ann-title">${h(item.title)}</div>
          <div class="ann-desc">${h(item.description)}</div>
        </div>
        <div class="item-admin-controls" style="padding:.4rem .8rem .8rem">
          ${adminBtn('Edit', `ML.admin.editItem('announcements','${item.id}')`)}
          ${item.pinned
            ? adminBtn('Unpin', `ML.admin.pinItem('announcements','${item.id}',false)`, 'pin')
            : adminBtn('Pin', `ML.admin.pinItem('announcements','${item.id}',true)`, 'pin')}
          ${item.archived
            ? adminBtn('Restore', `ML.admin.restoreItem('announcements','${item.id}')`, 'restore')
            : adminBtn('Archive', `ML.admin.archiveItem('announcements','${item.id}')`, 'archive')}
          ${adminBtn('Delete', `ML.admin.deleteItem('announcements','${item.id}')`, 'item-ctrl-btn delete')}
        </div>
      </div>`;
    }).join('');

    const adminCtrl = [
      adminBtn('+ Post Announcement', `ML.admin.addItem('announcements')`, 'add'),
      d.archived ? adminBtn('↺ Restore', `ML.admin.restoreSection('announcements')`, 'restore')
                 : adminBtn('◉ Archive', `ML.admin.archiveSection('announcements')`, 'archive')
    ].join('');

    const el = document.createElement('div');
    el.innerHTML = sectionWrapper('s-announcements',
      sectionHdr('09', 'Announcements', 'Special updates, events, and news from MathLab Education',
        `<span class="stag stag-g">Latest First</span><span class="stag stag-gd">Social Media</span>`) +
      (d.archived ? `<div class="archived-notice">⚠ Section archived</div>` : '') +
      `<div class="ann-grid">${cards || '<div class="empty-state"><div class="empty-state-icon">📢</div>No announcements yet. Post one via Admin Mode.</div>'}</div>`,
      adminCtrl);
    return el.firstElementChild;
  }

  /* ── Videos ─────────────────────────────────────────────────── */
  function renderVideos() {
    const d = _data.videos;

    const plTabs = d.playlists.map(pl =>
      `<button class="playlist-tab ${_activeVideoPlaylist === pl.id ? 'active' : ''}"
               data-plid="${pl.id}" onclick="ML.render.switchPlaylist('${pl.id}')">${h(pl.title)}</button>`
    ).join('');

    const filtered = d.items.filter(v =>
      (!v.archived || ML.admin.isActive()) &&
      (_activeVideoPlaylist === 'pl0' || v.playlistId === _activeVideoPlaylist)
    );

    const cards = filtered.map(v => {
      const plLabel = d.playlists.find(p => p.id === v.playlistId);
      return `<div class="video-card ${v.archived ? 'item-archived' : ''}" data-id="${v.id}" data-ytid="${h(v.youtubeId)}">
        <div class="video-thumb" id="vthumb-${v.id}" onclick="ML.embed.loadVideo('${v.id}','${h(v.youtubeId)}')">
          <img src="https://img.youtube.com/vi/${h(v.youtubeId)}/hqdefault.jpg"
               alt="${h(v.title)}" loading="lazy">
          <div class="video-play-btn">
            <svg viewBox="0 0 68 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="68" height="48" rx="12" fill="#C8A227" fill-opacity="0.88"/>
              <path d="M45 24L28 34V14L45 24Z" fill="#080b14"/>
            </svg>
          </div>
        </div>
        <div class="video-body">
          ${plLabel ? `<div class="video-playlist-tag">▶ ${h(plLabel.title)}</div>` : ''}
          <div class="video-title">${h(v.title)}</div>
          <div class="video-desc">${h(v.description)}</div>
          <div class="item-admin-controls">
            ${adminBtn('Edit', `ML.admin.editItem('videos','${v.id}')`)}
            ${v.archived
              ? adminBtn('Restore', `ML.admin.restoreItem('videos','${v.id}')`, 'restore')
              : adminBtn('Archive', `ML.admin.archiveItem('videos','${v.id}')`, 'archive')}
            ${adminBtn('Delete', `ML.admin.deleteItem('videos','${v.id}')`, 'item-ctrl-btn delete')}
          </div>
        </div>
      </div>`;
    }).join('');

    const adminCtrl = [
      adminBtn('✎ Edit Intro', `ML.admin.editSection('videos')`),
      adminBtn('+ Add Video', `ML.admin.addItem('videos')`, 'add'),
      d.archived ? adminBtn('↺ Restore', `ML.admin.restoreSection('videos')`, 'restore')
                 : adminBtn('◉ Archive', `ML.admin.archiveSection('videos')`, 'archive')
    ].join('');

    const el = document.createElement('div');
    el.innerHTML = sectionWrapper('s-videos',
      sectionHdr('10', 'Free Video Lessons', 'Recorded lessons available to everyone — no sign-up required',
        `<span class="stag stag-o">YouTube</span><span class="stag stag-g">Free Access</span>`) +
      (d.archived ? `<div class="archived-notice">⚠ Section archived</div>` : '') +
      `<p class="videos-intro">${h(d.intro)}</p>
       <div class="playlist-tabs" id="playlistTabs">${plTabs}</div>
       <div class="videos-grid" id="videosGrid">${cards || '<div class="empty-state"><div class="empty-state-icon">🎬</div>No videos in this playlist yet.</div>'}</div>`,
      adminCtrl);
    return el.firstElementChild;
  }

  /* ── Footer ─────────────────────────────────────────────────── */
  function renderFooter() {
    const m = _data.meta;
    const socials = m.socialLinks.map(s =>
      `<a href="${h(s.url)}" target="_blank" rel="noopener" class="footer-social-link" title="${h(s.platform)}">${h(s.label)}</a>`
    ).join('');
    document.getElementById('siteFooter').innerHTML = `
      <div class="footer-brand">
        <div class="footer-logo-mark">
          <svg viewBox="0 0 100 100" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 18 L78 18 L50 50 L78 82 L22 82" stroke="#080b14" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div>
          <div class="footer-name">Math<span>Lab</span> Education</div>
          <div class="footer-text">${h(m.footerText)}</div>
        </div>
      </div>
      <div class="footer-social">${socials}</div>`;
  }

  /* ── Scroll Spy ─────────────────────────────────────────────── */
  function initScrollSpy() {
    const sections = document.querySelectorAll('.section[id]');
    const items = document.querySelectorAll('.sb-item');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          items.forEach(i => i.classList.remove('active'));
          const active = document.querySelector(`.sb-item[data-target="${entry.target.id}"]`);
          if (active) { active.classList.add('active'); active.scrollIntoView({ block: 'nearest' }); }
        }
      });
    }, { threshold: 0.15, rootMargin: '-5% 0px -65% 0px' });
    sections.forEach(s => obs.observe(s));
  }

  /* ── Public render interface ────────────────────────────────── */
  const render = {
    getData()       { return _data; },
    setData(d)      { _data = d; data.save(d); },
    refresh()       { renderSidebar(); renderAll(); },

    highlightLocation(locId) {
      const target = document.getElementById('s-locations');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        const card = document.getElementById(`loc-card-${locId}`);
        if (card) {
          card.classList.add('highlighted-loc');
          setTimeout(() => card.classList.remove('highlighted-loc'), 2500);
        }
      }, 500);
    },

    switchPlaylist(plId) {
      _activeVideoPlaylist = plId;
      const section = document.getElementById('s-videos');
      if (section) {
        const newSection = renderVideos();
        section.replaceWith(newSection);
        ML.embed.initVideoThumbs();
      }
    }
  };

  /* ── Navigation helpers ─────────────────────────────────────── */
  const nav = {
    toggleMobile(open) {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sbOverlay');
      const state = open !== undefined ? open : !sidebar.classList.contains('mob-open');
      sidebar.classList.toggle('mob-open', state);
      overlay.classList.toggle('mob-open', state);
    }
  };

  /* ── Init ───────────────────────────────────────────────────── */
  function init() {
    renderSidebar();
    renderAll();
    // Keyboard shortcut for admin
    document.addEventListener('keydown', e => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        if (!ML.admin.isActive()) ML.admin.showLogin();
      }
    });
    // Show admin trigger button on hover near bottom-left
    const triggerBtn = document.getElementById('adminTriggerBtn');
    document.addEventListener('mousemove', e => {
      if (e.clientX < 320 && e.clientY > window.innerHeight - 120) {
        triggerBtn.classList.add('visible');
      } else {
        triggerBtn.classList.remove('visible');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);

  return { data, render, nav, uid, h, gdrive, fmtDate };
})();
