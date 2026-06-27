import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  PromoteHint,
  PrototypeBadge,
  PROMOTE_HINT_THRESHOLD,
} from "./PrototypeTierNotice";

describe("PromoteHint", () => {
  it("renders nothing below the threshold", () => {
    const { container } = render(<PromoteHint count={PROMOTE_HINT_THRESHOLD - 1} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a hint at/above the threshold, with a formatted count", () => {
    render(<PromoteHint count={12000} />);
    expect(screen.getByText(/12,000 records/)).toBeInTheDocument();
    expect(screen.getByText(/Promote to production/)).toBeInTheDocument();
  });
});

describe("PrototypeBadge", () => {
  it("renders the prototype label", () => {
    render(<PrototypeBadge />);
    expect(screen.getByText("Prototype")).toBeInTheDocument();
  });
});
