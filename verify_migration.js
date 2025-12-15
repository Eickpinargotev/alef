
const { getProducts } = require('./src/lib/productParser');

(async () => {
    try {
        console.log("Fetching products...");
        const products = await getProducts();
        console.log(`Fetched ${products.length} products.`);

        if (products.length > 0) {
            // Find a shirt and an article
            const shirt = products.find(p => p.type === 'camisa');
            const article = products.find(p => p.type === 'articulo');

            if (shirt) {
                console.log("\n--- SHIRT SAMPLE ---");
                console.log("Name:", shirt.name);
                console.log("Description:", shirt.description);
                console.log("Sizes:", shirt.sizes);
            }

            if (article) {
                console.log("\n--- ARTICLE SAMPLE ---");
                console.log("Name:", article.name);
                console.log("Description:", article.description);
                console.log("Sizes:", article.sizes);
                if (article.variants.length > 0 && article.variants[0].media.length > 0) {
                    console.log("Image URL:", article.variants[0].media[0].src);
                } else {
                    console.log("No images found for article.");
                }
            }
        }
    } catch (e) {
        console.error("Error:", e);
    }
})();
