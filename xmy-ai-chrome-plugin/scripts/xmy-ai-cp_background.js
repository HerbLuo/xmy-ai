const sites = [
  "http://localhost:5173",
  "https://xmy-ai.cn",
  "https://wode.xmy-ai.cn/",
  "https://lambs-ai.com",
  "https://my.lambs-ai.com"
];

console.log("background script is running: " + new Date());

const tabIdSet = new Set();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const origin = sender.origin;
  console.debug("Message received:", message, sender);
  if (!sites.includes(origin)) {
    return;
  }
  if (message.type === "XMY_PREPARE_PAGE") {
    const payload = JSON.parse(message.payload);
    console.log(message.action + ":", payload);
    tabIdSet.add(sender.tab.id);
    if (message.action === "COPY_STORAGE") {
      copyStorage(payload, sender, sendResponse);
    } else if (message.action === "MODIFY_COOKIE") {
      modifyCookie(payload, sendResponse);
    } else if (message.action === "APPEND_EXECUTOR_TO_IFRAME") {
      appendExecutorToIframe(sender, sendResponse);
    } else if (message.action === "EXECUTE_IN_SPLIT_VIEW") {
      executeInSplitView(payload, sendResponse)
    } else if (message.action === "ALLOW_IFRAME_CSP") {
      allowIframe(payload, sendResponse, 0);
    } else if (message.action === "ALLOW_TRANS_IFRAME_CSP") {
      allowIframe(payload, sendResponse, 1);
    } else if (message.action === "ALLOW_SPLIT_VIEW_CSP") {
      allowIframe(payload, sendResponse, 2);
    } else if (message.action === "REFRESH_SPLIT_VIEW") {
      refreshSplitView(payload, sendResponse)
    }
    return true;
  }
});

function tryParse(str) {
  if (str === null || str === undefined) {
    return null;
  }
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}

async function copyStorage(hostMapStorageKeys, sender, sendResponse) {
  const tabId = sender.tab.id;
  const frames = await chrome.webNavigation.getAllFrames({ tabId });

  for (const frame of frames) {
    if (frame.parentFrameId !== 0) {
      continue;
    }

    const url = new URL(frame.url);
    const hostname = url.hostname;
    const key = `ls:${hostname}`;
    const storages = await chrome.storage.local.get(key);
    const storage = tryParse(storages[key]);
    if (!storage) {
      continue;
    }
    let storageKeys = hostMapStorageKeys[hostname];
    if (!storageKeys) {
      continue
    }
    if (storageKeys.length === 1 && storageKeys[0] === "*") {
      storageKeys = Object.keys(storage);
    }

    for (const storageKey of storageKeys) {
      const storageValue = storage[storageKey] || '';

      await chrome.scripting.executeScript({
        target: {
          tabId: tabId,
          frameIds: [frame.frameId],
        },
        args: [storageKey, storageValue],
        world: "MAIN",
        func: (storageKey, storageValue) => {
          const oldValue = localStorage[storageKey];
          if (oldValue !== storageValue) {
            localStorage[storageKey] = storageValue;
            location.reload();
          }
        },
      });
    }
  }
  sendResponse({ success: true, type: "XMY_PREPARE_PAGE_DONE" });
}

async function changeCookieToNoRestriction(cookies, cookie, url) {
  let all = false;
  if (cookies.includes("*")) {
    all = true;
  }
  if (!cookies.includes(cookie.name) && !all) {
    return;
  }
  if (cookie.sameSite === "no_restriction") {
    return;
  }
  const remover = {
    name: cookie.name,
    url,
  };
  if (cookie.storeId) {
    remover.storeId = cookie.storeId;
  }
  if (cookie.partitionKey) {
    remover.partitionKey = cookie.partitionKey;
  }
  await chrome.cookies.remove(remover);
  const details = { ...cookie };
  delete details.hostOnly;
  delete details.session;
  details.secure = true;
  details.sameSite = "no_restriction";
  details.url = url;
  console.log(
    "Rewriting cookie",
    cookie.name,
    ", origin:",
    cookie,
    "transformed:",
    details
  );
  try {
    await chrome.cookies.set(details);
  } catch (e) {
    console.info(e);
  }
}

async function modifyCookie(pageConfigs, sendResponse) {
  for (const { url, cookies } of pageConfigs) {
    const allCookies = await chrome.cookies.getAll({ url });
    for (const cookie of allCookies) {
      changeCookieToNoRestriction(cookies, cookie, url);
    }
  }
  sendResponse({ success: true, type: "XMY_PREPARE_PAGE_DONE" });
}

async function refreshSplitView({sites}, sendResponse) {
  const domains = sites.map(s => new URL(s).host);

  chrome.tabs.query({currentWindow: true}, async (tabs) => {
    for (const tab of tabs) {
      if (!domains.includes(new URL(tab.url).host)) {
        continue
      }
      chrome.tabs.reload(tab.id)
    }
  });

  sendResponse({ success: true, type: "XMY_PREPARE_PAGE_DONE" });
}

