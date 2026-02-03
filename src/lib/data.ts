export interface Project {
  id: string
  name: string
  description: string
  category: string
  imageUrl: string
  website?: string
  twitter?: string
  discord?: string
  linkedin?: string
  farcaster?: string
  github?: string
  fundingGoal?: number
  fundingCurrent?: number
  likes?: number
  comments?: number
  walletAddress?: string
  isBookmarked?: boolean
  userHasLiked?: boolean
  userHasCommented?: boolean
  reportCount?: number
  boostAmount?: number
}

// Celo Builders projects from the JSON
const celoBuilderProjects = [
  {
    name: "JulioMCruz.base.eth",
    bio: "🚀 OnChain Engineer | Developing decentralized solutions that empower communities 🌐 Passionate about onchain innovation and open-source collaboration.",
    image: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/3cef26d3-9f0a-4c12-160a-47082c268d00/original",
    farcaster: "https://farcaster.xyz/juliomcruz",
    linkedin: "https://www.linkedin.com/in/juliomcruz",
    github: "https://github.com/JulioMCruz",
    wallet: "0xc2564e41b7f5cb66d2d99466450cfebce9e8228f",
  },
  {
    name: "Soko",
    bio: "Web3 OS Builder W3GPT.ai",
    image: "https://i.imgur.com/PNaumro.jpg",
    farcaster: "https://farcaster.xyz/soko.eth",
    linkedin: "https://www.linkedin.com/in/markeljan",
    github: "https://github.com/Markeljan",
    wallet: "0x42e9c498135431a48796b5ffe2cbc3d7a1811927",
  },
  {
    name: "Gabriel Temtsen",
    bio: "Full-stack Developer || Blockchain Developer || Web2 & Web3 developer",
    image: "https://images.colorino.site/eb2db514e7781d9bd460b81f3bbaae51b951258f5dd2b149a2c2250f707b6946.png",
    farcaster: "https://farcaster.xyz/gabedev.eth",
    linkedin: "https://www.linkedin.com/in/gabriel-temtsen-bb0a8a236",
    github: "https://github.com/gabrieltemtsen",
    wallet: "0xc5337cee97ff5b190f26c4a12341dd210f26e17c",
  },
  {
    name: "limone.eth 🍋",
    bio: "building mini-apps /builders-garden /farville /just-frame-it | building a web3 hub in rome /urbe-eth /ethrome 🇮🇹🐺 https://limone.lol",
    image: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/05f5a8aa-48ee-48af-d618-c420091f3200/original",
    farcaster: "https://farcaster.xyz/limone.eth",
    linkedin: "https://www.linkedin.com/in/simone-staffa-8b3b79158",
    github: "https://github.com/limone-eth",
    wallet: "0x1358155a15930f89ebc787a34eb4ccfd9720bc62",
  },
  {
    name: "Sambit Sargam Ekalabya",
    bio: "Web3 Builder",
    image: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fa31601f-a263-40b3-2067-517a1b110400/rectcrop3",
    farcaster: "https://farcaster.xyz/sambitsargam",
    linkedin: "https://www.linkedin.com/in/sambitsargam",
    github: "https://github.com/sambitsargam",
    wallet: "0xadbb2bae7f0cd584491c35089d8a819108a1276c",
  },
  {
    name: "Mark Carey 🎩🫂",
    bio: "frame developer, web3 developer, long distance runner /pixelnouns /frm /degendogs /degenfers /toka /maxis",
    image: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/ce812b3c-6930-41e7-b2a1-d70075494500/original",
    farcaster: "https://farcaster.xyz/markcarey",
    linkedin: "https://www.linkedin.com/in/markcareyinternet",
    github: "https://github.com/markcarey",
    wallet: "0x09a900eb2ff6e9aca12d4d1a396ddc9be0307661",
  },
  {
    name: "ottox.eth",
    bio: "Cryptocat",
    image: "https://i.imgur.com/nm0OfnR.jpg",
    farcaster: "https://farcaster.xyz/ottox",
    linkedin: "https://www.linkedin.com/in/otto-blockchain",
    github: "https://github.com/ottodevs",
    wallet: "0xb343880dc01517dcfcbb528864d567e3389753e1",
  },
  {
    name: "thescoho",
    bio: "I like building cool stuff! 🏗️",
    image: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/aee44326-2c54-4478-9137-258fa970fd00/original",
    farcaster: "https://farcaster.xyz/jake",
    linkedin: "https://www.linkedin.com/in/sailesh-s-453061141",
    github: "https://github.com/ss251",
    wallet: "0x09928cebb4c977c5e5db237a2a2ce5cd10497cb8",
  },
  {
    name: "leal.eth 🫡",
    bio: "Engineer/Cofounder of @talent",
    image: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/2ea7d438-7e41-4057-1ea0-9346b5a29f00/original",
    farcaster: "https://farcaster.xyz/leal.eth",
    linkedin: "https://www.linkedin.com/in/lealfrancisco",
    github: "https://github.com/0xleal",
    wallet: "0x33041027dd8f4dc82b6e825fb37adf8f15d44053",
  },
]

