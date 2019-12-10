// js code here

loadJSON("https://interactive.guim.co.uk/docsdata-test/1oyBV1VukfZ9X5lnN8wQloEmlYox4TkJNUSMmAqVh1jw.json", function (data) {

  buildRegions(data.sheets.Regions);
  buildTributes(data.sheets.Submissions);
  bindScrollEvents();
  bindNavClickEvents();

});

function bindNavClickEvents() {
  let navSections = document.querySelectorAll('.article-nav__regions__region');
  navSections.forEach(function (navSection) {
    let navRegion = navSection.dataset.region;
    navSection.addEventListener('click', function () {
      let t = document.querySelector('.tribute[data-region="' + navRegion + '"]');
      let tribScrollOffset = getScrollOffset(t);
      scrollTo(tribScrollOffset);
    })
  })
}

function getScrollOffset(el) {
  var viewportHeight = window.innerHeight,
    header = document.querySelector('.header'),
    headerScroll = (header.offsetHeight + header.getBoundingClientRect().top + window.scrollY),
    elementToPageTop = el.getBoundingClientRect().top + window.scrollY,
    elementScrollPos = (elementToPageTop - (viewportHeight * 0.15));

  let scrollOffset = Math.max(headerScroll, elementScrollPos)
  return scrollOffset;
}

function scrollTo(to) {
  let duration = 1200;
  const element = document.scrollingElement;
  const start = (element && element.scrollTop) || window.pageYOffset,
    change = to - start,
    increment = 20;
  let currentTime = 0;

  duration = Math.min(2000, Math.max(800, (Math.sqrt(Math.abs(change)) * 20)));

  const animateScroll = function () {
    currentTime += increment;
    const val = Math.easeInOutQuad(currentTime, start, change, duration);
    window.scrollTo(0, val);
    if (currentTime < duration) {
      window.setTimeout(animateScroll, increment);
    }
  };
  animateScroll();
}

Math.easeInOutQuad = function (t, b, c, d) {
  t /= d / 2;
  if (t < 1) return c / 2 * t * t + b;
  t--;
  return -c / 2 * (t * (t - 2) - 1) + b;
};


function bindScrollEvents() {
  markVisibleTributes();
  window.addEventListener('scroll', function () {
    markVisibleTributes();
  });
  window.addEventListener('resize', function () {
    markVisibleTributes();
  });
}

