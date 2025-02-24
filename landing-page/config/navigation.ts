export const ROUTES = {
  HOME: "/",
  ARTIST_TYPES: "/artist-types",
  ABOUT: "/about",
  SHOP: "/shop",
  CONTACT: "/contact",
} as const;

export const navItems = [
  { name: "Home", link: ROUTES.HOME },
  { name: "Artist Types", link: ROUTES.ARTIST_TYPES },
  { name: "About", link: ROUTES.ABOUT },
  { name: "Shop", link: ROUTES.SHOP },
  { name: "Contact", link: ROUTES.CONTACT },
];