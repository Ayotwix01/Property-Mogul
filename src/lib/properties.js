tone: "success" | "primary" };
 label };

  title;
  location;
  address;
  price;
  priceUnit;
  category;
  tags[];
  specs[];
  beds;
  baths;
  sqft;
  yearBuilt;
  totalUnits;
  petFriendly;
  certification;
  description;
  images[];
  owner: {
    name;
    title;
    phone;
    email;
  };
};

export const properties[] = [
  {
    id: "azure-heights-loft",
    title: "Azure Heights Loft",
    location: "Lekki Phase 1, Lagos",
    address: "22 Admiralty Way, Lekki Phase 1, Lagos",
    price: "₦2,450,000",
    priceUnit: "per year",
    category: "RESIDENTIAL",
    tags: [{ label: "FOR SALE", tone: "success" }],
    specs: [
      { icon: "bed", label: "3 Beds" },
      { icon: "bathtub", label: "2 Baths" },
      { icon: "square_foot", label: "1,240 sqft" },
    ],
    beds: 3,
    baths: 2,
    sqft: 1240,
    yearBuilt: 2022,
    totalUnits: 48,
    petFriendly: "YES",
    certification: "LEED GOLD",
    description:
      "Azure Heights Loft blends contemporary design with tranquil oceanfront living. Floor-to-ceiling windows, hand-finished oak flooring, and smart-home integration throughout. Residents enjoy a private rooftop pool, concierge service, and 24/7 security.",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCQYPCz6xWrHX9ciBSlfP3UpdxhXHAOQFabN1kFNMz9qVhUJyGmXPnAITgajti2cX20IoZwrUIUch5oZYYINHd3q97zxYu-kzmlvpGpoq9nTVn--H9Rz44VUx9t_V0Bpf0_kgcIu4O4l_vcZ4qJ0Fltop8Ry6clCrQTHu-u25k7QyhMprARpd1NoMJU-ocpHJ0alxhSNyXmjzytVdX4F942i0hvpzUB6Gf6oDjtOx614nfI48x0Kgs6MOaekwlKRhQcR3jsV13gDWgn",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAHBRBO_g0D9u00YU97_23OJCyNcbzrU55T8KutxfO4_xrpNOxmkl8-GC_rPxPlBsSCRkyUFX-XQ5EnTlv4hbnlttBLvj2If4w7BwodTIheV_LOE-ejp96di1znnPMAzzidp2d27spPuQMyp-AAYRl8TsqKw75MOt5nJh5jrz_qs9KF06JX7N0asgc6K3QnoJ5vHGFpNjJ-WU1jm2TwA8KYq7vdOtDH_rlZTerVxokaAp_TWFQ5WpHRLhqcBg6vjdDVjjM_2-uOhcPT",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDhiUbu1oBa7XpGDfal8ULoLTt3ufy2LNixKcOxD4wLsL97hxoLIg134vOj9fULBNNgKXVMgr0W80Qj-yBjoFEZ0_gnky9J2C3a-lYYAsGwMnRXI7FlAFpOZzVT8cQHtfIJ52zvl5MtT97vazTyPno-ZBc33D-exh0Vrrg4Xd4W1_EWb-IDJMJP0jwRsGMtvapgh2pIV46Aq5GzC2rEEfM96EtHTlfEG-eaDK6M-X0CJt3XvAf5Ghzs99lw_pegPJmkqsuZdEDDYvRr",
    ],
    owner: {
      name: "Sarah Jenkins",
      title: "Property Owner",
      phone: "+234 802 555 4210",
      email: "s.jenkins@propertymogul.com",
    },
  },
  {
    id: "neohub-logistics",
    title: "NeoHub Logistics",
    location: "Maitama, Abuja",
    address: "Plot 7 Aguiyi Ironsi St, Maitama, Abuja",
    price: "₦8,900,000",
    priceUnit: "per year",
    category: "INDUSTRIAL",
    tags: [{ label: "TRENDING", tone: "primary" }],
    specs: [
      { icon: "precision_manufacturing", label: "Warehouse" },
      { icon: "square_foot", label: "24,500 sqft" },
    ],
    beds: 0,
    baths: 4,
    sqft: 24500,
    yearBuilt: 2019,
    totalUnits: 1,
    petFriendly: "NO",
    certification: "ISO 9001",
    description:
      "NeoHub Logistics is a purpose-built distribution hub with 12m clear ceilings, six loading docks, and dedicated fibre. Ideal for e-commerce fulfilment, third-party logistics, and cold-chain operations.",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDVayHjKLS7Wn1YIJKWZRX-xv4Hid-9eJ_v5HaQCQ1eO2az7TcMCfZS4fuwF4YT5QY-3m9sAYSxVKEfR_UtUU5vm6tNUfBYeoB_u8d53Ng_dhGM3xAcPwxGyF9ybzzfH0zPKTSKLURxhZtHrjYzPXrmBXyhCmlAASeofac3qPi_X6TH8BQrvhrRJELRH7t3AVLKSMNomTH9NV8z2Mm1dkNO-Is5LW0_LoXgWZZYsOUDb7yESYuoHD5Sg_QKfwtI2VGQTYP2N7wM58op",
      "https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&q=80",
      "https://images.unsplash.com/photo-1580982327559-c1202864eb05?w=1200&q=80",
    ],
    owner: {
      name: "Michael Adeyemi",
      title: "Commercial Broker",
      phone: "+234 803 118 9922",
      email: "m.adeyemi@propertymogul.com",
    },
  },
  {
    id: "crystal-plaza-hub",
    title: "Crystal Plaza Hub",
    location: "Wuse 2, Abuja",
    address: "14 Aminu Kano Crescent, Wuse 2, Abuja",
    price: "₦15,500,000",
    priceUnit: "per year",
    category: "COMMERCIAL",
    tags: [{ label: "NEW", tone: "success" }],
    specs: [
      { icon: "corporate_fare", label: "Office Suite" },
      { icon: "square_foot", label: "45,000 sqft" },
    ],
    beds: 0,
    baths: 8,
    sqft: 45000,
    yearBuilt: 2024,
    totalUnits: 22,
    petFriendly: "NO",
    certification: "LEED PLATINUM",
    description:
      "Crystal Plaza Hub is Abuja's newest Grade-A office tower featuring biometric access, on-site cafés, private meeting suites, and rooftop event space. Configurable floors from 500 to 8,000 sqft.",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDqe5cHql3GNEH4qpKgzF5Hwx-xpHhvVuAHvPI9--vgDJe9DD7wfudxW6BL5L9aBDWUFz9lx--aCf6HObQiBiDygJVqushzbJFKnqtqdWdFOOIp521iXq5BtDl8gkt4h58JksCX2qCj7J2nOQkV4-LUfaEh-KRAiDQOHLamu3TQYhDMWm3Z3bolgJpUY7eYmhZm8FQph1JQoznl69kYj3EifZNfsQtfccQa4Sgldzkfhx-CZ-8C4T2VA1xZ8-E460nBAmozl795mzT8",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80",
    ],
    owner: {
      name: "Ada Okonkwo",
      title: "Leasing Director",
      phone: "+234 809 402 7715",
      email: "a.okonkwo@propertymogul.com",
    },
  },
  {
    id: "skyline-heights",
    title: "Skyline Heights",
    location: "Victoria Island, Lagos",
    address: "452 Metropolis Avenue, Victoria Island, Lagos",
    price: "₦4,500,000",
    priceUnit: "per year",
    category: "LUXURY RENTAL",
    tags: [
      { label: "AVAILABLE", tone: "success" },
      { label: "LUXURY", tone: "primary" },
    ],
    specs: [
      { icon: "bed", label: "2-4 Beds" },
      { icon: "bathtub", label: "2-3 Baths" },
      { icon: "square_foot", label: "1,800 sqft" },
    ],
    beds: 4,
    baths: 3,
    sqft: 1800,
    yearBuilt: 2023,
    totalUnits: 124,
    petFriendly: "YES",
    certification: "LEED PLATINUM",
    description:
      "Skyline Heights represents the pinnacle of modern urban lifestyle. This 42-story architectural marvel features state-of-the-art sustainable systems, private rooftop gardens, and world-class amenities. Residents enjoy panoramic city views and integrated smart-home features.",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDp302OXPzynoNW0Af6WXlou4es8_Qkncby5I88pRWx4Mqpru1H_5Y2UO3Fg_TW6GbESqJhQIqpzNAoW9F5AgfEn8YZpzJrfE8CzH2PFW1XnKMpgYGi9zH83i4pgd6s6YW5NN-utfuodgC3EhWVzB5_zDkZmU_M_Ht5VPJOl7XxdWszRYeYCxOBCwZjC5pSQrQivnIcGC5tA_gFn1n5ccizJDXPXfzVuI4uh-j-xP3L2hYos_CzjyTifVhJBF2iWbXVZrUYP4xPBRFV",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAHBRBO_g0D9u00YU97_23OJCyNcbzrU55T8KutxfO4_xrpNOxmkl8-GC_rPxPlBsSCRkyUFX-XQ5EnTlv4hbnlttBLvj2If4w7BwodTIheV_LOE-ejp96di1znnPMAzzidp2d27spPuQMyp-AAYRl8TsqKw75MOt5nJh5jrz_qs9KF06JX7N0asgc6K3QnoJ5vHGFpNjJ-WU1jm2TwA8KYq7vdOtDH_rlZTerVxokaAp_TWFQ5WpHRLhqcBg6vjdDVjjM_2-uOhcPT",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDhiUbu1oBa7XpGDfal8ULoLTt3ufy2LNixKcOxD4wLsL97hxoLIg134vOj9fULBNNgKXVMgr0W80Qj-yBjoFEZ0_gnky9J2C3a-lYYAsGwMnRXI7FlAFpOZzVT8cQHtfIJ52zvl5MtT97vazTyPno-ZBc33D-exh0Vrrg4Xd4W1_EWb-IDJMJP0jwRsGMtvapgh2pIV46Aq5GzC2rEEfM96EtHTlfEG-eaDK6M-X0CJt3XvAf5Ghzs99lw_pegPJmkqsuZdEDDYvRr",
    ],
    owner: {
      name: "Sarah Jenkins",
      title: "Property Owner",
      phone: "+234 802 555 4210",
      email: "s.jenkins@propertymogul.com",
    },
  },
  {
    id: "harbor-view-villa",
    title: "Harbor View Villa",
    location: "Ikoyi, Lagos",
    address: "9 Bourdillon Road, Ikoyi, Lagos",
    price: "₦12,750,000",
    priceUnit: "per year",
    category: "RESIDENTIAL",
    tags: [{ label: "FEATURED", tone: "primary" }],
    specs: [
      { icon: "bed", label: "5 Beds" },
      { icon: "bathtub", label: "6 Baths" },
      { icon: "square_foot", label: "6,400 sqft" },
    ],
    beds: 5,
    baths: 6,
    sqft: 6400,
    yearBuilt: 2021,
    totalUnits: 1,
    petFriendly: "YES",
    certification: "GREEN STAR",
    description:
      "Harbor View Villa is a private waterfront estate with infinity pool, home cinema, and dedicated staff quarters. Panoramic views of the Lagos lagoon from every principal room.",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=80",
    ],
    owner: {
      name: "Tunde Balogun",
      title: "Private Estate Agent",
      phone: "+234 812 700 3388",
      email: "t.balogun@propertymogul.com",
    },
  },
  {
    id: "verdant-court-townhomes",
    title: "Verdant Court Townhomes",
    location: "Gwarinpa, Abuja",
    address: "3rd Avenue, Gwarinpa Estate, Abuja",
    price: "₦1,850,000",
    priceUnit: "per year",
    category: "RESIDENTIAL",
    tags: [{ label: "FOR RENT", tone: "success" }],
    specs: [
      { icon: "bed", label: "4 Beds" },
      { icon: "bathtub", label: "3 Baths" },
      { icon: "square_foot", label: "2,150 sqft" },
    ],
    beds: 4,
    baths: 3,
    sqft: 2150,
    yearBuilt: 2020,
    totalUnits: 18,
    petFriendly: "YES",
    certification: "EDGE CERTIFIED",
    description:
      "Verdant Court is a family-friendly gated community with a shared park, playground, and on-site fitness centre. Solar-ready roofing and rainwater harvesting throughout.",
    images: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80",
    ],
    owner: {
      name: "Ngozi Ibeh",
      title: "Community Manager",
      phone: "+234 806 921 4400",
      email: "n.ibeh@propertymogul.com",
    },
  },
  {
    id: "prism-tower-penthouse",
    title: "Prism Tower Penthouse",
    location: "Eko Atlantic, Lagos",
    address: "Tower 3, Eko Atlantic City, Lagos",
    price: "₦28,000,000",
    priceUnit: "per year",
    category: "LUXURY RENTAL",
    tags: [
      { label: "EXCLUSIVE", tone: "primary" },
      { label: "NEW", tone: "success" },
    ],
    specs: [
      { icon: "bed", label: "4 Beds" },
      { icon: "bathtub", label: "5 Baths" },
      { icon: "square_foot", label: "5,800 sqft" },
    ],
    beds: 4,
    baths: 5,
    sqft: 5800,
    yearBuilt: 2025,
    totalUnits: 1,
    petFriendly: "YES",
    certification: "LEED PLATINUM",
    description:
      "The Prism Tower Penthouse crowns Eko Atlantic's tallest residential tower. Double-height living room, private elevator lobby, wraparound terrace with plunge pool, and 360° ocean and skyline views.",
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fe6ba68?w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1200&q=80",
    ],
    owner: {
      name: "Chinelo Umeh",
      title: "Luxury Portfolio Lead",
      phone: "+234 815 020 7788",
      email: "c.umeh@propertymogul.com",
    },
  },
];