// Complete dataset from the JSON file - all 404 projects
const rawProjects = [
  {
    "Name of Project": "12 Butterflies",
    "Description of Project":
      "Having one central location to allow all to access the wisdom and solutions required to fix these pressing issues",
    Website: "https://12butterflies.earth",
    Twitter: "https://twitter.com/12butterflies_",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703013/12_Butterflies_lzrora.jpg",
    Category: "Regeneration",
  },
  {
    "Name of Project": "1931.io",
    "Description of Project":
      "Our platform is a testament to the complexity and variety of Latin American art, offering a glimpse into the heart of a region where every stroke on the canvas, every chisel on the stone, and every echo of the brush dances to the rhythm of diverse cultures and timeless stories.",
    Website: "https://1931io",
    Twitter: "https://www.twitter.com/1931io",
    "URL to Logo": "/1931-latin-american-art.jpg",
    Category: "Social Impact",
  },
  {
    "Name of Project": "1Planet",
    "Description of Project":
      "Broker to bring offsets on-chain and sell them as a 1Planet token with a web2 type login.",
    Website: "https://1planet.org",
    Twitter: null,
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703013/1Planet_u1he25.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "2Local",
    "Description of Project": "Building local circular economies through blockchain technology",
    Website: "https://2local.io",
    Twitter: null,
    "URL to Logo": "/2local-circular-economy.jpg",
    Category: "Social Impact",
  },
  {
    "Name of Project": "5th World",
    "Description of Project":
      "Building cryptoeconomic systems to regenerate planet earth through permanent agriculture",
    Website: "https://5thworldregen.com",
    Twitter: null,
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703019/5th_World_tjs2wm.png",
    Category: "Regeneration",
  },
  {
    "Name of Project": "a16z crypto",
    "Description of Project": "we back bold entrepreneurs building the next internet",
    Website: "https://a16zcrypto.com",
    Twitter: "https://x.com/a16zcrypto",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703013/a16z_crypto_vihht1.jpg",
    Category: "Regeneration",
  },
  {
    "Name of Project": "Abundance Protocol",
    "Description of Project": "BUILDING AN ECONOMY OF ABUNDANCE",
    Website: "https://abundance.id/",
    Twitter: "https://twitter.com/Abundance_DAO",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703015/Abundance_Protocol_ppotrl.jpg",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Acumen Research Labs",
    "Description of Project": "Democratizing Space finance through a Space Investment DAO",
    Website: "https://acumenresearch.io/",
    Twitter: null,
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703013/Acumen_Research_Labs_ooalfp.jpg",
    Category: "Open Source",
  },
  {
    "Name of Project": "Aera Force DAO",
    "Description of Project":
      "We are a decentralized network of impact builders focused on regenerative finance and Web3 innovation, supporting projects that align ecological regeneration with economic resilience.",
    Website: "https://aeraforce.xyz",
    Twitter: "https://x.com/AeraForce",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703015/Aera_Force_DAO_tjabfc.jpg",
    Category: "Regeneration",
  },
  {
    "Name of Project": "Agartha",
    "Description of Project":
      "Our mission is to expand the global network of meaningful regenerative coliving communities. We will be: - Operating cohorts with changemakers to co-educate and collaborate on ideas to build new community prototypes, smart villages and sustainable living solutions. - Publishing educational content about new civilization building through commons-pooled p2p networks -Building a platform to discover existing communities that address these issues: Wealth inequality -- provide cheaper living solutions to uplift. unprivileged communities Environmental issues -- by harnessing food and water locally and adapting to off-grid solar technology, empower local resilience and sustainability. Existential issues -- promote communal living to increase sense of belonging and mutual support networks",
    Website: "https://agartha.one",
    Twitter: "https://x.com/agartha_one",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703014/Agartha_mbmvpr.png",
    Category: "Regeneration",
  },
  {
    "Name of Project": "AgroforestDAO",
    "Description of Project":
      "We are a movement with the purpose of building a support network that connects stewards, apprentices and investors with shared content, products and experiences as a way to foster collaboration and governance over tangible and intangible long term food forest commons.",
    Website: "https://agroforestdao.org",
    Twitter: "https://x.com/agroforestdao",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703015/AgroforestDAO_d8pp0q.png",
    Category: "Nature",
  },
  {
    "Name of Project": "AGROFORESTRY",
    "Description of Project":
      "Regenerative agriculture/agroforestry/permaculture has emerged as a major instrument in the fight against climate change in recent years. It's a widely accepted answer to the twin problems of climate change and food insecurity. we are training farmers on better farming methods such as smart agriculture as this is key for sustainability.",
    Website: "https://agroforestry-research.org",
    Twitter: "https://twitter.com/agroforestry_org",
    "URL to Logo":
      "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703016/AGROFORESTRY_CLIMATE_CHANGE_FORESTS_ECOSYSTEMS_u05ypa.jpg",
    Category: "Nature",
  },
  {
    "Name of Project": "Aioneer",
    "Description of Project":
      "By way of assessing social trust (e.g. cooperatives) and buy now pay later smartphone contracts (lease) we empower entrepreneurs and small businesses to join the digital society, build reputation and scale. Our assessment model fits the local trusted circles and brings social pressure (peer guarantees) besides the technical (device collateral) and financial (guarantees).",
    Website: "https://aioneer.io",
    Twitter: "https://twitter.com/aioneer_io",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703016/Aioneer_pcjaxs.png",
    Category: "Social Impact",
  },
  {
    "Name of Project": "Allegory",
    "Description of Project": "Allegory invests and builds at the intersection of web3 and climate",
    Website: "https://allegory.earth",
    Twitter: "https://x.com/allegorylabs",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703018/Allegory_hdf0fa.jpg",
    Category: "Regeneration",
  },
  {
    "Name of Project": "Allegory Labs",
    "Description of Project": "Allegory invests and builds at the intersection of web3 and climate",
    Website: "https://allegorylabs.io",
    Twitter: "https://twitter.com/allegorylabs",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703017/Allegory_Labs_rafxzg.jpg",
    Category: "Regeneration",
  },
  {
    "Name of Project": "All for Climate DAO",
    "Description of Project":
      "AllforClimate is a decentralised network of grassroots collectives. We support active citizens to start contributing to a sustainable world by providing a common infrastructure and actively bridging the gap between citizens, institutions and web3.",
    Website: "https://allforclimate.earth",
    Twitter: "https://x.com/allforclimate",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703017/All_for_Climate_DAO_lidymb.jpg",
    Category: "Climate Action",
  },
  {
    "Name of Project": "AlliedOffsets",
    "Description of Project":
      "We are the world's first aggregated data source for the voluntary carbon market. We've built an API that allows ReFis to better understand the market and pull in the necessary data to make their initiatives succeed.",
    Website: "https://alliedoffsets.com",
    Twitter: "https://x.com/alliedoffsets",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703012/AlliedOffsets_rv1uin.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Amazônia Cripto",
    "Description of Project":
      "AmazoniaCripto has been developing its own platform for the commercialization of sustainable NFts as a way of enabling investors to, through the acquisition of our digital assets, support production systems of local producers in the Amazon with projects for the management and implementation of agroforestry systems and/or recovery of degraded areas. through the Agroforestry Systems. The first collections of NFTs will be created and created by the company itself, being developed in projects with a network of producers and partners already mapped. For SAF projects, we intend to work with producers that we already have a relationship with and validate the demands. In parallel, we will make new partnerships to enable collections of third-party project NFTs to be curated before being approved on the platform.",
    Website: "https://amazoniacripto.com",
    Twitter: "https://twitter.com/amazoniacripto",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703014/Amaz%C3%B4nia_Cripto_joieij.jpg",
    Category: "Nature",
  },
  {
    "Name of Project": "Anatha",
    "Description of Project":
      'Wallet app with coin and trading platform that streams a "UBI" to token holders (really just staking rewards). Maps more ESG than climate, but definite possible brand / demographic overlap.',
    Website: "https://anatha.io",
    Twitter: "https://x.com/anatha",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703014/Anatha_bqkio7.png",
    Category: "Social Impact",
  },
  {
    "Name of Project": "AngelProtocol",
    "Description of Project":
      "Angel Protocol enables your charity to thrive from decentralized financial products, without the complexity",
    Website: "https://angelprotocol.io",
    Twitter: "https://x.com/angelprotocol",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703015/AngelProtocol_lfm4a6.jpg",
    Category: "Social Impact",
  },
  {
    "Name of Project": "Anu Initiative",
    "Description of Project":
      "Anu Initiative is a Company Limited by Guarantee (Nonprofit) incorporated in Dublin, Ireland. It was founded by nature lovers in an effort to harness the powers of cutting edge technologies to create a positive impact on the planet. The Anu Initiative aims to help heal the damage that actions like oil spills, forest fires, soil degradations, deforestation, etc. have on our environment and wildlife as well as offset the negative impact cryptocurrencies and other technologies have on the environment by providing resources to nature-focused charities around the world in a fully transparent manner.",
    Website: "https://anuinitiative.org",
    Twitter: "https://twitter.com/anuinitiative",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703015/Anu_Initiative_xy3rkc.png",
    Category: "Nature",
  },
  {
    "Name of Project": "Aqua Goat",
    "Description of Project":
      "AquaGoat is a yield-generating social cryptocurrency. Members of the AquaGoat ecosystem earn interest from network activity, all while benefiting the planet though our charitable partnerships.",
    Website: "https://aquagoat.finance",
    Twitter: "https://x.com/AquaBSC",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703015/Aqua_Goat_ndxzau.png",
    Category: "Social Impact",
  },
  {
    "Name of Project": "ARKREEN",
    "Description of Project":
      "arkreen network is an infrastructure powered by the evolution of WEB3 blockchain principles; it provides a platform to interconnect and monetize globally distributed clean and renewable energy equipment (e.g. Solar, Wind, Eos), with a goal to help reduce carbon emissions by using a tokenized miner or Smart Data Logger to track green energy and use Proof of Green Generation (PoGG) similar to the proof of coverage to convert recorded data from this device and turn it into green data of monetized value.",
    Website: "https://arkreen.com",
    Twitter: "https://x.com/arkreen_network",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703016/ARK_REEN_bqhc6u.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Arquitectura Regenerativa",
    "Description of Project":
      "We build Low Carbon social housing, combinign Natural and Local materials with PassivHaus German Standard. One idea is to build city nodes (as islands) were not just houses, but maybe a hole block, acts as a regenerative and soveraign space (soveraign water, food and finance). Make this a form of new living, within local policies, within the cities… this is something totally possbile using Web3/Blockchain tools.",
    Website: "https://arquitecturaregenerativa.org",
    Twitter: null,
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703019/Arquitectura_Regenerativa_xjobwg.jpg",
    Category: "Regeneration",
  },
  {
    "Name of Project": "Asoba DeFi",
    "Description of Project":
      '"Art that keeps on giving" marries NFT ArtPhotography investors with the less fortunate. It offers NFT images combined with Fine Art Prints in a limited edition that can be collected. Upon sale 50% of the price to my subjects via a transparent transaction',
    Website: "https://asoba.finance",
    Twitter: null,
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703017/Asoba_DeFi_ce1xci.png",
    Category: "Social Impact",
  },
  {
    "Name of Project": "Astral",
    "Description of Project": "Driving financing for solar energy projects across southern Africa with NFTs",
    Website: "https://astral.global",
    Twitter: "https://x.com/asobadefi",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703018/Astral_Protocol_rwjm1c.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Astral Protocol",
    "Description of Project":
      "Astral builds location-based Web3 applications and spatial smart contracts to serve applications such as MRV tools (measurement, reporting, and verification), spatial governance systems, sustainability-linked bonds, or parametric insurance mechanisms.",
    Website: "https://astralprotocol.io",
    Twitter: "https://twitter.com/astralprotocol",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703018/Astral_Protocol_rwjm1c.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Athena Protocol",
    "Description of Project":
      "Astral builds location-based Web3 applications and spatial smart contracts to serve applications such as MRV tools (measurement, reporting, and verification), spatial governance systems, sustainability-linked bonds, or parametric insurance mechanisms.",
    Website: "https://athena.tech",
    Twitter: "https://x.com/astralprotocol",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703018/Athena_Protocol_olqets.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Atlantis",
    "Description of Project":
      "EDGE ORACLE SOLUTIONS FOR ECOLOGICAL & SOCIAL GOVERNANCE - We work to ensure equity, accessibility, and transparency in ecological and social governance through the development of distributed ledger technology solutions that keep individual data sovereignty at the core of their design.",
    Website: "https://atlantians.world",
    Twitter: "https://x.com/astralprotocol",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703018/Atlantis_djhu6e.png",
    Category: "Open Source",
  },
  {
    "Name of Project": "Avatree",
    "Description of Project":
      "Atlantis is a digital ecosystem that provides a suite of tools that help carbon credit sellers and buyers transact with ease. Our tools not only provide convenience but also an array of incentives for both parties, encouraging positive climate actions at scale.",
    Website: "https://avatree.xyz",
    Twitter: null,
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703018/Avatree_q75x13.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Awake",
    "Description of Project":
      'Avatree\'s mission is to use art to amplify climate action. We work with established artists by connecting their art to climate restoration efforts via the blockchain. When the owner of a piece purchases climate credits, the art dynamically changes, making the artwork a visual representation of climate action. Artists benefit by being able to brand themselves with climate, extend their reach through our network, and sell more art. End users benefit by owning an appreciable piece of artwork that supports climate restoration. After our initial launch, we will create a consumer product, where our target market will be the enterprise. We will empower enterprises to offer carbon offsetting as an employee benefit and showcase this culture to the public in a verifiable way. OUR KEY DIFFERENTIATORS - Using Art - We believe that art has the unique ability to inspire and emotionally engage people. Our product integrates the artwork from established artists. Nicole Buffett (top 50 NFT influencers), Carlos James (his art was on the August 2022 Time Magazine cover), and other top-end artists are working with us. - Blockchain Based Climate Credits - Blockchain based climate credits introduce transparency and verifiability since each credit is stamped with meta-data about the project (location, relevant images, auditor, etc.), thereby cultivating greater trust in the authenticity of the climate project - Incentivization - After the initial rollout, we will allow users to earn tokens that can be redeemed for brand rewards or traded for cash. Essentially, this creates a "frequent flyer program" for climate action that encourages more people to participate - High Quality Climate Credits - Phil Taylor, a leading climate scientist and entrepreneur is on our team and helping us select high quality carbon credits that are nature based, offer clear additionality, and have secondary benefits wrt biodiversity, land health, soil health. etc.',
    Website: "https://awakeinvest.com",
    Twitter: null,
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703019/Awake_ocnydw.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Ayowecca Uganda",
    "Description of Project":
      "We have created a platform allowing users to link an investment account, discuss issues with other users, vote on proposals, and use the collective power of the stocks they own to influence corporations for positive climate action.",
    Website: "https://ayoweccauganda.org",
    Twitter: null,
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703019/Ayowecca_Uganda_dsiywe.jpg",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Bancambios Eco",
    "Description of Project":
      "Increasing awareness, training local farmers on regenerative agriculture, tree planting (Agroforestry), education, capacity building, storytelling, national dialogue and outreach programs",
    Website: "https://bancambios.com",
    Twitter: "https://x.com/bancambios",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703019/Bancambios_Eco_d7o7ks.png",
    Category: "Nature",
  },
  {
    "Name of Project": "BASIN DAO",
    "Description of Project":
      "Implement Satellite Geo monitoring to Projects issuing Carbon Credits Eliminate the low quality of Carbon Credit in circulation Accelerate the Plastic Credits, Blue Credits, and Clean Water Credits Global marketplace Launchpad of Regenerative Initiatives",
    Website: "https://basin.global",
    Twitter: "https://x.com/ayoweccauganda",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703020/BASIN_DAO_vrj6dp.jpg",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Beach Collective",
    "Description of Project":
      "As regenerative finance for real estate based climate, nature and carbon projects the Basin platform facilitates the acquisition and stewardship of undervalued / degraded property and regenerates it for economic and environmental benefit. The $BASIN ReFi Mechanism uses property restoration and other network activity to fund conservation to support the natural capital of the global Commons in perpetuity.",
    Website: "https://beachcollective.org",
    Twitter: "https://x.com/beach_token",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703020/Beach_Collective_onzt6f.png",
    Category: "Regeneration",
  },
  {
    "Name of Project": "BETTER",
    "Description of Project":
      "The Beach Collective is a blue circular economy platform powered by our native currency $BEACH, bringing together climate conscious consumers, planet-friendly brands and businesses and ocean conservation champions",
    Website: "https://better.world",
    Twitter: "https://x.com/basin_global",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703020/BETTER_bx9rex.jpg",
    Category: "Nature",
  },
  {
    "Name of Project": "Betterverse",
    "Description of Project":
      "Creating a web3 climate brand that appeals to the masses using entertainment, humor, and engaging campaigns.",
    Website: "https://betterverse.app",
    Twitter: "https://x.com/beach_token",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703020/Betterverse_n3jf41.jpg",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Better Worlds",
    "Description of Project":
      "Building the world's charity aggregator on Web3 🌱 Donate, collect NFTs, track your donation, share with your friends and followers.",
    Website: "https://betterworlds.com",
    Twitter: null,
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703020/Better_Worlds_ojrqr4.png",
    Category: "Social Impact",
  },
  {
    "Name of Project": "BICOWG",
    "Description of Project":
      "Building cryptoeconomic systems to regenerate planet earth through permanent agriculture",
    Website: "https://bicowg.org",
    Twitter: "https://x.com/betterverse",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703021/BICOWG_mfte1b.png",
    Category: "Regeneration",
  },
  {
    "Name of Project": "BiO2",
    "Description of Project": "Oxigeno para la vida",
    Website: "https://bio2.earth",
    Twitter: "https://x.com/betterworlds",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703022/BiO2_tqlalt.jpg",
    Category: "Social Impact",
  },
  {
    "Name of Project": "BioFrequency Company",
    "Description of Project":
      "We specialize in the protection of artificial electromagnetic fields to maintain the quality of life of human beings",
    Website: "https://biofrequency.company",
    Twitter: "https://x.com/bicowg",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703021/BioFrequency_Company_q57pv3.png",
    Category: "Social Impact",
  },
  {
    "Name of Project": "Bioregional Regeneration Finance",
    "Description of Project":
      "Creation of a decentralised regenerative development finance institution (DAO) specifically designed to support and scale bioregional regeneration in developing and emerging markets. This ReDevFi DAO would provide a critical bridge between on-chain and off-chain resources at key friction points to enhance flow, capacity and resilience; between local capability and global standards with regards to impact measurement and reporting; and between investor and regenerator needs, expectations and objectives across short, medium and long-term time horizons.",
    Website: "https://bioregional.finance",
    Twitter: "https://x.com/bioregionalfinance",
    "URL to Logo":
      "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703022/Bioregional_Regeneration_Finance_ey5n96.png",
    Category: "Social Impact",
  },
  {
    "Name of Project": "BioTrip",
    "Description of Project":
      "BioTrip is a utility token to be used for purchases of medicine products in Latin America.",
    Website: "https://biotripcoin.com",
    Twitter: "https://x.com/biotripcoin",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703021/BioTrip_yzwg6d.png",
    Category: "Regeneration",
  },
  {
    "Name of Project": "Block2030",
    "Description of Project":
      "An educational project that teaches about blockchain and web3 to peripheral communities. We build special and interactive content to peripheral youth and special knowledge trials for artists, social producers and local entrepreneurs. Our project promotes public goods and the creative and circular economy, through black and peripheral protagonism.",
    Website: "https://block2030.com",
    Twitter: "https://x.com/block2030",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703022/Block2030_bjlyiz.png",
    Category: "Social Impact",
  },
  {
    "Name of Project": "Blcktopia",
    "Description of Project":
      "The first derivative token of the carbon credit market- benefit of the increasing co2 price with Block2030. additionally, increasing transparency and barriers to deal with carbon credits.",
    Website: "https://blcktopia.io",
    Twitter: "https://x.com/blcktopia",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703023/Blcktopia_ngnkew.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Blockchain for Good (France)",
    "Description of Project":
      "Blockchain for Good is a French non-profit organization whose purpose is to foster the sharing of experiences between the blockchains ecosystem and sustainable development actors.",
    Website: "https://blockchainforgood.fr",
    Twitter: "https://x.com/blockchainforgood",
    "URL to Logo":
      "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703022/Blockchain_for_Good_France_bau000.jpg",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Blockchain x Climate Leadership Network",
    "Description of Project":
      "BxC is an activist-to-industry network of global stakeholders working together to define and author principles that govern climate-related blockchain efforts, develop shared understanding and narratives across sectors, and design tangible and meaningful cross-chain and cross-industry climate initiatives and projects.",
    Website: "https://bxc.network",
    Twitter: "https://x.com/bxcnetwork",
    "URL to Logo":
      "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703022/Blockchain_x_Climate_Leadership_Network_BxC_eyoy4s.png",
    Category: "Open Source",
  },
  {
    "Name of Project": "Blocks.garden",
    "Description of Project":
      "#MakeCryptoGreen, starting from ETH1 historical emissions, by turning blocks in the blockchain into pixels on a large canvas, decarbonizing one by one, by automatically pairing it with Green-NFTs (tokenized Renewable Enercy Certificates or, soon, also other decarbonization strategies) . Many Refi Companies are already launch partners.",
    Website: "https://blocks.garden",
    Twitter: "https://x.com/blocks_garden",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703022/Blocks.garden_mubpjr.png",
    Category: "Open Source",
  },
  {
    "Name of Project": "Bloom Network",
    "Description of Project":
      "Bloom is a climate action network that helps people of all ages find and participate in local, proven grassroots climate actions. It combines an online social network with local climate coalitions.",
    Website: "https://bloomnetwork.earth",
    Twitter: "https://x.com/bloomnetwork",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703023/Bloom_Network_taem3v.svg",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Blue Heart Economy",
    "Description of Project":
      "The Blue Heart Economy is a heart and art centered movement for the ocean and earth. The Blue Heart Economy is the next evolution of the circular economy when applied to ocean generation and accelerated by Web3. It is the creation of a new economy that incentivizes IRL (in real life) plastic mining to eliminate plastic from the environment and transform into clean energy through a technological innovation invented by Petgas.mx",
    Website: "https://blueheart.economy",
    Twitter: "https://x.com/bluehearteconomy",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703023/Blue_Heart_Economy_p9m48b.jpg",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Borderless Money",
    "Description of Project":
      "We are a DeFi protocol for the good! We've created a democratic and transparent mechanism for social investment and fund distributions. We've done this through the use of yield generating protocols aimed at funding social causes, registered on our platform. Investors will benefit from unique income-generating opportunities at a cost comparable to existing solutions while also contributing to social impact initiatives of their choice.",
    Website: "https://borderless.money",
    Twitter: "https://x.com/borderlessmoney",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703023/Borderless_Money_epecea.png",
    Category: "Nature",
  },
  {
    "Name of Project": "BORN",
    "Description of Project": "Biotechnologies cutting-edge Epigenetic Health Enhancement",
    Website: "https://born.foundation",
    Twitter: "https://x.com/bornfoundation",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703024/BORN_dvcxze.jpg",
    Category: "Social Impact",
  },
  {
    "Name of Project": "Brazil Carbon",
    "Description of Project":
      "Brazil Carbon is a carbon credit tokenization platform. Using cryptography and machine learning, we offer high integrity carbon credits and investment into carbon credit projects. We also aim to enable co-benefiting by direct funding of project area cohabitants and local communities.",
    Website: "https://brazilcarbon.com",
    Twitter: "https://x.com/brazilcarbon",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703023/Brazil_Carbon_xlepom.png",
    Category: "Social Impact",
  },
  {
    "Name of Project": "Bridgit DAO",
    "Description of Project":
      "The BÚAN _economy leverages Ξthereum as an unprecedented arena for playing cooperative games, enabling us to evolve from the paradigm where natural assets only have value to those that harvest them. The assets in our treasury from which the impact certificates are derived from will be imbued with the same life that they embody in the real world. Natural Capital is the backbone of the BÚAN _economy similar to the gold standard.",
    Website: "https://bridgit.io",
    Twitter: "https://x.com/bridgitdao",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703024/Bridgit_DAO_hjya2u.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "BÚAN",
    "Description of Project":
      "The BÚAN _economy leverages Ξthereum as an unprecedented arena for playing cooperative games, enabling us to evolve from the paradigm where natural assets only have value to those that harvest them. The assets in our treasury from which the impact certificates are derived from will be imbued with the same life that they embody in the real world. Natural Capital is the backbone of the BÚAN _economy similar to the gold standard.",
    Website: "https://buanfund.eth",
    Twitter: "https://x.com/buan_fund",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703024/B%C3%9AAN_gvadu6.png",
    Category: "Regeneration",
  },
  {
    "Name of Project": "Budakiss",
    "Description of Project": "Nutrición y Gastronomía",
    Website: null,
    Twitter: null,
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703027/Budakiss_h8kixe.jpg",
    Category: "Regeneration",
  },
  {
    "Name of Project": "C0MM0NSIA",
    "Description of Project":
      "We are dedicated to pioneering Omni-Commons On-chainability, ushering the era of abundance and prosperity through regenerative Commons Finance and Commons Economies. Our foundation rests on the Distributed Commons Economies Protocol (Proof of Mutuality), fueled by the Reciprocal Currency.",
    Website: "https://c0mm0nsia.com",
    Twitter: "https://x.com/c0mm0nsia",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703044/C0MM0NSIA_wyw1rf.jpg",
    Category: "Social Impact",
  },
  {
    "Name of Project": "C3",
    "Description of Project":
      "C3 is an automated suite of products that bridges the Voluntary Carbon Market with the blockchain and Decentralized Finance. This approach enables the high-integrity credits traded within the market to be exposed to greater levels of access, transparency, and liquidity, benefitting the creators and consumers of the credits themselves.\nC3 Vision is: To unlock climate impact at scale.",
    Website: "https://www.c3web3.com/",
    Twitter: "https://www.instagram.com/c3web3.0/",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703045/C3_qukf4k.png",
    Category: "Regeneration",
  },
  {
    "Name of Project": "C4EST",
    "Description of Project":
      "Creating a token-based economy to invest in building plantations near city peripheries most prone to global warming's effects and turning it into a nature-based bio-economy according to local industrial, social and environmental needs of the cities.",
    Website: "https://c4est.org",
    Twitter: "https://x.com/c4est",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703044/C4EST_pvx9is.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "CALLIRIUS",
    "Description of Project":
      "We enable financing for high-quality climate solutions through a data-driven, science-backed, and well-regulated framework.",
    Website: "https://callirius.com",
    Twitter: "https://x.com/callirius",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703044/CALLIRIUS_vi00tf.svg",
    Category: "Regeneration",
  },
  {
    "Name of Project": "Cambiatus",
    "Description of Project":
      "Cambiatus is an open source platform to empower the creation of new organizations (DAOs and collaborative businesses) through social currencies using blockchain.",
    Website: "https://cambiatus.com",
    Twitter: "https://x.com/_cambiatus",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703044/Cambiatus_mponit.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Capital Institute",
    "Description of Project":
      "The Capital Institute has pioneered a new space for holistic economic thought that draws on the latest science of living systems, global wisdom traditions, and 20 years of real world experience at the pillar of global finance on Wall Street.",
    Website: "https://capitalinstitute.org",
    Twitter: null,
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703044/Capital_Institute_ggggby.png",
    Category: "Regeneration",
  },
  {
    "Name of Project": "Carbonable",
    "Description of Project":
      "Carbonable is the technological partner for companies to execute their carbon contribution strategy. Our solution leverages the latest technologies (blockchain, satellite imagery and AI) to overcome the financial, operational and reputational challenges and problems inherent in carbon contribution.",
    Website: "https://carbonable.io",
    Twitter: "https://x.com/Carbonable_io",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703046/Carbonable_u81gkn.png",
    Category: "Regeneration",
  },
  {
    "Name of Project": "Carbon Credit Technology (CCT)",
    "Description of Project":
      "CC Technology has brought the world's largest carbon ecosystem for the first time ever with CC Token (Carbon Credit Token). By linking our token to EUA carbon credits, our token opens the door for consumers to the European Union Emissions Trading System. Through buying and holding CC Token you have an impact on how some of the world's largest polluters do business.",
    Website: "https://carboncredit.tech",
    Twitter: "https://twitter.com/carbonlanddao",
    "URL to Logo":
      "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703045/Carbon_Credit_Technology_CCT_ourivm.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "CarbonDAO",
    "Description of Project":
      "Building on-chain carbon offsets: Tokenised pool of non-fungible security tokens for verified off-chain VCUs held by DAO approved custodians. Last update still working on legal.",
    Website: "https://carbon-dao.com",
    Twitter: "https://x.com/carbon_dao",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703045/CarbonDAO_s2vdc8.jpg",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Carbonland DAO",
    "Description of Project":
      "Carbonland DAO is a Nature Preserve Timeshare that sells carbon credits from its owned forest land. Carbonland DAO acquires property by selling CDAO tokens, the governance token of Carbonland DAO. Token holders can use CDAO to vote where Carbonland DAO buys property, and can spend CDAO to make reservations to visit and stay at Carbonland DAO's nature preserves.",
    Website: "https://carbonlanddao.com",
    Twitter: "https://x.com/carbonlanddao",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703045/Carbonland_DAO_cri7u0.jpg",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Carbonlink",
    "Description of Project":
      "CarbonLink aims to serve the community as an all-encompassing carbon offsetting platform. We drive sustainable demand by increasing the accessibility of tokenized carbon offsets. Our suite of products includes a carbon emission calculator (subscription-based model) and a carbon marketplace/exchange (complete with an offsetting API & on-chain meta registry). Our simple user flow (sign-up, pay in fiat, retire) promotes sustainable initiative by breaking down the Web3 barrier to entry that's involved with tokenized carbon offsets.",
    Website: "https://carbonlink.io",
    Twitter: "https://x.com/carbonlink",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703046/Carbonlink_prmlqu.png",
    Category: "RWA",
  },
  {
    "Name of Project": "Carbon Path",
    "Description of Project": "Carbon Path provides carbon offset solutions through blockchain technology",
    Website: "https://carbonpath.io",
    Twitter: "https://x.com/CarbonPath_io",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703046/Carbon_Path_ukhzbb.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "CarbonX",
    "Description of Project": "Investment for carbon mitigation",
    Website: "https://carbonx.ca",
    Twitter: null,
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703046/CarbonX_cl8a4f.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Carbovalent",
    "Description of Project":
      "Carbovalent is a carbon credit network built on the Solana blockchain that aims to address the challenges of transparency, accessibility, liquidity, and composability in traditional off-chain carbon credit registries.",
    Website: "https://carbovalent.com",
    Twitter: "https://x.com/carbovalent",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703047/Carbovalent_yhl4ui.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Cardashift",
    "Description of Project":
      "Cardashift provides society with the tools to change the economy, as a whole. We build mission-driven NFTs, the new engagement contracts of entire ecosystems enabling the structuring, financing, promotion and delivery of a novel impact economy.",
    Website: "https://cardashift.com",
    Twitter: "https://x.com/cardashift",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703056/Cardashift_crpiba.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Cascadia Carbon",
    "Description of Project":
      "Cascadia Carbon is disrupting and democratizing voluntary carbon offsets. We've built CODEX, a custom, low-carbon blockchain designed for individuals and enterprises to buy, build, or exchange their trees ongoing, additional offsets. Cascadia Carbon provides a platform for individuals to generate, purchase, store, and exchange carbon offsets to earn social and monetary credit while mitigating their climate impact.",
    Website: "https://cascadiacarbon.com",
    Twitter: "https://x.com/CascadiaCarbon",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703056/Cascadia_Carbon_sqnczw.png",
    Category: "Regeneration",
  },
  {
    "Name of Project": "Celo",
    "Description of Project":
      "Creating a more prosperous world with mission-aligned organizations. Enable a regenerative, ecological economy by creating natural-capital backed assets and putting them into circulation. Help your communities overcome inflation and build for their future by saving in stablecoins",
    Website: "https://celo.org",
    Twitter: "https://x.com/celo",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703056/Celo_xb6vbk.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Celo Public Goods",
    "Description of Project": "Supporting public goods on the Celo blockchain",
    Website: "https://celopg.eco",
    Twitter: "https://x.com/CeloPublicGoods",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703057/Celo_Public_Goods_ymvzrp.png",
    Category: "Open Source",
  },
  {
    "Name of Project": "Centree.org",
    "Description of Project":
      "Turning forests into living assets instead of commodities. Investors can get NFTs representing the conserved forests they finance. Carbon, biodiversity, and other values to be accounted for.",
    Website: "https://centree.org",
    Twitter: "https://twitter.com/chatafisha",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703056/Centree.org_yzpp7r.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Cerulean Ventures",
    "Description of Project":
      "An Inter-blockchain infrastructure / climate fund of contributors creating institutions to scale climate impact.",
    Website: "https://cerulean.vc",
    Twitter: "https://x.com/Cerulean_xyz",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703056/Cerulean_Ventures_kc7zx2.jpg",
    Category: "Nature",
  },
  {
    "Name of Project": "Chatafisha",
    "Description of Project":
      "Regenerating marginalized communities by creating an infrastructure to unlock liquidity for waste pickers to attain a universal basic income as well as upload and keep track of daily offsets. In the long-run a DAO centered around regenerating stakeholders such as Waste pickers, collection points and recyclers.",
    Website: "https://chatafisha.com",
    Twitter: "https://x.com/chatafisha",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703057/Chatafisha_ysylnr.jpg",
    Category: "Regeneration",
  },
  {
    "Name of Project": "Circonomy",
    "Description of Project":
      "Our mission and vision is to turn capital goods into public goods by putting the circular economy on-chain and we'll accomplish this with a recycle/reuse-to-earn protocol.",
    Website: "https://circonomy.org",
    Twitter: "https://x.com/circonomy",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703056/Circonomy_dwzhwm.png",
    Category: "Social Impact",
  },
  {
    "Name of Project": "cLabs",
    "Description of Project":
      "Building decentralized platforms to support stablecoins and tokenized assets optimized for mobile phones.",
    Website: "https://clabs.co",
    Twitter: "https://x.com/clabs_co",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703057/cLabs_ahzr8x.png",
    Category: "Regeneration",
  },
  {
    "Name of Project": "CleanFi",
    "Description of Project":
      "Decentralized funding for renewable energy projects + Stablecoins backed by energy/metal reserves",
    Website: "https://cleanfi.io",
    Twitter: "https://x.com/cleanfi",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703058/CleanFi_cjnktd.png",
    Category: "Open Source",
  },
  {
    "Name of Project": "Climate Chain Coalition",
    "Description of Project":
      "The Climate Chain Coalition (CCC) is an open global initiative to support collaboration among members and stakeholders to advance blockchain (distributed ledger technology) and related digital solutions (e.g. IoT, big data) to help mobilize climate finance and enhance MRV (measurement, reporting and verification) to scale climate actions for mitigation and adaptation.",
    Website: "https://climatechaincoalition.org",
    Twitter: "https://x.com/climatechaincoalition",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703057/Climate_Chain_Coalition_sylkoh.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Climate Collective",
    "Description of Project":
      "The Climate Collective is an effort driven by the Celo community to fight climate change by tokenizing rainforests and other carbon sequestering assets to enable natural capital backed stablecoins on the Celo platform.",
    Website: "https://climatecollective.org",
    Twitter: "https://x.com/climatecollective",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703066/Climate_Collective_x058ab.png",
    Category: "Open Source",
  },
  {
    "Name of Project": "Clime DAO",
    "Description of Project":
      "Steer thousands of global organizations towards environmental stewardship via blockchain first SaaS solution that drastically reduces the cost to take and verify climate action and has enough market driven incentives to build sustainability sixth sense in their DNA.",
    Website: "https://climedao.com",
    Twitter: "https://x.com/climedao",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703066/Clime_DAO_d8qcnk.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Closer",
    "Description of Project":
      "Closer is a platform that enables effective community and land management, built with regenerative principles at its core.",
    Website: "https://closer.earth",
    Twitter: "https://x.com/closerearth",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703066/Closer_whx0bq.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "co2cult",
    "Description of Project":
      "Forking the NounsDAO auction and governance methods. Auctioning 1 NFT every 12 hours forever. Splitting the funds from the auction to the 2 main goals. 50% going to a fund to leverage yield generating mechanism (ideally by supplying liquidity to the forward carbon contracts market) and taking 50% of the yield to buy offsets and burn them to count towards offsetting Eth's historic GHG emissions. The other 50% goes to a DAO treasury that anyone with an NFT would have access to by way of proposals. Other NFT holders would then vote on the proposal to determine whether or not it passes.",
    Website: "https://co2cult.org",
    Twitter: "https://x.com/co2cult",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703066/co2cult_zlcdvg.png",
    Category: "Nature",
  },
  {
    "Name of Project": "Coffee Carbon Collective",
    "Description of Project":
      "Coffee Carbon Collective supports coffee farmers in their transition to Agroforestry systems by providing pre-financing through forward contracts, guidance and in-field resources. Coffee Carbon Collective is a vertically integrated market place that connects coffee producers and rosters and consumers directly and enabled direct trade of coffee as well as 4 types of credits - carbon, biodiversity, water quality and social impact.",
    Website: "https://coffee-carbon-collective.notion.site",
    Twitter: "https://x.com/coffeecarboncollective",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703070/Coffee_Carbon_Collective_gfszcd.bmp",
    Category: "Climate Action",
  },
  {
    "Name of Project": "CofiBlocks",
    "Description of Project":
      "A Collaborative Business for Coffee Lovers ☕ Proud members of the Cambiatus Ecosystem in Costa Rica",
    Website: "https://cofiblocks.com",
    Twitter: "https://x.com/cofiblocks",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703067/CofiBlocks_rwjzac.png",
    Category: "Nature",
  },
  {
    "Name of Project": "Collab + Currency",
    "Description of Project": "a crypto-focused venture fund.",
    Website: "https://collabcurrency.com",
    Twitter: "https://x.com/collabcurrency",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703067/Collab_Currency_w1tbgy.png",
    Category: "Regeneration",
  },
  {
    "Name of Project": "ColtonArt",
    "Description of Project": "Digital art and NFT creation focused on environmental themes",
    Website: "https://www.instagram.com/coltonart.eth",
    Twitter: "https://twitter.com/commonsstack",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703067/ColtonArt_zolsah.png",
    Category: "Regeneration",
  },
  {
    "Name of Project": "Commons Hub",
    "Description of Project":
      "The Commons Hub is a co-working, co-living and event venue in the Austrian Alps that harbours artists, digital movements and decentralized communities exploring the liberatory potential of emerging technologies.",
    Website: "https://commons-hub.com",
    Twitter: "https://x.com/commons_hub",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703067/Commons_Hub_ldrxwy.png",
    Category: "Social Impact",
  },
  {
    "Name of Project": "Commons Stack",
    "Description of Project":
      "Commons Stack is on a mission to enable ground-up, community-driven initiatives that support public or common goods. To achieve this, years of research have gone into developing Commons design patterns which include cultural frameworks, a suite of tools and a radically inclusive methodology (Collaborative Economics) for launching a Commons DAO.",
    Website: "https://commonsstack.org",
    Twitter: "https://x.com/commonsstack",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703067/Commons_Stack_am5rio.jpg",
    Category: "Regeneration",
  },
  {
    "Name of Project": "Confluence Analytics",
    "Description of Project":
      "Making it possible to grow investment capital and be truely net zero. This work wil bring the power of ReFi to Tradfi, and help folster a carbon market in the united states.",
    Website: "https://confluenceanalytics.com",
    Twitter: "https://x.com/Cosmos4Humanity",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703068/Confluence_Analytics_g20zt4.png",
    Category: "Open Source",
  },
  {
    "Name of Project": "Coral Tribe",
    "Description of Project":
      "A platform for impact investing, tokenising shares and decentralising crowdlending. Tokenization of shares that provides liquidity to a traditionally illiquid market.",
    Website: "https://coraltribe.io",
    Twitter: "https://x.com/CoralTribeNFT",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703070/Coral_Tribe_bah0cf.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Cosmos for Humanity",
    "Description of Project":
      "The mission of our NGO is to help Humanity to preserve its access to outer space as a Commons.",
    Website: "https://cosmosforhumanity.eu",
    Twitter: "https://x.com/Cosmos4Humanity",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703069/Cosmos_for_Humanity_a258mm.png",
    Category: "Regeneration",
  },
  {
    "Name of Project": "Crowdmuse",
    "Description of Project": "Crowdmuse is a platform for creative collaboration and funding",
    Website: "https://crowdmuse.com",
    Twitter: "https://x.com/crowdmuse",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703068/Crowdmuse_ecveg3.png",
    Category: "Open Source",
  },
  {
    "Name of Project": "Crypto Commons Association",
    "Description of Project":
      "The CCA brings together builders and academics working on crypto commons, and operates the Crypto Commons Hub in the Austrian Alps as an experimental testbed for emerging technology and a harbor for web 3 projects producing public goods",
    Website: "https://crypto-commons.org",
    Twitter: "https://x.com/crypto4commons",
    "URL to Logo":
      "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703069/Crypto_Commons_Association_s8ohrq.png",
    Category: "Open Source",
  },
  {
    "Name of Project": "Crypto Council for Innovation",
    "Description of Project": "Crypto Council for Innovation advocates for blockchain technology and digital assets",
    Website: "https://www.cryptocouncilforinnovation.org",
    Twitter: "https://twitter.com/CryptoCouncil",
    "URL to Logo":
      "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703078/Crypto_Council_for_Innovation_h4o2ul.png",
    Category: "Open Source",
  },
  {
    "Name of Project": "CyberBox",
    "Description of Project":
      "- ReFi NFT Marketplace that helps people and companies to be carbon neutral - No-code solution for creating dynamic NFTs tied to real data",
    Website: "https://cyberbox.art",
    Twitter: "https://twitter.com/dclimate",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703078/CyberBox_swsjwo.png",
    Category: "Open Source",
  },
  {
    "Name of Project": "CZero",
    "Description of Project":
      "CZero(Carbon Zero) is a carbon neutralization initiative DAO (Decentralized Autonomous Organization) project operated independently by participants with the goal of zero carbon. It is a community-run blockchain-based organization where people who sympathize with the problem consciousness of the climate crisis gather to raise problems, present carbon-neutral initiatives, and act together to solve problems.",
    Website: "https://czero.finance",
    Twitter: "https://x.com/czero",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703078/CZero_am61zz.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "dClimate.net",
    "Description of Project": "The First Decentralized Network for Climate Data",
    Website: "https://dclimate.net",
    Twitter: "https://x.com/dClimateDAO",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703079/dClimate.net_s1igsn.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "DeBi - Decentralised Biodiversity",
    "Description of Project":
      "To create store of value for Forest and Biodiversity through Decentralised Ownership of via blockchain.",
    Website: "https://debi.earth",
    Twitter: "https://x.com/debi_earth",
    "URL to Logo":
      "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703078/DeBi_-_Decentralised_Biodiversity_ewjjju.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Decent Labs",
    "Description of Project":
      "Decent Labs is accelerating the decentralized future, restoring power to individuals, and raising the bar for Web3 development.",
    Website: "https://decentlabs.io",
    Twitter: "https://x.com/decentdao",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703079/Decent_Labs_khq3po.png",
    Category: "Nature",
  },
  {
    "Name of Project": "DecentrAgora",
    "Description of Project":
      "Helping create an open, regenerative and sustainable future through positive-sum infinite cooperative games.",
    Website: "https://decentragora.xyz",
    Twitter: "https://x.com/decentragora",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703080/DecentrAgora_byyjy7.png",
    Category: "Open Source",
  },
  {
    "Name of Project": "DeepVenture",
    "Description of Project":
      "We are building web3 tools/ dApps for Space Scientists to build upon publicly available patents and spin-off in an open and structured way.",
    Website: "https://deepventure.io",
    Twitter: "https://x.com/deepventure",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703080/DeepVenture_dnf2wi.png",
    Category: "Regeneration",
  },
  {
    "Name of Project": "de_plan",
    "Description of Project":
      "1. proto : proto is a location protocol and spatial data api on solana 2. Ostrom : Ostrom is a community based development solution for land regeneration.",
    Website: "https://de-plan.net",
    Twitter: "https://x.com/de_plan",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703079/de_plan_qrsrjp.png",
    Category: "Open Source",
  },
  {
    "Name of Project": "deScier",
    "Description of Project":
      "Solution: A decentralized science ecosystem to integrate and promote synergies, actions and collaborations between people, communities and initiatives, using web3 tools and technologies. Let's make it easier to do science and change the world.",
    Website: "https://descier.com",
    Twitter: null,
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703080/deScier_eylniv.png",
    Category: "Regeneration",
  },
  {
    "Name of Project": "DeTrash",
    "Description of Project":
      "A decentralized recycling and composting incentives protocol, the RECY Network. The network receives and verifies recycling and composting reports. Based on the verified reports new cRECYs are minted and distributed.",
    Website: "https://detrash.io",
    Twitter: "https://x.com/DetrashGlobal",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703081/DeTrash_pzmanq.svg",
    Category: "Open Source",
  },
  {
    "Name of Project": "Diamante Bridge Collective (The DBC)",
    "Description of Project":
      "A Costa Rican Collective Association of individual contributors, local organizations, and global partners working together as an interdependent network of autonomous communities. We meet in the space where public goods and private ownership meet personal responsibility and collective power.",
    Website: "https://diamantebridge.org",
    Twitter: "https://x.com/DiamanteBridge",
    "URL to Logo":
      "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703088/Diamante_Bridge_Collective_The_DBC_kkdnut.png",
    Category: "Regeneration",
  },
  {
    "Name of Project": "Digital MRV",
    "Description of Project":
      "DigitalMRV provides data confidence with IOTAs DLT and ClimateCHECKs 20 years of MRV expertise. Providing data confidence and utility with a shared data ledger that captures project data and protects it during processing, transfer and verification.",
    Website: "https://digitalmrv.io",
    Twitter: "https://x.com/digitalmr",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703088/Digital_MRV_xb6jhb.png",
    Category: "Nature",
  },
  {
    "Name of Project": "disCarbon",
    "Description of Project":
      "We are building transparent and verifiable carbon retirement tools available as public goods in order to drive the adoption of on-chain carbon. Our tools aim to: 1. Onboard crypto natives and create awareness for on-chain carbon within the crypto community. 2. Serve as tangible examples of decentralized applications using on-chain carbon to those working within the traditional carbon market, for example, http://flight.discarbon.earth/. 3. Drive demand for and the irrevocable retirement of on-chain carbon.",
    Website: "https://discarbon.earth",
    Twitter: "https://x.com/discarbon",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703088/disCarbon_yco1ov.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Disruptor DAO",
    "Description of Project":
      "The Disruptor DAO is on a mission to advance efforts that position melanated women and communities as creators, builders, and owners in this space – disrupting the wealth gap. We are an inclusive community of women and allies committed to creating generational wealth through education, advancing Black and Latina women-led projects & businesses, philanthropy, investment in real estate, and practicing collective economics to secure our place in Web3.",
    Website: "https://disruptordao.xyz",
    Twitter: "https://x.com/disruptordao",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703089/Disruptor_DAO_kpchuk.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "diverse earth",
    "Description of Project":
      "A tool / methodology to assess and measure biodiversity gain or loss on land, suggest appropriate indicators (not only MSA), make results report-ready.",
    Website: "https://diverseearth.io",
    Twitter: "https://x.com/diverseearth",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703090/diverse_earth_pjc4ef.jpg",
    Category: "Social Impact",
  },
  {
    "Name of Project": "dMeter",
    "Description of Project":
      "Network building smart contract framework for open, decentralized, distributed, diverse measurement recordation and validation of real world occurrences, particularly re water, carbon cycling, landscape & land use change, biodiversity.",
    Website: "https://d33p.org",
    Twitter: "https://x.com/dMeter4dmrv",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703090/dMeter_hfkxxe.jpg",
    Category: "Nature",
  },
  {
    "Name of Project": "DoinGud",
    "Description of Project":
      "The DoinGud protocol enables the decentralized funding, governance, and validation of an ecosystem of Impact Communities. Specifically, the protocol empowers impact communities to: 1. Organize around common impact and humanitarian purposes (curated by token holders) 2. Bootstrap treasuries from Direct Donations, NFT Sale Proceeds, Capital Yield Pools 3. Transparently disperse funds to impact makers (Impact DAOs, Non-Profits, NGOs, Community Groups) 4. Reward impact reporters (journalists, researchers, etc.) for sharing the stories of impact organizations 5. Leverage curation incentives to efficiently allocate funds to the various impact makers",
    Website: "https://doin.gud",
    Twitter: "https://x.com/doin_gud",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703089/DoinGud_d3hscv.png",
    Category: "Open Source",
  },
  {
    "Name of Project": "dotlabs()",
    "Description of Project": "dotlabs() is a dev blockchain community that share knowledge about blockchain and web3.",
    Website: "https://dotlabs.academy",
    Twitter: "https://x.com/dotlabs",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703089/dotlabs_vifdun.png",
    Category: "Regeneration",
  },
  {
    "Name of Project": "Dottyland",
    "Description of Project":
      "Turning individual climate-positive behaviour and impact as part of functional and serviceable identity, aka the Impact Self.",
    Website: "https://dottyland.xyz",
    Twitter: "https://x.com/dottyland",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703089/Dottyland_odfrhh.png",
    Category: "Open Source",
  },
  {
    "Name of Project": "Draft Ventures",
    "Description of Project":
      "We incubate, advise/accelerate & invest in pre-seed/seed stage companies in web3, climate, fintech, & proptech.",
    Website: "https://draftvc.com",
    Twitter: "https://x.com/draftvc",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703089/Draft_Ventures_z8b9iy.jpg",
    Category: "Regeneration",
  },
  {
    "Name of Project": "Dream Village",
    "Description of Project": "Introducing regenerative agriculture, economies and developmental projects in Ghana",
    Website: "https://dreamvillageghana.org",
    Twitter: "https://x.com/dreamvillage",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703090/Dream_Village_bed6t6.jpg",
    Category: "Regeneration",
  },
  {
    "Name of Project": "Dulang",
    "Description of Project":
      "For most people who do not know how to handle their used electronics properly and want it be done easily, as well as maximize the value that they can get from their e-wastes, Dulang provides a decision support tool (e.g., to fix, fix and sell, sell, donate, swap, and/or recycle) that would direct to and help consumers in the appropriate course of action and show the value to be unlocked.",
    Website: null,
    Twitter: null,
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703090/Dulang_k6mhei.jpg",
    Category: "Regeneration",
  },
  {
    "Name of Project": "Dutch Blockchain Coalition",
    "Description of Project":
      "A triple helix network of government, private sector and research institutes. Our mission is to increase both knowledge and use of blockchain in the Netherlands, thereby speeding up the decentralisation of digital infrastructure. Within the track of energy and sustainability we find the link with the ReFi movement.",
    Website: "https://dutchblockchaincoalition.org",
    Twitter: "https://x.com/Dutchblockchain",
    "URL to Logo":
      "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703091/Dutch_Blockchain_Coalition_nmpwy2.jpg",
    Category: "Social Impact",
  },
  {
    "Name of Project": "Dynastea",
    "Description of Project": "A collaborative network of solutioneers",
    Website: "https://dynastea.io",
    Twitter: null,
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703096/Dynastea_enalwv.jpg",
    Category: "Open Source",
  },
  {
    "Name of Project": "Earthbanc",
    "Description of Project":
      "Earthbanc is a carbon credit issuer both on and off-chain, that delivers audits and ratings of underlying carbon assets, and is venture backed by European Space Agency programs. The platform enables investors to finance carbon removal at scale.",
    Website: "https://earthbanc.io",
    Twitter: "https://x.com/earthbanc",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703100/Earthbanc_iivxgj.png",
    Category: "Regeneration",
  },
  {
    "Name of Project": "Earthfund",
    "Description of Project":
      "A low-fee giving platform, for big ideas that could save the planet, built on the blockchain, governed by our DAO and powered by the 1Earth token.",
    Website: "https://earthfund.io",
    Twitter: "https://x.com/EarthFund_io",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703100/Earthfund_el9eqo.jpg",
    Category: "RWA",
  },
  {
    "Name of Project": "Earthist Network",
    "Description of Project":
      "Education program for farmers (young) to build new farmlands with regenerative practices. Seed bank that holds ancestor seeds. MRV for carbon reduction via hemp plants. Community-owned farmlands.",
    Website: "https://earthist.network",
    Twitter: "https://x.com/earthistdao",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703101/Earthist_Network_erltu4.jpg",
    Category: "Regeneration",
  },
  {
    "Name of Project": "$Earth - Solarpunk Dao",
    "Description of Project":
      "Building a currency backed by real, yield generating, core utility providing climate solutions for the solarpunk paradigm.",
    Website: "https://solarpunkdao.earth",
    Twitter: "https://x.com/solarpunkdao",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703013/Earth_-_Solarpunk_Dao_lg7izx.png",
    Category: "Nature",
  },
  {
    "Name of Project": "EasyCarbon",
    "Description of Project":
      "We provide the on-ramp for small scale sustainable agriculture, carbon farming & reforestation projects to acquire & sell carbon credits. We focus mainly on reforestation & sustainable agriculture projects in Turkey. Using drones & satellite imagery, we ensure the high-quality of projects that we source carbon credits from.",
    Website: "https://easycarbon.io",
    Twitter: "https://x.com/easycarbon",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703103/EasyCarbon_b8lrsr.png",
    Category: "Regeneration",
  },
  {
    "Name of Project": "Eco Labs",
    "Description of Project":
      "We are building an dApp to more easily onboard regenerators into the ecosystems, such as Regen Network, that will value their actions at small scales and provide tooling for human sensing.",
    Website: "https://ecolabs.xyz",
    Twitter: "https://x.com/ecolabs",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703107/Eco_Labs_racczs.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Economic Space Agency",
    "Description of Project":
      "Just like social networking applications gave us social media, economic networking applications will give us ECONOMIC MEDIA. How we relate to each other economically will be remediated by applications (formats, templates, protocols) in the same sense that our social relations already are.",
    Website: "https://economicspace.agency",
    Twitter: null,
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703102/Economic_Space_Agency_ozohpe.png",
    Category: "Regeneration",
  },
  {
    "Name of Project": "ecoPros",
    "Description of Project":
      "A decentralized clean energy financing protocol. A platform open to everyone, connecting investors, clean energy installers and energy users together. Enabling investors to generate a competitive APY on their stablecoins while creating environmental value.",
    Website: "https://ecopros.co",
    Twitter: "https://x.com/ecoPros",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703105/ecoPros_fibw93.png",
    Category: "Regeneration",
  },
  {
    "Name of Project": "EcoSapiens",
    "Description of Project":
      "Web3 ecosystem designed to fix the real one. Introducing the world's first perpetual carbon-capture NFT. Start your evolution on Discord.",
    Website: "https://ecosapiens.xyz",
    Twitter: "https://x.com/ecosapiensxyz",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703105/EcoSapiens_gdz1fn.jpg",
    Category: "Climate Action",
  },
  {
    "Name of Project": "EcoSupply",
    "Description of Project":
      "Our solution is divided in 2: 1. My co founder and I are building a B2B e procurement platform to help corporations meet their sustainability goals by offering them a variety of triple impact products and guidance, so they can switch from a traditional purchasing system to a more sustainable office supplies purchasing system.",
    Website: "https://ecosupply.webflow.io",
    Twitter: null,
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703105/EcoSupply_j1ejwu.jpg",
    Category: "Regeneration",
  },
  {
    "Name of Project": "ecoToken",
    "Description of Project": "Aligning economic incentives with environmental impacts.",
    Website: "https://eco-token.io",
    Twitter: "https://x.com/THEecoToken",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703107/ecoToken_k3ro0l.png",
    Category: "Social Impact",
  },
  {
    "Name of Project": "Ekonavi",
    "Description of Project":
      "Collaborative impact network for sustainable agriculture, environment and bioconstruction. Bringing together, mapping and supporting ecological initiatives throughout Brazil and the World. In the platform, users can present their activities to get rewards and invite the public to participate in ecological action.",
    Website: "https://ekonavi.com",
    Twitter: "https://x.com/ekonavi_com",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703106/Ekonavi_rvv0ry.png",
    Category: "Climate Action",
  },
  {
    "Name of Project": "Endangered Tokens",
    "Description of Project": "Revalue biodiversity by tokenizing endangered species",
    Website: "https://endangeredtokens.org",
    Twitter: "https://x.com/endangeredtokens",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703106/Endangered_Tokens_hm6k5v.jpg",
    Category: "Nature",
  },
  {
    "Name of Project": "EnerDAO",
    "Description of Project":
      "EnerDAO is a revolutionary DeFi platform that focuses exclusively on expediting the global transition to renewable energy. By marrying decentralized finance with the untapped potential of small to medium-sized renewable projects, we democratize investment and break down the barriers at streamlining the green energy funding.",
    Website: "https://enerdao.io",
    Twitter: "https://x.com/enerdao",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703106/EnerDAO_ubfz1q.png",
    Category: "Nature",
  },
  {
    "Name of Project": "Energy Web",
    "Description of Project":
      "The EW-STACK is a suite of open source tools built on top of the Energy Web Chain, the world's first public, enterprise-grade blockchain tailored to the energy sector",
    Website: "https://energyweb.org",
    Twitter: "https://x.com/energywebx",
    "URL to Logo": "https://res.cloudinary.com/db7zzjmcj/image/upload/v1757703125/Energy_Web_emsbpc.png",
    Category: "Climate Action",
  },
]

