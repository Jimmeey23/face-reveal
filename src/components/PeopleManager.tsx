import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Baby, Camera, ImagePlus, Loader2, Plus, Trash2, UserRound, AlertTriangle } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";
import type { Person } from "../types";
import { compressImageFile, uid } from "../lib/image";
import { Modal } from "./ui";
import { cn } from "../utils/cn";

interface Props {
  open: boolean;
  onClose: () => void;
  people: Person[];
  disabledIds: string[];
  onToggleDisabled: (id: string) => void;
  onAdd: (p: Person) => void;
  onDelete: (id: string) => void;
  storageError: string | null;
}

/* ---------------- Dropzone ---------------- */
function Dropzone({
  label,
  icon,
  value,
  onFile,
}: {
  label: string;
  icon: React.ReactNode;
  value: string | null;
  onFile: (f: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      className={cn(
        "group relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-dashed transition-all",
        over ? "scale-[1.02] border-brand-1 bg-white/10" : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10",
        value && "border-solid border-white/30",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
      {value ? (
        <>
          <img src={value} alt={label} className="h-full w-full object-cover" />
          <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/55 py-1.5 text-[11px] font-bold text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
            <Camera size={12} /> Replace
          </span>
        </>
      ) : (
        <span className="flex h-full flex-col items-center justify-center gap-2 p-3 text-center text-white/60">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white/80">{icon}</span>
          <span className="text-sm font-bold text-white/85">{label}</span>
          <span className="text-[11px]">Click or drop a photo</span>
        </span>
      )}
    </button>
  );
}

/* ---------------- Manager ---------------- */
export function PeopleManager({ open, onClose, people, disabledIds, onToggleDisabled, onAdd, onDelete, storageError }: Props) {
  const [name, setName] = useState("");
  const [baby, setBaby] = useState<string | null>(null);
  const [adult, setAdult] = useState<string | null>(null);
  const [funFact, setFunFact] = useState("");
  const [years, setYears] = useState("");
  const [busy, setBusy] = useState<"baby" | "adult" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleFile = async (which: "baby" | "adult", file: File) => {
    setBusy(which);
    setError(null);
    try {
      const data = await compressImageFile(file);
      if (which === "baby") setBaby(data);
      else setAdult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't process that image.");
    } finally {
      setBusy(null);
    }
  };

  const reset = () => {
    setName("");
    setBaby(null);
    setAdult(null);
    setFunFact("");
    setYears("");
    setError(null);
  };

  const submit = () => {
    if (!name.trim()) return setError("Give this cutie a name.");
    if (!baby) return setError("Add a baby photo.");
    if (!adult) return setError("Add a grown-up photo.");
    const y = parseInt(years, 10);
    onAdd({
      id: uid("custom"),
      name: name.trim(),
      babyImage: baby,
      adultImage: adult,
      funFact: funFact.trim() || undefined,
      yearsApart: Number.isFinite(y) && y > 0 ? y : undefined,
      custom: true,
    });
    reset();
    setShowForm(false);
  };

  const activeCount = people.filter((p) => !disabledIds.includes(p.id)).length;

  return (
    <Modal open={open} onClose={onClose} size="lg" title={<span className="flex items-center gap-2">👥 People in the deck</span>}>
      <div className="space-y-5 p-6">
        {/* Add form */}
        <div className="rounded-3xl border border-white/10 bg-white/5">
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="flex w-full items-center justify-between px-5 py-4 text-left"
          >
            <span className="flex items-center gap-3">
              <span className="brand-gradient grid h-10 w-10 place-items-center rounded-xl shadow-lg">
                <Plus size={18} strokeWidth={3} />
              </span>
              <span>
                <span className="block font-display text-lg font-semibold">Add your own baby</span>
                <span className="block text-xs text-white/50">Upload a baby photo + a recent photo. Stored privately in this browser.</span>
              </span>
            </span>
            <span className={cn("text-white/50 transition-transform", showForm && "rotate-90")}>
              <ArrowRight size={18} />
            </span>
          </button>
          <AnimatePresence initial={false}>
            {showForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-4 border-t border-white/10 px-5 py-5">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                    <div className="relative">
                      <Dropzone label="Baby photo" icon={<Baby size={22} />} value={baby} onFile={(f) => handleFile("baby", f)} />
                      {busy === "baby" && (
                        <span className="absolute inset-0 grid place-items-center rounded-2xl bg-black/50">
                          <Loader2 className="animate-spin" />
                        </span>
                      )}
                    </div>
                    <div className="hidden text-white/40 sm:block">
                      <ArrowRight size={22} />
                    </div>
                    <div className="relative">
                      <Dropzone label="Grown-up photo" icon={<UserRound size={22} />} value={adult} onFile={(f) => handleFile("adult", f)} />
                      {busy === "adult" && (
                        <span className="absolute inset-0 grid place-items-center rounded-2xl bg-black/50">
                          <Loader2 className="animate-spin" />
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[1fr_7rem]">
                    <label className="block">
                      <span className="mb-1 block text-xs font-bold text-white/60">Name *</span>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Grandma Rosa"
                        maxLength={40}
                        className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm font-semibold outline-none placeholder:text-white/30 focus:border-brand-1/70 focus:bg-white/15"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-bold text-white/60">Years apart</span>
                      <input
                        value={years}
                        onChange={(e) => setYears(e.target.value.replace(/[^\d]/g, ""))}
                        inputMode="numeric"
                        placeholder="25"
                        maxLength={3}
                        className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm font-semibold outline-none placeholder:text-white/30 focus:border-brand-1/70 focus:bg-white/15"
                      />
                    </label>
                  </div>
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-white/60">Fun fact (shown after the reveal)</span>
                    <input
                      value={funFact}
                      onChange={(e) => setFunFact(e.target.value)}
                      placeholder="Still makes that exact face when cake appears."
                      maxLength={120}
                      className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm font-semibold outline-none placeholder:text-white/30 focus:border-brand-1/70 focus:bg-white/15"
                    />
                  </label>
                  {error && (
                    <p className="flex items-center gap-2 rounded-xl bg-rose-500/15 px-3 py-2 text-sm font-bold text-rose-200">
                      <AlertTriangle size={16} /> {error}
                    </p>
                  )}
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        reset();
                        setShowForm(false);
                      }}
                      className="rounded-xl px-4 py-2.5 text-sm font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={submit}
                      className="brand-gradient flex items-center gap-2 rounded-xl px-5 py-2.5 font-display text-sm font-bold shadow-lg transition hover:brightness-110 active:scale-95"
                    >
                      <ImagePlus size={16} /> Add to deck
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {storageError && (
          <p className="flex items-center gap-2 rounded-xl bg-amber-500/15 px-3 py-2 text-sm font-bold text-amber-200">
            <AlertTriangle size={16} /> {storageError}
          </p>
        )}

        {/* List */}
        <div>
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-[11px] font-black tracking-[0.18em] text-white/45 uppercase">
              {activeCount} of {people.length} in the deck
            </span>
            <span className="text-[11px] text-white/40">Untick to skip someone</span>
          </div>
          <ul className="space-y-2">
            {people.map((p) => {
              const enabled = !disabledIds.includes(p.id);
              return (
                <motion.li
                  layout
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2.5 transition-opacity",
                    !enabled && "opacity-50",
                  )}
                >
                  <label className="flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={() => onToggleDisabled(p.id)}
                      className="peer sr-only"
                      aria-label={`Include ${p.name}`}
                    />
                    <span className="grid h-6 w-6 place-items-center rounded-lg border border-white/25 bg-white/10 text-transparent transition peer-checked:border-transparent peer-checked:bg-[image:linear-gradient(120deg,var(--c1),var(--c2))] peer-checked:text-white">
                      ✓
                    </span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <img src={p.babyImage} alt="" className="h-12 w-12 rounded-xl object-cover ring-1 ring-white/15" />
                    <ArrowRight size={14} className="text-white/35" />
                    <img src={p.adultImage} alt="" className="h-12 w-12 rounded-xl object-cover ring-1 ring-white/15" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-display text-base font-semibold">{p.name}</span>
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10px] font-black tracking-wider uppercase",
                          p.custom ? "bg-brand-1/25 text-white" : "bg-white/10 text-white/60",
                        )}
                      >
                        {p.custom ? "Yours" : "Sample"}
                      </span>
                    </div>
                    {p.funFact && <p className="truncate text-xs text-white/50">{p.funFact}</p>}
                  </div>
                  {p.custom && (
                    <button
                      type="button"
                      onClick={() => onDelete(p.id)}
                      aria-label={`Delete ${p.name}`}
                      className="grid h-9 w-9 place-items-center rounded-xl text-white/50 transition hover:bg-rose-500/20 hover:text-rose-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>
    </Modal>
  );
}
