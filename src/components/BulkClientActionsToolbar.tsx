import * as React from "react";
import {
  Archive,
  ChevronDown,
  FileDown,
  Layers3,
  Megaphone,
  RotateCcw,
  Tags,
  Trash2,
  UserRoundPlus,
  WandSparkles,
} from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Dialog, DialogContent } from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Input } from "./ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { toast } from "sonner";

type SelectionMode = "partial" | "allVisible" | "allMatching" | "single";
type ModalKind =
  | "assignCollaborator"
  | "addTags"
  | "removeTags"
  | "assignPond"
  | "mergeClients"
  | "archiveClient"
  | "deleteClient"
  | "exportClients";
type CollaboratorTab = "add" | "remove";
type FigmaState =
  | "none"
  | "assignCollaborator"
  | "addTags"
  | "removeTags"
  | "assignPond"
  | "mergeClients"
  | "archiveClient"
  | "deleteClient"
  | "exportClients"
  | "stage"
  | "source"
  | "more";

type Collaborator = {
  name: string;
  role: string;
  invited?: boolean;
  access: string;
};

const collaborators: Collaborator[] = [
  { name: "Dillion Dennis", role: "T.C.", access: "Default Level Access" },
  { name: "Sandeep M Team", role: "T.C.", access: "Default Level Access" },
  { name: "James Cooper", role: "Vendor", access: "Default Level Access" },
  { name: "James Mori", role: "T.C.", invited: true, access: "Default Level Access" },
  { name: "Sandeep TC 1", role: "T.C.", invited: true, access: "Default Level Access" },
  { name: "James Money", role: "Lender", access: "Default Level Access" },
  { name: "Joe Assistant", role: "Assistant", invited: true, access: "Default Level Access" },
];

const stageItems = [
  "New Client",
  "Met with Client",
  "Pre-approved/Listing Prepped",
  "Showings/Tours",
  "Sending/Receiving Offers",
  "In Contract",
  "Closed",
  "Archived",
];

const sourceItems = [
  "Agency",
  "Builder",
  "Events",
  "Floor Call",
  "FSBO",
  "Mail",
  "My mobile app",
  "Networking",
  "New Construction",
  "Open House",
  "OpCity/Realtor.com",
  "Others",
  "Paid Marketing - Farming/Direct",
  "Paid Marketing - Zillow",
  "Personal Transaction",
  "Property Management",
  "Radius Marketplace",
  "Referral - Attorney",
  "Referral - From Past Client",
  "Referral - Lender",
  "Referral - Real Estate Agent(External)",
  "Referral - Sphere of Influence",
  "Referral - Title",
  "Referrals (Agent/Lender)",
  "Self",
  "Sign Call",
  "Social Profile - Facebook",
  "Social Profile - Instagram",
  "Sphere of Influence/Personal",
  "Team/Mentor Lead",
  "Zillow (Agent's Personal Account)",
  "Zillow (Radius Provided)",
  "Zillow Flex",
  "Zillow",
  "Slyhomes",
  "Skyhomes",
  "SKR",
];

const pondItems = ["High perform", "Test pond"];
const tagItems = ["#newzillowleads", "#probate", "#probatejune", "#probatewebsite"];
const mergeClients = ["Amy Adams", "Test Lead", "Roger Test"];

const moreMenuItems = [
  { label: "Update Stage", key: "updateStage", icon: WandSparkles },
  { label: "Update Source", key: "updateSource", icon: Megaphone },
  { label: "Assign Pond", key: "assignPond", icon: Layers3 },
  { label: "Merge Clients", key: "mergeClients", icon: RotateCcw },
  { label: "Export Clients", key: "exportClients", icon: FileDown },
];

function useToasts() {
  const push = React.useCallback((message: string) => {
    toast(message);
  }, []);

  return { push };
}

function avatarInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function roleLabel(role: string) {
  return role === "T.C." ? "T.C." : role;
}

function isFigmaCaptureSession() {
  if (typeof window === "undefined") return false;
  return window.location.hash.includes("figmacapture=") || window.location.search.includes("figmacapture=");
}

function ToolbarIconButton({
  label,
  children,
  onClick,
  variant = "secondary",
  className,
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "secondary" | "destructive";
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant={variant}
          className={["toolbar-button toolbar-icon-button", className ?? ""].join(" ")}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "blue" | "green" }) {
  const tones = {
    neutral: "border-border bg-white text-muted-foreground",
    blue: "border-[rgba(90,95,242,0.22)] bg-[rgba(90,95,242,0.1)] text-[#4f54df]",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  } as const;

  return <span className={["inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold", tones[tone]].join(" ")}>{children}</span>;
}