// Transform Celo Builders projects
const celoBuilderProjectsTransformed = celoBuilderProjects
  .filter((project) => {
    const hasValidName = project.name && project.name.trim().length > 0
    return hasValidName
  })
  .map((project, index) => ({
    id: `celo-builder-${index + 1}`,
    name: project.name,
    description: project.bio || `Building on Celo blockchain - ${project.name}`,
    category: "Celo Builders",
    imageUrl: project.image || `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(project.name)}`,
    website: undefined,
    twitter: undefined,
    discord: undefined,
    linkedin: project.linkedin || undefined,
    farcaster: project.farcaster || undefined,
    github: project.github || undefined,
    fundingGoal: Math.floor(Math.random() * 100000) + 10000,
    fundingCurrent: Math.floor(Math.random() * 50000) + 5000,
    likes: Math.floor(Math.random() * 500) + 10,
    comments: Math.floor(Math.random() * 100) + 1,
    walletAddress: project.wallet,
    isBookmarked: false,
    userHasLiked: false,
    userHasCommented: false,
    reportCount: 0,
    boostAmount: 0,
  }))

// Transform original projects to our Project interface
const originalProjects: Project[] = rawProjects
  .filter((project) => {
    // Filter out projects with generic names or missing data
    const hasValidName =
      project["Name of Project"] &&
      !project["Name of Project"].startsWith("Project ") &&
      project["Name of Project"] !== "NA" &&
      project["Name of Project"].trim().length > 0

    const hasValidDescription =
      project["Description of Project"] &&
      project["Description of Project"] !== "NA" &&
      project["Description of Project"].trim().length > 10

    return hasValidName && hasValidDescription
  })
  .map((project, index) => ({
    id: `project-${index + 1}`,
    name: project["Name of Project"],
    description: project["Description of Project"],
    category: project.Category,
    imageUrl:
      project["URL to Logo"] && project["URL to Logo"] !== "NA"
        ? project["URL to Logo"]
        : `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(project["Name of Project"] + " " + project.Category)}`,
    website: project.Website && project.Website !== "NA" ? project.Website : "NA",
    twitter: project.Twitter && project.Twitter !== "NA" ? project.Twitter : "NA",
    fundingGoal: Math.floor(Math.random() * 100000) + 10000,
    fundingCurrent: Math.floor(Math.random() * 50000) + 5000,
    likes: Math.floor(Math.random() * 500) + 10,
    comments: Math.floor(Math.random() * 100) + 1,
    walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
    isBookmarked: false,
    userHasLiked: false,
    userHasCommented: false,
    reportCount: 0,
    boostAmount: 0,
  }))

