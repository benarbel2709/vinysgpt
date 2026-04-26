import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { invalidateExerciseVideoCache } from "@/lib/exerciseVideoUrl";
import { Loader2, Upload, CheckCircle2, ShieldAlert, Search, Trash2 } from "lucide-react";

type VideoRow = {
  id: string;
  exercise_id: string;
  storage_path: string;
  duration_seconds: number | null;
  quality: string | null;
  is_active: boolean;
  created_at: string;
};

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

export default function AdminVideos() {
  const { user } = useAuthContext();
  const { state } = useApp();
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<VideoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    (async () => {
      const { data } = await (supabase.rpc as any)("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      setIsAdmin(!!data);
      if (data) await refresh();
      else setLoading(false);
    })();
  }, [user, navigate]);

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("exercise_videos")
      .select("id, exercise_id, storage_path, duration_seconds, quality, is_active, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Failed to load videos", description: error.message, variant: "destructive" });
    } else {
      setRows(data ?? []);
    }
    setLoading(false);
  };

  const exerciseMap = useMemo(() => {
    const m = new Map<string, { id: string; name_he: string; category: string }>();
    for (const ex of state.exerciseLibrary) {
      m.set(ex.id, { id: ex.id, name_he: ex.name_he, category: ex.category });
    }
    return m;
  }, [state.exerciseLibrary]);

  const uploadedByExercise = useMemo(() => {
    const m = new Map<string, VideoRow>();
    for (const r of rows) {
      if (r.is_active) m.set(r.exercise_id, r);
    }
    return m;
  }, [rows]);

  const exercises = useMemo(() => {
    const list = Array.from(exerciseMap.values());
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter(
      (e) => e.id.toLowerCase().includes(q) || e.name_he.toLowerCase().includes(q),
    );
  }, [exerciseMap, search]);

  const handleUpload = async (exerciseId: string, file: File) => {
    if (file.size > MAX_BYTES) {
      toast({
        title: "File too large",
        description: `Max 50 MB. This file is ${(file.size / 1024 / 1024).toFixed(1)} MB.`,
        variant: "destructive",
      });
      return;
    }
    setUploadingFor(exerciseId);
    try {
      const ext = file.name.split(".").pop() || "mp4";
      const path = `${exerciseId}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("exercise-videos")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;

      // Deactivate any prior video for this exercise (unique-active index requires this)
      await supabase
        .from("exercise_videos")
        .update({ is_active: false })
        .eq("exercise_id", exerciseId)
        .eq("is_active", true);

      const { error: insErr } = await supabase.from("exercise_videos").insert({
        exercise_id: exerciseId,
        storage_path: path,
        uploaded_by: user?.id,
        is_active: true,
      });
      if (insErr) throw insErr;

      invalidateExerciseVideoCache();
      toast({ title: "Uploaded", description: `${exerciseId} ✓` });
      await refresh();
    } catch (e: any) {
      toast({
        title: "Upload failed",
        description: e?.message ?? "Unknown error",
        variant: "destructive",
      });
    } finally {
      setUploadingFor(null);
    }
  };

  const handleDelete = async (row: VideoRow) => {
    if (!confirm(`Remove video for ${row.exercise_id}?`)) return;
    const { error: delObj } = await supabase.storage
      .from("exercise-videos")
      .remove([row.storage_path]);
    if (delObj) {
      toast({ title: "Storage delete failed", description: delObj.message, variant: "destructive" });
      return;
    }
    const { error: delRow } = await supabase.from("exercise_videos").delete().eq("id", row.id);
    if (delRow) {
      toast({ title: "Row delete failed", description: delRow.message, variant: "destructive" });
      return;
    }
    invalidateExerciseVideoCache();
    toast({ title: "Removed", description: row.exercise_id });
    await refresh();
  };

  if (isAdmin === null || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="max-w-md mx-auto py-24 text-center space-y-4">
          <ShieldAlert className="w-10 h-10 mx-auto text-muted-foreground" />
          <h1 className="text-xl font-medium">Admin only</h1>
          <p className="text-sm text-muted-foreground">
            You need an admin role to manage exercise videos.
          </p>
        </div>
      </Layout>
    );
  }

  const totalUploaded = uploadedByExercise.size;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-medium">Exercise videos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload one MP4 per exercise. Max 50 MB. Recommended: 720p H.264, ~1.5 Mbps.
          </p>
          <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
            <Badge variant="secondary">{totalUploaded} / {exerciseMap.size} uploaded</Badge>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by exercise ID or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="space-y-2">
          {exercises.map((ex) => {
            const existing = uploadedByExercise.get(ex.id);
            const isUploading = uploadingFor === ex.id;
            return (
              <Card key={ex.id} className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{ex.name_he}</span>
                    {existing && <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">
                    {ex.id} · {ex.category}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Label
                    htmlFor={`up-${ex.id}`}
                    className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm hover:bg-accent"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {existing ? "Replace" : "Upload"}
                  </Label>
                  <Input
                    id={`up-${ex.id}`}
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm"
                    className="hidden"
                    disabled={isUploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(ex.id, f);
                      e.target.value = "";
                    }}
                  />
                  {existing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(existing)}
                      title="Remove video"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
          {exercises.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-12">
              No exercises match "{search}".
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}