async function executeInSplitView(execs, sendResponse) {
  const execMap = {}
  for (const exec of execs) {
    execMap[new URL(exec.site).host] = exec.code
  }

  await new Promise(res => {
    chrome.tabs.query({currentWindow: true}, async (tabs) => {
      for (const tab of tabs) {
        const host = new URL(tab.url).host;
        if (!execMap[host]) {
          continue
        }
        await executeScriptInSplitView(tab.id, execMap[host])
      }
      res()
    });
  })
  sendResponse({ success: true, type: "XMY_PREPARE_PAGE_DONE" });
}

async function executeScriptInSplitView(tabId, script) {
  try {
    const className = "__XMY_AI__" + nextStr(nextInt(1))
    const ress = await chrome.scripting.executeScript({
      target: { tabId },
      args: [className, script],
      world: "MAIN",
      func: (className, script) => {
          const scriptNode = document.createElement("script");
          scriptNode.className = className;
          const textNode = document.createTextNode(script);
          scriptNode.appendChild(textNode);
          window.document.head.appendChild(scriptNode);
        return { msg: "Executed, site: " + window.location.href };
      },
    });
    const res = ress[0];
    const msg = res?.result?.msg;
    if (msg) {
      console.log(msg);
    }
  } catch (error) {
    console.error(error);
  }
}

async function appendExecutorToIframe(sender, sendResponse) {
  const tabId = sender.tab.id;
  const frames = await chrome.webNavigation.getAllFrames({ tabId });
  for (const frame of frames) {
    if (frame.parentFrameId !== 0) {
      continue;
    }
    await appendScriptToFrame(tabId, frame.frameId);
  }
  sendResponse({ success: true, type: "XMY_PREPARE_PAGE_DONE" });
}

function nextInt(len = 3) {
  return Math.floor(Math.random() * 10 ** len);
}
function nextStr(len = 3, upperCase = true) {
  if (len > 10) {
    return `${nextStr(10, upperCase)}${nextStr(len - 10, upperCase)}`;
  }
  const hex10 = Math.random() * (36 ** len + 1);
  const hex36 = Number(hex10.toFixed(0)).toString(36).padStart(len, "0");
  return upperCase ? hex36.toUpperCase() : hex36;
}
const className = "__XMY_AI__" + nextStr(nextInt(1));

async function appendScriptToFrame(tabId, frameId) {
  try {
    const ress = await chrome.scripting.executeScript({
      target: {
        tabId: tabId,
        frameIds: frameId ? [frameId] : undefined,
      },
      args: [sites, className],
      world: "MAIN",
      func: (sites, className) => {
        let times = 0;
        function exec() {
          if (times > 3000) {
            clearInterval(timer);
          }
          times++;
          if (!window.document.head) {
            return "skip";
          }
          if (document.querySelector("." + className)) {
            return "skip";
          }
          const scriptNode = document.createElement("script");
          scriptNode.className = className;
          const textNode = document.createTextNode(
            `
const sites = ${JSON.stringify(sites)};
window.addEventListener('message', async (event) => { 
  console.debug('Background script received an event:', event); 
  if (!sites.includes(event.origin)) return; 
  const script = document.createElement('script');
  script.className = '${className}';
  const funcName = ("xmy" + Math.random()).replace('.', '');
  const msg = JSON.parse(event.data);
  if (!msg.type === 'exec') return;
  script.textContent = 'async function ' + funcName + '() {' + msg.code + '};' + funcName + '()';
  document.head.appendChild(script);
})`
          );
          scriptNode.appendChild(textNode);
          window.document.head.appendChild(scriptNode);
          clearInterval(timer);
        }
        const timer = setInterval(exec, 100);
        if ("skip" === exec()) {
          return;
        }
        return { msg: "Injected, site: " + window.location.href };
      },
    });
    const res = ress[0];
    const msg = res?.result?.msg;
    if (msg) {
      console.log(msg);
    }
  } catch (error) {
    console.error(error);
  }
}

async function allowIframe(config, sendResponse, group) {
  const regexFilters = config.regexFilters;
  const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
  const oldRuleIds = oldRules
    .map((rule) => rule.id)
    .filter((id) => {
      if (id >= (group + 1) * 100) {
        return false;
      }
      if (id < group * 100) {
        return false;
      }
      return true;
    });

  let id = group * 100 + 1;
  for (const regexFilter of regexFilters) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [
        {
          id,
          priority: 1,
          action: {
            type: "modifyHeaders",
            requestHeaders: [{ header: "referer", operation: "remove" }],
            responseHeaders: [
              { header: "X-Frame-Options", operation: "remove" },
              { header: "Content-Security-Policy", operation: "remove" },
              {
                header: "Access-Control-Allow-Credentials",
                operation: "set",
                value: "true",
              },
            ],
          },
          condition: {
            regexFilter: regexFilter,
            resourceTypes: group === 2 ? ["main_frame"] : ["sub_frame"],
          },
        },
      ],
      removeRuleIds: id % 100 === 1 ? oldRuleIds : [],
    });
    id++;
  }

  sendResponse({ success: true, type: "XMY_PREPARE_PAGE_DONE", action: "CSP" });
}