// The following code block is from the updates and replaces the previous 'categories' and 'projects' definitions.
// It also adds new data structures for builders, ecoProjects, and karmagapProjects.

const buildersData = [
  {
    Name: "juliomcruz",
    Description:
      "🚀 OnChain Engineer | Developing decentralized solutions that empower communities 🌐 Passionate about onchain innovation and open-source collaboration.",
    GitHub: "https://github.com/JulioMCruz",
    Twitter: "https://www.x.com/JulioMCruz",
    Farcaster: "https://farcaster.xyz/juliomcruz",
    LinkedIn: "https://www.linkedin.com/in/juliomcruz/",
    "Profile Image URL":
      "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/3cef26d3-9f0a-4c12-160a-47082c268d00/original",
    "Wallet Address": "0xc2564e41B7F5Cb66d2d99466450CfebcE9e8228f",
  },
  {
    Name: "Soko",
    Description: "Web3 OS Builder W3GPT.ai",
    GitHub: "https://github.com/Markeljan",
    Twitter: "https://www.x.com/soko_eth",
    Farcaster: "https://farcaster.xyz/soko.eth",
    LinkedIn: "https://www.linkedin.com/in/markeljan",
    "Profile Image URL": "https://i.imgur.com/PNaumro.jpg",
    "Wallet Address": "0x42e9c498135431a48796B5fFe2CBC3d7A1811927",
  },
  {
    Name: "Gabriel Temtsen",
    Description: "Full-stack Developer || Blockchain Developer || Web2 & Web3 developer",
    GitHub: "https://github.com/gabrieltemtsen",
    Twitter: "https://www.x.com/gabe_temtsen",
    Farcaster: "https://farcaster.xyz/gabedev.eth",
    LinkedIn: "https://www.linkedin.com/in/gabriel-temtsen-bb0a8a236",
    "Profile Image URL":
      "https://images.colorino.site/eb2db514e7781d9bd460b81f3bbaae51b951258f5dd2b149a2c2250f707b6946.png",
    "Wallet Address": "0xC5337CeE97fF5B190F26C4A12341dd210f26e17c",
  },
  {
    Name: "limone.eth 🍋",
    Description:
      "building mini-apps /builders-garden /farville /just-frame-it | building a web3 hub in rome /urbe-eth /ethrome 🇮🇹🐺 https://limone.lol",
    GitHub: "https://github.com/limone-eth",
    Twitter: "https://www.x.com/limone_eth",
    Farcaster: "https://farcaster.xyz/limone.eth",
    LinkedIn: "https://www.linkedin.com/in/simone-staffa-8b3b79158",
    "Profile Image URL":
      "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/bb6aa274-8daa-49b1-8d66-00c7c43f1200/original",
    "Wallet Address": "0x1358155a15930f89eBc787a34Eb4ccfd9720bC62",
  },
  {
    Name: "Sambit Sargam Ekalabya",
    Description: "Web3 Builder",
    GitHub: "https://github.com/sambitsargam",
    Twitter: "https://www.x.com/sambitsargam",
    Farcaster: "https://farcaster.xyz/sambitsargam",
    LinkedIn: "https://www.linkedin.com/in/sambitsargam",
    "Profile Image URL":
      "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fa31601f-a263-40b3-2067-517a1b110400/rectcrop3",
    "Wallet Address": "0xADbB2bAe7F0CD584491C35089d8a819108A1276c",
  },
  {
    Name: "Mark Carey 🎩🫂",
    Description:
      "frame developer, web3 developer, long distance runner /pixelnouns /frm /degendogs /degenfers /toka /maxis",
    GitHub: "https://github.com/markcarey",
    Twitter: "https://www.x.com/mthacks",
    Farcaster: "https://farcaster.xyz/markcarey",
    LinkedIn: "https://www.linkedin.com/in/markcareyinternet",
    "Profile Image URL":
      "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/ce812b3c-6930-41e7-b2a1-d70075494500/original",
    "Wallet Address": "0x09A900eB2ff6e9AcA12d4d1a396DdC9bE0307661",
  },
  {
    Name: "ottox.eth",
    Description: "Cryptocat",
    GitHub: "https://github.com/ottodevs",
    Twitter: "https://www.x.com/aerovalencia",
    Farcaster: "https://farcaster.xyz/ottox",
    LinkedIn: "https://www.linkedin.com/in/otto-blockchain",
    "Profile Image URL": "https://i.imgur.com/nm0OfnR.jpg",
    "Wallet Address": "0xB343880DC01517DcfCbb528864d567e3389753E1",
  },
  {
    Name: "thescoho",
    Description: "I like building cool stuff! 🏗️",
    GitHub: "https://github.com/ss251",
    Twitter: "https://www.x.com/0fjake",
    Farcaster: "https://farcaster.xyz/jake",
    LinkedIn: "https://www.linkedin.com/in/sailesh-s-453061141",
    "Profile Image URL":
      "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/60673c14-95bf-423e-37c4-2a221de62700/original",
    "Wallet Address": "0x09928ceBB4c977C5e5Db237a2A2cE5CD10497CB8",
  },
  {
    Name: "leal.eth 🫡",
    Description: "Engineer/Cofounder of @talent",
    GitHub: "https://github.com/0xleal",
    Twitter: "https://www.x.com/0x_leal",
    Farcaster: "https://farcaster.xyz/leal.eth",
    LinkedIn: "https://www.linkedin.com/in/lealfrancisco",
    "Profile Image URL":
      "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/2ea7d438-7e41-4057-1ea0-9346b5a29f00/original",
    "Wallet Address": "0x33041027dd8F4dC82B6e825FB37ADf8f15d44053",
  },
  {
    Name: "geeloko",
    Description: "doing things @3wbclub",
    GitHub: "https://github.com/Tickether",
    Twitter: "https://www.x.com/0xGeeLoko",
    Farcaster: "https://farcaster.xyz/geeloko",
    LinkedIn: "https://www.linkedin.com/in/samuelamoako",
    "Profile Image URL":
      "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/0dbec033-69ba-4f88-0de5-55bdde402a00/rectcrop3",
    "Wallet Address": "0x99342D3CE2d10C34b7d20D960EA75bd742aec468",
  },
]

