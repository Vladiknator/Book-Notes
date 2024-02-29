let lastresponse = {};

function debounce(func, timeout = 600) {
  let timer;
  return (...args) => {
    try {
      const tables = document.getElementsByClassName('resultTable');
      while (tables.length > 0) {
        tables[0].parentNode.removeChild(tables[0]);
      }
    } catch (error) {
      /* empty */
      console.log('result table does not exist');
    }
    showLoading();
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

function showResults() {
  const query = document.getElementById('searchBar').value;
  if (!query) {
    return;
  }
  searchOL(query).then((data) => {
    hideLoading();
    console.log(data);
    lastresponse = data.docs;
    const dropdown = document.getElementById('dropDownCont');
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');
    const thead = document.createElement('thead');
    const trhead = document.createElement('tr');

    const authHead = document.createTextNode('Author');
    const titHead = document.createTextNode('Title');
    const covHead = document.createTextNode('Cover');
    const headList = [covHead, titHead, authHead];

    for (let i = 0; i < headList.length; i += 1) {
      const td = document.createElement('td');
      trhead.appendChild(td);
      td.appendChild(headList[i]);
    }
    thead.appendChild(trhead);

    table.className = 'table table-hover resultTable';
    dropdown.prepend(table);
    table.appendChild(thead);
    table.appendChild(tbody);

    let index = 0;
    data.docs.forEach((e) => {
      const tr = document.createElement('tr');
      tr.setAttribute('onclick', `autofillForm(${index})`);
      index += 1;
      const author = document.createTextNode(e.author_name[0]);
      const title = document.createTextNode(e.editions.docs[0].title);
      const cover = document.createElement('img');
      cover.src = `https://covers.openlibrary.org/b/id/${e.editions.docs[0].cover_i}-S.jpg`;
      const bodyList = [cover, title, author];
      for (let i = 0; i < bodyList.length; i += 1) {
        const td = document.createElement('td');
        tr.appendChild(td);
        td.appendChild(bodyList[i]);
      }
      tbody.appendChild(tr);
    });
  });
}
const processChange = debounce(() => showResults());

function unhide() {
  const dropdown = document.getElementById('searchDropDown');
  dropdown.classList.add('show');
}

function hide() {
  const dropdown = document.getElementById('searchDropDown');
  dropdown.classList.remove('show');
}

function showLoading() {
  const load = document.getElementById('loading');
  load.classList.add('showLoading');
  if (!document.getElementById('searchBar').value) {
    hideLoading();
  }
}

function hideLoading() {
  const load = document.getElementById('loading');
  load.classList.remove('showLoading');
}

async function searchOL(query) {
  console.log('searching');
  const response = await fetch(
    `https://openlibrary.org/search.json?q=${query}&limit=5&fields=editions,key,title,cover_i,author_name&lang=en`,
  );
  return response.json();
}

async function getDesc(oLId) {
  const response = await fetch(`https://openlibrary.org/works/${oLId}.json`);
  return response.json();
}

function autofillForm(index) {
  console.log('autofilling');

  const selected = lastresponse[index];
  console.log(lastresponse[index]);
  const cover = document.getElementById('cover');
  const title = document.getElementById('title');
  const author = document.getElementById('author');
  const oLId = document.getElementById('oLId');
  const desc = document.getElementById('desc');

  cover.src = `https://covers.openlibrary.org/b/id/${selected.editions.docs[0].cover_i}-M.jpg`;
  cover.parentElement.classList.remove('visually-hidden');

  getDesc(stripBeforeLastSlash(selected.key)).then((data) => {
    desc.value = data.description.value;
  });

  /* eslint-disable prefer-destructuring */
  title.value = selected.editions.docs[0].title;
  author.value = selected.author_name[0];
  oLId.value = stripBeforeLastSlash(selected.key);
  /* eslint-enable prefer-destructuring */

  hide();
}

function hideDropdownContent() {
  setTimeout(() => {
    hideLoading();
    hide();
  }, 500);
}

function stripBeforeLastSlash(str) {
  const index = str.lastIndexOf('/');
  if (index !== -1) {
    return str.substring(index + 1);
  }
  return str;
}

const search = document.getElementById('searchBar');
search.addEventListener('input', processChange);
search.addEventListener('focus', unhide);
search.addEventListener('blur', hideDropdownContent);