function throttle(func, wait, options) {
  var context, args, result;
  var timeout = null;
  var previous = 0;
  if (!options) options = {};
  var later = function () {
    previous = options.leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };
  return function () {
    var now = Date.now();
    if (!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};

var markVisibleTributes = throttle(function () {
  let tributesAll = document.querySelectorAll('.tribute')
  tributesAll.forEach(function (tribute) {
    let tR = onScreenRatio(tribute);
    if (tR.top < 0.85 && tR.bottom > 0.20) {
      tribute.dataset.status = 'in';
    } else if (tR.bottom < 0.20) {
      tribute.dataset.status = 'above';
    } else {
      tribute.dataset.status = 'below';
    }
  });

  refreshNavStatus();
}, 100);

function refreshNavStatus() {
  let currentTribute = document.querySelector('.tribute[data-status="in"]');
  if (currentTribute) {
    let currentRegion = currentTribute.dataset.region;
    let navRegion = document.querySelector('.article-nav__regions__region[data-region=' + currentRegion + ']');
    if (!navRegion.classList.contains('active')) {
      let prevNav = document.querySelector('.article-nav__regions__region.active');
      navRegion.classList.add('active');
      if (prevNav) {
        prevNav.classList.remove('active');
      }
    }
  } else {
    let prevNav = document.querySelector('.article-nav__regions__region.active');
    if (prevNav) {
      prevNav.classList.remove('active');
    }
  }
}

function onScreenRatio(el) {
  var viewportHeight = window.innerHeight,
    elementOffsetTop = el.getBoundingClientRect().top,
    elementHeight = el.offsetHeight,
    elementOffsetTop = (elementOffsetTop),
    elementOffsetMiddle = (elementOffsetTop + (elementHeight / 2)),
    elementOffsetBottom = (elementOffsetTop + (elementHeight));

  let topRatio, bottomRatio;

  if (elementOffsetTop > (viewportHeight)) {
    topRatio = 1;
  } else if (elementOffsetTop < 0) {
    topRatio = 0;
  } else {
    var ratio = (elementOffsetTop / viewportHeight);
    topRatio = ratio;
  }

  if (elementOffsetBottom > (viewportHeight)) {
    bottomRatio = 1;
  } else if (elementOffsetBottom < 0) {
    bottomRatio = 0;
  } else {
    var ratio = (elementOffsetBottom / viewportHeight);
    bottomRatio = ratio;
  }

  return { top: topRatio, bottom: bottomRatio };
}



function buildTributes(tributes) {
  let tributesWrapper = document.querySelector('.tributes__wrapper');
  tributes.forEach(function (t) {
    let newTribute = document.createElement('div');
    newTribute.classList.add('tribute');
    newTribute.dataset.status = 'below';
    newTribute.dataset.region = stringToHTMLClass(t.Region);

    let tributePhotoHTML = '';
    if (t.PhotoSize.toLowerCase() == 'pattern') {
      let bgX = Math.floor(Math.random() * 1000) + 1;
      let bgY = Math.floor(Math.random() * 1000) + 1;
      tributePhotoHTML = "<div class='image' data-style='pattern' style='background-position:" + bgX + "px " + bgY + "px;'></div>";
    } else {
      tributePhotoHTML = "<div class='image' data-style='" + stringToHTMLClass(t.PhotoSize.toLowerCase()) + "'><div class='image__img'><img src='" + t.Photo + "'></div></div>";
    }

    newTribute.innerHTML = "<div class='tribute__heading'><div class='name box'>" + t.Name + "</div><div class='location box'>" + t.Location + "</div>" + tributePhotoHTML + "</div>"

    newTribute.innerHTML += "<div class='tribute__story box'><div class='intro'><p>" + t.Intro + "</p></div><div class='more'><div class='more__inner'><p>" + t.More.replace(/\n/g, '</p><p>') + "</p></div>"
      + (t.PhotoCredit != '' ? "<div class='more__image-credit'>Photo by " + t.PhotoCredit + "</div>" : "")
      + "<div class='more__submitter'>" + t.Submitter + "</div></div><div class='more__expand-toggle'><span class='open'><i></i>Read more</span><span class='close'><i></i>Close</span></div></div>"

    tributesWrapper.appendChild(newTribute);

    assignClickHandlers(newTribute);
  });
}

function assignClickHandlers(tribute) {
  tributeButton = tribute.querySelector('.more__expand-toggle');
  tributeButton.addEventListener('click', function () {
    tribute.classList.toggle('expanded');
  })
}


function buildRegions(regions) {
  let regionsWrapper = document.querySelector('.article-nav__regions');
  regions.forEach(function (r) {
    let newRegion = document.createElement('div');
    newRegion.classList.add('article-nav__regions__region');
    newRegion.dataset.region = stringToHTMLClass(r.Region);
    newRegion.innerText = r.Region;
    regionsWrapper.appendChild(newRegion);
  });
}

function stringToHTMLClass(n) {
  return n.replace(/\s+/g, '-').toLowerCase();
}

function loadJSON(path, success, error) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        if (success)
          success(JSON.parse(xhr.responseText));
      } else {
        if (error) {
          error(xhr);
        }
      }
    }
  };
  xhr.open("GET", path, true);
  xhr.send();
}

function jsonUrl() {
  if (window.location.hostname == 'preview.gutools.co.uk') {
    return 'https://interactive.guim.co.uk/docsdata-test/1oyBV1VukfZ9X5lnN8wQloEmlYox4TkJNUSMmAqVh1jw.json';
  } else {
    return 'https://interactive.guim.co.uk/docsdata/1oyBV1VukfZ9X5lnN8wQloEmlYox4TkJNUSMmAqVh1jw.json'
  }
}