const ecoProjectsData = [
  {
    "Project Name": 'GainForest XPRIZE Rainforest "Most Impact" Winner Edition ✖️🏆',
    Description:
      'GainForest is co-lead of ETH BioDivX, the XPRIZE Rainforest bonus prize award winner recognized as the "single most impactful approach/technology". GainForest has worked with over 28 communities to bring crucial biodiversity data onchain, distributing $32K in conservation data income to local communities in 2024.',
    Website: "https://gainforest.earth",
    "Image url":
      "https://app.hypercerts.org/_next/image?url=%2Fapi%2Fhypercerts%2F42220-0x16bA53B74c234C870c61EFC04cD418B8f2865959-31305977756726338638630463883722675453952%2Fimage&w=1080&q=75",
    Wallet: "0x16bA53B74c234C870c61EFC04cD418B8f2865959",
  },
  {
    "Project Name": "Bees and Trees: Restoring Land through Agroforestry in Uganda",
    Description:
      "Bees and Trees motivates smallholder farmers in Uganda to restore degraded land through incentives. They gift beehives and coffee seedlings to farmers. So far, 734 trees have been planted and marked on the GainForest Green Globe.",
    Website: "https://beesandtreesug.org",
    "Image url":
      "https://app.hypercerts.org/_next/image?url=%2Fapi%2Fhypercerts%2F42220-0x16bA53B74c234C870c61EFC04cD418B8f2865959-31646260123647277102093838491154443665408%2Fimage&w=1080&q=75",
    Wallet: "0x16bA53B74c234C870c61EFC04cD418B8f2865959",
  },
  {
    "Project Name": "Help Inhã-bé Village Access Clean Water",
    Description:
      "The Inhã-bé village, a close-knit indigenous community, is facing a severe crisis as two consecutive years of extreme drought have left them struggling with limited access to water, food, and essential supplies.",
    Website: "https://www.gofundme.com/f/help-inhaabe-village-access-clean-water",
    "Image url":
      "https://app.hypercerts.org/_next/image?url=%2Fapi%2Fhypercerts%2F42220-0x16bA53B74c234C870c61EFC04cD418B8f2865959-31986542490568215565557213098586211876864%2Fimage&w=1080&q=75",
    Wallet: "0x16bA53B74c234C870c61EFC04cD418B8f2865959",
  },
  {
    "Project Name": "Santa Helena do Ingles Biodiversity Monitoring",
    Description:
      "Santa Helena do Ingles is a community located in the Negro River margins. Since I was born I live here, and the forest educated us. We have learned how to read nature.",
    Website: "https://gainforest.app/305a905ca8add1b2298efa0bd15eade42db038a7084b059b09bef89979517d68/info",
    "Image url":
      "https://app.hypercerts.org/_next/image?url=%2Fapi%2Fhypercerts%2F42220-0x16bA53B74c234C870c61EFC04cD418B8f2865959-32326824857489154029020587706017980088320%2Fimage&w=1080&q=75",
    Wallet: "0x16bA53B74c234C870c61EFC04cD418B8f2865959",
  },
  {
    "Project Name": "Parque das Tribos: Digital capacity building for Indigenous communities",
    Description:
      "The Parque das Tribos is dedicated to preserving Indigenous culture while integrating modern technology. Through workshops on Artificial Intelligence, we are introducing AI to our community.",
    Website: "https://www.instagram.com/parque_das_tribos_oficial",
    "Image url":
      "https://app.hypercerts.org/_next/image?url=%2Fapi%2Fhypercerts%2F42220-0x16bA53B74c234C870c61EFC04cD418B8f2865959-33007389591331030955947336920881516511232%2Fimage&w=1080&q=75",
    Wallet: "0x16bA53B74c234C870c61EFC04cD418B8f2865959",
  },
]

