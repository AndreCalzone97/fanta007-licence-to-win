import { StrictMode, lazy, Suspense } from "react";
import { MotionConfig } from "motion/react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import "./styles/foundation.css";
import "./styles/agent.css";
import "./styles/v2.css";
import "./styles/refinement.css";
import "./styles/studio.css";
import "./styles/club.css";
import "./styles/operations.css";
import "./styles/reference-components.css";

const Feedback = import.meta.env.DEV ? lazy(() => import("./components/DevelopmentFeedback")) : null;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user"><App /></MotionConfig>
    {Feedback && <Suspense fallback={null}><Feedback /></Suspense>}
  </StrictMode>,
);
