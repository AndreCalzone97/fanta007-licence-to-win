import { useEffect, useState } from "react";
import { Agentation } from "agentation";

export default function DevelopmentFeedback() {
  const [desktop, setDesktop] = useState(() => window.matchMedia("(min-width: 900px)").matches);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 900px)");
    const update = () => setDesktop(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return desktop ? <Agentation /> : null;
}
