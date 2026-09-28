import { StrictMode, lazy, Suspense } from "react";
import { MotionConfig } from "motion/react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "@fontsource-variable/sora/index.css";
import "./styles.css";
import "./styles/foundation.css";
import "./styles/agent.css";
import "./styles/v2.css";
import "./styles/refinement.css";
import "./styles/studio.css";
import "./styles/club.css";
import "./styles/operations.css";
import "./styles/identity-v21.css";
import "./styles/squad-v21.css";
import "./styles/listone-v21.css";
import "./styles/reference-components.css";
import "./styles/onboarding.css";
import "./styles/dossier-v21.css";
import "./styles/team-crest.css";
import "./styles/action-toast.css";
import "./styles/cursor.css";
import "./styles/glass-system.css";

const Feedback = import.meta.env.DEV ? lazy(() => import("./components/DevelopmentFeedback")) : null;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user"><App /></MotionConfig>
    {Feedback && <Suspense fallback={null}><Feedback /></Suspense>}
  </StrictMode>,
);
