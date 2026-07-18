export interface WikiCategories {
    batchcomplete: boolean;
    query: {
        allcategories: WikiCategory[]
    }
}

export interface WikiCategory {
    category: string;
}