import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "./DashboardPage";

const { mockRefetchSites, mockUpdate, mockFrom } = vi.hoisted(() => {
  const refetch = vi.fn(async () => undefined);
  const update = vi.fn(() => ({
    eq: vi.fn(() => ({
      eq: vi.fn(async () => ({ error: null })),
    })),
  }));
  const from = vi.fn(() => ({
    update,
  }));
  return { mockRefetchSites: refetch, mockUpdate: update, mockFrom: from };
});

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-1", email: "user@example.com" },
    signOut: vi.fn(async () => undefined),
  }),
}));

vi.mock("@/hooks/useProfile", () => ({
  useProfile: () => ({
    profile: { plan: "none" },
    loading: false,
    updatePlan: vi.fn(async () => undefined),
  }),
}));

vi.mock("@/hooks/useSites", () => ({
  useSites: () => ({
    sites: [
      {
        id: "site-1",
        user_id: "user-1",
        name: "Old Site Name",
        original_filename: "old-site.zip",
        size_bytes: 2048,
        status: "live",
        proxmox_vmid: null,
        error_message: null,
        created_at: "2026-05-01T10:00:00Z",
        updated_at: "2026-05-01T10:00:00Z",
        subdomain: "old-site",
        ip_address: "127.0.0.1",
      },
    ],
    loading: false,
    error: null,
    refetch: mockRefetchSites,
  }),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: mockFrom,
  },
}));

vi.mock("@/components/SiteUploadDialog", () => ({
  default: () => null,
}));

describe("DashboardPage manage modal", () => {
  beforeAll(() => {
    class MockIntersectionObserver {
      observe() {}
      disconnect() {}
      unobserve() {}
    }
    Object.defineProperty(window, "IntersectionObserver", {
      writable: true,
      configurable: true,
      value: MockIntersectionObserver,
    });
  });

  beforeEach(() => {
    mockFrom.mockClear();
    mockUpdate.mockClear();
    mockRefetchSites.mockClear();
  });

  it("shows read-only site identity and still saves manage modal", async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Manage" })[0]);

    const nameInput = await screen.findByLabelText("Site name");
    const domainInput = screen.getByLabelText("Subdomain");

    expect(nameInput).toHaveAttribute("readonly");
    expect(domainInput).toHaveAttribute("readonly");
    expect(screen.getByText("To rename or migrate your site, please contact support.")).toBeInTheDocument();
    expect(screen.getByText("Creation date")).toBeInTheDocument();
    expect(screen.getByText("Publication status")).toBeInTheDocument();
    expect(screen.getByText("Published")).toBeInTheDocument();
    expect(screen.getByText("Last updated")).toBeInTheDocument();
    expect(screen.getByText("Traffic")).toBeInTheDocument();
    expect(screen.getByText("Not available yet")).toBeInTheDocument();

    const docsLink = screen.getByRole("link", { name: "Documentation (opens in a new tab)" });
    const faqLink = screen.getByRole("link", { name: "FAQ (opens in a new tab)" });
    expect(docsLink).toHaveAttribute("href", expect.stringContaining("site=old-site"));
    expect(faqLink).toHaveAttribute("href", expect.stringContaining("site=old-site"));
    expect(screen.getByRole("button", { name: "Contact Support" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith("sites");
      expect(mockUpdate).toHaveBeenCalledWith({
        name: "Old Site Name",
        subdomain: "old-site",
      });
      expect(mockRefetchSites).toHaveBeenCalledTimes(1);
    });
  });
});
