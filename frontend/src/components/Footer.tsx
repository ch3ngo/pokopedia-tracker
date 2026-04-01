import { Github, Linkedin, Twitter } from "lucide-react";

const LINKS = [
  {
    href: "https://github.com/ch3ngo",
    label: "GitHub",
    Icon: Github,
  },
  {
    href: "https://www.linkedin.com/in/diego-fidalgo/",
    label: "LinkedIn",
    Icon: Linkedin,
  },
  {
    href: "https://x.com/0x_ch3ngo",
    label: "Twitter / X",
    Icon: Twitter,
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-auto py-4 px-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-center gap-5">
      {LINKS.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <Icon className="w-4 h-4" />
        </a>
      ))}
    </footer>
  );
}
