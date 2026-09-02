export const guides = [
  {
    slug: "verify-a-property-before-paying",
    category: "Safety",
    title: "How to verify a property before paying",
    summary:
      "A practical checklist for confirming a listing, the person offering it, and the next safe step.",
    readingTime: "5 min read",
    content: [
      "Visit the property in person or use a trusted representative. Compare the address, photos, facilities, and condition with the listing.",
      "Ask who owns or manages the property and request supporting documents. Property Mogul verification is a trust signal, not a substitute for your own checks or professional advice.",
      "Do not pay a landlord, agent, or intermediary because of pressure, urgency, or a promise that someone else is waiting. Confirm the recipient and purpose of every payment.",
      "Paid contact access only unlocks contact information. It does not buy or reserve a property and does not guarantee a successful rental or sale.",
    ],
  },
  {
    slug: "common-property-scams",
    category: "Safety",
    title: "Common rental and property scams",
    summary: "Recognise pressure tactics and suspicious requests before they cost you money.",
    readingTime: "4 min read",
    content: [
      "Be cautious when a listing is far below comparable prices, the owner refuses a viewing, or you are asked to pay immediately to ‘secure’ a place.",
      "Keep conversations and payment records. Never share passwords, verification codes, or unnecessary identity documents through chat.",
      "Report suspicious listings or users through the available reporting tools and stop communicating if you feel threatened or pressured.",
    ],
  },
  {
    slug: "questions-to-ask-a-landlord",
    category: "Viewings",
    title: "What to ask a landlord",
    summary: "Questions that help you understand the property, costs, rules, and process.",
    readingTime: "4 min read",
    content: [
      "Ask what is included in the rent, which service charges apply, the tenancy length, renewal expectations, and notice arrangements.",
      "Ask about water, power, access, security, repairs, parking, and any restrictions that matter to your household.",
      "Request written terms before paying and consider independent professional advice for important transactions.",
    ],
  },
  {
    slug: "viewing-a-property-safely",
    category: "Viewings",
    title: "Viewing a property safely",
    summary: "Plan viewings in a way that protects your time, information, and personal safety.",
    readingTime: "3 min read",
    content: [
      "Tell someone where you are going, use daylight hours where possible, and meet at the property or another verifiable location.",
      "Inspect the surroundings as well as the rooms. Check access, noise, drainage, utilities, and the condition of fixtures.",
      "Do not hand over cash or original documents during a viewing. Leave if the situation feels unsafe.",
    ],
  },
];

export function getGuide(slug) {
  return guides.find((guide) => guide.slug === slug);
}
