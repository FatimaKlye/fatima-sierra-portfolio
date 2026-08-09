const SIMPLE_ICONS_BASE = "https://cdn.jsdelivr.net/npm/simple-icons@15/icons";

export type SocialLink = {
  id: "github" | "linkedin" | "facebook" | "instagram" | "email";
  label: string;
  handle: string;
  href: string;
  icon: string;
};

export const SOCIAL_LINKS: SocialLink[] = [
  {
    id: "github",
    label: "GitHub",
    handle: "@FatimaKlye",
    href: "https://github.com/FatimaKlye",
    icon: `${SIMPLE_ICONS_BASE}/github.svg`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    handle: "Fatima Klye Sierra",
    href: "https://www.linkedin.com/in/fatima-klye-sierra-902060288/",
    icon: `${SIMPLE_ICONS_BASE}/linkedin.svg`,
  },
  {
    id: "facebook",
    label: "Facebook",
    handle: "@klye.sie",
    href: "https://www.facebook.com/klye.sie/",
    icon: `${SIMPLE_ICONS_BASE}/facebook.svg`,
  },
  {
    id: "instagram",
    label: "Instagram",
    handle: "@xo.klye",
    href: "https://www.instagram.com/xo.klye/",
    icon: `${SIMPLE_ICONS_BASE}/instagram.svg`,
  },
  {
    id: "email",
    label: "Email",
    handle: "fatimaklyesierra081005@gmail.com",
    href: "https://mail.google.com/mail/?view=cm&fs=1&to=fatimaklyesierra081005@gmail.com",
    icon: `${SIMPLE_ICONS_BASE}/gmail.svg`,
  },
];
