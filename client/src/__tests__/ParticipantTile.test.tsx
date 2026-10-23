import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("ParticipantTile", () => {
  it("renders placeholder", () => {
    render(<div>ParticipantTile placeholder</div>);
    expect(screen.getByText("ParticipantTile placeholder")).toBeInTheDocument();
  });
});
