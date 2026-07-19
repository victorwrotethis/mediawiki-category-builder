import type { WikiCategories } from './model/WikiCategories';
import './style.css'
const categoriesUrl = new URL('/categories.json', import.meta.url).href

let categoryData: WikiCategories;
const savedCategories = new Set<string>();

const searchInput: string = 'search-input';
const resultContainer: string = 'result-container';
const savedListContainer: string = 'saved-list-container';

async function loadCategoryData(searchInput: HTMLInputElement, resultContainer: HTMLElement) {
  try {
    const requestHeaders: HeadersInit = new Headers();
    requestHeaders.set('Access-Control-Allow-Origin', '*');
    const response = await fetch(categoriesUrl, {
      headers: requestHeaders
    });
    if (!response.ok) throw new Error(`Well I warned ya. Error! Status: ${response.status}`);

    categoryData = await response.json() as WikiCategories;

    searchInput.disabled = false;
    resultContainer.innerHTML = '<p class="message">Ready. Start typing to search...</p>';
  } catch (error) {
    resultContainer.innerHTML = '<p class="message" style="color: red;">Error loading data.</p>';
  }
}

function createResultCard(foundItemName: string){
  return` <div class="result-card" id="clickable-card-${foundItemName}" title="Click to add to saved list">
      <div class="result-item">
      <span style="color:green;font-size:18pt">&#x002B;</span>
        ${foundItemName}              
      </div>
    </div>
  `
}

function handleSearch(event: Event, resultContainer: HTMLElement, savedListContainerElement: HTMLElement) {
  const searchTerm = (event.target as HTMLInputElement).value.toLowerCase().trim();

  if (searchTerm === '') {
    resultContainer.innerHTML = '<p class="message">Ready. Start typing to search...</p>';
    return;
  }
  let foundItems: string[] = [];

  categoryData.query.allcategories.find(categoryListing => {
    if(categoryListing.category.toLowerCase().includes(searchTerm)){
      foundItems.push(categoryListing.category)
    }
    if(foundItems.length > 4){
      return true;
    }
  });

  if (foundItems.length != 0) {
    let resultHTML = '';
    foundItems.forEach((foundItemName)=>{
      resultHTML = resultHTML.concat(createResultCard(foundItemName));
    })
    resultContainer.innerHTML = resultHTML
    foundItems.forEach((foundItemName)=>{
      document.getElementById(`clickable-card-${foundItemName}`)! //extract name
      .addEventListener('click', () => {
        saveCategory(savedListContainerElement, foundItemName)
      });
    })
  } else {
    resultContainer.innerHTML = `<p class="message">No matching category found.</p>`;
  }
}

function saveCategory(savedListContainer: HTMLElement, foundItem: string) {
  const emptyListMsg = document.getElementById('empty-list-msg')!; //extract name
  if (!foundItem) return;
  if (savedCategories.has(foundItem)) {
    alert(`${foundItem} is already in your saved list.`);
    return;
  }
  if (savedCategories.size === 0) {
    emptyListMsg.style.display = 'none';
  }
  savedCategories.add(foundItem);
  const li = document.createElement('li');
  li.className = 'saved-list-item';
  li.innerHTML = `
    <div>
      <strong>${foundItem}</strong>
      <span style="color:red;font-size:11pt"> &#x274c;</span>
    </div>
  `;

  li.addEventListener('click', () => { deleteCategory(emptyListMsg, li, foundItem) })
  savedListContainer.appendChild(li);
  updateQueryResult();
}

function deleteCategory(emptyListMsg: HTMLElement, element: HTMLElement, category: string) {
  element.remove();
  savedCategories.delete(category);
  if (savedCategories.size === 0) {
    emptyListMsg.style.display = 'block';
  }
  updateQueryResult();
}

const queryResultElement = 'query-result';
const queryResultEmptyMessage = 'Start adding categories to view the result URL';
let queryResultHolder = '';
function updateQueryResult() {
  const queryResult = document.getElementById(queryResultElement) as HTMLInputElement;
  if (savedCategories.size === 0) {
    queryResult.value = queryResultEmptyMessage;
  } else {
    const longQuery = `https://wiki.project-tamriel.com/w/index.php?search=+${appendedCategories()}&title=Special%3ASearch&profile=all&fulltext=1`
    queryResultHolder = longQuery
    queryResult.value = longQuery;
  }
}

function setupCopyURL(element: HTMLButtonElement) {
  element.addEventListener('click', () => {
    const queryResult = document.getElementById(queryResultElement) as HTMLInputElement;
    if (queryResultHolder == queryResultEmptyMessage || queryResultHolder == '') {
      queryResult.value = 'There is nothing to copy, add categories first.';
    } else {
      navigator.clipboard.writeText(queryResultHolder);
      queryResult.value = copyResultMessageCreator();
    }
  });
}

let copycounter: number = 0;
function copyResultMessageCreator(){
  console.log(copycounter)
  let copyMessage = "Copied"
  if(copycounter >= 1 && copycounter < 5){    
    copyMessage = "Copied again!"
  } if (copycounter > 5) {
    copyMessage = `Copy #${copycounter}, you sure you got it this time??`
  }
  copycounter = copycounter + 1;
  return copyMessage  
}

function appendedCategories() {
  let createdQuery = "";
  savedCategories.forEach((category) => {
    const querybit = createCategoryQuery(category);
    createdQuery = createdQuery.concat(querybit);
  });
  return createdQuery;
}

function createCategoryQuery(categoryName: string) {
  return `%22%5B%5BCategory%3A${categoryName}%5D%5D%22+`
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <h1>Category Search</h1>

    <h2>Wiki Inputs</h2>
    <div class="search-container" id="query-bit">
        <button type="button" id="action-button" class="action-btn">
            <span>&#128203;</span>
        </button>
        <input type="text" id="query-result" class="query-box"
            placeholder="Start adding categories to view the result URL" disabled>
    </div>

    <div id="search-bit">
        <h2>Search Category</h2>
        <input type="text" id="${searchInput}" class="search-box" placeholder="Type a name to search..." disabled>
    </div>

    <div id="${resultContainer}">
        <p class="message">Loading data file...</p>
    </div>

    <div class="column">
        <h2>Selected Categories</h2>
        <ul id="${savedListContainer}" class="saved-list">
            <p class="message" id="empty-list-msg">No members saved yet.</p>
        </ul>
    </div>
`

addEventListener("load", () => {
  const searchInputElement = document.getElementById(searchInput)!;
  const resultContainerElement = document.getElementById(resultContainer)!;
  const savedListContainerElement = document.getElementById(savedListContainer)!;
  loadCategoryData(searchInputElement as HTMLInputElement, resultContainerElement);
  searchInputElement.addEventListener('input', (event) => { handleSearch(event, resultContainerElement, savedListContainerElement) });
})

setupCopyURL(document.querySelector<HTMLButtonElement>('#action-button')!)