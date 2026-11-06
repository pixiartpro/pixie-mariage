// L'appli du mariage côté invités : plein écran, sans le menu du salon.
export const metadata = {
  robots: { index: false, follow: false },
};

export const viewport = {
  themeColor: "#2B2421",
  viewportFit: "cover",
};

export default function AppliLayout({ children }) {
  return <main className="appli-fond">{children}</main>;
}
