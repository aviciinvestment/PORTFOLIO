"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Check,
  Eye,
  EyeOff,
  FolderKanban,
  LayoutDashboard,
  Loader2,
  Mail,
  Pencil,
  Plus,
  Quote,
  Settings,
  Star,
  Trash2,
  X,
  Share2,
} from "lucide-react";
import clsx from "clsx";

type Stats = {
  projects: number;
  skills: number;
  experiences: number;
  messages: number;
  unread: number;
};

type Project = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  tags: string[];
  liveUrl: string | null;
  repoUrl: string | null;
  order: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

type Skill = {
  id: string;
  name: string;
  icon: string | null;
  category: string;
  level: number;
  order: number;
  createdAt: string;
};

type Experience = {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string | null;
  order: number;
  createdAt: string;
};

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read: boolean;
  createdAt: string;
};

type Social = {
  id: string;
  platform: string;
  url: string;
  icon: string | null;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type SiteContent = {
  id: string;
  brand: string;
  greeting: string;
  heroName: string;
  heroTitle: string;
  heroTagline: string;
  testimonialQuote: string;
  testimonialName: string;
  testimonialRole: string;
  resumeUrl: string | null;
};

type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch {
      // ignore parse errors
    }
    throw new Error(msg);
  }
  return res.json();
}

function useDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [socials, setSocials] = useState<Social[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [s, p, sk, ex, m, soc, testims] = await Promise.all([
        apiFetch<Stats>("/api/admin/stats"),
        apiFetch<Project[]>("/api/admin/projects"),
        apiFetch<Skill[]>("/api/admin/skills"),
        apiFetch<Experience[]>("/api/admin/experiences"),
        apiFetch<Message[]>("/api/admin/messages"),
        apiFetch<Social[]>("/api/socials"),
        apiFetch<Testimonial[]>("/api/testimonials"),
      ]);
      setStats(s);
      setProjects(p);
      setSkills(sk);
      setExperiences(ex);
      setMessages(m);
      setSocials(soc);
      setTestimonials(testims);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    const load = () => {
      attempts += 1;
      Promise.all([
        apiFetch<Stats>("/api/admin/stats"),
        apiFetch<Project[]>("/api/admin/projects"),
        apiFetch<Skill[]>("/api/admin/skills"),
        apiFetch<Experience[]>("/api/admin/experiences"),
        apiFetch<Message[]>("/api/admin/messages"),
        apiFetch<Social[]>("/api/socials"),
        apiFetch<Testimonial[]>("/api/testimonials"),
      ])
        .then(([s, p, sk, ex, m, soc, testims]) => {
          if (!active) return;
          setStats(s);
          setProjects(p);
          setSkills(sk);
          setExperiences(ex);
          setMessages(m);
          setSocials(soc);
          setTestimonials(testims);
          setError(null);
        })
        .catch((e) => {
          if (!active) return;
          setError(e instanceof Error ? e.message : "Failed to load data");
          throw e;
        })
        .catch(() => {
          if (active && attempts < 3) {
            timer = setTimeout(load, 2000);
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    };

    load();

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  return { stats, projects, skills, experiences, messages, socials, testimonials, loading, error, refresh };
}

type TabId = "dashboard" | "projects" | "skills" | "experience" | "messages" | "socials" | "testimonials" | "site";

const TABS: { id: TabId; label: string; icon: ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: "site", label: "Site", icon: <Settings className="w-4 h-4" /> },
  { id: "projects", label: "Projects", icon: <FolderKanban className="w-4 h-4" /> },
  { id: "skills", label: "Skills", icon: <Star className="w-4 h-4" /> },
  { id: "experience", label: "Experience", icon: <Briefcase className="w-4 h-4" /> },
  { id: "messages", label: "Messages", icon: <Mail className="w-4 h-4" /> },
  { id: "socials", label: "Socials", icon: <Share2 className="w-4 h-4" /> },
  { id: "testimonials", label: "Testimonials", icon: <Quote className="w-4 h-4" /> },
];

export function AdminDashboard() {
  const data = useDashboard();
  const [tab, setTab] = useState<TabId>("dashboard");
  const [toast, setToast] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const handleError = useCallback(
    (e: unknown) => notify(e instanceof Error ? e.message : "Something went wrong"),
    [notify]
  );

  const handleSyncRag = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/sync-rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sync: true }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to sync RAG");
      notify(result.message || "Synced RAG data successfully");
    } catch (e) {
      handleError(e);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0604] text-[#f8fafc] relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[#d9480f]/15 rounded-full blur-[120px] pointer-events-none translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#d9480f]/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/4 translate-y-1/4" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white transition-colors"
              aria-label="Back to homepage"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Admin<span className="text-[#ff5c00]">.</span>
              </h1>
              <p className="text-sm text-white/50">Victory portfolio management</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={handleSyncRag}
              disabled={syncing}
              className="flex items-center gap-2 text-xs px-4 py-2 rounded-full bg-[#ff5c00]/10 border border-[#ff5c00]/20 text-[#ff5c00] hover:bg-[#ff5c00]/20 transition-colors disabled:opacity-50"
            >
              {syncing ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              {syncing ? "Syncing RAG..." : "Sync AI Data"}
            </button>
            <div className="flex items-center gap-2 text-xs px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Connected to Neon
            </div>
          </div>
        </header>

        {data.error && (
          <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
            {data.error}
          </div>
        )}

        {data.loading ? (
          <div className="flex items-center justify-center gap-3 py-32 text-white/50">
            <Loader2 className="w-6 h-6 animate-spin" />
            Connecting to database...
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all border",
                    tab === t.id
                      ? "bg-[#ff5c00] text-white border-transparent shadow-[0_0_20px_rgba(255,92,0,0.35)]"
                      : "bg-white/5 text-white/60 border-white/10 hover:text-white"
                  )}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "dashboard" && (
              <DashboardTab data={data} onNavigate={setTab} />
            )}
            {tab === "projects" && (
              <ProjectsTab
                projects={data.projects}
                onError={handleError}
                onNotify={notify}
                onRefresh={data.refresh}
              />
            )}
            {tab === "skills" && (
              <SkillsTab
                skills={data.skills}
                onError={handleError}
                onNotify={notify}
                onRefresh={data.refresh}
              />
            )}
            {tab === "experience" && (
              <ExperienceTab
                experiences={data.experiences}
                onError={handleError}
                onNotify={notify}
                onRefresh={data.refresh}
              />
            )}
            {tab === "messages" && (
              <MessagesTab
                messages={data.messages}
                onError={handleError}
                onNotify={notify}
                onRefresh={data.refresh}
              />
            )}
            {tab === "socials" && (
              <SocialsTab
                socials={data.socials}
                onError={handleError}
                onNotify={notify}
                onRefresh={data.refresh}
              />
            )}
            {tab === "testimonials" && (
              <TestimonialsTab
                testimonials={data.testimonials}
                onError={handleError}
                onNotify={notify}
                onRefresh={data.refresh}
              />
            )}
            {tab === "site" && (
              <SiteTab onError={handleError} onNotify={notify} />
            )}
          </>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-[#ff5c00] text-white text-sm font-medium shadow-[0_0_30px_rgba(255,92,0,0.4)]">
          {toast}
        </div>
      )}
    </main>
  );
}

