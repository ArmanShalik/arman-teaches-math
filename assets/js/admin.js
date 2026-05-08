/* ═══════════════════════════════════════════════════════════════
   MathLab Education — Admin Module
   Manages content editing, login, CRUD, and persistence.
   Default password: mathlab2025  (change via editSection('meta'))
   ═══════════════════════════════════════════════════════════════ */

ML.admin = (function () {

  /* ── Auth ───────────────────────────────────────────────────── */
  const PASS_KEY   = 'mathlab_admin_pass';
  const SESSION_KEY = 'mathlab_admin_session';
  const DEFAULT_PASS_HASH = btoa('mathlab2025');

  function _getPassHash() {
    return localStorage.getItem(PASS_KEY) || DEFAULT_PASS_HASH;
  }
  function isActive() {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  }

  function showLogin() {
    const overlay = document.getElementById('loginModalOverlay');
    overlay.classList.add('open');
    setTimeout(() => document.getElementById('adminPassInput').focus(), 100);
  }
  function closeLogin() {
    const overlay = document.getElementById('loginModalOverlay');
    overlay.classList.remove('open');
    document.getElementById('adminPassInput').value = '';
    document.getElementById('loginError').textContent = '';
  }
  function attemptLogin() {
    const input = document.getElementById('adminPassInput').value;
    if (btoa(input) === _getPassHash()) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      closeLogin();
      document.body.classList.add('admin-active');
      ML.render.refresh();
      toast('Admin mode active. Use Ctrl+Shift+A or the bar to exit.', 'success');
    } else {
      document.getElementById('loginError').textContent = 'Incorrect password. Try again.';
      document.getElementById('adminPassInput').value = '';
      document.getElementById('adminPassInput').focus();
    }
  }
  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    document.body.classList.remove('admin-active');
    ML.render.refresh();
    toast('Exited admin mode.', 'success');
  }

  /* ── Toast ──────────────────────────────────────────────────── */
  function toast(msg, type = 'success') {
    const icon = type === 'success' ? '✓' : '✕';
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span class="toast-icon">${icon}</span><span>${ML.h(msg)}</span>`;
    document.getElementById('toastContainer').appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }

  /* ── Confirm Dialog ─────────────────────────────────────────── */
  let _confirmCb = null;
  function confirm(title, msg, cb) {
    _confirmCb = cb;
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = msg;
    document.getElementById('confirmOkBtn').onclick = () => { closeConfirm(); cb(); };
    document.getElementById('confirmOverlay').classList.add('open');
  }
  function closeConfirm() {
    document.getElementById('confirmOverlay').classList.remove('open');
    _confirmCb = null;
  }

  /* ── Edit Modal ─────────────────────────────────────────────── */
  let _modalSaveCb = null;
  function openEditModal(title, bodyHtml, saveCb) {
    _modalSaveCb = saveCb;
    document.getElementById('editModalTitle').textContent = title;
    document.getElementById('editModalBody').innerHTML = bodyHtml;
    document.getElementById('editModalSave').onclick = () => {
      if (_modalSaveCb) _modalSaveCb();
    };
    document.getElementById('editModalOverlay').classList.add('open');
  }
  function closeEditModal() {
    document.getElementById('editModalOverlay').classList.remove('open');
    _modalSaveCb = null;
  }

  /* ── Form Helpers ───────────────────────────────────────────── */
  function fg(label, id, type, val, hint = '', options = null) {
    const safeVal = ML.h(val || '');
    if (type === 'textarea') {
      return `<div class="form-group">
        <label class="form-label" for="${id}">${label}</label>
        <textarea class="form-textarea" id="${id}">${safeVal}</textarea>
        ${hint ? `<div class="form-hint">${hint}</div>` : ''}
      </div>`;
    }
    if (type === 'select' && options) {
      const opts = options.map(o => `<option value="${ML.h(o.v)}" ${o.v === val ? 'selected' : ''}>${ML.h(o.l)}</option>`).join('');
      return `<div class="form-group">
        <label class="form-label" for="${id}">${label}</label>
        <select class="form-select" id="${id}">${opts}</select>
        ${hint ? `<div class="form-hint">${hint}</div>` : ''}
      </div>`;
    }
    if (type === 'check') {
      return `<div class="form-group">
        <label class="form-check">
          <input type="checkbox" id="${id}" ${val ? 'checked' : ''}>
          <span class="form-check-label">${label}</span>
        </label>
      </div>`;
    }
    return `<div class="form-group">
      <label class="form-label" for="${id}">${label}</label>
      <input type="${type}" class="form-input" id="${id}" value="${safeVal}">
      ${hint ? `<div class="form-hint">${hint}</div>` : ''}
    </div>`;
  }
  function fv(id) { const el = document.getElementById(id); return el ? (el.type === 'checkbox' ? el.checked : el.value.trim()) : ''; }

  /* ── Section-Level Edits ────────────────────────────────────── */
  function editSection(key) {
    const d = ML.render.getData();
    if (key === 'profile') {
      const p = d.profile;
      const statsHtml = p.stats.map((s, i) =>
        `<div class="form-list-item">
          <div class="item-body">
            <div class="form-row">
              <input type="text" class="form-input stat-val" placeholder="Value (e.g. 8+)" value="${ML.h(s.value)}">
              <input type="text" class="form-input stat-lbl" placeholder="Label (e.g. Years Teaching)" value="${ML.h(s.label)}">
            </div>
          </div>
          <button class="form-list-item-remove" onclick="this.closest('.form-list-item').remove()">✕</button>
        </div>`).join('');
      const subjectsHtml = p.subjects.map(s =>
        `<div class="form-list-item">
          <div class="item-body">
            <input type="text" class="form-input subj-item" value="${ML.h(s)}">
          </div>
          <button class="form-list-item-remove" onclick="this.closest('.form-list-item').remove()">✕</button>
        </div>`).join('');

      openEditModal('Edit Profile', `
        <div class="form-section-title">Basic Information</div>
        ${fg('Display Name', 'pName', 'text', p.name)}
        ${fg('Full Name', 'pFullName', 'text', p.fullName)}
        ${fg('Title / Role', 'pTitle', 'text', p.title, 'e.g. Mathematics Educator & Tutor')}
        ${fg('Sub-title', 'pSubtitle', 'text', p.subtitle, 'e.g. Founder, MathLab Education')}
        ${fg('Biography', 'pBio', 'textarea', p.bio)}
        <hr class="form-sep">
        <div class="form-section-title">Profile Photo</div>
        ${fg('Photo URL', 'pPhoto', 'text', p.photoUrl, 
          'Paste a Google Drive share URL (https://drive.google.com/file/d/…/view) or any direct image URL.')}
        <hr class="form-sep">
        <div class="form-section-title">Statistics</div>
        <div class="form-list" id="statsList">${statsHtml}</div>
        <button class="btn-add-item" onclick="addStatRow()">+ Add Stat</button>
        <hr class="form-sep">
        <div class="form-section-title">Subjects Offered</div>
        <div class="form-list" id="subjList">${subjectsHtml}</div>
        <button class="btn-add-item" onclick="addSubjRow()">+ Add Subject</button>
        <hr class="form-sep">
        <div class="form-section-title">Contact &amp; Password</div>
        ${fg('Email', 'pEmail', 'email', d.meta.email)}
        ${fg('Phone', 'pPhone', 'text', d.meta.phone)}
        ${fg('WhatsApp Number', 'pWA', 'text', d.meta.whatsapp, 'Digits only, e.g. 94770000000')}
        ${fg('New Admin Password', 'pPass', 'password', '', 'Leave blank to keep current password')}
      `, () => {
        d.profile.name      = fv('pName');
        d.profile.fullName  = fv('pFullName');
        d.profile.title     = fv('pTitle');
        d.profile.subtitle  = fv('pSubtitle');
        d.profile.bio       = fv('pBio');
        d.profile.photoUrl  = fv('pPhoto');
        d.meta.email        = fv('pEmail');
        d.meta.phone        = fv('pPhone');
        d.meta.whatsapp     = fv('pWA');
        const newPass       = fv('pPass');
        if (newPass) localStorage.setItem(PASS_KEY, btoa(newPass));

        // Stats
        d.profile.stats = [];
        document.querySelectorAll('#statsList .form-list-item').forEach(row => {
          const v = row.querySelector('.stat-val')?.value.trim();
          const l = row.querySelector('.stat-lbl')?.value.trim();
          if (v || l) d.profile.stats.push({ id: ML.uid(), value: v, label: l });
        });
        // Subjects
        d.profile.subjects = [];
        document.querySelectorAll('#subjList .subj-item').forEach(el => {
          if (el.value.trim()) d.profile.subjects.push(el.value.trim());
        });

        ML.render.setData(d); ML.render.refresh(); closeEditModal();
        toast('Profile updated!');
      });

      // Helpers attached to window temporarily
      window.addStatRow = () => {
        const list = document.getElementById('statsList');
        const row = document.createElement('div');
        row.className = 'form-list-item';
        row.innerHTML = `<div class="item-body"><div class="form-row"><input type="text" class="form-input stat-val" placeholder="Value"><input type="text" class="form-input stat-lbl" placeholder="Label"></div></div><button class="form-list-item-remove" onclick="this.closest('.form-list-item').remove()">✕</button>`;
        list.appendChild(row);
      };
      window.addSubjRow = () => {
        const list = document.getElementById('subjList');
        const row = document.createElement('div');
        row.className = 'form-list-item';
        row.innerHTML = `<div class="item-body"><input type="text" class="form-input subj-item" placeholder="Subject name"></div><button class="form-list-item-remove" onclick="this.closest('.form-list-item').remove()">✕</button>`;
        list.appendChild(row);
      };
    }

    else if (key === 'workflow') {
      const w = d.workflow;
      openEditModal('Edit Workflow Intro', fg('Section Introduction', 'wfIntro', 'textarea', w.intro), () => {
        d.workflow.intro = fv('wfIntro');
        ML.render.setData(d); ML.render.refresh(); closeEditModal(); toast('Workflow updated!');
      });
    }

    else if (key === 'timetable') {
      const t = d.timetable;
      openEditModal('Edit Timetable Note', fg('Note / Disclaimer', 'ttNote', 'textarea', t.note), () => {
        d.timetable.note = fv('ttNote');
        ML.render.setData(d); ML.render.refresh(); closeEditModal(); toast('Timetable updated!');
      });
    }

    else if (key === 'fees') {
      const f = d.fees;
      openEditModal('Edit Fees Info', `
        ${fg('Currency', 'fCur', 'text', f.currency)}
        ${fg('Note / Disclaimer', 'fNote', 'textarea', f.note)}
      `, () => {
        d.fees.currency = fv('fCur');
        d.fees.note     = fv('fNote');
        ML.render.setData(d); ML.render.refresh(); closeEditModal(); toast('Fees info updated!');
      });
    }

    else if (key === 'enrollment') {
      const e = d.enrollment;
      openEditModal('Edit Enrollment Info', `
        ${fg('Introduction', 'enIntro', 'textarea', e.intro)}
        ${fg('WhatsApp Pre-filled Message', 'enWA', 'textarea', e.whatsappMessage)}
      `, () => {
        d.enrollment.intro            = fv('enIntro');
        d.enrollment.whatsappMessage  = fv('enWA');
        ML.render.setData(d); ML.render.refresh(); closeEditModal(); toast('Enrollment updated!');
      });
    }

    else if (key === 'videos') {
      const v = d.videos;
      openEditModal('Edit Videos Intro', fg('Introduction', 'vIntro', 'textarea', v.intro), () => {
        d.videos.intro = fv('vIntro');
        ML.render.setData(d); ML.render.refresh(); closeEditModal(); toast('Videos intro updated!');
      });
    }

    else if (key === 'experience' || key === 'qualifications' || key === 'announcements' || key === 'locations') {
      toast('Use the section-level Archive button, or click Edit on individual items.', 'success');
    }
  }

  /* ── Add Item ───────────────────────────────────────────────── */
  function addItem(section) {
    const d = ML.render.getData();

    if (section === 'experience') {
      openEditModal('Add Experience', `
        ${fg('Role / Position', 'iRole', 'text', '')}
        ${fg('Organisation', 'iOrg', 'text', '')}
        ${fg('Period', 'iPeriod', 'text', '', 'e.g. 2019 – Present')}
        ${fg('Description', 'iDesc', 'textarea', '')}
        ${fg('Current position?', 'iCurrent', 'check', false)}
      `, () => {
        d.experience.items.unshift({ id: ML.uid(), role: fv('iRole'), organization: fv('iOrg'), period: fv('iPeriod'), description: fv('iDesc'), current: fv('iCurrent'), archived: false });
        ML.render.setData(d); ML.render.refresh(); closeEditModal(); toast('Experience added!');
      });
    }

    else if (section === 'qualifications') {
      openEditModal('Add Qualification', `
        ${fg('Title', 'qTitle', 'text', '')}
        ${fg('Institution', 'qInst', 'text', '')}
        ${fg('Year', 'qYear', 'text', '')}
        ${fg('Type', 'qType', 'select', 'degree', '', [
          { v: 'degree', l: 'Degree' }, { v: 'diploma', l: 'Diploma / PG' }, { v: 'certification', l: 'Certification' }
        ])}
      `, () => {
        d.qualifications.items.push({ id: ML.uid(), title: fv('qTitle'), institution: fv('qInst'), year: fv('qYear'), type: fv('qType'), archived: false });
        ML.render.setData(d); ML.render.refresh(); closeEditModal(); toast('Qualification added!');
      });
    }

    else if (section === 'workflow') {
      const nextStep = String(d.workflow.steps.length + 1).padStart(2, '0');
      openEditModal('Add Workflow Step', `
        ${fg('Step Number', 'wsStep', 'text', nextStep)}
        ${fg('Emoji Icon', 'wsIcon', 'text', '📌', 'Paste any emoji')}
        ${fg('Title', 'wsTitle', 'text', '')}
        ${fg('Description', 'wsDesc', 'textarea', '')}
      `, () => {
        d.workflow.steps.push({ id: ML.uid(), step: fv('wsStep'), icon: fv('wsIcon') || '📌', title: fv('wsTitle'), description: fv('wsDesc'), archived: false });
        ML.render.setData(d); ML.render.refresh(); closeEditModal(); toast('Step added!');
      });
    }

    else if (section === 'timetable') {
      const locOpts = d.locations.items.filter(l => !l.archived).map(l => ({ v: l.id, l: l.name }));
      openEditModal('Add Timetable Row', `
        ${fg('Day', 'ttDay', 'text', '', 'e.g. Monday, Saturday, Flexible')}
        ${fg('Time', 'ttTime', 'text', '', 'e.g. 4:00 PM – 5:30 PM')}
        ${fg('Subject', 'ttSubj', 'text', '')}
        ${fg('Level', 'ttLevel', 'text', '', 'e.g. Grade 10–11')}
        ${fg('Class Type', 'ttType', 'select', 'Group', '', [{ v: 'Group', l: 'Group' }, { v: 'Individual', l: 'Individual' }])}
        ${fg('Location', 'ttLoc', 'select', locOpts[0]?.v || '', '', locOpts)}
        ${fg('Limited seats?', 'ttLimited', 'check', false)}
      `, () => {
        d.timetable.rows.push({ id: ML.uid(), day: fv('ttDay'), time: fv('ttTime'), subject: fv('ttSubj'), level: fv('ttLevel'), type: fv('ttType'), locationId: fv('ttLoc'), limited: fv('ttLimited'), archived: false });
        ML.render.setData(d); ML.render.refresh(); closeEditModal(); toast('Timetable row added!');
      });
    }

    else if (section === 'locations') {
      openEditModal('Add Location', `
        ${fg('Location Name', 'lName', 'text', '')}
        ${fg('Type', 'lType', 'select', 'Centre', '', [{ v: 'Centre', l: 'Centre' }, { v: 'Branch', l: 'Branch' }, { v: 'Online', l: 'Online' }])}
        ${fg('Address / Details', 'lAddr', 'textarea', '')}
        ${fg('Google Maps URL', 'lMap', 'text', '', 'Paste a maps.google.com link')}
        ${fg('Facilities (comma-separated)', 'lFac', 'text', '', 'e.g. Air Conditioned, Whiteboard, Parking')}
        ${fg('Card Colour', 'lColor', 'select', 'gold', '', [{ v: 'gold', l: 'Gold' }, { v: 'blue', l: 'Blue' }, { v: 'green', l: 'Green' }])}
      `, () => {
        const facs = fv('lFac').split(',').map(f => f.trim()).filter(Boolean);
        d.locations.items.push({ id: ML.uid(), name: fv('lName'), type: fv('lType'), address: fv('lAddr'), mapUrl: fv('lMap'), facilities: facs, color: fv('lColor'), archived: false });
        ML.render.setData(d); ML.render.refresh(); closeEditModal(); toast('Location added!');
      });
    }

    else if (section === 'fees') {
      openEditModal('Add Fee Package', `
        ${fg('Package Name', 'fpName', 'text', '')}
        ${fg('Monthly Price', 'fpPrice', 'text', '', 'Numbers only, e.g. 6,500')}
        ${fg('Sessions', 'fpSessions', 'text', '', 'e.g. 4 sessions/month')}
        ${fg('Duration per session', 'fpDuration', 'text', '', 'e.g. 90 min/session')}
        ${fg('Badge text (optional)', 'fpBadge', 'text', '', 'e.g. Most Popular, Exam Prep')}
        ${fg('Features (one per line)', 'fpFeatures', 'textarea', '')}
        ${fg('Highlight this package?', 'fpHL', 'check', false)}
      `, () => {
        const features = fv('fpFeatures').split('\n').map(f => f.trim()).filter(Boolean);
        d.fees.packages.push({ id: ML.uid(), name: fv('fpName'), priceMonthly: fv('fpPrice'), sessions: fv('fpSessions'), duration: fv('fpDuration'), badge: fv('fpBadge'), features, highlight: fv('fpHL'), archived: false });
        ML.render.setData(d); ML.render.refresh(); closeEditModal(); toast('Package added!');
      });
    }

    else if (section === 'enrollment') {
      const nextStep = String(d.enrollment.steps.length + 1).padStart(2, '0');
      openEditModal('Add Enrollment Step', `
        ${fg('Step Number', 'enStep', 'text', nextStep)}
        ${fg('Title', 'enTitle', 'text', '')}
        ${fg('Description', 'enDesc', 'textarea', '')}
        ${fg('Action Label (optional)', 'enAction', 'text', '', 'Button label')}
        ${fg('Action URL (optional)', 'enActionUrl', 'text', '', 'URL or #section-id')}
      `, () => {
        d.enrollment.steps.push({ id: ML.uid(), step: fv('enStep'), title: fv('enTitle'), description: fv('enDesc'), action: fv('enAction'), actionUrl: fv('enActionUrl'), archived: false });
        ML.render.setData(d); ML.render.refresh(); closeEditModal(); toast('Step added!');
      });
    }

    else if (section === 'announcements') {
      openEditModal('Post Announcement', `
        ${fg('Title', 'anTitle', 'text', '')}
        ${fg('Description', 'anDesc', 'textarea', '')}
        ${fg('Image URL', 'anImg', 'text', '', 'Google Drive share URL or direct image URL')}
        ${fg('Image Aspect Ratio', 'anRatio', 'select', '1:1', '', [
          { v: '1:1', l: '1:1 (Square — Instagram)' },
          { v: '16:9', l: '16:9 (Landscape — YouTube / Facebook)' },
          { v: '4:5', l: '4:5 (Portrait — Instagram)' },
          { v: '9:16', l: '9:16 (Stories)' }
        ])}
        ${fg('Date', 'anDate', 'date', new Date().toISOString().slice(0, 10))}
        ${fg('Pin to top?', 'anPin', 'check', false)}
      `, () => {
        d.announcements.items.unshift({ id: ML.uid(), title: fv('anTitle'), description: fv('anDesc'), imageUrl: fv('anImg'), aspectRatio: fv('anRatio'), date: fv('anDate'), pinned: fv('anPin'), archived: false });
        ML.render.setData(d); ML.render.refresh(); closeEditModal(); toast('Announcement posted!');
      });
    }

    else if (section === 'videos') {
      const plOpts = d.videos.playlists.filter(p => p.id !== 'pl0').map(p => ({ v: p.id, l: p.title }));
      openEditModal('Add Video', `
        ${fg('Video Title', 'vTitle', 'text', '')}
        ${fg('YouTube Video ID', 'vYtId', 'text', '', 'From the URL: youtube.com/watch?v=THIS_PART')}
        ${fg('Playlist', 'vPl', 'select', plOpts[0]?.v || '', '', plOpts)}
        ${fg('Description', 'vDesc', 'textarea', '')}
      `, () => {
        d.videos.items.push({ id: ML.uid(), title: fv('vTitle'), youtubeId: fv('vYtId'), playlistId: fv('vPl'), description: fv('vDesc'), archived: false });
        ML.render.setData(d); ML.render.refresh(); closeEditModal(); toast('Video added!');
      });
    }
  }

  /* ── Edit Item ──────────────────────────────────────────────── */
  function editItem(section, id) {
    const d = ML.render.getData();

    if (section === 'experience') {
      const item = d.experience.items.find(x => x.id === id);
      if (!item) return;
      openEditModal('Edit Experience', `
        ${fg('Role / Position', 'iRole', 'text', item.role)}
        ${fg('Organisation', 'iOrg', 'text', item.organization)}
        ${fg('Period', 'iPeriod', 'text', item.period)}
        ${fg('Description', 'iDesc', 'textarea', item.description)}
        ${fg('Current position?', 'iCurrent', 'check', item.current)}
      `, () => {
        item.role = fv('iRole'); item.organization = fv('iOrg'); item.period = fv('iPeriod');
        item.description = fv('iDesc'); item.current = fv('iCurrent');
        ML.render.setData(d); ML.render.refresh(); closeEditModal(); toast('Updated!');
      });
    }

    else if (section === 'qualifications') {
      const item = d.qualifications.items.find(x => x.id === id);
      if (!item) return;
      openEditModal('Edit Qualification', `
        ${fg('Title', 'qTitle', 'text', item.title)}
        ${fg('Institution', 'qInst', 'text', item.institution)}
        ${fg('Year', 'qYear', 'text', item.year)}
        ${fg('Type', 'qType', 'select', item.type, '', [
          { v: 'degree', l: 'Degree' }, { v: 'diploma', l: 'Diploma / PG' }, { v: 'certification', l: 'Certification' }
        ])}
      `, () => {
        item.title = fv('qTitle'); item.institution = fv('qInst');
        item.year = fv('qYear'); item.type = fv('qType');
        ML.render.setData(d); ML.render.refresh(); closeEditModal(); toast('Updated!');
      });
    }

    else if (section === 'workflow') {
      const item = d.workflow.steps.find(x => x.id === id);
      if (!item) return;
      openEditModal('Edit Step', `
        ${fg('Step Number', 'wsStep', 'text', item.step)}
        ${fg('Emoji Icon', 'wsIcon', 'text', item.icon)}
        ${fg('Title', 'wsTitle', 'text', item.title)}
        ${fg('Description', 'wsDesc', 'textarea', item.description)}
      `, () => {
        item.step = fv('wsStep'); item.icon = fv('wsIcon') || '📌';
        item.title = fv('wsTitle'); item.description = fv('wsDesc');
        ML.render.setData(d); ML.render.refresh(); closeEditModal(); toast('Updated!');
      });
    }

    else if (section === 'timetable') {
      const item = d.timetable.rows.find(x => x.id === id);
      if (!item) return;
      const locOpts = d.locations.items.map(l => ({ v: l.id, l: l.name }));
      openEditModal('Edit Timetable Row', `
        ${fg('Day', 'ttDay', 'text', item.day)}
        ${fg('Time', 'ttTime', 'text', item.time)}
        ${fg('Subject', 'ttSubj', 'text', item.subject)}
        ${fg('Level', 'ttLevel', 'text', item.level)}
        ${fg('Type', 'ttType', 'select', item.type, '', [{ v: 'Group', l: 'Group' }, { v: 'Individual', l: 'Individual' }])}
        ${fg('Location', 'ttLoc', 'select', item.locationId, '', locOpts)}
        ${fg('Limited seats?', 'ttLimited', 'check', item.limited)}
      `, () => {
        item.day = fv('ttDay'); item.time = fv('ttTime'); item.subject = fv('ttSubj');
        item.level = fv('ttLevel'); item.type = fv('ttType'); item.locationId = fv('ttLoc');
        item.limited = fv('ttLimited');
        ML.render.setData(d); ML.render.refresh(); closeEditModal(); toast('Updated!');
      });
    }

    else if (section === 'locations') {
      const item = d.locations.items.find(x => x.id === id);
      if (!item) return;
      openEditModal('Edit Location', `
        ${fg('Location Name', 'lName', 'text', item.name)}
        ${fg('Type', 'lType', 'select', item.type, '', [{ v: 'Centre', l: 'Centre' }, { v: 'Branch', l: 'Branch' }, { v: 'Online', l: 'Online' }])}
        ${fg('Address / Details', 'lAddr', 'textarea', item.address)}
        ${fg('Google Maps URL', 'lMap', 'text', item.mapUrl)}
        ${fg('Facilities (comma-separated)', 'lFac', 'text', item.facilities.join(', '))}
        ${fg('Card Colour', 'lColor', 'select', item.color, '', [{ v: 'gold', l: 'Gold' }, { v: 'blue', l: 'Blue' }, { v: 'green', l: 'Green' }])}
      `, () => {
        item.name = fv('lName'); item.type = fv('lType'); item.address = fv('lAddr');
        item.mapUrl = fv('lMap'); item.color = fv('lColor');
        item.facilities = fv('lFac').split(',').map(f => f.trim()).filter(Boolean);
        ML.render.setData(d); ML.render.refresh(); closeEditModal(); toast('Updated!');
      });
    }

    else if (section === 'fees') {
      const item = d.fees.packages.find(x => x.id === id);
      if (!item) return;
      openEditModal('Edit Package', `
        ${fg('Package Name', 'fpName', 'text', item.name)}
        ${fg('Monthly Price', 'fpPrice', 'text', item.priceMonthly)}
        ${fg('Sessions', 'fpSessions', 'text', item.sessions)}
        ${fg('Duration', 'fpDuration', 'text', item.duration)}
        ${fg('Badge text (optional)', 'fpBadge', 'text', item.badge)}
        ${fg('Features (one per line)', 'fpFeatures', 'textarea', item.features.join('\n'))}
        ${fg('Highlight this package?', 'fpHL', 'check', item.highlight)}
      `, () => {
        item.name = fv('fpName'); item.priceMonthly = fv('fpPrice');
        item.sessions = fv('fpSessions'); item.duration = fv('fpDuration');
        item.badge = fv('fpBadge'); item.highlight = fv('fpHL');
        item.features = fv('fpFeatures').split('\n').map(f => f.trim()).filter(Boolean);
        ML.render.setData(d); ML.render.refresh(); closeEditModal(); toast('Updated!');
      });
    }

    else if (section === 'enrollment') {
      const item = d.enrollment.steps.find(x => x.id === id);
      if (!item) return;
      openEditModal('Edit Step', `
        ${fg('Step Number', 'enStep', 'text', item.step)}
        ${fg('Title', 'enTitle', 'text', item.title)}
        ${fg('Description', 'enDesc', 'textarea', item.description)}
        ${fg('Action Label (optional)', 'enAction', 'text', item.action)}
        ${fg('Action URL (optional)', 'enActionUrl', 'text', item.actionUrl)}
      `, () => {
        item.step = fv('enStep'); item.title = fv('enTitle');
        item.description = fv('enDesc'); item.action = fv('enAction');
        item.actionUrl = fv('enActionUrl');
        ML.render.setData(d); ML.render.refresh(); closeEditModal(); toast('Updated!');
      });
    }

    else if (section === 'announcements') {
      const item = d.announcements.items.find(x => x.id === id);
      if (!item) return;
      openEditModal('Edit Announcement', `
        ${fg('Title', 'anTitle', 'text', item.title)}
        ${fg('Description', 'anDesc', 'textarea', item.description)}
        ${fg('Image URL', 'anImg', 'text', item.imageUrl, 'Google Drive share URL or direct image URL')}
        ${fg('Aspect Ratio', 'anRatio', 'select', item.aspectRatio, '', [
          { v: '1:1', l: '1:1 (Square)' }, { v: '16:9', l: '16:9 (Landscape)' },
          { v: '4:5', l: '4:5 (Portrait)' }, { v: '9:16', l: '9:16 (Stories)' }
        ])}
        ${fg('Date', 'anDate', 'date', item.date)}
        ${fg('Pinned?', 'anPin', 'check', item.pinned)}
      `, () => {
        item.title = fv('anTitle'); item.description = fv('anDesc');
        item.imageUrl = fv('anImg'); item.aspectRatio = fv('anRatio');
        item.date = fv('anDate'); item.pinned = fv('anPin');
        ML.render.setData(d); ML.render.refresh(); closeEditModal(); toast('Updated!');
      });
    }

    else if (section === 'videos') {
      const item = d.videos.items.find(x => x.id === id);
      if (!item) return;
      const plOpts = d.videos.playlists.filter(p => p.id !== 'pl0').map(p => ({ v: p.id, l: p.title }));
      openEditModal('Edit Video', `
        ${fg('Video Title', 'vTitle', 'text', item.title)}
        ${fg('YouTube Video ID', 'vYtId', 'text', item.youtubeId)}
        ${fg('Playlist', 'vPl', 'select', item.playlistId, '', plOpts)}
        ${fg('Description', 'vDesc', 'textarea', item.description)}
      `, () => {
        item.title = fv('vTitle'); item.youtubeId = fv('vYtId');
        item.playlistId = fv('vPl'); item.description = fv('vDesc');
        ML.render.setData(d); ML.render.refresh(); closeEditModal(); toast('Updated!');
      });
    }
  }

  /* ── CRUD helpers ───────────────────────────────────────────── */
  function _getItemsArray(section) {
    const d = ML.render.getData();
    const map = {
      experience: d.experience.items,
      qualifications: d.qualifications.items,
      workflow: d.workflow.steps,
      timetable: d.timetable.rows,
      locations: d.locations.items,
      fees: d.fees.packages,
      enrollment: d.enrollment.steps,
      announcements: d.announcements.items,
      videos: d.videos.items
    };
    return { d, arr: map[section] };
  }

  function archiveItem(section, id) {
    const { d, arr } = _getItemsArray(section);
    const item = arr.find(x => x.id === id);
    if (item) { item.archived = true; ML.render.setData(d); ML.render.refresh(); toast('Item archived.'); }
  }
  function restoreItem(section, id) {
    const { d, arr } = _getItemsArray(section);
    const item = arr.find(x => x.id === id);
    if (item) { item.archived = false; ML.render.setData(d); ML.render.refresh(); toast('Item restored.'); }
  }
  function deleteItem(section, id) {
    confirm('Delete Item', 'This will permanently remove this item. Are you sure?', () => {
      const { d, arr } = _getItemsArray(section);
      const idx = arr.findIndex(x => x.id === id);
      if (idx > -1) { arr.splice(idx, 1); ML.render.setData(d); ML.render.refresh(); toast('Item deleted.'); }
    });
  }
  function archiveSection(key) {
    const d = ML.render.getData();
    if (d[key]) { d[key].archived = true; ML.render.setData(d); ML.render.refresh(); toast('Section archived.'); }
  }
  function restoreSection(key) {
    const d = ML.render.getData();
    if (d[key]) { d[key].archived = false; ML.render.setData(d); ML.render.refresh(); toast('Section restored.'); }
  }
  function pinItem(section, id, pin) {
    const { d, arr } = _getItemsArray(section);
    const item = arr.find(x => x.id === id);
    if (item) { item.pinned = pin; ML.render.setData(d); ML.render.refresh(); toast(pin ? 'Pinned!' : 'Unpinned.'); }
  }

  /* ── Export / Import ────────────────────────────────────────── */
  function exportData() {
    const json = JSON.stringify(ML.render.getData(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `mathlab-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast('Data exported!');
  }
  function importData() {
    document.getElementById('importFileInput').click();
  }
  function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target.result);
        ML.render.setData(parsed);
        ML.render.refresh();
        toast('Data imported successfully!');
      } catch (err) {
        toast('Invalid JSON file.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }
  function resetToDefaults() {
    confirm('Reset to Defaults', 'This will erase all your changes and restore the default demo content. Are you sure?', () => {
      const d = ML.data.reset();
      ML.render.setData(d);
      ML.render.refresh();
      toast('Reset to defaults.');
    });
  }

  /* Close modals on overlay click */
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('editModalOverlay').addEventListener('click', e => {
      if (e.target === e.currentTarget) closeEditModal();
    });
    document.getElementById('loginModalOverlay').addEventListener('click', e => {
      if (e.target === e.currentTarget) closeLogin();
    });
    document.getElementById('confirmOverlay').addEventListener('click', e => {
      if (e.target === e.currentTarget) closeConfirm();
    });
    // Restore session if still active
    if (isActive()) document.body.classList.add('admin-active');
  });

  return {
    isActive, showLogin, closeLogin, attemptLogin, logout,
    editSection, addItem, editItem,
    archiveItem, restoreItem, deleteItem,
    archiveSection, restoreSection, pinItem,
    exportData, importData, handleImportFile, resetToDefaults,
    closeEditModal, closeConfirm, toast
  };
})();
