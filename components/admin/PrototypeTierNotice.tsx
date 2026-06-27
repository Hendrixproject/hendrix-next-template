/**
 * Prototype-tier notices (issue #10).
 *
 * Dynamically-created models are the *prototyping* tier: stored as JSON,
 * filtered/sorted in memory, no per-field DB indexes — great to ~thousands of
 * records, not for large-scale production. These components surface that
 * boundary at the point of use, framed as guidance (not a defect), and point at
 * the "Promote to production" flow.
 */

/** Records above this count trigger a gentle "consider promoting" hint. */
export const PROMOTE_HINT_THRESHOLD = 5000;

/** Small inline badge for a dynamic model (e.g. in lists). */
export function PrototypeBadge() {
  return (
    <span
      title="Prototype model — stored as JSON, not indexed. Promote to a typed model for production scale."
      className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
    >
      Prototype
    </span>
  );
}

/** Explainer banner for the Schema Builder describing the two tiers. */
export function TierExplainer() {
  return (
    <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
      <span className="font-medium text-foreground">Prototype tier.</span>{" "}
      Models you create here are stored dynamically (as JSON) — perfect for
      prototyping, fine to a few thousand records. When an app gets real, use{" "}
      <span className="font-medium text-foreground">Promote to production</span>{" "}
      on a model to generate a typed, indexed{" "}
      <code>amplify/data/resource.ts</code> definition.
    </div>
  );
}

/** Shown on a model when its record count suggests it should be promoted. */
export function PromoteHint({ count }: { count: number }) {
  if (count < PROMOTE_HINT_THRESHOLD) return null;
  return (
    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-foreground">
      This model has {count.toLocaleString()} records. The prototype tier filters
      and sorts in memory, which slows down at this size — consider{" "}
      <span className="font-medium">Promote to production</span> for indexed,
      scalable queries.
    </div>
  );
}
