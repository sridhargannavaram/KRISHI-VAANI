/**
 * KRISHI VAANI — Centralized Local Commodity Image Library & Registry
 * 
 * Maps Government Mandi API commodity names to locally stored, high-quality,
 * realistic agricultural photographs in assets/images/commodities/.
 * 
 * Rules:
 * - Every supported commodity points to a local .webp asset file.
 * - Accurate botanical/agricultural normalization (strips parentheses, varieties, regional spelling).
 * - Exact precedence rules (e.g. Mentha Oil != Mentha, Marigold != Rose, Custard Apple != Apple).
 * - STRICT NEUTRAL FALLBACK: Unrecognized items return a clean SVG placeholder. NEVER an unrelated vegetable image.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CommodityImageService = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  const LOCAL_IMAGE_BASE = 'assets/images/commodities/';

  // 1. Centralized Local Asset Registry (Filename -> Relative Path)
  const LOCAL_COMMODITY_REGISTRY = {
    // Solanaceae & Alliums
    'tomato': LOCAL_IMAGE_BASE + 'Tomatoes.jpg',
    'onion': LOCAL_IMAGE_BASE + 'Green Onion (Spring Onion).png',
    'onion_green': LOCAL_IMAGE_BASE + 'Green Onion (Spring Onion).png',
    'potato': LOCAL_IMAGE_BASE + 'potato.jpg',
    'sweet_potato': LOCAL_IMAGE_BASE + 'sweet potato.jpg',
    'garlic': LOCAL_IMAGE_BASE + 'Garlic.jpg',
    'ginger': LOCAL_IMAGE_BASE + 'green ginger.webp',
    'carrot': LOCAL_IMAGE_BASE + 'Carrot.webp',
    'radish': LOCAL_IMAGE_BASE + 'Radish.png',
    'turnip': LOCAL_IMAGE_BASE + 'Turnips.webp',
    'beetroot': LOCAL_IMAGE_BASE + 'beetroot.webp',
    'yam': LOCAL_IMAGE_BASE + 'Yam.webp',
    'tapioca': LOCAL_IMAGE_BASE + 'tapioca.webp',

    // Vegetables & Greens
    'bhindi': LOCAL_IMAGE_BASE + 'bhindi.webp',
    'brinjal': LOCAL_IMAGE_BASE + 'brinjal.webp',
    'cabbage': LOCAL_IMAGE_BASE + 'cabbage.webp',
    'cauliflower': LOCAL_IMAGE_BASE + 'cauliflower.webp',
    'green_chilli': LOCAL_IMAGE_BASE + 'green-chilli.webp',
    'dry_chilli': LOCAL_IMAGE_BASE + 'Dry Chillies.webp',
    'capsicum': LOCAL_IMAGE_BASE + 'Capsicum.png',
    'cucumber': LOCAL_IMAGE_BASE + 'cucumber.webp',
    'bottle_gourd': LOCAL_IMAGE_BASE + 'ash-gourd.webp',
    'bitter_gourd': LOCAL_IMAGE_BASE + 'bitter-gourd.webp',
    'ridge_gourd': LOCAL_IMAGE_BASE + 'ridge-gourd.jpeg',
    'sponge_gourd': LOCAL_IMAGE_BASE + 'sponge-gourd.webp',
    'snake_gourd': LOCAL_IMAGE_BASE + 'snake-gourd.png',
    'ash_gourd': LOCAL_IMAGE_BASE + 'ash-gourd.webp',
    'pointed_gourd': LOCAL_IMAGE_BASE + 'Pointed Gourd (Parval).png',
    'pumpkin': LOCAL_IMAGE_BASE + 'pumpkin.jpg',
    'coriander': LOCAL_IMAGE_BASE + 'Methi (Fenugreek).png',
    'methi': LOCAL_IMAGE_BASE + 'Methi (Fenugreek).png',
    'spinach': LOCAL_IMAGE_BASE + 'spinach.jpeg',
    'drumstick': LOCAL_IMAGE_BASE + 'drumstick.webp',
    'green_peas': LOCAL_IMAGE_BASE + 'green-peas.webp',
    'beans': LOCAL_IMAGE_BASE + 'beans.webp',
    'cluster_beans': LOCAL_IMAGE_BASE + 'cluster-beans.webp',
    'mushroom': LOCAL_IMAGE_BASE + 'Mashrooms.webp',

    // Grains, Cereals & Millets
    'wheat': LOCAL_IMAGE_BASE + 'Wheat.webp',
    'wheat_atta': LOCAL_IMAGE_BASE + 'wheat-atta.webp',
    'rice': LOCAL_IMAGE_BASE + 'paddy.png',
    'paddy': LOCAL_IMAGE_BASE + 'paddy.png',
    'maize': LOCAL_IMAGE_BASE + 'Maize.png',
    'sweet_corn': LOCAL_IMAGE_BASE + 'Maize.png',
    'baby_corn': LOCAL_IMAGE_BASE + 'baby-corn.jpg',
    'jowar': LOCAL_IMAGE_BASE + 'Jowar.png',
    'bajra': LOCAL_IMAGE_BASE + 'bajra.jpg',
    'ragi': LOCAL_IMAGE_BASE + 'ragi.webp',

    // Fibres, Plantation & Commercial
    'cotton': LOCAL_IMAGE_BASE + 'cotton.webp',
    'tobacco': LOCAL_IMAGE_BASE + 'tobacco.webp',
    'wood': LOCAL_IMAGE_BASE + 'Wood.png',
    'coconut': LOCAL_IMAGE_BASE + 'coconut.jpg',
    'tender_coconut': LOCAL_IMAGE_BASE + 'tender-coconut.webp',
    'copra': LOCAL_IMAGE_BASE + 'Copra.png',
    'arecanut': LOCAL_IMAGE_BASE + 'Arecanut.png',
    'betel_leaf': LOCAL_IMAGE_BASE + 'betel-leaf.webp',
    'jaggery': LOCAL_IMAGE_BASE + 'Jaggery (Gur).png',

    // Flowers
    'jasmine': LOCAL_IMAGE_BASE + 'Jasmin.jpeg',
    'marigold': LOCAL_IMAGE_BASE + 'Marigold.jpg',
    'rose': LOCAL_IMAGE_BASE + 'rose.webp',

    // Spices & Essential Oils
    'mentha_oil': LOCAL_IMAGE_BASE + 'mentha-oil.webp',
    'mustard': LOCAL_IMAGE_BASE + 'Mustard.webp',
    'turmeric': LOCAL_IMAGE_BASE + 'turmeric.jpg',
    'tamarind': LOCAL_IMAGE_BASE + 'sweet tamarind.jpg',

    // Oilseeds & Pulses
    'groundnut': LOCAL_IMAGE_BASE + 'Groundnet.jpg',
    'sesamum': LOCAL_IMAGE_BASE + 'sesamum.webp',
    'castor_seed': LOCAL_IMAGE_BASE + 'Castor Seed.png',
    'soybean': LOCAL_IMAGE_BASE + 'soybean.webp',
    'bengal_gram': LOCAL_IMAGE_BASE + 'Bengal Gram.jpeg',
    'red_gram': LOCAL_IMAGE_BASE + 'tur-dal.webp',
    'green_gram': LOCAL_IMAGE_BASE + 'green-gram.webp',
    'horse_gram': LOCAL_IMAGE_BASE + 'Horse Gram (Kulthi).png',
    'lentil': LOCAL_IMAGE_BASE + 'Lentil (Masur).png',

    // Fruits
    'banana': LOCAL_IMAGE_BASE + 'banana.png',
    'banana_green': LOCAL_IMAGE_BASE + 'Green Banana.png',
    'papaya': LOCAL_IMAGE_BASE + 'Papaya.jpg',
    'pineapple': LOCAL_IMAGE_BASE + 'pineapple.jpg',
    'apple': LOCAL_IMAGE_BASE + 'apple.webp',
    'pomegranate': LOCAL_IMAGE_BASE + 'Pomegranate.jpg',
    'sweet_lime': LOCAL_IMAGE_BASE + 'sweet-lime.jpg',
    'orange': LOCAL_IMAGE_BASE + 'Orange.jpg',
    'grapes': LOCAL_IMAGE_BASE + 'grapes.jpg',
    'watermelon': LOCAL_IMAGE_BASE + 'watermelons.webp',
    'amla': LOCAL_IMAGE_BASE + 'Amla.webp',
    'fig': LOCAL_IMAGE_BASE + 'Fig (Anjeer).png',
    'pear': LOCAL_IMAGE_BASE + 'pear.webp',
    'chikoo': LOCAL_IMAGE_BASE + 'Chikoo (Sapota).png'
  };

  /**
   * Normalizes Government Mandi commodity names safely into canonical keys.
   */
  function normalizeCommodityName(rawName) {
    if (!rawName || typeof rawName !== 'string') return '';
    return rawName.toLowerCase().replace(/['"_\-]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /**
   * Resolves raw commodity string to a canonical registry key with strict priority.
   */
  function resolveCanonicalKey(rawName) {
    if (!rawName) return null;
    const str = normalizeCommodityName(rawName);

    // 1. Flowers & Essential Oils (Highest precedence to avoid crop misclassification)
    if (str.includes('mentha oil') || (str.includes('mentha') && str.includes('oil'))) return 'mentha_oil';
    if (str.includes('mentha') || str.includes('mint') || str.includes('pudina')) return 'mentha';
    if (str.includes('jasmine') || str.includes('mogra') || str.includes('chameli')) return 'jasmine';
    if (str.includes('marigold') || str.includes('genda')) return 'marigold';
    if (str.includes('rose') || str.includes('gulab')) return 'rose';
    if (str.includes('gerbera') || str.includes('jarbara')) return 'gerbera';
    if (str.includes('flower') || str.includes('phool')) return 'marigold';

    // 2. Specific Compound Produce (Checked before single word matches)
    if (str.includes('custard apple') || str.includes('sharifa')) return 'custard_apple';
    if (str.includes('pineapple') || str.includes('ananas')) return 'pineapple';
    if (str.includes('sweet corn')) return 'sweet_corn';
    if (str.includes('baby corn')) return 'baby_corn';
    if (str.includes('sweet potato')) return 'sweet_potato';
    if (str.includes('onion green') || str.includes('spring onion')) return 'onion_green';
    if (str.includes('dry chilli') || str.includes('dry chillies') || str.includes('red chilli')) return 'dry_chilli';
    if (str.includes('green chilli') || str.includes('green chillies')) return 'green_chilli';
    if (str.includes('tender coconut')) return 'tender_coconut';
    if (str.includes('coconut oil')) return 'coconut_oil';
    if (str.includes('wheat atta') || str.includes('atta') || str.includes('flour')) return 'wheat_atta';
    if (str.includes('sweet lime') || str.includes('mousambi') || str.includes('mosambi')) return 'sweet_lime';
    if (str.includes('water melon') || str.includes('watermelon') || str.includes('tarbooj')) return 'watermelon';
    if (str.includes('musk melon') || str.includes('muskmelon') || str.includes('kharbooja') || str.includes('karbuja')) return 'muskmelon';
    if (str.includes('raw mango') || str.includes('green mango') || str.includes('mango')) return 'mango';

    // 3. Spices, Commercial & Plantation Crops
    if (str.includes('cumin') || str.includes('cummin') || str.includes('jeera')) return 'cumin';
    if (str.includes('mustard') || str.includes('sarson') || str.includes('rai')) return 'mustard';
    if (str.includes('turmeric') || str.includes('haldi')) return 'turmeric';
    if (str.includes('groundnut') || str.includes('ground nut') || str.includes('peanut')) return 'groundnut';
    if (str.includes('sesamum') || str.includes('sesame') || str.includes('gingelly') || /\btil\b/.test(str)) return 'sesamum';
    if (str.includes('castor')) return 'castor_seed';
    if (str.includes('soyabean') || str.includes('soybean')) return 'soybean';
    if (str.includes('cotton') || str.includes('kapas')) return 'cotton';
    if (str.includes('tobacco')) return 'tobacco';
    if (str.includes('firewood') || str.includes('wood')) return 'wood';
    if (str.includes('copra')) return 'copra';
    if (str.includes('coconut')) return 'coconut';
    if (str.includes('arecanut') || str.includes('betelnut') || str.includes('supari')) return 'arecanut';
    if (str.includes('betal') || str.includes('betel') || str.includes('paan')) return 'betel_leaf';
    if (str.includes('gur') || str.includes('jaggery')) return 'jaggery';
    if (str.includes('tamarind') || str.includes('imli')) return 'tamarind';

    // 4. Pulses & Legumes
    if (str.includes('bengal gram') || str.includes('chana') || str.includes('gram(whole)')) return 'bengal_gram';
    if (str.includes('red gram') || str.includes('arhar') || str.includes('tur(') || str.includes('/tur')) return 'red_gram';
    if (str.includes('green gram') || str.includes('moong')) return 'green_gram';
    if (str.includes('kulthi') || str.includes('horse gram')) return 'horse_gram';
    if (str.includes('lentil') || str.includes('masur')) return 'lentil';
    if (str.includes('cowpea') || str.includes('lobia')) return 'cowpea';
    if (str.includes('cluster bean') || /\bguar\b/.test(str)) return 'cluster_beans';
    if (str.includes('green peas') || str.includes('peas wet') || str.includes('peas')) return 'green_peas';
    if (str.includes('bean') || str.includes('avare') || str.includes('papadi')) return 'beans';

    // 5. Gourds
    if (str.includes('bottle gourd') || str.includes('lauki') || str.includes('doodhi')) return 'bottle_gourd';
    if (str.includes('bitter gourd') || str.includes('karela')) return 'bitter_gourd';
    if (str.includes('ridgeguard') || str.includes('ridge gourd') || str.includes('tori')) return 'ridge_gourd';
    if (str.includes('sponge gourd') || str.includes('turai')) return 'sponge_gourd';
    if (str.includes('snakeguard') || str.includes('snake gourd')) return 'snake_gourd';
    if (str.includes('ash gourd') || str.includes('ashgourd') || str.includes('petha')) return 'ash_gourd';
    if (str.includes('pointed gourd') || str.includes('parval') || str.includes('parwal')) return 'pointed_gourd';
    if (str.includes('pumpkin') || str.includes('kaddu')) return 'pumpkin';

    // 6. Vegetables & Roots
    if (str.includes('tomato')) return 'tomato';
    if (str.includes('onion')) return 'onion';
    if (str.includes('potato') || str.includes('aloo')) return 'potato';
    if (str.includes('bhindi') || str.includes('ladies finger') || str.includes('okra')) return 'bhindi';
    if (str.includes('brinjal') || str.includes('eggplant') || str.includes('baingan')) return 'brinjal';
    if (str.includes('cabbage') || str.includes('patta gobhi')) return 'cabbage';
    if (str.includes('cauliflower') || str.includes('phool gobhi')) return 'cauliflower';
    if (str.includes('capsicum') || str.includes('shimla mirch') || str.includes('chilly capsicum')) return 'capsicum';
    if (str.includes('chilli') || str.includes('chili') || str.includes('mirchi')) return 'green_chilli';
    if (str.includes('garlic') || str.includes('lahsun')) return 'garlic';
    if (str.includes('ginger') || str.includes('adrak')) return 'ginger';
    if (str.includes('carrot') || str.includes('gajar')) return 'carrot';
    if (str.includes('radish') || str.includes('raddish') || str.includes('mooli')) return 'radish';
    if (str.includes('turnip') || str.includes('shalgam')) return 'turnip';
    if (str.includes('beetroot') || str.includes('chukandar')) return 'beetroot';
    if (str.includes('yam') || str.includes('suran') || str.includes('jimikand') || str.includes('ratalu')) return 'yam';
    if (str.includes('tapioca') || str.includes('cassava')) return 'tapioca';
    if (str.includes('cucumber') || str.includes('kheera') || str.includes('kakri')) return 'cucumber';
    if (str.includes('drumstick') || str.includes('sahjan')) return 'drumstick';
    if (str.includes('coriander') || str.includes('dhania')) return 'coriander';
    if (str.includes('methi') || str.includes('fenugreek')) return 'methi';
    if (str.includes('spinach') || str.includes('palak')) return 'spinach';
    if (str.includes('mushroom') || str.includes('mashroom')) return 'mushroom';

    // 7. Grains & Cereals
    if (str.includes('wheat') || str.includes('gehu')) return 'wheat';
    if (str.includes('paddy') || str.includes('dhan')) return 'paddy';
    if (str.includes('rice') || str.includes('chawal')) return 'rice';
    if (str.includes('maize') || str.includes('makka') || str.includes('corn')) return 'maize';
    if (str.includes('jowar') || str.includes('sorghum')) return 'jowar';
    if (str.includes('bajra') || str.includes('pearl millet')) return 'bajra';
    if (str.includes('ragi') || str.includes('finger millet') || str.includes('navane') || str.includes('foxtail')) return 'ragi';

    // 8. Fruits
    if (str.includes('banana') || str.includes('kela')) return 'banana';
    if (str.includes('papaya') || str.includes('papita')) return 'papaya';
    if (str.includes('pear') || str.includes('nashpati') || str.includes('marasebu')) return 'pear';
    if (str.includes('apple') || str.includes('seb')) return 'apple';
    if (str.includes('pomegranate') || str.includes('anar')) return 'pomegranate';
    if (str.includes('lemon') || str.includes('lime') || str.includes('nimbu')) return 'lemon';
    if (str.includes('orange') || str.includes('santrash') || str.includes('santara')) return 'orange';
    if (str.includes('grapes') || str.includes('angoor')) return 'grapes';
    if (str.includes('guava') || str.includes('amrood')) return 'guava';
    if (str.includes('jack fruit') || str.includes('jackfruit') || str.includes('kathal')) return 'jackfruit';
    if (str.includes('amla') || str.includes('gooseberry')) return 'amla';
    if (str.includes('fig') || str.includes('anjeer') || str.includes('anjura')) return 'fig';
    if (str.includes('plum') || str.includes('aloo bukhara')) return 'plum';
    if (str.includes('chikoo') || str.includes('sapota') || str.includes('chikoos')) return 'chikoo';

    return null;
  }

  /**
   * Generates a neutral, professional SVG data URL.
   */
  function getNeutralPlaceholderUrl(commodityName) {
    const label = commodityName ? String(commodityName).replace(/[<>&"]/g, '') : 'Commodity';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="100%" height="100%">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f8fafc"/>
          <stop offset="100%" stop-color="#e2e8f0"/>
        </linearGradient>
      </defs>
      <rect width="400" height="280" fill="url(#bgGrad)"/>
      <rect x="15" y="15" width="370" height="250" rx="10" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="6,6"/>
      <g transform="translate(200, 110)" text-anchor="middle" fill="#94a3b8">
        <circle cx="0" cy="0" r="32" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <path d="M-12,-4 L-8,-10 L8,-10 L12,-4 L16,-4 C17.1,-4 18,-3.1 18,-2 L18,12 C18,13.1 17.1,14 16,14 L-16,14 C-17.1,14 -18,13.1 -18,12 L-18,-2 C-18,-3.1 -17.1,-4 -16,-4 Z" fill="#94a3b8"/>
        <circle cx="0" cy="5" r="5" fill="#ffffff"/>
      </g>
      <text x="200" y="178" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#475569" text-anchor="middle">Image Unavailable</text>
      <text x="200" y="200" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="500" fill="#64748b" text-anchor="middle">${label}</text>
      <text x="200" y="222" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="600" fill="#16a34a" text-anchor="middle">KRISHI VAANI APMC VERIFIED</text>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /**
   * Main Public API: Get the verified local image path for a commodity name.
   */
  function getCommodityImageUrl(commodityName) {
    if (!commodityName) return getNeutralPlaceholderUrl('Produce');
    const key = resolveCanonicalKey(commodityName);
    if (key && LOCAL_COMMODITY_REGISTRY[key]) {
      return LOCAL_COMMODITY_REGISTRY[key];
    }
    return getNeutralPlaceholderUrl(commodityName);
  }

  /**
   * Error handler for <img> tag fallback.
   */
  function handleImageError(imgElement, commodityName) {
    if (imgElement) {
      imgElement.onerror = null; // prevent infinite loop
      imgElement.src = getNeutralPlaceholderUrl(commodityName);
    }
  }

  return {
    LOCAL_IMAGE_BASE,
    LOCAL_COMMODITY_REGISTRY,
    normalizeCommodityName,
    resolveCanonicalKey,
    getCommodityImageUrl,
    getNeutralPlaceholderUrl,
    handleImageError
  };
}));
