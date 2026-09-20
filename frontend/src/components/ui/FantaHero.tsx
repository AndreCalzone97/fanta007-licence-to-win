import { ReunoHero } from "./ReunoHero";

export function FantaHero(props: { onStart: () => void; resume?: boolean }) {
  return <ReunoHero {...props} />;
}
