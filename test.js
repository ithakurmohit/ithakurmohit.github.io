fetch('https://api.codetabs.com/v1/proxy?quest=https://play.google.com/store/apps/details?id=com.whatsapp&hl=en')
  .then(r => r.text())
  .then(html => {
    // try the original regex
    const ogImgMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/) ||
                       html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/);
    console.log("Original regex result:", ogImgMatch ? ogImgMatch[1] : "NOT FOUND");

    // Try finding any image tag containing play-lh
    const imgMatch = html.match(/<img[^>]+src=["'](https:\/\/play-lh\.googleusercontent\.com\/[^"']+)["']/g);
    console.log("Found play-lh images:", imgMatch ? imgMatch.slice(0, 3) : "NONE");
  });
