"use client";

import { useRef, useState, useEffect, type ChangeEvent } from "react";
import imageCompression from "browser-image-compression";
import { Camera, Loader2, X, Check, AlertCircle, Sparkles, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FoodRow } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import type { MealTime } from "@/lib/foods";
import { MEAL_TIMES } from "@/lib/foods";

const CATEGORIES = [
  "Swallows",
  "Soups & Stews",
  "Rice & Grains",
  "Proteins",
  "Breakfast & Drinks",
  "Snacks & Street Food",
  "Fast Foods",
] as const;

type ScanResult = {
  food_name: string;
  category: string;
  serving_unit: string;
  base_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  confidence_score: number;
};

type PhotoScannerProps = {
  onConfirm: (food: FoodRow, portions: number, meal: MealTime) => void;
};

const FREE_DAILY_LIMIT = 3;

export function PhotoScanner({ onConfirm }: PhotoScannerProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [meal, setMeal] = useState<MealTime>("Lunch");
  const [portions, setPortions] = useState(1);
  const [scansUsed, setScansUsed] = useState(0);
  const [isPro, setIsPro] = useState(false);

  // Editable fields
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState<string>("Swallows");
  const [editUnit, setEditUnit] = useState("");
  const [editCalories, setEditCalories] = useState("0");
  const [editProtein, setEditProtein] = useState("0");
  const [editCarbs, setEditCarbs] = useState("0");
  const [editFat, setEditFat] = useState("0");

  useEffect(() => {
    const fetchProStatus = async () => {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data } = await supabase
        .from("profiles")
        .select("is_pro")
        .eq("id", userData.user.id)
        .maybeSingle();
      setIsPro(data?.is_pro ?? false);
    };
    fetchProStatus();
  }, []);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    await processImage(file);
  }

  async function processImage(file: File) {
    setLoading(true);
    setError(null);
    setQuotaExceeded(false);
    setPreview(null);
    setManualMode(false);

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });
      const reader = new FileReader();
      const dataUrl: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(compressed);
      });

      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        setError("Please sign in to scan meals.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/scan-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, accessToken }),
      });
      const data = await res.json();

      if (data.quotaExceeded) {
        setQuotaExceeded(true);
        setError(data.error);
        setManualMode(true);
        resetEditFields();
        setEditOpen(true);
        setLoading(false);
        return;
      }

      if (data.fallback) {
        setError(data.error);
        setManualMode(true);
        resetEditFields();
        setEditOpen(true);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.error || "Failed to analyze image");
        setManualMode(true);
        resetEditFields();
        setEditOpen(true);
        setLoading(false);
        return;
      }

      const scan: ScanResult = data;
      setResult(scan);
      setScansUsed(data.scansUsed ?? 0);
      setIsPro(data.isPro ?? false);
      setEditName(scan.food_name);
      setEditCategory(
        CATEGORIES.includes(scan.category as (typeof CATEGORIES)[number])
          ? scan.category
          : "Swallows"
      );
      setEditUnit(scan.serving_unit || "serving");
      setEditCalories(String(Math.round(scan.base_calories || 0)));
      setEditProtein(String(Math.round(scan.protein_g || 0)));
      setEditCarbs(String(Math.round(scan.carbs_g || 0)));
      setEditFat(String(Math.round(scan.fat_g || 0)));
      setMeal("Lunch");
      setPortions(1);
      setEditOpen(true);
      setLoading(false);
    } catch {
      setError("Failed to process the image. You can still log your meal manually.");
      setManualMode(true);
      resetEditFields();
      setEditOpen(true);
      setLoading(false);
    }
  }

  function resetEditFields() {
    setEditName("");
    setEditCategory("Swallows");
    setEditUnit("serving");
    setEditCalories("0");
    setEditProtein("0");
    setEditCarbs("0");
    setEditFat("0");
    setMeal("Lunch");
    setPortions(1);
  }

  async function handleConfirmAdd() {
    setSaving(true);

    const supabase = createClient();
    const foodName = editName.trim() || "Unknown Dish";
    const category = editCategory;
    const servingUnit = editUnit.trim() || "serving";
    const baseCalories = parseInt(editCalories) || 0;
    const proteinG = parseFloat(editProtein) || 0;
    const carbsG = parseFloat(editCarbs) || 0;
    const fatG = parseFloat(editFat) || 0;

    const { data: existing } = await supabase
      .from("foods")
      .select("*")
      .ilike("name", foodName)
      .limit(1)
      .maybeSingle();

    let foodRow: FoodRow;

    if (existing) {
      foodRow = existing as FoodRow;
    } else {
      const { data: newFood, error: foodError } = await supabase
        .from("foods")
        .insert({
          name: foodName,
          category,
          serving_unit: servingUnit,
          base_calories: baseCalories,
          protein_g: proteinG,
          carbs_g: carbsG,
          fat_g: fatG,
          is_verified: false,
        })
        .select("*")
        .single();

      if (foodError) {
        setError("Failed to save food. Please try again.");
        setSaving(false);
        return;
      }
      foodRow = newFood as FoodRow;
    }

    onConfirm(foodRow, portions, meal);
    setSaving(false);
    setEditOpen(false);
    setResult(null);
    setManualMode(false);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  }

  function closeDialog() {
    setEditOpen(false);
    setResult(null);
    setManualMode(false);
    setError(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  }

  const scansRemaining = FREE_DAILY_LIMIT - scansUsed;

  return (
    <>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />

      <button
        type="button"
        onClick={() => cameraRef.current?.click()}
        aria-label="Snap & Log Meal"
        className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-brand-green transition-colors hover:bg-brand-green/10"
      >
        <Camera className="size-5" />
      </button>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm">
          <div className="size-16 animate-spin rounded-full border-4 border-brand-green border-t-transparent" />
          <p className="text-sm font-medium text-foreground">
            Analyzing your meal &amp; estimating nutrition...
          </p>
          {preview && (
            <img
              src={preview}
              alt="Analyzing meal"
              className="max-h-32 rounded-xl border border-border object-cover"
            />
          )}
        </div>
      )}

      {/* Error toast */}
      {error && !loading && !editOpen && (
        <div className="fixed inset-x-0 bottom-20 z-50 mx-auto max-w-sm px-4">
          <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} aria-label="Dismiss error">
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Edit & Confirm modal */}
      <Dialog open={editOpen} onOpenChange={(o) => { if (!o) closeDialog(); else setEditOpen(o); }}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {manualMode ? (
                <>
                  <AlertCircle className="size-4 text-amber-500" />
                  Log Meal Manually
                </>
              ) : (
                <>
                  <Sparkles className="size-4 text-brand-green" />
                  Edit Meal Details
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {manualMode
                ? "AI analysis wasn't available. Fill in the details below to log your meal."
                : "Review the AI-detected values and adjust anything before adding to your plate."}
            </DialogDescription>
          </DialogHeader>

          {preview && (
            <img
              src={preview}
              alt="Scanned meal"
              className="max-h-32 w-full rounded-xl border border-border object-cover"
            />
          )}

          {quotaExceeded && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
              <AlertCircle className="size-3.5 shrink-0" />
              {error}
            </div>
          )}

          {!manualMode && result && result.confidence_score < 0.5 && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
              <AlertCircle className="size-3.5 shrink-0" />
              Low confidence detection — please verify the details.
            </div>
          )}

          {!manualMode && !isPro && scansRemaining > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-secondary/60 px-3 py-1.5 text-xs text-muted-foreground">
              <span>AI scans today</span>
              <span className="font-medium tabular-nums">
                {scansUsed} / {FREE_DAILY_LIMIT} · {scansRemaining} left
              </span>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Food Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Dish name" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Serving Unit</label>
              <Input value={editUnit} onChange={(e) => setEditUnit(e.target.value)} placeholder="e.g. wrap, plate, bowl" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Meal Time</label>
              <Select value={meal} onValueChange={(v) => setMeal(v as MealTime)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {MEAL_TIMES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Portions</label>
                <Input
                  type="number"
                  min={0.5}
                  max={5}
                  step={0.5}
                  value={portions}
                  onChange={(e) => setPortions(parseFloat(e.target.value) || 1)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Calories</label>
                <Input type="number" min={0} value={editCalories} onChange={(e) => setEditCalories(e.target.value)} />
              </div>
            </div>

            {/* Macros: gated for free users */}
            <div className="relative">
              <div className={isPro ? "" : "pointer-events-none select-none blur-sm"}>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Protein (g)</label>
                    <Input type="number" min={0} value={editProtein} onChange={(e) => setEditProtein(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Carbs (g)</label>
                    <Input type="number" min={0} value={editCarbs} onChange={(e) => setEditCarbs(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Fat (g)</label>
                    <Input type="number" min={0} value={editFat} onChange={(e) => setEditFat(e.target.value)} />
                  </div>
                </div>
              </div>

              {!isPro && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <a
                    href="/pro"
                    className="flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background shadow-lg"
                  >
                    <Lock className="size-3" />
                    Unlock Macros with Pro
                  </a>
                </div>
              )}
            </div>

            <div className="rounded-xl bg-secondary/60 p-3 text-center">
              <span className="text-2xl font-bold text-brand-green tabular-nums">
                {Math.round((parseInt(editCalories) || 0) * portions)}
              </span>
              <span className="text-sm text-muted-foreground"> kcal total</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              className="w-full bg-brand-orange text-white hover:bg-brand-orange/90"
              onClick={handleConfirmAdd}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check data-icon="inline-start" />
              )}
              Confirm &amp; Add to Plate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
