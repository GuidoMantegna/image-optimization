import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterBar } from "@/components/FilterBar";
import { PhotoFilters } from "@/types/unsplash";

function setup(filters: PhotoFilters = {}, onChange = vi.fn()) {
  const user = userEvent.setup();
  render(<FilterBar filters={filters} onChange={onChange} />);
  return { user, onChange };
}

describe("FilterBar", () => {
  // ── color swatches ───────────────────────────────────────────────────────────

  it("calls onChange with the selected color when a color swatch is clicked", async () => {
    const { user, onChange } = setup();
    await user.click(screen.getByRole("button", { name: "Blue" }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ color: "blue" })
    );
  });

  it("calls onChange with color: undefined when the active color is clicked again (deselect)", async () => {
    const { user, onChange } = setup({ color: "blue" });
    await user.click(screen.getByRole("button", { name: "Blue" }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ color: undefined })
    );
  });

  it("selects a different color when a non-active color is clicked", async () => {
    const { user, onChange } = setup({ color: "blue" });
    await user.click(screen.getByRole("button", { name: "Red" }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ color: "red" })
    );
  });

  // ── orientation buttons ──────────────────────────────────────────────────────

  it("calls onChange with orientation: landscape when Landscape is clicked", async () => {
    const { user, onChange } = setup();
    await user.click(screen.getByRole("button", { name: "Landscape" }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ orientation: "landscape" })
    );
  });

  it("calls onChange with orientation: portrait when Portrait is clicked", async () => {
    const { user, onChange } = setup();
    await user.click(screen.getByRole("button", { name: "Portrait" }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ orientation: "portrait" })
    );
  });

  it("calls onChange with orientation: squarish when Square is clicked", async () => {
    const { user, onChange } = setup();
    await user.click(screen.getByRole("button", { name: "Square" }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ orientation: "squarish" })
    );
  });

  it("deselects orientation when the active orientation button is clicked again", async () => {
    const { user, onChange } = setup({ orientation: "portrait" });
    await user.click(screen.getByRole("button", { name: "Portrait" }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ orientation: undefined })
    );
  });

  // ── sort buttons ─────────────────────────────────────────────────────────────

  it("calls onChange with order_by: relevant when Sort by relevant is clicked", async () => {
    const { user, onChange } = setup();
    await user.click(screen.getByRole("button", { name: "Sort by relevant" }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ order_by: "relevant" })
    );
  });

  it("calls onChange with order_by: latest when Sort by latest is clicked", async () => {
    const { user, onChange } = setup();
    await user.click(screen.getByRole("button", { name: "Sort by latest" }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ order_by: "latest" })
    );
  });

  it("deselects sort when the active sort button is clicked again", async () => {
    const { user, onChange } = setup({ order_by: "latest" });
    await user.click(screen.getByRole("button", { name: "Sort by latest" }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ order_by: undefined })
    );
  });

  // ── clear button visibility ──────────────────────────────────────────────────

  it("does not render a Clear button when no filters are active", () => {
    setup({});
    expect(screen.queryByRole("button", { name: /clear/i })).not.toBeInTheDocument();
  });

  it("renders a Clear button when a color filter is active", () => {
    setup({ color: "red" });
    expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
  });

  it("renders a Clear button when an orientation filter is active", () => {
    setup({ orientation: "landscape" });
    expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
  });

  it("renders a Clear button when a sort filter is active", () => {
    setup({ order_by: "latest" });
    expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
  });

  // ── clear button behavior ────────────────────────────────────────────────────

  it("calls onChange with an empty object when Clear is clicked", async () => {
    const { user, onChange } = setup({
      color: "red",
      orientation: "landscape",
      order_by: "latest",
    });
    await user.click(screen.getByRole("button", { name: /clear/i }));
    expect(onChange).toHaveBeenCalledWith({});
  });

  // ── aria-pressed ─────────────────────────────────────────────────────────────

  it("sets aria-pressed=true on the active color button", () => {
    setup({ color: "green" });
    expect(screen.getByRole("button", { name: "Green" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("sets aria-pressed=false on inactive color buttons", () => {
    setup({ color: "green" });
    expect(screen.getByRole("button", { name: "Blue" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("sets aria-pressed=true on the active orientation button", () => {
    setup({ orientation: "squarish" });
    expect(screen.getByRole("button", { name: "Square" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("sets aria-pressed=false on inactive orientation buttons", () => {
    setup({ orientation: "squarish" });
    expect(screen.getByRole("button", { name: "Landscape" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("sets aria-pressed=true on the active sort button", () => {
    setup({ order_by: "latest" });
    expect(
      screen.getByRole("button", { name: "Sort by latest" })
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("sets aria-pressed=false on inactive sort buttons", () => {
    setup({ order_by: "latest" });
    expect(
      screen.getByRole("button", { name: "Sort by relevant" })
    ).toHaveAttribute("aria-pressed", "false");
  });

  // ── group role ───────────────────────────────────────────────────────────────

  it("renders a group element with an accessible label 'Photo filters'", () => {
    setup();
    expect(
      screen.getByRole("group", { name: "Photo filters" })
    ).toBeInTheDocument();
  });

  // ── preserves other filters when changing one ────────────────────────────────

  it("preserves existing filters when a new color is selected", async () => {
    const { user, onChange } = setup({
      orientation: "landscape",
      order_by: "latest",
    });
    await user.click(screen.getByRole("button", { name: "Blue" }));
    expect(onChange).toHaveBeenCalledWith({
      color: "blue",
      orientation: "landscape",
      order_by: "latest",
    });
  });
});