const projectsData = [
  {
    project_name: "3 Wheeler Bike Club",
    Description:
      "3 Wheeler Bike Club is developing a community finance blockchain protocol where retail investors can collectively fund 3-wheelers at wholesale cost to help drivers stuck in an endless rental cycle achieve vehicle ownership.",
    project_url: "https://gap.karmahq.xyz/project/3-wheeler-bike-club",
    project_image:
      "https://images.weserv.nl/?url=https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F191299608%3Fs%3D400%26v%3D4&default=https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F191299608%3Fs%3D400%26v%3D4&l=9&af=&il=&n=-1&w=400&ttl=31557600000",
    twitter: "https://x.com/3wbClub",
    github: "https://github.com/3-Wheeler-Bike-Club",
    farcaster: "https://warpcast.com/3wbclub",
    wallet_address: "0x99342d3ce2d10c34b7d20d960ea75bd742aec468",
    website: "https://3wb.club/",
  },
  {
    project_name: "Ads-Bazaar",
    Description:
      "Ads-Bazaar: Democratizing Influencer Marketing with Web3. The first influencer platform where Nigerian businesses pay in Naira, Kenyan influencers earn in Shillings, and Europeans transact in Euros - all powered by Mento stablecoins.",
    project_url: "https://gap.karmahq.xyz/project/ads-bazaar",
    project_image:
      "https://images.weserv.nl/?url=https%3A%2F%2Fpbs.twimg.com%2Fprofile_images%2F1926742717696008192%2F38qs0dA4_200x200.png&default=https%3A%2F%2Fpbs.twimg.com%2Fprofile_images%2F1926742717696008192%2F38qs0dA4_200x200.png&l=9&af=&il=&n=-1&w=400&ttl=31557600000",
    twitter: "https://x.com/AdsBazaar5",
    github: "https://github.com/JamesVictor-O/ads-Bazaar",
    farcaster: "https://warpcast.com/musaga",
    wallet_address: "0x131ec028bb8bd936a3416635777d905497f3d21f",
    website: "https://www.canva.com/design/DAGuYUhUqw8/cLQhq51hEyj8tNXA-BAPpA/edit",
  },
  {
    project_name: "Bank Of Celo",
    Description:
      "Bank of Celo is a community-powered CELO faucet and vault that lets Celo OGs donate funds and Farcaster users request up to 0.5 CELO for seamless onboarding to the Celo ecosystem.",
    project_url: "https://gap.karmahq.xyz/project/bank-of-celo",
    project_image: "http://bank-of-celo.vercel.app/icon.png",
    twitter: "https://x.com/gabe_temtsen",
    github: "https://github.com/gabrieltemtsen",
    farcaster: "https://warpcast.com/gabedev.eth",
    wallet_address: "0xc5337cee97ff5b190f26c4a12341dd210f26e17c",
    website: "https://docs.google.com/presentation/d/1we-RDNq4gDpnOcotMOyv7agQlCP4iMdp1TZKuvPkVPA/edit",
  },
  {
    project_name: "Buy Hypercerts on Celo",
    Description:
      "Farcaster mini app to allow users buy a fraction of a hypercert on Celo. A hypercert is a 1155 token that represents the impact of projects' work.",
    project_url: "https://gap.karmahq.xyz/project/buy-hypercerts-on-celo",
    project_image: "https://celo-farcaster-frames-chi.vercel.app/hypercert-img-url.png",
    twitter: "https://x.com/rhorheeymarh",
    github: "https://github.com/AbolareRoheemah",
    farcaster: "https://farcaster.xyz/miniapps/Zdh0xnr4_Udh/celo-hypercerts-marketplace",
    wallet_address: "0x21dfd1cfd1d45801f46b0f40aed056b064045aa2",
    website: "https://gamma.app/docs/Hypercerts-Marketplace-Revolutionizing-Impact-Investment-on-Celo-2xa9hap3bnx10l3",
    linkedin: "https://www.linkedin.com/in/abolareroheemah/",
  },
  {
    project_name: "Canvassing",
    Description:
      "Canvassing is a dApp that leverages stablecoins to pay out participants for answering surveys questions.",
    project_url: "https://gap.karmahq.xyz/project/canvassing",
    project_image:
      "https://images.weserv.nl/?url=https%3A%2F%2Fpbs.twimg.com%2Fprofile_images%2F1912519687012794368%2FbLIgn1y6_400x400.jpg&default=https%3A%2F%2Fpbs.twimg.com%2Fprofile_images%2F1912519687012794368%2FbLIgn1y6_400x400.jpg&l=9&af=&il=&n=-1&w=400&ttl=31557600000",
    twitter: "https://x.com/thecanvassing",
    github: "https://github.com/andrewkimjoseph",
    wallet_address: "0x5e20682be95cd9319b0557d905384bb356932116",
    website: "https://thecanvassing.framer.website/",
    linkedin: "https://www.linkedin.com/company/thecanvassing/",
  },
  {
    project_name: "cCOP Wrapper",
    Description:
      "This project is a decentralized application (dApp) that enables users to seamlessly bridge cCOP tokens between the Celo <> Base & Arbitrum blockchains.",
    project_url: "https://gap.karmahq.xyz/project/ccop-wrapper",
    project_image:
      "https://bafybeihaqyxy6vrelryd66eewjggu3tafuv2hfof6cmzzga2qpfmd4gmue.ipfs.w3s.link/Foto%20de%20perfil.png",
    twitter: "https://x.com/tucopfinance",
    github: "https://github.com/TuCopFinance/cCOP-Wrapper",
    wallet_address: "0x22886c71a4c1fa2824bd86210ead1c310b3d7cf5",
  },
  {
    project_name: "ChamaPay",
    Description:
      "ChamaPay is a decentralized circular savings (chama) platform built on the Celo blockchain, designed to digitize and enhance traditional group savings practices widely adopted across African communities.",
    project_url: "https://gap.karmahq.xyz/project/chamapay",
    project_image: "https://ik.imagekit.io/gcfah6uz27/Unknown.jpg",
    twitter: "https://x.com/Chama_pay",
    github: "https://github.com/jeffIshmael/chamapay-minipay",
    farcaster: "https://farcaster.xyz/miniapps/xXpwKJ5lxJHj/chamapay",
    wallet_address: "0x4821ced48fb4456055c86e42587f61c1f39c6315",
    website: "https://chamapay-minipay.vercel.app/",
  },
  {
    project_name: "Dezenmart",
    Description:
      "DezenMart is a decentralized marketplace built on the CELO blockchain, designed to connect African and global artisans directly with buyers.",
    project_url: "https://gap.karmahq.xyz/project/dezenmart",
    project_image: "https://drive.google.com/file/d/1VycAXB59PxEsLN9CTptaomkV_nD1MjOw/view?usp=sharing",
    twitter: "https://x.com/Dezenmart",
    github: "https://github.com/Dezenmart-STORE",
    wallet_address: "0x2298947e6c1d6c282c258b3e5f8989670a8e346f",
    website: "https://dezenmart.netlify.app/product",
    linkedin: "https://www.linkedin.com/company/105698759",
  },
  {
    project_name: "Earnbase",
    Description:
      "EarnBase is a smart contract-powered rewards platform designed to incentivize high-quality participation during Chamapay's beta testing.",
    project_url: "https://gap.karmahq.xyz/project/earnbase",
    project_image: "https://ik.imagekit.io/gcfah6uz27/logo.png?updatedAt=1752053854934",
    github: "https://github.com/jeffIshmael/Earnbase",
    farcaster: "https://farcaster.xyz/miniapps/te_I8X6QteFo/earnbase",
    wallet_address: "0x4821ced48fb4456055c86e42587f61c1f39c6315",
    website: "https://earnbase.vercel.app/",
  },
  {
    project_name: "EduCert - Certificate Verification",
    Description:
      "A decentralized platform for issuing and verifying non-transferable digital certificates on the Celo blockchain.",
    project_url: "https://gap.karmahq.xyz/project/educert---certificate-verification",
    project_image: "https://drive.google.com/file/d/14KWSM_fB_kM57L29xI-YDb_HFbwztAAt/view?usp=sharing",
    twitter: "https://x.com/0xLexa.dev,%20kenzman18",
    github: "https://github.com/Educertfication/Educert-v2",
    wallet_address: "0x62bc8ae3c235ded14ebf9fe8f72e827204c4efe4",
    website: "https://educertv2.netlify.app/",
  },
]