// Additional generated listings so pagination has multiple pages
const extraSeed = [
  { id: "coastal-breeze-suites", title: "Coastal Breeze Suites", location: "Banana Island, Lagos", address: "12 Ocean Parade, Banana Island, Lagos", price: "₦6,200,000", category: "RESIDENTIAL", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80" },
  { id: "emerald-court-flats", title: "Emerald Court Flats", location: "Yaba, Lagos", address: "5 Herbert Macaulay Way, Yaba, Lagos", price: "₦1,150,000", category: "RESIDENTIAL", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80" },
  { id: "obsidian-office-park", title: "Obsidian Office Park", location: "Ikeja GRA, Lagos", address: "Plot 14 Isaac John St, Ikeja GRA, Lagos", price: "₦9,800,000", category: "COMMERCIAL", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80" },
  { id: "terracotta-townhouse", title: "Terracotta Townhouse", location: "Asokoro, Abuja", address: "18 Yakubu Gowon Cres, Asokoro, Abuja", price: "₦3,400,000", category: "RESIDENTIAL", image: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1200&q=80" },
  { id: "sable-ridge-estate", title: "Sable Ridge Estate", location: "Katampe, Abuja", address: "22 Katampe Extension, Abuja", price: "₦5,750,000", category: "RESIDENTIAL", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80" },
  { id: "aurora-retail-mall", title: "Aurora Retail Mall", location: "Surulere, Lagos", address: "88 Bode Thomas St, Surulere, Lagos", price: "₦22,000,000", category: "COMMERCIAL", image: "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=1200&q=80" },
  { id: "moonstone-duplex", title: "Moonstone Duplex", location: "Magodo, Lagos", address: "7 CMD Road, Magodo Phase 2, Lagos", price: "₦2,900,000", category: "RESIDENTIAL", image: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200&q=80" },
  { id: "citrine-studio-lofts", title: "Citrine Studio Lofts", location: "Wuse 2, Abuja", address: "9 Aminu Kano Cres, Wuse 2, Abuja", price: "₦980,000", category: "RESIDENTIAL", image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80" },
  { id: "titan-industrial-yard", title: "Titan Industrial Yard", location: "Apapa, Lagos", address: "Wharf Road, Apapa, Lagos", price: "₦11,500,000", category: "INDUSTRIAL", image: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=1200&q=80" },
  { id: "ivory-court-apartments", title: "Ivory Court Apartments", location: "Ajah, Lagos", address: "Km 22 Lekki-Epe Expressway, Ajah, Lagos", price: "₦1,420,000", category: "RESIDENTIAL", image: "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80" },
  { id: "granite-corporate-tower", title: "Granite Corporate Tower", location: "Marina, Lagos", address: "40 Marina Rd, Lagos Island, Lagos", price: "₦18,500,000", category: "COMMERCIAL", image: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=1200&q=80" },
  { id: "opal-garden-villas", title: "Opal Garden Villas", location: "Life Camp, Abuja", address: "Plot 33 Life Camp District, Abuja", price: "₦3,850,000", category: "RESIDENTIAL", image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=80" },
  { id: "cobalt-warehouse-park", title: "Cobalt Warehouse Park", location: "Ogba, Lagos", address: "Acme Rd, Ogba Industrial Estate, Lagos", price: "₦7,650,000", category: "INDUSTRIAL", image: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1200&q=80" },
  { id: "jasper-heights-flats", title: "Jasper Heights Flats", location: "Ikate, Lekki", address: "Ikate Elegushi, Lekki, Lagos", price: "₦2,180,000", category: "RESIDENTIAL", image: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80" },
  { id: "solstice-hotel-residence", title: "Solstice Hotel Residence", location: "Central Business District, Abuja", address: "CBD, Abuja", price: "₦14,900,000", category: "LUXURY RENTAL", image: "https://images.unsplash.com/photo-1519449556851-5720b33024e7?w=1200&q=80" },
  { id: "coral-bay-bungalow", title: "Coral Bay Bungalow", location: "Sangotedo, Lagos", address: "Monastery Rd, Sangotedo, Lagos", price: "₦1,650,000", category: "RESIDENTIAL", image: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=1200&q=80" },
  { id: "meridian-medical-plaza", title: "Meridian Medical Plaza", location: "Garki, Abuja", address: "Area 11, Garki, Abuja", price: "₦10,250,000", category: "COMMERCIAL", image: "https://images.unsplash.com/photo-1587351021355-a479a299d2f9?w=1200&q=80" },
  { id: "zenith-riverside-flats", title: "Zenith Riverside Flats", location: "Oniru, Lagos", address: "4 Ligali Ayorinde St, Oniru, Lagos", price: "₦3,120,000", category: "RESIDENTIAL", image: "https://images.unsplash.com/photo-1613977257592-4a9a32f9141b?w=1200&q=80" },
  { id: "silverline-office-suites", title: "Silverline Office Suites", location: "Utako, Abuja", address: "Plot 8 Ekukinam St, Utako, Abuja", price: "₦8,400,000", category: "COMMERCIAL", image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=1200&q=80" },
  { id: "amber-lake-cottage", title: "Amber Lake Cottage", location: "Epe, Lagos", address: "Lakowe-Ajah Rd, Epe, Lagos", price: "₦2,050,000", category: "RESIDENTIAL", image: "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?w=1200&q=80" },
];

const extraProperties[] = extraSeed.map((s, i) => {
  const beds = 2 + (i % 4);
  const baths = 1 + (i % 3);
  const sqft = 900 + i * 220;
  return {
    id: s.id,
    title: s.title,
    location: s.location,
    address: s.address,
    price: s.price,
    priceUnit: "per year",
    category: s.category,
    tags: [{ label: i % 3 === 0 ? "NEW" : i % 3 === 1 ? "FOR RENT" : "FEATURED", tone: (i % 2 === 0 ? "success" : "primary")"success" | "primary" }],
    specs: s.category === "INDUSTRIAL" || s.category === "COMMERCIAL"
      ? [
          { icon: "corporate_fare", label: s.category === "INDUSTRIAL" ? "Warehouse" : "Office Suite" },
          { icon: "square_foot", label: `${sqft.toLocaleString()} sqft` },
        ]
      : [
          { icon: "bed", label: `${beds} Beds` },
          { icon: "bathtub", label: `${baths} Baths` },
          { icon: "square_foot", label: `${sqft.toLocaleString()} sqft` },
        ],
    beds,
    baths,
    sqft,
    yearBuilt: 2018 + (i % 7),
    totalUnits: 1 + (i % 40),
    petFriendly: i % 2 === 0 ? "YES" : "NO",
    certification: ["LEED GOLD", "EDGE CERTIFIED", "GREEN STAR", "LEED PLATINUM"][i % 4],
    description: `${s.title} offers a curated blend of modern design and location convenience in ${s.location}. Thoughtful finishes, secure access, and on-site management make it an ideal choice for discerning residents and investors.`,
    images: [s.image, s.image, s.image],
    owner: {
      name: ["Amaka Obi", "David Uche", "Fatima Bello", "Kunle Ade", "Ruth Eze"][i % 5],
      title: "Property Owner",
      phone: "+234 800 000 0000",
      email: `owner+${s.id}@propertymogul.com`,
    },
  };
});

properties.push(...extraProperties);

export function getProperty(id) | undefined {
  return properties.find((p) => p.id === id);
}