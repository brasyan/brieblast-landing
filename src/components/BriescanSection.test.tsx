import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BriescanSection from "./BriescanSection";

describe("BriescanSection", () => {
  it("renders Briescan™ and WTFPL license messaging", () => {
    render(<BriescanSection />);

    expect(screen.getByRole("heading", { name: /introducing briescan™/i })).toBeInTheDocument();
    expect(screen.getByText(/zero gatekeeping/i)).toBeInTheDocument();
    expect(screen.getByText(/go clank!/i)).toBeInTheDocument();
    expect(screen.getByText(/released under the wtfpl license – do what you want!/i)).toBeInTheDocument();
  });
});