export const categories = ["Builders", "Eco Projects", "Projects"]

const buildersProjects: Project[] = buildersData.map((builder, index) => ({
  id: `builder-${index + 1}`,
  name: builder.Name,
  description: builder.Description,
  category: "Builders",
  imageUrl:
    builder["Profile Image URL"] || `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(builder.Name)}`,
  website: undefined,
  twitter: builder.Twitter || undefined,
  github: builder.GitHub || undefined,
  linkedin: builder.LinkedIn || undefined,
  farcaster: builder.Farcaster || undefined,
  fundingGoal: Math.floor(Math.random() * 100000) + 10000,
  fundingCurrent: Math.floor(Math.random() * 50000) + 5000,
  likes: Math.floor(Math.random() * 500) + 10,
  comments: Math.floor(Math.random() * 100) + 1,
  walletAddress: builder["Wallet Address"],
  isBookmarked: false,
  userHasLiked: false,
  userHasCommented: false,
  reportCount: 0,
  boostAmount: 0,
}))

const ecoProjects: Project[] = ecoProjectsData.map((eco, index) => ({
  id: `eco-${index + 1}`,
  name: eco["Project Name"],
  description: eco.Description,
  category: "Eco Projects",
  imageUrl:
    eco["Image url"] || `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(eco["Project Name"])}`,
  website: eco.Website || undefined,
  twitter: undefined,
  github: undefined,
  linkedin: undefined,
  farcaster: undefined,
  fundingGoal: Math.floor(Math.random() * 100000) + 10000,
  fundingCurrent: Math.floor(Math.random() * 50000) + 5000,
  likes: Math.floor(Math.random() * 500) + 10,
  comments: Math.floor(Math.random() * 100) + 1,
  walletAddress: eco.Wallet,
  isBookmarked: false,
  userHasLiked: false,
  userHasCommented: false,
  reportCount: 0,
  boostAmount: 0,
}))

const karmagapProjects: Project[] = projectsData.map((project, index) => ({
  id: `project-${index + 1}`,
  name: project.project_name,
  description: project.Description,
  category: "Projects",
  imageUrl:
    project.project_image || `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(project.project_name)}`,
  website: project.website || project.project_url || undefined,
  twitter: project.twitter || undefined,
  github: project.github || undefined,
  linkedin: project.linkedin || undefined,
  farcaster: project.farcaster || undefined,
  fundingGoal: Math.floor(Math.random() * 100000) + 10000,
  fundingCurrent: Math.floor(Math.random() * 50000) + 5000,
  likes: Math.floor(Math.random() * 500) + 10,
  comments: Math.floor(Math.random() * 100) + 1,
  walletAddress: project.wallet_address,
  isBookmarked: false,
  userHasLiked: false,
  userHasCommented: false,
  reportCount: 0,
  boostAmount: 0,
}))

export const projects: Project[] = [...buildersProjects, ...ecoProjects, ...karmagapProjects]
