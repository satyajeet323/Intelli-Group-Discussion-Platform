import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("ControlBar", () => {
  it("renders placeholder", () => {
    render(<div>ControlBar placeholder</div>);
    expect(screen.getByText("ControlBar placeholder")).toBeInTheDocument();
  });
});
