(function () {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
    }

    var STYLE_ID = 'global-mobile-sidebar-style';
    var ROOT_ID = 'globalMobileSidebarRoot';
    var SIDEBAR_ID = 'globalMobileSidebar';
    var OVERLAY_ID = 'globalMobileSidebarOverlay';
    var TOGGLE_ID = 'globalMobileSidebarToggle';

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) {
            return;
        }

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = [
            '.global-mobile-nav-toggle{display:none;}',
            '@media (max-width: 1100px){',
            '  .global-mobile-nav-toggle{',
            '    position:fixed;',
            '    top:16px;',
            '    right:14px;',
            '    width:44px;',
            '    height:44px;',
            '    border-radius:12px;',
            '    border:1px solid rgba(255,255,255,.45);',
            '    background:rgba(17,24,39,.42);',
            '    color:#ffffff;',
            '    z-index:1400;',
            '    display:inline-flex;',
            '    align-items:center;',
            '    justify-content:center;',
            '    font-size:18px;',
            '    cursor:pointer;',
            '    backdrop-filter:blur(4px);',
            '  }',
            '  .navbar{',
            '    flex-direction:row !important;',
            '    justify-content:space-between !important;',
            '    align-items:center !important;',
            '    gap:10px !important;',
            '    padding:10px 14px !important;',
            '    min-height:auto !important;',
            '  }',
            '  .logo{margin:0 !important;}',
            '  .logo img{height:64px !important;width:auto !important;display:block;}',
            '  .navbar .nav-links{display:none !important;}',
            '  .navbar .nav-actions{display:none !important;}',
            '  .mobile-menu-toggle{display:inline-flex !important;}',
            '}',
            '.global-mobile-sidebar-overlay{',
            '  position:fixed;',
            '  inset:0;',
            '  background:rgba(15,23,42,.55);',
            '  opacity:0;',
            '  pointer-events:none;',
            '  transition:opacity .22s ease;',
            '  z-index:1398;',
            '}',
            '.global-mobile-sidebar{',
            '  position:fixed;',
            '  top:0;',
            '  right:0;',
            '  width:min(86vw,340px);',
            '  height:100vh;',
            '  background:linear-gradient(160deg,#1c7e7a 0%,#184f72 100%);',
            '  color:#fff;',
            '  transform:translateX(100%);',
            '  transition:transform .25s ease;',
            '  z-index:1399;',
            '  padding:16px 14px 24px;',
            '  overflow-y:auto;',
            '  box-shadow:-12px 0 30px rgba(0,0,0,.3);',
            '}',
            '.global-mobile-sidebar.open{transform:translateX(0);}',
            '.global-mobile-sidebar-overlay.open{opacity:1;pointer-events:auto;}',
            '.global-mobile-sidebar-header{',
            '  display:flex;',
            '  justify-content:space-between;',
            '  align-items:center;',
            '  margin-bottom:14px;',
            '  padding-bottom:10px;',
            '  border-bottom:1px solid rgba(255,255,255,.28);',
            '}',
            '.global-mobile-sidebar-header h3{font:700 18px/1.2 Poppins,sans-serif;margin:0;}',
            '.global-mobile-sidebar-close{',
            '  width:36px;',
            '  height:36px;',
            '  border-radius:10px;',
            '  border:1px solid rgba(255,255,255,.4);',
            '  background:rgba(255,255,255,.14);',
            '  color:#fff;',
            '  cursor:pointer;',
            '  font-size:16px;',
            '}',
            '.global-mobile-nav-section{margin-bottom:14px;}',
            '.global-mobile-nav-section h4{',
            '  margin:0 0 8px;',
            '  font:600 12px/1.2 Poppins,sans-serif;',
            '  color:rgba(255,255,255,.82);',
            '  letter-spacing:1px;',
            '  text-transform:uppercase;',
            '}',
            '.global-mobile-nav-link{',
            '  display:flex;',
            '  align-items:center;',
            '  justify-content:space-between;',
            '  margin-bottom:8px;',
            '  padding:10px 12px;',
            '  border-radius:10px;',
            '  background:rgba(255,255,255,.1);',
            '  color:#fff;',
            '  text-decoration:none;',
            '  font:500 14px/1.2 Poppins,sans-serif;',
            '}',
            '.global-mobile-nav-link:hover{background:rgba(255,255,255,.2);}',
            '.global-mobile-nav-link.sos-link{',
            '  background:rgba(230,57,70,.32);',
            '  border:1px solid rgba(255,255,255,.22);',
            '}',
            'body.global-mobile-nav-open{overflow:hidden;}'
        ].join('');

        document.head.appendChild(style);
    }

    function resetDropdownState(sidebar) {
        if (!sidebar) {
            return;
        }

        var groups = sidebar.querySelectorAll('.global-mobile-nav-group');
        groups.forEach(function (group, index) {
            var openByDefault = index === 0;
            group.classList.toggle('open', openByDefault);
            var toggle = group.querySelector('.global-mobile-nav-parent');
            if (toggle) {
                toggle.setAttribute('aria-expanded', openByDefault ? 'true' : 'false');
            }
        });
    }

    function closeSidebar() {
        var sidebar = document.getElementById(SIDEBAR_ID);
        var overlay = document.getElementById(OVERLAY_ID);
        if (!sidebar || !overlay) {
            return;
        }

        sidebar.classList.remove('open');
        overlay.classList.remove('open');
        document.body.classList.remove('global-mobile-nav-open');
        sidebar.setAttribute('aria-hidden', 'true');
        resetDropdownState(sidebar);
    }

    function openSidebar() {
        var sidebar = document.getElementById(SIDEBAR_ID);
        var overlay = document.getElementById(OVERLAY_ID);
        if (!sidebar || !overlay) {
            return;
        }

        sidebar.classList.add('open');
        overlay.classList.add('open');
        document.body.classList.add('global-mobile-nav-open');
        sidebar.setAttribute('aria-hidden', 'false');
    }

    function toggleSidebar() {
        var sidebar = document.getElementById(SIDEBAR_ID);
        if (!sidebar) {
            return;
        }

        if (sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }

    function buildSidebar() {
        if (document.getElementById(ROOT_ID)) {
            return;
        }

        if (document.getElementById('mobileSidebar')) {
            return;
        }

        var root = document.createElement('div');
        root.id = ROOT_ID;
        root.innerHTML = [
            '<button id="' + TOGGLE_ID + '" class="global-mobile-nav-toggle" type="button" aria-label="Open menu">',
            '  <span aria-hidden="true">&#9776;</span>',
            '</button>',
            '<div id="' + OVERLAY_ID + '" class="global-mobile-sidebar-overlay"></div>',
            '<aside id="' + SIDEBAR_ID + '" class="global-mobile-sidebar" aria-hidden="true">',
            '  <div class="global-mobile-sidebar-header">',
            '    <h3>Navigate</h3>',
            '    <button class="global-mobile-sidebar-close" type="button" aria-label="Close menu">&#10005;</button>',
            '  </div>',
            '  <div class="global-mobile-nav-section">',
            '    <div class="global-mobile-nav-group open">',
            '      <button class="global-mobile-nav-parent" type="button" aria-expanded="true">Home <span class="chevron">&#9662;</span></button>',
            '      <div class="global-mobile-nav-children">',
            '        <a class="global-mobile-nav-link" href="front_page.html">Home</a>',
            '        <a class="global-mobile-nav-link" href="main_donar_login.html">Donor Login</a>',
            '        <a class="global-mobile-nav-link" href="admin_login.html">Admin Login</a>',
            '      </div>',
            '    </div>',
            '    <div class="global-mobile-nav-group">',
            '      <button class="global-mobile-nav-parent" type="button" aria-expanded="false">About Jeevandhara <span class="chevron">&#9662;</span></button>',
            '      <div class="global-mobile-nav-children">',
            '        <a class="global-mobile-nav-link" href="about_jeevandhara.html">About Jeevandhara</a>',
            '        <a class="global-mobile-nav-link" href="history_tracker.html">Donation History Tracking</a>',
            '        <a class="global-mobile-nav-link" href="Badges_Rewards.html">Badges and Rewards</a>',
            '        <a class="global-mobile-nav-link" href="FAQ.html">Jeevandhara FAQ</a>',
            '        <a class="global-mobile-nav-link" href="about_jeevandhara.html">Contact Us</a>',
            '      </div>',
            '    </div>',
            '    <div class="global-mobile-nav-group">',
            '      <button class="global-mobile-nav-parent" type="button" aria-expanded="false">Looking for Blood <span class="chevron">&#9662;</span></button>',
            '      <div class="global-mobile-nav-children">',
            '        <a class="global-mobile-nav-link" href="main_donar_login.html">Donor Login</a>',
            '        <a class="global-mobile-nav-link" href="blood_availability.html">Blood Availability</a>',
            '        <a class="global-mobile-nav-link" href="blood_center_directory.html">Blood Center Directory</a>',
            '        <a class="global-mobile-nav-link sos-link" href="blood_center.html">SOS Emergency</a>',
            '      </div>',
            '    </div>',
            '    <div class="global-mobile-nav-group">',
            '      <button class="global-mobile-nav-parent" type="button" aria-expanded="false">Want to Donate <span class="chevron">&#9662;</span></button>',
            '      <div class="global-mobile-nav-children">',
            '        <a class="global-mobile-nav-link" href="BBA.html">Blood Bank Appointment</a>',
            '        <a class="global-mobile-nav-link" href="AI.html">AI Blood Matching</a>',
            '        <a class="global-mobile-nav-link" href="health_advice.html">Health Advice (Diet)</a>',
            '        <a class="global-mobile-nav-link" href="VBD.html">Register VBD Camp</a>',
            '        <a class="global-mobile-nav-link" href="camp.html">Blood Donation Camps</a>',
            '      </div>',
            '    </div>',
            '    <div class="global-mobile-nav-group">',
            '      <button class="global-mobile-nav-parent" type="button" aria-expanded="false">Blood Center Login <span class="chevron">&#9662;</span></button>',
            '      <div class="global-mobile-nav-children">',
            '        <a class="global-mobile-nav-link" href="jeevandhara_login.html">Jeevandhara Login</a>',
            '        <a class="global-mobile-nav-link" href="blood_center.html">Add your Blood Center</a>',
            '      </div>',
            '    </div>',
            '  </div>',
            '</aside>'
        ].join('');

        document.body.appendChild(root);

        var toggle = document.getElementById(TOGGLE_ID);
        var closeBtn = root.querySelector('.global-mobile-sidebar-close');
        var overlay = document.getElementById(OVERLAY_ID);
        var sidebar = document.getElementById(SIDEBAR_ID);
        var groups = root.querySelectorAll('.global-mobile-nav-group');
        var dropdownToggles = root.querySelectorAll('.global-mobile-nav-parent');
        var allLinks = root.querySelectorAll('a.global-mobile-nav-link');

        if (toggle) {
            toggle.addEventListener('click', toggleSidebar);
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', closeSidebar);
        }
        if (overlay) {
            overlay.addEventListener('click', closeSidebar);
        }
        allLinks.forEach(function (link) {
            link.addEventListener('click', closeSidebar);
        });

        dropdownToggles.forEach(function (dropdownToggle) {
            dropdownToggle.addEventListener('click', function () {
                var group = dropdownToggle.closest('.global-mobile-nav-group');
                if (!group) {
                    return;
                }

                var willOpen = !group.classList.contains('open');

                groups.forEach(function (item) {
                    item.classList.remove('open');
                    var itemToggle = item.querySelector('.global-mobile-nav-parent');
                    if (itemToggle) {
                        itemToggle.setAttribute('aria-expanded', 'false');
                    }
                });

                if (willOpen) {
                    group.classList.add('open');
                    dropdownToggle.setAttribute('aria-expanded', 'true');
                }
            });
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 1100) {
                closeSidebar();
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                closeSidebar();
            }
        });

        resetDropdownState(sidebar);
    }

    function repairTickerText() {
        var tickerSpans = document.querySelectorAll('.ticker-content span');
        if (!tickerSpans.length) {
            return;
        }

        tickerSpans.forEach(function (span) {
            var text = (span.textContent || '').trim();
            if (/ðŸ|ð|âœ|â|ï¸/.test(text)) {
                span.textContent = 'BUILT FOR EMERGENCIES - POWERED BY PEOPLE';
            }
        });
    }

    function init() {
        injectStyles();
        buildSidebar();
        repairTickerText();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
