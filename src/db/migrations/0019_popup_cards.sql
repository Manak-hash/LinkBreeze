-- 0019: Popup card types (#93) — text + location.
-- links.popup_text holds the long body shown inside the dialog (rendered
-- with a safe markdown subset). links.cta_label is the optional CTA button
-- label; the CTA target URL lives in the existing links.url column so it
-- rides the existing /go/:id click-tracking redirect untouched.
--   type = 'text'     → popup with body + optional CTA (url may be empty
--                        string when no CTA is set)
--   type = 'location' → popup with an embedded Google map + optional body +
--                        directions CTA (url = resolved maps search URL)
-- analytics_clicks.event_type separates popup opens from real outbound
-- clicks so CTR widgets never count opens. Legacy rows default to 'click'.

ALTER TABLE "links" ADD "popup_text" text;
--> statement-breakpoint
ALTER TABLE "links" ADD "cta_label" text;
--> statement-breakpoint
ALTER TABLE "analytics_clicks" ADD "event_type" text DEFAULT 'click' NOT NULL;
