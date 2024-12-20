(() => {
  const CONTAINER_ID = "_stats-link";
  const githubUrlRegex = /^(?:https?:\/\/github\.com\/|git@github\.com:)?(?<owner>[^\/]+?)\/(?<repo>[^\/]+?)(?:\/(?<refType>tree|blob)\/(?<branch>[^\/]+?)(?<path>\/.*)?)?$/;

  function parseCurrentGithubUrl() {
    const match = location.href.match(githubUrlRegex);
    if (!match?.groups) {
      return null;
    }

    const groups = match.groups;
    if (!groups.branch) {
      const branchSelect = document.querySelector("[data-hotkey='w']");
      if (branchSelect?.textContent) {
        groups.branch = branchSelect.textContent.trim();
      }
    }

    return groups;
  }

  async function getStats({ owner, repo, branch }) {
    fetch(`https://ghloc.ifels.dev/${owner}/${repo}/${branch}?pretty=false`, {
      "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
      },
      "referrer": "https://ghloc.vercel.app/",
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "omit",
    });

    fetch(`https://bundlephobia.com/api/size?package=${package}@latest&record=true`, {
      "headers": {
        "accept": "application/json",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-bundlephobia-user": "bundlephobia website",
      },
      "referrer": "https://bundlephobia.com/package/adm-zip@0.5.16",
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "omit",
    });
  }

  /** @param {Record<string, string>} styles **/
  function stringifyStyles(styles) {
    /** @param {string} str **/
    const camelCaseToKebabCase = (str) => str.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
    return Object.entries(styles)
        .map(([key, value]) => `${camelCaseToKebabCase(key)}: ${value};`)
        .join(" ");
  }


  function createLink(id, label, href) {
    const link = document.createElement("button");
    link.className = ["btn", "ml-2"].filter(Boolean).join(" ");
    link.textContent = label;
    link.id = id;
    link.dataset.hotkey = "g l";

    const anchorName = `--${id}`;
    const linkStyles = {
      anchorName,
    }
    link.setAttribute("style", stringifyStyles(linkStyles));
    const popoverId = `popover-${id}`;
    link.setAttribute("popovertarget", popoverId);

    const frame = document.createElement("iframe");
    frame.src = href;
    const frameStyles = {
      minWidth: '800px',
      minHeight: '600px',
      maxWidth: 'max-content',
      paddingRight: '1rem',
      resize: 'both',
      border: 0,
    }
    frame.setAttribute("style", stringifyStyles(frameStyles));

    const popover = document.createElement("div");
    popover.id = popoverId;
    popover.setAttribute('popover', 'auto')
    popover.appendChild(frame);

    const popoverStyles = {
      margin: 0,
      positionAnchor: anchorName,
      inset: 'auto',
      positionArea: 'bottom',
      positionTry: 'top, block-start span-inline-end, top right, top left, bottom, block-end span-inline-end, bottom right, bottom left, left, right',
      border: `1px solid #333`,
      borderRadius: `3px`,
    }
    popover.setAttribute("style", stringifyStyles(popoverStyles))
    document.body.appendChild(popover);

    // link.target = "_blank";
    // link.rel = "noopener";
    // link.href = href;
    return link;
  }


  function attachLink() {
    if (!location.href.startsWith('https://github.com')) {
      console.log("GH-STATS: Not on github.com");
      return;
    }

    const prevLinkContainer = document.getElementById(CONTAINER_ID);

    if (prevLinkContainer) {
      console.log(`GH-STATS: Container "${CONTAINER_ID}" already attached`);
      prevLinkContainer.parentElement.removeChild(prevLinkContainer);
    }

    const container = document.querySelector(".react-directory-add-file-icon")?.parentElement?.parentElement
        ?? document.querySelector('[data-hotkey="Control+Shift+<"]')?.parentElement

    if (!container) {
      console.log("GH-STATS: Couldn't find a suitable container");
      return;
    }

    const url = parseCurrentGithubUrl();

    console.log(url);
    if (!url) {
      console.log("GH-STATS: Couldn't parse the current URL");
      return;
    }

    const params = new URLSearchParams();
    if (url.branch) {
      params.append("branch", url.branch);
    }
    const paramsString = params.toString();

    const links = [
      createLink('_bundlephobia', 'BUNDLEPHOBIA', `https://bundlephobia.com/package/${url.repo}`),
      createLink('_ghloc', 'GHLOC', `https://ghloc.vercel.app/${url.owner}/${url.repo}?${paramsString}`),
    ];

    const linkContainer = document.createElement("div");
    linkContainer.id = CONTAINER_ID;

    links.forEach((link) => linkContainer.appendChild(link));

    container.appendChild(linkContainer);

    console.log(`GH-STATS: Attaching links to ${links.map((link) => link.href).join(", ")}`);
  }

  console.log("GH-STATS: Initialized");
  /*const observer = new MutationObserver(() => {
    attachLink();
  });
  observer.observe(document.body, { subtree: true, childList: true });*/
  attachLink();
})();
