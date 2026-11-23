// edulab-lazy.js · 五期拆出：启蒙教学研讨密钥板块（原 site.js 2636-2771）
// 依赖：window.EDULAB_DATA（由 edulab_data.js 提供）、CryptoJS（按需加载）
  // ===== 启蒙教学研讨 - 密钥板块脚本 v2（账号+密码）=====
  (function() {
    const STORAGE_KEY = "edulab_unlock_v2";
    const EXPIRE_DAYS = 30;

    // 内容加密 key 混淆存储（前端反编译仍可拿到，静态站固有限制）
    const _mkArr = ["luobogan", "edulab", "master", "2026"];
    function _mk() { return _mkArr.join("-"); }

    function sha256(text) {
      return CryptoJS.SHA256(text).toString(CryptoJS.enc.Hex);
    }

    function aesDecrypt(cipherB64, password) {
      try {
        const decrypted = CryptoJS.AES.decrypt(cipherB64, password);
        return decrypted.toString(CryptoJS.enc.Utf8);
      } catch(e) {
        return null;
      }
    }

    function saveUnlock(account) {
      const payload = { account: account, expire: Date.now() + EXPIRE_DAYS * 86400000 };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }

    function readUnlock() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (data.expire && data.expire > Date.now() && data.account) return data.account;
        localStorage.removeItem(STORAGE_KEY);
        return null;
      } catch(e) { return null; }
    }

    window.submitEdulabKey = async function() {
      const accInput = document.getElementById("edulab-account-input");
      const pwdInput = document.getElementById("edulab-pass-input");
      const msg = document.getElementById("edulab-gate-msg");
      const account = (accInput.value || "").trim().toUpperCase();
      const password = (pwdInput.value || "").trim();

      if (!account || !password) {
        msg.textContent = "请输入账号和密码";
        msg.className = "gate-msg";
        return;
      }

      // P0-3: 按需加载 crypto-js（首次点击时下载 60 KB）
      if (typeof CryptoJS === "undefined") {
        msg.textContent = "正在加载安全组件…";
        msg.className = "gate-msg";
        try {
          await window.__luoboLoadScript("/assets/vendor/crypto-js.min.js");
        } catch(e) {
          msg.textContent = "安全组件加载失败，请检查网络后重试";
          msg.className = "gate-msg";
          return;
        }
      }
      const hash = sha256(account + ":" + password);
      if (window.EDULAB_DATA.hashList.indexOf(hash) >= 0) {
        saveUnlock(account);
        msg.textContent = "✓ 登录成功，正在进入…";
        msg.className = "gate-msg ok";
        setTimeout(() => unlockEdulab(account), 400);
      } else {
        msg.textContent = "账号或密码不正确，请检查后重试";
        msg.className = "gate-msg";
      }
    };

    function unlockEdulab(account) {
      document.getElementById("edulab-gate").style.display = "none";
      document.getElementById("edulab-content").style.display = "block";
      document.getElementById("edulab-current-account").textContent = account;
      // 用 master key 解密所有卡片内容
      const mk = _mk();
      window.EDULAB_DATA.cards.forEach(c => {
        c._plain = aesDecrypt(c.cipher, mk);
      });
    }

    window.openEdulabCard = function(cardId) {
      const card = window.EDULAB_DATA.cards.find(c => c.id === cardId);
      if (!card || !card._plain) return;
      document.getElementById("edulab-content").style.display = "none";
      document.getElementById("edulab-detail").style.display = "block";
      document.getElementById("edulab-detail-content").innerHTML =
        '<h3 style="font-size:22px;color:var(--ink);letter-spacing:3px;margin-bottom:8px;">' +
        card.icon + ' ' + card.title + '</h3>' +
        '<p style="color:var(--gray-soft);font-size:13px;margin-bottom:20px;line-height:1.7;">' +
        card.intro + '</p>' + card._plain;
      window.scrollTo({ top: document.getElementById("edulab").offsetTop - 40, behavior: "smooth" });
    };

    window.closeEdulabCard = function() {
      document.getElementById("edulab-detail").style.display = "none";
      document.getElementById("edulab-content").style.display = "block";
    };

    window.logoutEdulab = function() {
      if (!confirm("确定要退出登录吗？下次进入需要重新输入账号密码。")) return;
      localStorage.removeItem(STORAGE_KEY);
      document.getElementById("edulab-detail").style.display = "none";
      document.getElementById("edulab-content").style.display = "none";
      document.getElementById("edulab-gate").style.display = "block";
      document.getElementById("edulab-account-input").value = "";
      document.getElementById("edulab-pass-input").value = "";
      document.getElementById("edulab-gate-msg").textContent = "";
    };

    // 五期：本文件由懒加载注入，DOM 已 ready，直接执行
    (function() {
      const accInput = document.getElementById("edulab-account-input");
      const pwdInput = document.getElementById("edulab-pass-input");
      [accInput, pwdInput].forEach(el => {
        if (el) el.addEventListener("keydown", function(e) {
          if (e.key === "Enter") submitEdulabKey();
        });
      });
      // ===== v3.2: Owner Mode（本机永久免登，优先级最高）=====
      // 主人 F12 控制台执行 localStorage.setItem('luobogan_owner','1'); 即可激活
      if (localStorage.getItem('luobogan_owner') === '1') {
        unlockEdulab('OWNER');
        return;
      }
      // 自动登录（30 天免登）
      const savedAccount = readUnlock();
      if (savedAccount) {
        unlockEdulab(savedAccount);
      }
    })();
  })();