/* ------------------------------ Dashboard ------------------------------ */

function DashboardTab({
  data,
  onNavigate,
}: {
  data: ReturnType<typeof useDashboard>;
  onNavigate: (tab: TabId) => void;
}) {
  const stats = data.stats;
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          label="Projects"
          value={stats?.projects ?? 0}
          color="text-[#ff5c00]"
        />
        <StatCard label="Skills" value={stats?.skills ?? 0} color="text-amber-400" />
        <StatCard
          label="Experience"
          value={stats?.experiences ?? 0}
          color="text-sky-400"
        />
        <StatCard
          label="Messages"
          value={stats?.messages ?? 0}
          color="text-violet-400"
        />
        <StatCard
          label="Unread"
          value={stats?.unread ?? 0}
          color="text-emerald-400"
          highlight
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="Recent Projects" actionLabel="View all" onAction={() => onNavigate("projects")}>
          {data.projects.slice(0, 5).map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 py-2.5 border-b border-white/5 last:border-0">
              <div>
                <p className="text-sm font-medium">{p.title}</p>
                <p className="text-xs text-white/40 text-ellipsis overflow-hidden whitespace-nowrap max-w-[220px]">
                  {p.description}
                </p>
              </div>
              <span
                className={clsx(
                  "text-[10px] px-2 py-1 rounded-full",
                  p.published
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-white/10 text-white/40"
                )}
              >
                {p.published ? "Published" : "Draft"}
              </span>
            </div>
          ))}
          {data.projects.length === 0 && <EmptyRow label="No projects yet" />}
        </Panel>

        <Panel title="Latest Messages" actionLabel="View all" onAction={() => onNavigate("messages")}>
          {data.messages.slice(0, 5).map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-3 py-2.5 border-b border-white/5 last:border-0">
              <div>
                <p className="text-sm font-medium">
                  {m.name}
                  <span className="text-white/40 font-normal"> · {m.email}</span>
                </p>
                <p className="text-xs text-white/40 text-ellipsis overflow-hidden whitespace-nowrap max-w-[240px]">
                  {m.message}
                </p>
              </div>
              {!m.read && <span className="w-2 h-2 rounded-full bg-[#ff5c00]" />}
            </div>
          ))}
          {data.messages.length === 0 && <EmptyRow label="No messages yet" />}
        </Panel>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  highlight = false,
}: {
  label: string;
  value: number;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={clsx(
        "glass-panel rounded-2xl p-5",
        highlight && "ring-1 ring-[#ff5c00]/40"
      )}
    >
      <p className="text-xs uppercase tracking-wider text-white/40 mb-2">{label}</p>
      <p className={clsx("text-3xl font-bold", color)}>{value}</p>
    </div>
  );
}

