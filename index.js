let categoryData = [];
let currentFoundItem = null;
const savedCategories = new Set();

async function loadCategoryData(searchInput, resultContainer) {
  let categorySource = "categories.json"
  try {
    const response = await fetch(categorySource);
    if (!response.ok) throw new Error(`Well I warned ya. Error! Status: ${response.status}`);

    categoryData = await response.json();

    searchInput.disabled = false;
    resultContainer.innerHTML = '<p class="message">Ready. Start typing to search...</p>';
  } catch (error) {
    resultContainer.innerHTML = '<p class="message" style="color: red;">Error loading data.</p>';
  }
}

function handleSearch(event, resultContainer, savedListContainer) {
  const searchTerm = event.target.value.toLowerCase().trim();

  if (searchTerm === '') {
    resultContainer.innerHTML = '<p class="message">Ready. Start typing to search...</p>';
    return;
  }

  const foundItem = categoryData.query.allcategories.find(categoryListing => {
    return (
      categoryListing.category.toLowerCase().includes(searchTerm)
    );
  });

  if (foundItem) {
    resultContainer.innerHTML = `
          <div class="result-card" id="clickable-card" title="Click to add to saved list">
            <div class="result-item">
            <span style="color:green;font-size:18pt">&#x002B;</span>
               ${foundItem.category}              
            </div>
          </div>
        `;
    document.getElementById('clickable-card').addEventListener('click', (event) => {
      saveCategory(savedListContainer, foundItem)
    });
  } else {
    resultContainer.innerHTML = `<p class="message">No matching user found.</p>`;
  }
}

function saveCategory(savedListContainer, foundItem) {
  const emptyListMsg = document.getElementById('empty-list-msg');
  if (!foundItem) return;
  if (savedCategories.has(foundItem.category)) {
    alert(`${foundItem.category} is already in your saved list.`);
    return;
  }
  if (savedCategories.size === 0) {
    emptyListMsg.style.display = 'none';
  }
  savedCategories.add(foundItem.category);
  const li = document.createElement('li');
  li.className = 'saved-list-item';
  li.innerHTML = `
    <div>
      <strong>${foundItem.category}</strong>
      <span style="color:red;font-size:11pt"> &#x274c;</span>
    </div>
  `;

  li.addEventListener('click', (event) => { deleteCategory(emptyListMsg, li, foundItem.category) })
  savedListContainer.appendChild(li);
  updateQueryResult(emptyListMsg);
}

function deleteCategory(emptyListMsg, element, category) {
  element.remove();
  savedCategories.delete(category);
  if (savedCategories.size === 0) {
    emptyListMsg.style.display = 'block';
  }
  updateQueryResult(emptyListMsg);
}

const queryResultElement = 'query-result';
const queryResultEmptyMessage = 'Start adding categories to view the result URL';
function updateQueryResult(emptyListMsg) {
  const queryResult = document.getElementById(queryResultElement);
  if (savedCategories.size === 0) {
    queryResult.value = queryResultEmptyMessage;
  } else {
    const longQuery = `https://wiki.project-tamriel.com/w/index.php?search=+${appendedCategories()}&title=Special%3ASearch&profile=all&fulltext=1`
    queryResult.value = longQuery;
  }
}

function copyURL() {
  const queryResult = document.getElementById(queryResultElement);
  if (queryResult.value == queryResultEmptyMessage || queryResult.value == '') {
    queryResult.value = 'There is nothing to copy, add categories first.';
  } else {
    navigator.clipboard.writeText(queryResult.value);
    queryResult.value = "Copied!";
  }
}

function appendedCategories() {
  let createdQuery = "";
  savedCategories.forEach((category) => {
    const querybit = createCategoryQuery(category);
    createdQuery = createdQuery.concat(querybit);
  });
  return createdQuery;
}

function createCategoryQuery(categoryName) {
  return `%5B%5BCategory%3A${categoryName}%5D%5D%22`
}

addEventListener("load", (event) => {
  const searchInput = document.getElementById('search-input');
  const resultContainer = document.getElementById('result-container');
  const savedListContainer = document.getElementById('saved-list-container');
  loadCategoryData(searchInput, resultContainer);
  searchInput.addEventListener('input', (event) => { handleSearch(event, resultContainer, savedListContainer) });
});
