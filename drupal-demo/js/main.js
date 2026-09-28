/**
 * AURA DIGITAL | Enterprise Drupal 10 Digital Experience Platform
 * Drupal Behavior Architecture & Interactive Controller
 */

(function (window, document) {
  'use strict';

  // Initialize Drupal namespace
  window.Drupal = window.Drupal || {
    behaviors: {},
    settings: {
      auraTheme: {
        version: "10.3.2-enterprise",
        debug: true,
        activeTheme: "aura_enterprise"
      }
    },
    attachBehaviors: function (context, settings) {
      context = context || document;
      settings = settings || window.drupalSettings || {};
      for (const i in Drupal.behaviors) {
        if (Drupal.behaviors.hasOwnProperty(i) && typeof Drupal.behaviors[i].attach === 'function') {
          try {
            Drupal.behaviors[i].attach(context, settings);
          } catch (e) {
            console.error('Drupal behavior error in ' + i, e);
          }
        }
      }
    }
  };

  /* ==========================================================================
     1. Drupal Behavior: Canvas Interactive Mesh Particles
     ========================================================================== */
  Drupal.behaviors.canvasNetwork = {
    attach: function (context) {
      const canvas = document.getElementById('canvas-background');
      if (!canvas || canvas.dataset.initialized) return;
      canvas.dataset.initialized = 'true';

      const ctx = canvas.getContext('2d');
      let width, height;
      let particles = [];
      const particleCount = 45;
      const maxDistance = 140;

      function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = canvas.parentElement.offsetHeight;
      }
      resize();
      window.addEventListener('resize', resize);

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7,
          radius: Math.random() * 2 + 1
        });
      }

      function animate() {
        ctx.clearRect(0, 0, width, height);
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const particleColor = isDark ? 'rgba(148, 163, 184, 0.25)' : 'rgba(100, 116, 139, 0.18)';
        const lineColor = isDark ? 'rgba(100, 116, 139, ' : 'rgba(203, 213, 225, ';

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = particleColor;
          ctx.fill();

          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxDistance) {
              const alpha = (1 - dist / maxDistance) * (isDark ? 0.22 : 0.15);
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = lineColor + alpha + ')';
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }
        requestAnimationFrame(animate);
      }
      animate();
    }
  };

  /* ==========================================================================
     2. Drupal Behavior: Admin Toolbar & Authoring Modes
     ========================================================================== */
  Drupal.behaviors.drupalAdminToolbar = {
    attach: function (context) {
      const toolbar = document.getElementById('drupal-toolbar');
      const toggleBtn = document.getElementById('toggle-toolbar-btn');
      const modeBtns = document.querySelectorAll('.drupal-mode-btn');

      if (toggleBtn && !toggleBtn.dataset.bound) {
        toggleBtn.dataset.bound = 'true';
        toggleBtn.addEventListener('click', function () {
          toolbar.classList.toggle('hidden');
          document.body.classList.toggle('toolbar-hidden');
          const isHidden = toolbar.classList.contains('hidden');
          toggleBtn.querySelector('.toggle-text').textContent = isHidden ? 'Show Drupal Admin' : 'Hide Drupal Admin';
        });
      }

      modeBtns.forEach(btn => {
        if (btn.dataset.bound) return;
        btn.dataset.bound = 'true';
        btn.addEventListener('click', function () {
          modeBtns.forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          const mode = this.dataset.mode;
          
          if (mode === 'edit' || mode === 'layout') {
            document.body.classList.add('drupal-edit-mode');
            showNotification('Drupal 10 ' + (mode === 'edit' ? 'Quick Edit' : 'Layout Builder') + ' Mode Enabled');
          } else {
            document.body.classList.remove('drupal-edit-mode');
            showNotification('Switched to Standard Visitor View');
          }
        });
      });

      // Quick Edit contextual click handler
      document.querySelectorAll('.contextual-edit-btn').forEach(btn => {
        if (btn.dataset.bound) return;
        btn.dataset.bound = 'true';
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          const region = this.closest('.drupal-editable-region')?.dataset.drupalRegion || 'Block';
          alert('Drupal 10 Quick Edit Modal:\n\nEditing Region: ' + region + '\nConfiguration stored in Drupal Config Sync (config/sync/block.block.aura.yml)');
        });
      });
    }
  };

  /* ==========================================================================
     3. Drupal Behavior: Theme Mode Switcher (Dark / Light)
     ========================================================================== */
  Drupal.behaviors.themeSwitch = {
    attach: function (context) {
      const toggle = document.getElementById('theme-toggle');
      if (!toggle || toggle.dataset.bound) return;
      toggle.dataset.bound = 'true';

      const savedTheme = localStorage.getItem('aura-theme') || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);
      updateIcon(savedTheme);

      toggle.addEventListener('click', function () {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('aura-theme', newTheme);
        updateIcon(newTheme);
      });

      function updateIcon(theme) {
        toggle.innerHTML = theme === 'dark' 
          ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>'
          : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
      }
    }
  };

  /* ==========================================================================
     4. Drupal Behavior: Architecture Blueprint Tabs
     ========================================================================== */
  Drupal.behaviors.architectureTabs = {
    attach: function (context) {
      const tabs = document.querySelectorAll('.arch-tab-btn');
      const titleEl = document.getElementById('arch-title');
      const descEl = document.getElementById('arch-desc');
      const badgeStack = document.getElementById('arch-badges');
      const diagramEl = document.getElementById('arch-diagram');
      const featureListEl = document.getElementById('arch-features');

      if (!tabs.length || tabs[0].dataset.bound) return;

      const blueprints = {
        headless: {
          title: "Headless Decoupled Drupal 10 + Next.js 14",
          desc: "Full separation of frontend presentation layer and content repository. Drupal powers the GraphQL / JSON:API endpoints with authenticated preview, revision workflows, and granular caching tags.",
          badges: ["Next.js 14 App Router", "Drupal JSON:API", "GraphQL v4", "Edge Cache Invalidation"],
          diagram: [
            { icon: "⚡", title: "Next.js 14 Edge", desc: "Global CDN delivery & ISR rendering" },
            { icon: "⇄", title: "GraphQL / JSON:API", desc: "Sub-50ms serialized responses" },
            { icon: "💧", title: "Drupal 10 Core", desc: "Enterprise editorial & entity engine" }
          ],
          features: [
            { title: "Incremental Static Regeneration", desc: "Pages re-generate in background upon Drupal node publishing." },
            { title: "Editorial Instant Live Preview", desc: "Editors view draft revisions in Next.js iframe before publication." },
            { title: "Bank-Grade Headless Security", desc: "Drupal CMS backend sits in private VPC inaccessible to public." },
            { title: "Omnichannel Syndication", desc: "One Drupal backend feeds web apps, iOS/Android apps, and digital kiosks." }
          ]
        },
        multisite: {
          title: "Enterprise Global Multisite Network",
          desc: "Single unified Drupal codebase powering 150+ regional localized sites across 42 languages, shared design system tokens, and independent regional editorial permissions.",
          badges: ["Drupal Multisite", "Config Split", "Multilingual i18n", "Single Codebase"],
          diagram: [
            { icon: "🌍", title: "Global Design System", desc: "Shared Twig component library" },
            { icon: "⚙️", title: "Centralized Core", desc: "Automated single-click core updates" },
            { icon: "🏢", title: "150+ Local Portals", desc: "Isolated databases & domain routing" }
          ],
          features: [
            { title: "Zero Redundant Maintenance", desc: "Core security patches applied once across all 150+ instances simultaneously." },
            { title: "Config Split per Territory", desc: "Local currencies, compliance banners, and payment gateways per country." },
            { title: "Cross-Site Content Syndication", desc: "Publish corporate press releases globally with one checkbox." },
            { title: "Role-Based Regional Permissions", desc: "Regional marketing teams only edit their specific locale content." }
          ]
        },
        cloud: {
          title: "Acquia Cloud Enterprise & GovCMS Compliance",
          desc: "Engineered to satisfy federal and financial compliance standards including FedRAMP High, HIPAA, SOC 2 Type II, and GDPR, running on resilient auto-scaling clusters.",
          badges: ["FedRAMP Compliant", "Acquia Cloud Next", "Varnish Caching", "99.99% SLA"],
          diagram: [
            { icon: "🛡️", title: "WAF & DDoS Shield", desc: "Cloudflare Enterprise perimeter" },
            { icon: "🚀", title: "Varnish Cache Tier", desc: "98.4% cache hit ratio" },
            { icon: "🔒", title: "Encrypted DB Cluster", desc: "Multi-AZ MariaDB replication" }
          ],
          features: [
            { title: "Automated Disaster Recovery", desc: "Sub-5-minute RTO and RPO with automated geographic failover." },
            { title: "Immutable Audit Trails", desc: "Full watchdog and revision logs synced to external SIEM systems." },
            { title: "Zero-Downtime Blue/Green Deploys", desc: "Deploy new Drupal releases with zero interruption to active checkouts." },
            { title: "Automated Load Spike Absorption", desc: "Autoscales to absorb 100,000 concurrent visitors during live broadcast events." }
          ]
        },
        migration: {
          title: "Automated Drupal 7/8 to Drupal 10 Migration Pipeline",
          desc: "Proprietary automated ETL pipelines converting legacy Drupal 7 fields, taxonomy vocabularies, paragraphs, and custom modules into modern Drupal 10 OOP architecture and Twig 3 templates.",
          badges: ["Migrate API Core", "Automated ETL", "Paragraphs to Layout Builder", "Zero Data Loss"],
          diagram: [
            { icon: "📦", title: "Legacy D7/D8 Source", desc: "Extract 500k+ nodes & media assets" },
            { icon: "⚡", title: "Migrate ETL Pipeline", desc: "Schema transformation & field mapping" },
            { icon: "✨", title: "Drupal 10 Production", desc: "Clean modern entities & Layout Builder" }
          ],
          features: [
            { title: "Continuous Rollback & Re-sync", desc: "Keep old site live while delta syncs run in staging without downtime." },
            { title: "Asset Optimization on Ingest", desc: "Automatically converts all legacy JPEG/PNG to modern WebP formats." },
            { title: "SEO URL & Redirect Retention", desc: "Preserves 100% of historical URL structures and generates 301 maps." },
            { title: "Modern Twig 3 Transformation", desc: "Replaces deprecated PHP templates with lightning-fast semantic Twig." }
          ]
        }
      };

      tabs.forEach(tab => {
        tab.dataset.bound = 'true';
        tab.addEventListener('click', function () {
          tabs.forEach(t => t.classList.remove('active'));
          this.classList.add('active');
          const key = this.dataset.arch;
          const data = blueprints[key];
          if (!data) return;

          titleEl.textContent = data.title;
          descEl.textContent = data.desc;

          badgeStack.innerHTML = data.badges.map(b => `<span class="arch-pill">${b}</span>`).join('');

          diagramEl.innerHTML = data.diagram.map((d, index) => `
            <div class="diag-node ${index === 1 ? 'highlight' : ''}">
              <div class="diag-node-icon">${d.icon}</div>
              <div class="diag-node-title">${d.title}</div>
              <div class="diag-node-desc">${d.desc}</div>
            </div>
            ${index < data.diagram.length - 1 ? '<div class="diag-arrow">→</div>' : ''}
          `).join('');

          featureListEl.innerHTML = data.features.map(f => `
            <div class="arch-feature-item">
              <div class="feature-check-icon">✓</div>
              <div class="feature-info">
                <h4>${f.title}</h4>
                <p>${f.desc}</p>
              </div>
            </div>
          `).join('');
        });
      });
    }
  };

  /* ==========================================================================
     5. Drupal Behavior: Filterable Views Portfolio & Case Studies Modal
     ========================================================================== */
  Drupal.behaviors.viewsPortfolio = {
    attach: function (context) {
      const filterBtns = document.querySelectorAll('.views-filter-btn');
      const cards = document.querySelectorAll('.portfolio-card');
      const modalBackdrop = document.getElementById('case-study-modal');
      const modalCloseBtn = document.getElementById('modal-close-btn');

      const caseStudiesData = {
        fintech: {
          title: "Apex Global FinTech — Enterprise Banking Portal",
          tag: "FinTech & Banking",
          version: "Drupal 10.3 Enterprise",
          img: "images/portfolio/fintech.jpg",
          metrics: [
            { val: "$14.2 Billion", lbl: "Annual Volume Processed" },
            { val: "380ms", lbl: "p99 API Response" },
            { val: "99.999%", lbl: "Transaction SLA" }
          ],
          desc: "Architected a mission-critical financial hub for Apex Financial Group. Leveraging decoupled Drupal 10 with high-concurrency microservices, GraphQL middleware, and bi-directional core banking APIs. Designed with custom Drupal security event listeners and real-time fraud telemetry dashboards.",
          stack: ["Drupal 10 Enterprise", "Next.js 14", "GraphQL", "Redis Cache", "Acquia Cloud Next", "ISO 27001 Certified"]
        },
        ecommerce: {
          title: "OmniStore Commerce — 420K SKU Enterprise Catalog",
          tag: "Enterprise Commerce",
          version: "Drupal Commerce 2.x",
          img: "images/portfolio/ecommerce.jpg",
          metrics: [
            { val: "+34.8%", lbl: "Conversion Rate Surge" },
            { val: "420,000", lbl: "SKU Catalog Indexed" },
            { val: "2.1M", lbl: "Monthly Transactions" }
          ],
          desc: "Built a high-volume omnichannel commerce engine using Drupal Commerce 2.x integrated with Algolia InstantSearch, Stripe Treasury, and SAP ERP. Sub-second facet filtering, multi-currency localization across 24 countries, and real-time inventory level synchronization.",
          stack: ["Drupal Commerce 2.38", "Algolia Search", "SAP ERP Gateway", "Stripe Connect", "Varnish ESI Caching"]
        },
        realestate: {
          title: "Veritas International — Ultra-Luxury Property Platform",
          tag: "Multisite Headless",
          version: "Drupal 10 + Vue 3",
          img: "images/portfolio/realestate.jpg",
          metrics: [
            { val: "$2.8 Billion", lbl: "Property Value Listed" },
            { val: "4.8x", lbl: "Lead Ingestion Speed" },
            { val: "18 Locales", lbl: "Language Portals" }
          ],
          desc: "Constructed an ultra-luxury real estate portfolio for Veritas International. Implemented custom Drupal GIS geospatial mapping modules, 3D interactive virtual tour streaming, dynamic PDF brochure generation, and private broker VIP vaults with biometrics.",
          stack: ["Drupal 10 Core", "Vue 3 Composition", "Mapbox GL", "Cloudflare Workers", "Media Asset Microservice"]
        },
        saas: {
          title: "Novus Cloud — Global Developer Documentation & Portal",
          tag: "Government & SaaS",
          version: "Decoupled Drupal 10",
          img: "images/portfolio/saas.jpg",
          metrics: [
            { val: "1,200,000+", lbl: "Active Enterprise Users" },
            { val: "68%", lbl: "Reduction in Support Tickets" },
            { val: "100%", lbl: "WCAG 2.1 AAA Accessibility" }
          ],
          desc: "Delivered an enterprise-scale documentation and developer portal serving over 1.2 million engineers. Powered by Drupal's revision engine, Markdown git ingestion pipelines, interactive API playgrounds, and instantaneous Algolia search indexing.",
          stack: ["Drupal 10 Core", "OpenAPI Spec Parser", "Algolia DocSearch", "Tailwind Design System", "FedRAMP Moderate"]
        }
      };

      // Filter button handlers
      filterBtns.forEach(btn => {
        if (btn.dataset.bound) return;
        btn.dataset.bound = 'true';
        btn.addEventListener('click', function () {
          filterBtns.forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          const filter = this.dataset.filter;

          cards.forEach(card => {
            if (filter === 'all' || card.dataset.category === filter) {
              card.style.display = 'flex';
              setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 50);
            } else {
              card.style.opacity = '0';
              card.style.transform = 'translateY(15px)';
              setTimeout(() => { card.style.display = 'none'; }, 300);
            }
          });
        });
      });

      // Open Modal handlers
      document.querySelectorAll('.open-case-study-btn').forEach(btn => {
        if (btn.dataset.bound) return;
        btn.dataset.bound = 'true';
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          const key = this.dataset.id;
          const data = caseStudiesData[key];
          if (!data || !modalBackdrop) return;

          document.getElementById('modal-img').src = data.img;
          document.getElementById('modal-tag').textContent = data.tag;
          document.getElementById('modal-version').textContent = data.version;
          document.getElementById('modal-title').textContent = data.title;
          document.getElementById('modal-desc').textContent = data.desc;

          document.getElementById('modal-metrics').innerHTML = data.metrics.map(m => `
            <div class="metric-chip">
              <div class="metric-val" style="font-size:22px;">${m.val}</div>
              <div class="metric-lbl">${m.lbl}</div>
            </div>
          `).join('');

          document.getElementById('modal-chips').innerHTML = data.stack.map(s => `
            <span class="stack-chip">${s}</span>
          `).join('');

          modalBackdrop.classList.add('active');
          document.body.style.overflow = 'hidden';
        });
      });

      if (modalCloseBtn && !modalCloseBtn.dataset.bound) {
        modalCloseBtn.dataset.bound = 'true';
        modalCloseBtn.addEventListener('click', function () {
          modalBackdrop.classList.remove('active');
          document.body.style.overflow = '';
        });
      }

      if (modalBackdrop && !modalBackdrop.dataset.bound) {
        modalBackdrop.dataset.bound = 'true';
        modalBackdrop.addEventListener('click', function (e) {
          if (e.target === modalBackdrop) {
            modalBackdrop.classList.remove('active');
            document.body.style.overflow = '';
          }
        });
      }
    }
  };

  /* ==========================================================================
     6. Drupal Behavior: Interactive Enterprise ROI & Architecture Estimator
     ========================================================================== */
  Drupal.behaviors.estimator = {
    attach: function (context) {
      const scaleBtns = document.querySelectorAll('[data-scale]');
      const sourceBtns = document.querySelectorAll('[data-source]');
      const slider = document.getElementById('traffic-slider');
      const trafficBubble = document.getElementById('traffic-value');

      const tierTitle = document.getElementById('calc-tier-title');
      const timelineEl = document.getElementById('calc-timeline');
      const archEl = document.getElementById('calc-arch');
      const slaEl = document.getElementById('calc-sla');
      const roiEl = document.getElementById('calc-roi');

      if (!slider || slider.dataset.bound) return;
      slider.dataset.bound = 'true';

      let currentScale = 'multisite';
      let currentSource = 'd7';
      let currentTraffic = 500; // in thousands

      function recalculate() {
        const trafficFormatted = currentTraffic >= 1000 
          ? (currentTraffic / 1000).toFixed(1) + 'M' 
          : currentTraffic + 'K';
        if (trafficBubble) trafficBubble.textContent = trafficFormatted + ' visitors/mo';

        let tierName = "Enterprise Global Drupal 10";
        let timeline = "14 - 18 Weeks";
        let arch = "Decoupled Next.js + Acquia Cloud Next";
        let sla = "99.99% Guaranteed SLA";
        let roi = "315% Average 3-Yr ROI";

        if (currentScale === 'single') {
          tierName = "Enterprise Core Platform";
          timeline = currentSource === 'd7' ? "10 - 12 Weeks" : "8 - 10 Weeks";
          arch = "Standard Drupal 10 + Varnish Caching Tier";
          sla = "99.9% Uptime SLA";
          roi = "240% Average 3-Yr ROI";
        } else if (currentScale === 'multisite') {
          tierName = "Global Multisite Network";
          timeline = currentSource === 'd7' ? "16 - 20 Weeks" : "12 - 16 Weeks";
          arch = "Drupal Multisite + Config Split + Global CDN";
          sla = "99.99% Enterprise SLA";
          roi = "380% Average 3-Yr ROI";
        } else if (currentScale === 'headless') {
          tierName = "Mission-Critical Decoupled Hub";
          timeline = "18 - 24 Weeks";
          arch = "Drupal 10 JSON:API + Edge Next.js 14 Micro-frontends";
          sla = "99.999% High Availability SLA";
          roi = "440% Average 3-Yr ROI";
        }

        if (currentTraffic > 1000) {
          tierName += " (High Concurrency Cluster)";
        }

        if (tierTitle) tierTitle.textContent = tierName;
        if (timelineEl) timelineEl.textContent = timeline;
        if (archEl) archEl.textContent = arch;
        if (slaEl) slaEl.textContent = sla;
        if (roiEl) roiEl.textContent = roi;
      }

      scaleBtns.forEach(btn => {
        btn.addEventListener('click', function () {
          scaleBtns.forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          currentScale = this.dataset.scale;
          recalculate();
        });
      });

      sourceBtns.forEach(btn => {
        btn.addEventListener('click', function () {
          sourceBtns.forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          currentSource = this.dataset.source;
          recalculate();
        });
      });

      slider.addEventListener('input', function () {
        currentTraffic = parseInt(this.value, 10);
        recalculate();
      });

      recalculate();
    }
  };

  /* ==========================================================================
     7. Drupal Behavior: Contact & RFQ AJAX Submission Mock
     ========================================================================== */
  Drupal.behaviors.contactForm = {
    attach: function (context) {
      const form = document.getElementById('drupal-rfq-form');
      const statusMsg = document.getElementById('form-status-message');
      if (!form || form.dataset.bound) return;
      form.dataset.bound = 'true';

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Submitting to Drupal REST API...';

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          if (statusMsg) {
            statusMsg.classList.add('active');
            statusMsg.innerHTML = '<strong>Drupal Status:</strong> Success! Lead entity created in Drupal database (Node ID: #10492). Enterprise architect dispatched.';
            form.reset();
            setTimeout(() => {
              statusMsg.classList.remove('active');
            }, 8000);
          }
        }, 1200);
      });
    }
  };

  /* Helper Toast Notification */
  function showNotification(text) {
    let toast = document.getElementById('drupal-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'drupal-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: #0678be;
        color: #fff;
        padding: 10px 24px;
        border-radius: 50px;
        font-size: 13px;
        font-weight: 700;
        box-shadow: 0 10px 30px rgba(6, 120, 190, 0.4);
        z-index: 9999;
        transition: opacity 0.3s;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.style.opacity = '1';
    setTimeout(() => {
      toast.style.opacity = '0';
    }, 2800);
  }

  // Auto-init on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function () {
    Drupal.attachBehaviors(document, Drupal.settings);
  });

})(window, document);