function Panel({
  title,
  children,
  actionLabel,
  onAction,
}: {
  title: string;
  children: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
        {actionLabel && (
          <button
            onClick={onAction}
            className="text-xs text-[#ff5c00] hover:text-white transition-colors"
          >
            {actionLabel}
          </button>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

function EmptyRow({ label }: { label: string }) {
  return <p className="py-6 text-sm text-white/30 text-center">{label}</p>;
}

/* ------------------------------ Shared UI ------------------------------ */

function AddForm({
  title,
  onSubmit,
  onCancel,
  busy,
  children,
}: {
  title: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  busy?: boolean;
  children: ReactNode;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="glass-panel rounded-2xl p-6 mb-6 border border-[#ff5c00]/30"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#ff5c00]" />
          {title}
        </h3>
        <button type="button" onClick={onCancel} className="text-white/40 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">{children}</div>
      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-full text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy}
          className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium bg-[#ff5c00] hover:bg-[#ff5c00]/90 text-white transition-colors disabled:opacity-50"
        >
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}
          Save
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-white/50">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm placeholder-white/25 focus:outline-none focus:border-[#ff5c00]/60 transition-colors";

/* ------------------------------ Projects ------------------------------ */

function ProjectsTab({
  projects,
  onError,
  onNotify,
  onRefresh,
}: {
  projects: Project[];
  onError: (e: unknown) => void;
  onNotify: (msg: string) => void;
  onRefresh: () => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Project | null>(null);

  const openEdit = (p: Project) => {
    setEditing(p);
    setEditId(p.id);
    setShowForm(true);
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const payload = {
      title: values.title,
      description: values.description,
      image: values.image || null,
      tags: (values.tags || "").split(",").map((t) => t.trim()).filter(Boolean),
      liveUrl: values.liveUrl || null,
      repoUrl: values.repoUrl || null,
      order: Number(values.order || 0),
      published: values.published === "on",
    };
    setBusy(true);
    try {
      if (editId) {
        await apiFetch(`/api/admin/projects/${editId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        onNotify("Project updated");
      } else {
        await apiFetch("/api/admin/projects", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        onNotify("Project created");
      }
      setShowForm(false);
      setEditId(null);
      onRefresh();
    } catch (err) {
      onError(err);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await apiFetch(`/api/admin/projects/${id}`, { method: "DELETE" });
      onNotify("Project deleted");
      onRefresh();
    } catch (err) {
      onError(err);
    }
  };

  const togglePublished = async (p: Project) => {
    try {
      await apiFetch(`/api/admin/projects/${p.id}`, {
        method: "PATCH",
        body: JSON.stringify({ published: !p.published }),
      });
      onRefresh();
    } catch (err) {
      onError(err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Projects</h2>
          <p className="text-sm text-white/50">{projects.length} total</p>
        </div>
        <button
          onClick={() => {
            setEditId(null);
            setEditing(null);
            setShowForm((s) => !s);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-[#ff5c00] hover:bg-[#ff5c00]/90 text-white transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Close" : "Add Project"}
        </button>
      </div>

      {showForm && (
        <AddForm
          title={editId ? "Edit Project" : "New Project"}
          onSubmit={submit}
          onCancel={() => {
            setShowForm(false);
            setEditId(null);
            setEditing(null);
          }}
          busy={busy}
        >
          <Field label="Title">
            <input required name="title" defaultValue={editing?.title} className={inputCls} />
          </Field>
          <Field label="Order">
            <input name="order" type="number" defaultValue={editing?.order ?? 0} className={inputCls} />
          </Field>
          <Field label="Description">
            <textarea
              required
              name="description"
              defaultValue={editing?.description}
              rows={2}
              className={inputCls}
            />
          </Field>
          <Field label="Image path">
            <input name="image" defaultValue={editing?.image ?? ""} placeholder="/projects/lumina.png" className={inputCls} />
          </Field>
          <Field label="Tags (comma separated)">
            <input name="tags" defaultValue={editing?.tags.join(", ") ?? ""} placeholder="Next.js, Tailwind" className={inputCls} />
          </Field>
          <Field label="Live URL">
            <input name="liveUrl" defaultValue={editing?.liveUrl ?? ""} placeholder="https://..." className={inputCls} />
          </Field>
          <Field label="Repo URL">
            <input name="repoUrl" defaultValue={editing?.repoUrl ?? ""} placeholder="https://..." className={inputCls} />
          </Field>
          <label className="flex items-center gap-2 self-end pb-2 text-sm text-white/70">
            <input name="published" type="checkbox" defaultChecked={editing?.published ?? true} className="accent-[#ff5c00]" />
            Published
          </label>
        </AddForm>
      )}

      <div className="glass-panel rounded-2xl overflow-hidden">
        {projects.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{p.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={clsx(
                    "text-[10px] px-2 py-0.5 rounded-full",
                    p.published
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-white/10 text-white/40"
                  )}
                >
                  {p.published ? "Published" : "Draft"}
                </span>
                {p.tags.slice(0, 4).map((t) => (
                  <span key={t} className="text-[10px] text-white/40 border border-white/10 px-2 py-0.5 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => togglePublished(p)}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
                title={p.published ? "Unpublish" : "Publish"}
              >
                {p.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => openEdit(p)}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => remove(p.id)}
                className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 hover:text-red-200 hover:bg-red-500/20 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {projects.length === 0 && <EmptyRow label="No projects yet" />}
      </div>
    </div>
  );
}

/* ------------------------------ Skills ------------------------------ */

function SkillsTab({
  skills,
  onError,
  onNotify,
  onRefresh,
}: {
  skills: Skill[];
  onError: (e: unknown) => void;
  onNotify: (msg: string) => void;
  onRefresh: () => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    const payload = {
      name: values.name,
      icon: values.icon || null,
      category: values.category,
      level: Number(values.level || 75),
      order: Number(values.order || 0),
    };
    setBusy(true);
    try {
      if (editing) {
        await apiFetch(`/api/admin/skills/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        onNotify("Skill updated");
      } else {
        await apiFetch("/api/admin/skills", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        onNotify("Skill created");
      }
      setShowForm(false);
      setEditing(null);
      onRefresh();
    } catch (err) {
      onError(err);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await apiFetch(`/api/admin/skills/${id}`, { method: "DELETE" });
      onNotify("Skill deleted");
      onRefresh();
    } catch (err) {
      onError(err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Skills</h2>
          <p className="text-sm text-white/50">{skills.length} total</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm((s) => !s);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-[#ff5c00] hover:bg-[#ff5c00]/90 text-white transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Close" : "Add Skill"}
        </button>
      </div>

      {showForm && (
        <AddForm
          title={editing ? "Edit Skill" : "New Skill"}
          onSubmit={submit}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
          busy={busy}
        >
          <Field label="Name">
            <input required name="name" defaultValue={editing?.name} className={inputCls} />
          </Field>
          <Field label="Category">
            <select name="category" defaultValue={editing?.category ?? "frontend"} className={inputCls}>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="design">Design</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Icon (emoji)">
            <input name="icon" defaultValue={editing?.icon ?? ""} placeholder="⚛️" className={inputCls} />
          </Field>
          <Field label="Proficiency (0–100)">
            <input name="level" type="number" min={0} max={100} defaultValue={editing?.level ?? 75} className={inputCls} />
          </Field>
          <Field label="Order">
            <input name="order" type="number" defaultValue={editing?.order ?? 0} className={inputCls} />
          </Field>
        </AddForm>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((s) => (
          <div key={s.id} className="glass-panel rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{s.icon ?? "◆"}</span>
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-white/40 uppercase tracking-wide">{s.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditing(s);
                    setShowForm(true);
                  }}
                  className="p-1.5 rounded-md bg-white/5 border border-white/10 text-white/50 hover:text-white transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => remove(s.id)}
                  className="p-1.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-300 hover:text-red-200 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="mt-4 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#ff5c00]"
                style={{ width: `${s.level}%` }}
              />
            </div>
            <p className="text-xs text-white/40 mt-1.5">{s.level}% · order {s.order}</p>
          </div>
        ))}
        {skills.length === 0 && (
          <div className="md:col-span-3">
            <EmptyRow label="No skills yet" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ Experience ------------------------------ */

function ExperienceTab({
  experiences,
  onError,
  onNotify,
  onRefresh,
}: {
  experiences: Experience[];
  onError: (e: unknown) => void;
  onNotify: (msg: string) => void;
  onRefresh: () => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Experience | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    const payload = {
      role: values.role,
      company: values.company,
      period: values.period,
      description: values.description || null,
      order: Number(values.order || 0),
    };
    setBusy(true);
    try {
      if (editing) {
        await apiFetch(`/api/admin/experiences/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        onNotify("Experience updated");
      } else {
        await apiFetch("/api/admin/experiences", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        onNotify("Experience created");
      }
      setShowForm(false);
      setEditing(null);
      onRefresh();
    } catch (err) {
      onError(err);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await apiFetch(`/api/admin/experiences/${id}`, { method: "DELETE" });
      onNotify("Experience deleted");
      onRefresh();
    } catch (err) {
      onError(err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Experience</h2>
          <p className="text-sm text-white/50">{experiences.length} total</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm((s) => !s);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-[#ff5c00] hover:bg-[#ff5c00]/90 text-white transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Close" : "Add Experience"}
        </button>
      </div>

      {showForm && (
        <AddForm
          title={editing ? "Edit Experience" : "New Experience"}
          onSubmit={submit}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
          busy={busy}
        >
          <Field label="Role">
            <input required name="role" defaultValue={editing?.role} className={inputCls} />
          </Field>
          <Field label="Company">
            <input required name="company" defaultValue={editing?.company} className={inputCls} />
          </Field>
          <Field label="Period">
            <input name="period" defaultValue={editing?.period ?? ""} placeholder="2022 — Present" className={inputCls} />
          </Field>
          <Field label="Order">
            <input name="order" type="number" defaultValue={editing?.order ?? 0} className={inputCls} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Description">
              <textarea name="description" defaultValue={editing?.description ?? ""} rows={2} className={inputCls} />
            </Field>
          </div>
        </AddForm>
      )}

      <div className="space-y-4">
        {experiences.map((x) => (
          <div key={x.id} className="glass-panel rounded-2xl p-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="font-medium">{x.role}</h3>
              <p className="text-sm text-white/60">{x.company}</p>
              <p className="text-xs text-[#ff5c00] mt-1">{x.period}</p>
              {x.description && (
                <p className="text-sm text-white/50 mt-2">{x.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setEditing(x);
                  setShowForm(true);
                }}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => remove(x.id)}
                className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 hover:text-red-200 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {experiences.length === 0 && <EmptyRow label="No experience entries yet" />}
      </div>
    </div>
  );
}

/* ------------------------------ Messages ------------------------------ */

function MessagesTab({
  messages,
  onError,
  onNotify,
  onRefresh,
}: {
  messages: Message[];
  onError: (e: unknown) => void;
  onNotify: (msg: string) => void;
  onRefresh: () => Promise<void>;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleRead = async (m: Message) => {
    try {
      await apiFetch(`/api/admin/messages/${m.id}`, {
        method: "PATCH",
        body: JSON.stringify({ read: !m.read }),
      });
      onRefresh();
    } catch (err) {
      onError(err);
    }
  };

  const remove = async (id: string) => {
    try {
      await apiFetch(`/api/admin/messages/${id}`, { method: "DELETE" });
      onNotify("Message deleted");
      onRefresh();
    } catch (err) {
      onError(err);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Messages</h2>
        <p className="text-sm text-white/50">
          {messages.filter((m) => !m.read).length} unread of {messages.length} total
        </p>
      </div>

      <div className="space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={clsx(
              "glass-panel rounded-2xl transition-colors",
              !m.read && "border-[#ff5c00]/40"
            )}
          >
            <button
              onClick={() => setOpenId(openId === m.id ? null : m.id)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <div className="min-w-0 flex-1">
                <p className={clsx("text-sm font-medium truncate", !m.read && "text-[#ff5c00]")}>
                  {m.subject || "No subject"}
                </p>
                <p className="text-xs text-white/45">
                  {m.name} · {m.email} · {formatDate(m.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {!m.read && <span className="w-2 h-2 rounded-full bg-[#ff5c00]" />}
                <span className="text-white/30">
                  {openId === m.id ? <X className="w-4 h-4" /> : <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10">Open</span>}
                </span>
              </div>
            </button>
            {openId === m.id && (
              <div className="px-5 pb-5 border-t border-white/5 pt-4">
                <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed mb-5">
                  {m.message}
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href={`mailto:${m.email}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-[#ff5c00] hover:bg-[#ff5c00]/90 text-white transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" /> Reply
                  </a>
                  <button
                    onClick={() => toggleRead(m)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    {m.read ? <EyeOff className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                    {m.read ? "Mark unread" : "Mark read"}
                  </button>
                  <button
                    onClick={() => remove(m.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {messages.length === 0 && <EmptyRow label="No messages yet" />}
      </div>
    </div>
  );
}

/* ------------------------------ Site Content ------------------------------ */

const SITE_FIELDS: {
  key: keyof SiteContent;
  label: string;
  hint?: string;
  textarea?: boolean;
}[] = [
  { key: "brand", label: "Brand / logo text", hint: 'Shown top-left of the homepage, e.g. "noah."' },
  { key: "greeting", label: "Greeting", hint: 'e.g. "Hey I am"' },
  { key: "heroName", label: "Name", hint: 'Name shown after the greeting, e.g. "Sammy"' },
  { key: "heroTitle", label: "Hero title", hint: 'e.g. "Web Developer"' },
  {
    key: "heroTagline",
    label: "Hero tagline",
    hint: 'e.g. "I design websites using Figma and develop them to bring to live"',
    textarea: true,
  },
  {
    key: "testimonialQuote",
    label: "Legacy Testimonial quote",
    hint: "Deprecated: Use the new Testimonials tab instead.",
    textarea: true,
  },
  { key: "testimonialName", label: "Legacy Testimonial name", hint: 'Deprecated: Use the new Testimonials tab instead.' },
  { key: "testimonialRole", label: "Legacy Testimonial role", hint: 'Deprecated: Use the new Testimonials tab instead.' },
  { key: "resumeUrl", label: "Resume Link (URL)", hint: 'e.g. Google Drive or Dropbox public link' },
];

const DEFAULT_SITE_CONTENT: SiteContent = {
  id: "",
  brand: "noah.",
  greeting: "Hey I am",
  heroName: "Sammy",
  heroTitle: "Web Developer",
  heroTagline: "I design websites using Figma and develop them to bring to live",
  testimonialQuote:
    "Working with Sammy was so good, he is so professional and would work with him again",
  testimonialName: "Angelina Jolie",
  testimonialRole: "Business owner",
  resumeUrl: null,
};

function SiteTab({
  onError,
  onNotify,
}: {
  onError: (e: unknown) => void;
  onNotify: (msg: string) => void;
}) {
  const [values, setValues] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    apiFetch<SiteContent | null>("/api/admin/site-content")
      .then((data) => active && data && setValues({ ...DEFAULT_SITE_CONTENT, ...data }))
      .catch((e) => active && onError(e))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [onError]);

  const setField = (key: keyof SiteContent) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload: Record<string, string> = {};
      for (const field of SITE_FIELDS) payload[field.key] = values[field.key] ?? "";
      const saved = await apiFetch<SiteContent>("/api/admin/site-content", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setValues({ ...DEFAULT_SITE_CONTENT, ...saved });
      onNotify("Site content saved");
    } catch (err) {
      onError(err);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-white/50">
        <Loader2 className="w-6 h-6 animate-spin" />
        Loading site content...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Site content</h2>
        <p className="text-sm text-white/50">
          Edit the homepage hero and testimonial. Changes apply immediately after saving.
        </p>
      </div>

      <form onSubmit={submit} className="glass-panel rounded-2xl p-6">
        <div className="grid md:grid-cols-2 gap-4">
          {SITE_FIELDS.map((field) => (
            <div
              key={field.key}
              className={field.textarea ? "md:col-span-2" : undefined}
            >
              <Field label={field.label}>
                {field.textarea ? (
                  <textarea
                    rows={3}
                    value={values[field.key] || ""}
                    onChange={setField(field.key)}
                    className={inputCls}
                  />
                ) : field.key === "resumeUrl" ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={values.resumeUrl || ""}
                      onChange={setField("resumeUrl")}
                      placeholder="Paste URL or upload file..."
                      className={clsx(inputCls, "flex-1")}
                    />
                    <label className="flex items-center justify-center px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl cursor-pointer text-sm font-medium transition-colors">
                      Upload
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          try {
                            setBusy(true);
                            onNotify("Uploading resume to Cloudinary...");
                            const formData = new FormData();
                            formData.append("file", file);
                            
                            const res = await fetch("/api/upload", {
                              method: "POST",
                              body: formData,
                            });
                            
                            if (!res.ok) throw new Error("Upload failed");
                            
                            const data = await res.json();
                            const newUrl = data.url;
                            
                            // Automatically save the URL
                            const payload: Record<string, string> = {};
                            for (const f of SITE_FIELDS) {
                              payload[f.key] = f.key === "resumeUrl" ? newUrl : (values[f.key] ?? "");
                            }
                            
                            const saved = await apiFetch<SiteContent>("/api/admin/site-content", {
                              method: "PUT",
                              body: JSON.stringify(payload),
                            });
                            
                            setValues({ ...DEFAULT_SITE_CONTENT, ...saved });
                            onNotify("Resume uploaded and saved successfully!");
                          } catch (err) {
                            onError(err);
                          } finally {
                            setBusy(false);
                            e.target.value = ""; // Reset input
                          }
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <input
                    value={values[field.key] || ""}
                    onChange={setField(field.key)}
                    className={inputCls}
                  />
                )}
              </Field>
              {field.hint && (
                <p className="text-xs text-white/35 mt-1.5">{field.hint}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => setValues(DEFAULT_SITE_CONTENT)}
            className="px-4 py-2 rounded-full text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            Reset to defaults
          </button>
          <button
            type="submit"
            disabled={busy}
            className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium bg-[#ff5c00] hover:bg-[#ff5c00]/90 text-white transition-colors disabled:opacity-50"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------ Socials ------------------------------ */

function SocialsTab({
  socials,
  onError,
  onNotify,
  onRefresh,
}: {
  socials: Social[];
  onError: (e: unknown) => void;
  onNotify: (msg: string) => void;
  onRefresh: () => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Social | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    const payload = {
      platform: values.platform,
      url: values.url,
      icon: values.icon || null,
      order: Number(values.order || 0),
      active: values.active === "on",
    };
    setBusy(true);
    try {
      if (editing) {
        await apiFetch(`/api/socials`, {
          method: "PUT",
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
        onNotify("Social link updated");
      } else {
        await apiFetch("/api/socials", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        onNotify("Social link created");
      }
      setShowForm(false);
      setEditing(null);
      onRefresh();
    } catch (err) {
      onError(err);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await apiFetch(`/api/socials?id=${id}`, { method: "DELETE" });
      onNotify("Social link deleted");
      onRefresh();
    } catch (err) {
      onError(err);
    }
  };

  const toggleActive = async (s: Social) => {
    try {
      await apiFetch(`/api/socials`, {
        method: "PUT",
        body: JSON.stringify({ id: s.id, platform: s.platform, url: s.url, icon: s.icon, order: s.order, active: !s.active }),
      });
      onRefresh();
    } catch (err) {
      onError(err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Socials</h2>
          <p className="text-sm text-white/50">{socials.length} total links</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm((s) => !s);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-[#ff5c00] hover:bg-[#ff5c00]/90 text-white transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Close" : "Add Social"}
        </button>
      </div>

      {showForm && (
        <AddForm
          title={editing ? "Edit Social Link" : "New Social Link"}
          onSubmit={submit}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
          busy={busy}
        >
          <Field label="Platform Name">
            <input required name="platform" defaultValue={editing?.platform} placeholder="Twitter" className={inputCls} />
          </Field>
          <Field label="URL">
            <input required name="url" defaultValue={editing?.url} placeholder="https://twitter.com/..." className={inputCls} />
          </Field>
          <Field label="Icon name (lucide-react)">
            <input name="icon" defaultValue={editing?.icon ?? ""} placeholder="Twitter, Github, Linkedin" className={inputCls} />
          </Field>
          <Field label="Order">
            <input name="order" type="number" defaultValue={editing?.order ?? 0} className={inputCls} />
          </Field>
          <label className="flex items-center gap-2 self-end pb-2 text-sm text-white/70">
            <input name="active" type="checkbox" defaultChecked={editing?.active ?? true} className="accent-[#ff5c00]" />
            Active
          </label>
        </AddForm>
      )}

      <div className="glass-panel rounded-2xl overflow-hidden">
        {socials.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{s.platform}</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={clsx(
                    "text-[10px] px-2 py-0.5 rounded-full",
                    s.active
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-white/10 text-white/40"
                  )}
                >
                  {s.active ? "Active" : "Hidden"}
                </span>
                <span className="text-[10px] text-white/40 border border-white/10 px-2 py-0.5 rounded-full truncate max-w-[200px]">
                  {s.url}
                </span>
                {s.icon && (
                  <span className="text-[10px] text-white/40 border border-white/10 px-2 py-0.5 rounded-full">
                    Icon: {s.icon}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleActive(s)}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
                title={s.active ? "Hide" : "Show"}
              >
                {s.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setEditing(s);
                  setShowForm(true);
                }}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => remove(s.id)}
                className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 hover:text-red-200 hover:bg-red-500/20 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {socials.length === 0 && <EmptyRow label="No social links yet" />}
      </div>
    </div>
  );
}

/* ------------------------------ Testimonials ------------------------------ */

function TestimonialsTab({
  testimonials,
  onError,
  onNotify,
  onRefresh,
}: {
  testimonials: Testimonial[];
  onError: (e: unknown) => void;
  onNotify: (msg: string) => void;
  onRefresh: () => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    const payload = {
      name: values.name,
      role: values.role,
      quote: values.quote,
      order: Number(values.order || 0),
      active: values.active === "on",
    };
    setBusy(true);
    try {
      if (editing) {
        await apiFetch(`/api/testimonials`, {
          method: "PUT",
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
        onNotify("Testimonial updated");
      } else {
        await apiFetch("/api/testimonials", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        onNotify("Testimonial created");
      }
      setShowForm(false);
      setEditing(null);
      onRefresh();
    } catch (err) {
      onError(err);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await apiFetch(`/api/testimonials?id=${id}`, { method: "DELETE" });
      onNotify("Testimonial deleted");
      onRefresh();
    } catch (err) {
      onError(err);
    }
  };

  const toggleActive = async (t: Testimonial) => {
    try {
      await apiFetch(`/api/testimonials`, {
        method: "PUT",
        body: JSON.stringify({ ...t, active: !t.active }),
      });
      onRefresh();
    } catch (err) {
      onError(err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Testimonials</h2>
          <p className="text-sm text-white/50">{testimonials.length} total remarks</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm((s) => !s);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-[#ff5c00] hover:bg-[#ff5c00]/90 text-white transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Close" : "Add Testimonial"}
        </button>
      </div>

      {showForm && (
        <AddForm
          title={editing ? "Edit Testimonial" : "New Testimonial"}
          onSubmit={submit}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
          busy={busy}
        >
          <Field label="Client Name">
            <input required name="name" defaultValue={editing?.name} placeholder="Angelina Jolie" className={inputCls} />
          </Field>
          <Field label="Client Role">
            <input required name="role" defaultValue={editing?.role} placeholder="Business Owner" className={inputCls} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Quote">
              <textarea required name="quote" defaultValue={editing?.quote} rows={3} placeholder="Working with Sammy was so good..." className={inputCls} />
            </Field>
          </div>
          <Field label="Order">
            <input name="order" type="number" defaultValue={editing?.order ?? 0} className={inputCls} />
          </Field>
          <label className="flex items-center gap-2 self-end pb-2 text-sm text-white/70">
            <input name="active" type="checkbox" defaultChecked={editing?.active ?? true} className="accent-[#ff5c00]" />
            Active
          </label>
        </AddForm>
      )}

      <div className="glass-panel rounded-2xl overflow-hidden">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{t.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={clsx(
                    "text-[10px] px-2 py-0.5 rounded-full",
                    t.active
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-white/10 text-white/40"
                  )}
                >
                  {t.active ? "Active" : "Hidden"}
                </span>
                <span className="text-[10px] text-white/40 border border-white/10 px-2 py-0.5 rounded-full truncate max-w-[200px]">
                  {t.role}
                </span>
              </div>
              <p className="text-xs text-white/50 mt-2 line-clamp-2">{t.quote}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleActive(t)}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
                title={t.active ? "Hide" : "Show"}
              >
                {t.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setEditing(t);
                  setShowForm(true);
                }}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => remove(t.id)}
                className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 hover:text-red-200 hover:bg-red-500/20 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {testimonials.length === 0 && <EmptyRow label="No testimonials yet" />}
      </div>
    </div>
  );
}