function titleFor(kind: ModalKind) {
  switch (kind) {
    case "assignCollaborator":
      return "Assign Collaborator";
    case "addTags":
      return "Add Tags";
    case "removeTags":
      return "Remove Tags";
    case "assignPond":
      return "Assign Pond";
    case "mergeClients":
      return "Merge Clients";
    case "archiveClient":
      return "Archive 1 Client";
    case "deleteClient":
      return "Delete 1 Client";
    case "exportClients":
      return "Export Selected Clients";
  }
}

function actionToast(kind: ModalKind, tab?: CollaboratorTab) {
  if (kind === "assignCollaborator" && tab === "remove") return "Collaborators removed";
  if (kind === "assignCollaborator") return "Collaborators assigned";
  if (kind === "addTags") return "Tags added";
  if (kind === "removeTags") return "Tags removed";
  if (kind === "assignPond") return "Pond assigned";
  if (kind === "mergeClients") return "Clients merged";
  if (kind === "archiveClient") return "Client archived";
  if (kind === "deleteClient") return "Client deleted";
  if (kind === "exportClients") return "Export started";
  return "";
}

function UpdateSelectionDialog({
  open,
  kind,
  onOpenChange,
  onComplete,
}: {
  open: boolean;
  kind: "stage" | "source" | null;
  onOpenChange: (open: boolean) => void;
  onComplete: (result: { kind: "stage" | "source"; value: string }) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setQuery("");
    setSelected(null);
  }, [open, kind]);

  if (!kind) return null;

  const items = kind === "stage" ? stageItems : sourceItems;
  const filtered = items.filter((item) => item.toLowerCase().includes(query.toLowerCase()));
  const title = kind === "stage" ? "Update Stage" : "Update Source";
  const description = kind === "stage" ? "Choose one client stage." : "Choose one client source.";
  const cta = kind === "stage" ? "Update stage" : "Update source";

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={!isFigmaCaptureSession()}>
      <DialogContent
        className="rounded-2xl p-0"
        style={{ width: "640px", maxWidth: "calc(100vw - 32px)" }}
      >
        <div className="flex max-h-[80vh] flex-col">
          <div className="border-b border-border px-6 py-5">
            <div className="text-base font-semibold">{title}</div>
            <div className="mt-1 text-sm text-muted-foreground">{description}</div>
          </div>
          <div className="border-b border-border px-6 py-4">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={kind === "stage" ? "Search stage" : "Search source"}
              className="h-11 rounded-xl"
            />
          </div>
          <Command shouldFilter={false} className="flex-1">
            <CommandList className="max-h-[44vh] px-3 py-3">
              <CommandEmpty>Nothing found</CommandEmpty>
              {filtered.map((item) => (
                <CommandItem
                  key={item}
                  value={item}
                  onSelect={() => setSelected(item)}
                  className={[
                    "flex items-center justify-between rounded-xl px-3 py-2.5",
                    selected === item ? "bg-muted/60" : "hover:bg-muted",
                  ].join(" ")}
                >
                  <span className="min-w-0 truncate text-sm font-medium">{item}</span>
                  <div
                    aria-hidden="true"
                    className={[
                      "flex h-4 w-4 items-center justify-center rounded-full border",
                      selected === item ? "border-primary bg-primary" : "border-border bg-white",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "h-2 w-2 rounded-full bg-white",
                        selected === item ? "opacity-100" : "opacity-0",
                      ].join(" ")}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
          <div className="sticky bottom-0 border-t border-border bg-background px-6 py-4">
            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" className="rounded-full" aria-label="Cancel update" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                className="rounded-full"
                aria-label={cta}
                disabled={!selected}
                onClick={() => {
                  onComplete({ kind, value: selected as string });
                  onOpenChange(false);
                }}
              >
                {cta}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SelectionMenu({
  mode,
  onModeChange,
}: {
  mode: SelectionMode;
  onModeChange: (mode: SelectionMode) => void;
}) {
  const label =
    mode === "partial"
      ? "1/10 selected"
      : mode === "allVisible"
        ? "10/10 selected"
        : mode === "allMatching"
          ? "243 selected"
          : "1/1 selected";

  const items =
    mode === "partial"
      ? ["Select all 10 visible clients", "Select all 243 matching clients", "Clear selection"]
      : mode === "allVisible"
        ? ["Select all 243 matching clients", "Clear selection"]
        : mode === "allMatching"
          ? ["Clear selection"]
          : ["Select all 1 clients", "Clear selection"];

  const nextMap = new Map([
    ["Select all 10 visible clients", "allVisible"],
    ["Select all 243 matching clients", "allMatching"],
    ["Select all 1 clients", "single"],
    ["Clear selection", "partial"],
  ]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className="toolbar-button toolbar-button-secondary">
          {label}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        {items.map((item) => (
          <DropdownMenuItem
            key={item}
            onSelect={(event) => {
              event.preventDefault();
              const next = nextMap.get(item);
              if (next) onModeChange(next as SelectionMode);
            }}
          >
            {item}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ToggleRow({
  label,
  meta,
  selected,
  single,
  onClick,
  left,
}: {
  label: string;
  meta?: React.ReactNode;
  selected: boolean;
  single?: boolean;
  onClick: () => void;
  left?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={[
        "dialog-row w-full text-left",
        selected ? "border-primary bg-[rgba(90,95,242,0.08)]" : "bg-background",
      ].join(" ")}
      onClick={onClick}
    >
      <div className="flex min-w-0 items-center gap-3">
        {left}
        <div className="min-w-0">
          <div className="dialog-row-title truncate">{label}</div>
          {meta ? <div className="dialog-row-meta">{meta}</div> : null}
        </div>
      </div>
      <div
        aria-hidden="true"
        className={[
          "flex h-4 w-4 items-center justify-center border",
          single ? "rounded-full" : "rounded-[4px]",
          selected ? "border-primary bg-primary" : "border-border bg-white",
        ].join(" ")}
      >
        <div
          className={[
            single ? "h-2 w-2 rounded-full bg-white" : "h-2.5 w-1.5 rotate-45 border-b-2 border-r-2 border-white",
            selected ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />
      </div>
    </button>
  );
}

function CollaboratorList({
  tab,
  search,
  setSearch,
  selected,
  setSelected,
}: {
  tab: CollaboratorTab;
  search: string;
  setSearch: (value: string) => void;
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const filtered = collaborators.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="grid gap-4">
      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search team members"
        className="dialog-search"
      />
      <div className="dialog-list">
        {filtered.map((item) => {
          const picked = selected.includes(item.name);
          return (
            <button
              key={item.name}
              type="button"
              className={[
                "dialog-row w-full text-left",
                picked ? "border-primary bg-[rgba(90,95,242,0.08)]" : "bg-background",
              ].join(" ")}
              onClick={() =>
                setSelected((current) =>
                  current.includes(item.name) ? current.filter((name) => name !== item.name) : [...current, item.name],
                )
              }
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(90,95,242,0.1)] text-sm font-semibold text-[#4f54df]">
                  {avatarInitials(item.name)}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="dialog-row-title truncate">{item.name}</div>
                    <Badge>{roleLabel(item.role)}</Badge>
                    {item.invited ? <Badge tone="green">Invited</Badge> : null}
                    <Badge tone="blue">{item.access}</Badge>
                  </div>
                </div>
              </div>
              <div
                aria-hidden="true"
                className={[
                  "flex h-4 w-4 items-center justify-center border",
                  "rounded-[4px]",
                  picked ? "border-primary bg-primary" : "border-border bg-white",
                ].join(" ")}
              >
                <div
                  className={[
                    "h-2.5 w-1.5 rotate-45 border-b-2 border-r-2 border-white",
                    picked ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ActionDialog({
  kind,
  open,
  onOpenChange,
  onComplete,
}: {
  kind: ModalKind | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (result: { kind: ModalKind; selected: string[]; tab?: CollaboratorTab }) => void;
}) {
  const [tab, setTab] = React.useState<CollaboratorTab>("add");
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [tagSearch, setTagSearch] = React.useState("");
  const [tagSelected, setTagSelected] = React.useState<string[]>([]);
  const [pond, setPond] = React.useState<string | null>(null);
  const [mainClient, setMainClient] = React.useState(mergeClients[0]);
  const [mergeFamily, setMergeFamily] = React.useState(true);
  const [exportAllColumns, setExportAllColumns] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setTab("add");
    setSearch("");
    setSelected([]);
    setTagSearch("");
    setTagSelected([]);
    setPond(null);
    setMainClient(mergeClients[0]);
    setMergeFamily(true);
    setExportAllColumns(false);
  }, [open, kind]);

  if (!kind) return null;

  const submit = () => {
    onComplete({ kind, selected: kind === "assignCollaborator" ? selected : kind === "addTags" || kind === "removeTags" ? tagSelected : [] , tab });
    onOpenChange(false);
  };

  const collaboratorActionLabel = tab === "add" ? "Add collaborators" : "Remove collaborators";

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={!isFigmaCaptureSession()}>
      <DialogContent>
        <div className="dialog-body">
          <div className="dialog-header">
            <div className="dialog-title">{titleFor(kind)}</div>
            <div className="dialog-description">
              {kind === "assignCollaborator" && "Choose collaborators to add or remove."}
              {kind === "addTags" && "Add tags to selected clients."}
              {kind === "removeTags" && "Remove tags from selected clients."}
              {kind === "assignPond" && "Choose pond to assign."}
              {kind === "mergeClients" && "Choose main client before merge."}
              {kind === "archiveClient" && "Move client to archive."}
              {kind === "deleteClient" && "Delete client permanently."}
              {kind === "exportClients" && "Export selected client."}
            </div>
          </div>

          {kind === "assignCollaborator" ? (
            <div className="grid gap-4">
              <div className="inline-flex rounded-full border border-border bg-muted p-1">
                <button
                  type="button"
                  className={[
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    tab === "add" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground",
                  ].join(" ")}
                  onClick={() => setTab("add")}
                >
                  Add
                </button>
                <button
                  type="button"
                  className={[
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    tab === "remove" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground",
                  ].join(" ")}
                  onClick={() => setTab("remove")}
                >
                  Remove
                </button>
              </div>
              <CollaboratorList
                tab={tab}
                search={search}
                setSearch={setSearch}
                selected={selected}
                setSelected={setSelected}
              />
              <div className="dialog-footer">
                <Button
                  variant="default"
                  disabled={!selected.length}
                  className="rounded-full"
                  onClick={submit}
                >
                  {collaboratorActionLabel}
                </Button>
              </div>
            </div>
          ) : null}

          {kind === "addTags" || kind === "removeTags" ? (
            <div className="grid gap-4">
              <Input
                value={tagSearch}
                onChange={(event) => setTagSearch(event.target.value)}
                placeholder="Search or create a new tag"
                className="dialog-search"
              />
              <div className="dialog-list">
                {tagItems
                  .filter((item) => item.toLowerCase().includes(tagSearch.toLowerCase()))
                  .map((item) => {
                    const picked = tagSelected.includes(item);
                    return (
                      <ToggleRow
                        key={item}
                        label={item}
                        selected={picked}
                        onClick={() =>
                          setTagSelected((current) =>
                            current.includes(item) ? current.filter((value) => value !== item) : [...current, item],
                          )
                        }
                      />
                    );
                  })}
              </div>
              <div className="dialog-footer px-0 pb-0 pt-0">
                <Button variant="default" disabled={!tagSelected.length} className="rounded-full" onClick={submit}>
                  {kind === "addTags" ? "Add tags" : "Remove tags"}
                </Button>
              </div>
            </div>
          ) : null}

          {kind === "assignPond" ? (
            <div className="grid gap-4">
              <div className="dialog-list">
                {pondItems.map((item) => (
                  <ToggleRow
                    key={item}
                    label={item}
                    selected={pond === item}
                    single
                    onClick={() => setPond(item)}
                  />
                ))}
              </div>
              <div className="dialog-footer px-0 pb-0 pt-0">
                <Button variant="default" disabled={!pond} className="rounded-full" onClick={submit}>
                  Assign pond
                </Button>
              </div>
            </div>
          ) : null}

          {kind === "mergeClients" ? (
            <div className="grid gap-4">
              <div className="grid gap-3">
                {mergeClients.map((client) => (
                  <ToggleRow
                    key={client}
                    label={client}
                    meta={client === "Amy Adams" ? "Client card" : client === "Test Lead" ? "Lead record" : "Potential duplicate"}
                    selected={mainClient === client}
                    single
                    onClick={() => setMainClient(client)}
                  />
                ))}
              </div>
              <label className="dialog-row cursor-pointer justify-start gap-3 bg-background">
                <Checkbox
                  checked={mergeFamily}
                  onCheckedChange={() => setMergeFamily((current) => !current)}
                />
                <div className="dialog-row-main">
                  <div className="dialog-row-title">Merge clients as family members</div>
                </div>
              </label>
              <div className="dialog-warning">
                Contact information and associated data will be moved to the main client. This cannot be undone.
              </div>
              <div className="dialog-footer px-0 pb-0 pt-0">
                <Button variant="default" className="rounded-full" onClick={submit}>
                  Yes, Merge 3 Clients
                </Button>
              </div>
            </div>
          ) : null}

          {kind === "archiveClient" ? (
            <div className="grid gap-4">
              <div className="dialog-warning">
                This client will remain in the system, but will be excluded from view.
              </div>
              <div className="dialog-warning">
                Are you sure you want to move this client to archive?
              </div>
              <div className="dialog-footer px-0 pb-0 pt-0">
                <Button variant="destructive" className="rounded-full" onClick={submit}>
                  Yes, Archive 1 Client
                </Button>
              </div>
            </div>
          ) : null}

          {kind === "deleteClient" ? (
            <div className="grid gap-4">
              <div className="dialog-warning">You are about to delete 1 client.</div>
              <div className="dialog-warning">
                By deleting this client, you will lose all communication history and will not be able to recover this
                client in the future.
              </div>
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                This contact will be permanently removed from your account
              </div>
              <label className="dialog-row cursor-pointer justify-start gap-3 bg-background">
                <Checkbox checked />
                <div className="dialog-row-main">
                  <div className="dialog-row-title">Export 1 client before deleting</div>
                </div>
              </label>
              <div className="dialog-footer px-0 pb-0 pt-0">
                <Button variant="destructive" className="rounded-full" onClick={submit}>
                  Yes, Delete 1 Client
                </Button>
              </div>
            </div>
          ) : null}

          {kind === "exportClients" ? (
            <div className="grid gap-4">
              <div className="dialog-warning">Would you like to export 1 client?</div>
              <label className="dialog-row cursor-pointer justify-start gap-3 bg-background">
                <Checkbox
                  checked={exportAllColumns}
                  onCheckedChange={() => setExportAllColumns((current) => !current)}
                />
                <div className="dialog-row-main">
                  <div className="dialog-row-title">Export all columns</div>
                  <div className="dialog-row-meta">
                    You can continue using Radius once your export starts. When the export is complete it will
                    automatically start downloading and we will also send you an email.
                  </div>
                </div>
              </label>
              <div className="dialog-footer px-0 pb-0 pt-0">
                <Button variant="default" className="rounded-full" onClick={submit}>
                  Yes, export clients
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BulkClientActionsToolbar() {
  const { push } = useToasts();
  const [selectionMode, setSelectionMode] = React.useState<SelectionMode>("partial");
  const [activeModal, setActiveModal] = React.useState<ModalKind | null>(null);
  const [moreOpen, setMoreOpen] = React.useState(false);
  const [stageDialogOpen, setStageDialogOpen] = React.useState(false);
  const [sourceDialogOpen, setSourceDialogOpen] = React.useState(false);
  const [figmaState, setFigmaState] = React.useState<FigmaState>(() => {
    if (typeof window === "undefined") return "none";
    const searchValue = new URLSearchParams(window.location.search).get("figmaState");
    const hashValue = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("figmaState");
    const value = searchValue ?? hashValue;
    return (value as FigmaState) ?? "none";
  });

  const openModal = (kind: ModalKind) => setActiveModal(kind);

  React.useEffect(() => {
    const sync = () => {
      const searchValue = new URLSearchParams(window.location.search).get("figmaState");
      const hashValue = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("figmaState");
      const value = searchValue ?? hashValue;
      setFigmaState((value as FigmaState) ?? "none");
    };
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  React.useEffect(() => {
    const timers: number[] = [];
    const schedule = (fn: () => void) => {
      timers.push(window.setTimeout(fn, 300));
    };

    if (figmaState === "assignCollaborator" || figmaState === "addTags" || figmaState === "removeTags" || figmaState === "assignPond" || figmaState === "mergeClients" || figmaState === "archiveClient" || figmaState === "deleteClient" || figmaState === "exportClients") {
      schedule(() => openModal(figmaState));
      return () => timers.forEach((timer) => window.clearTimeout(timer));
    }
    if (figmaState === "stage") {
      schedule(() => setStageDialogOpen(true));
      return () => timers.forEach((timer) => window.clearTimeout(timer));
    }
    if (figmaState === "source") {
      schedule(() => setSourceDialogOpen(true));
      return () => timers.forEach((timer) => window.clearTimeout(timer));
    }
    if (figmaState === "more") {
      schedule(() => setMoreOpen(true));
    }
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [figmaState]);

  return (
    <TooltipProvider delayDuration={120}>
      <div className="toolbar-frame">
        <div className="toolbar-surface">
          <SelectionMenu mode={selectionMode} onModeChange={setSelectionMode} />

          <Button className="toolbar-button toolbar-button-primary px-4" onClick={() => openModal("assignCollaborator")}>
            Assign Collaborator
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="secondary" className="toolbar-button toolbar-icon-button">
                <Tags className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  openModal("addTags");
                }}
              >
                Add Tags
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  openModal("removeTags");
                }}
              >
                Remove Tags
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu open={moreOpen} onOpenChange={setMoreOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="toolbar-button toolbar-button-secondary">
                More
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={10} className="w-[280px] rounded-2xl p-2 z-[70]">
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  setMoreOpen(false);
                  requestAnimationFrame(() => setStageDialogOpen(true));
                }}
              >
                <WandSparkles className="mr-2 h-4 w-4 text-muted-foreground" />
                Update Stage
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  setMoreOpen(false);
                  requestAnimationFrame(() => setSourceDialogOpen(true));
                }}
              >
                <Megaphone className="mr-2 h-4 w-4 text-muted-foreground" />
                Update Source
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  setMoreOpen(false);
                  openModal("assignPond");
                }}
              >
                <Layers3 className="mr-2 h-4 w-4 text-muted-foreground" />
                Assign Pond
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  setMoreOpen(false);
                  openModal("mergeClients");
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4 text-muted-foreground" />
                Merge Clients
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  setMoreOpen(false);
                  openModal("exportClients");
                }}
              >
                <FileDown className="mr-2 h-4 w-4 text-muted-foreground" />
                Export Clients
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  setMoreOpen(false);
                  openModal("archiveClient");
                }}
              >
                <Archive className="mr-2 h-4 w-4 text-muted-foreground" />
                Archive Clients
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  setMoreOpen(false);
                  openModal("deleteClient");
                }}
              >
                <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                Delete Clients
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ToolbarIconButton
            label="Archive clients"
            className="toolbar-hide-compact"
            onClick={() => openModal("archiveClient")}
          >
            <Archive className="h-4 w-4" />
          </ToolbarIconButton>

          <ToolbarIconButton
            label="Export clients"
            className="toolbar-hide-compact"
            onClick={() => openModal("exportClients")}
          >
            <FileDown className="h-4 w-4" />
          </ToolbarIconButton>

          <Button
            variant="ghost"
            className="toolbar-link-button"
            onClick={() => {
              setSelectionMode("partial");
              push("Selection cleared");
            }}
          >
            Cancel selection
          </Button>
        </div>
      </div>

      <ActionDialog
        kind={activeModal}
        open={Boolean(activeModal)}
        onOpenChange={(open) => {
          if (!open) setActiveModal(null);
        }}
        onComplete={({ kind, selected, tab }) => {
          if (kind === "assignCollaborator") {
            push(tab === "remove" ? "Collaborators removed" : "Collaborators assigned");
            return;
          }

          if (kind === "addTags") {
            push("Tags added");
            return;
          }

          if (kind === "removeTags") {
            push("Tags removed");
            return;
          }

          if (kind === "assignPond") {
            push("Pond assigned");
            return;
          }

          if (kind === "mergeClients") {
            push("Clients merged");
            return;
          }

          if (kind === "archiveClient") {
            push("Client archived");
            return;
          }

          if (kind === "deleteClient") {
            push("Client deleted");
            return;
          }

          if (kind === "exportClients") {
            push("Export started");
          }
        }}
      />

      <UpdateSelectionDialog
        open={stageDialogOpen}
        kind="stage"
        onOpenChange={setStageDialogOpen}
        onComplete={({ value }) => {
          push(`Stage updated to ${value}`);
        }}
      />

      <UpdateSelectionDialog
        open={sourceDialogOpen}
        kind="source"
        onOpenChange={setSourceDialogOpen}
        onComplete={({ value }) => {
          push(`Source updated to ${value}`);
        }}
      />

    </TooltipProvider>
  );
}
