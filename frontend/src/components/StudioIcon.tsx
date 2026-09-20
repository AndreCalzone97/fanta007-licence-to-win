export type StudioIconName = "home" | "squad" | "search" | "analysis" | "settings" | "star" | "compare";
const paths: Record<StudioIconName, string> = {
  home: "M3 10 12 3l9 7v10H15v-7H9v7H3Z",
  squad: "M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3M16 4a4 4 0 0 1 0 8M22 21v-3a4 4 0 0 0-3-3.87M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  search: "m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
  analysis: "M4 20V10M12 20V4M20 20v-7",
  settings: "M4 7h16M4 17h16M8 4v6M16 14v6",
  star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9Z",
  compare: "M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4",
};
export function StudioIcon({ name }: { name: StudioIconName }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
