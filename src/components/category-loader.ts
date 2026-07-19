import type { WikiCategories } from "../model/WikiCategories";

export async function loadCategoryData() {
    const categoriesUrl = new URL('/categories.json', import.meta.url).href
    const requestHeaders: HeadersInit = new Headers();
    requestHeaders.set('Access-Control-Allow-Origin', '*');
    const response = await fetch(categoriesUrl, {
      headers: requestHeaders
    });
    if (!response.ok) throw new Error(`Well I warned ya. Error! Status: ${response.status}`);
    return await response.json() as WikiCategories;
}
