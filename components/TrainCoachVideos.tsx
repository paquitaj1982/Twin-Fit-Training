"use client";

import React, { useEffect, useMemo, useState } from "react";
import { db, storage, auth } from "../firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { Upload, Video, Trash2, Edit2, X, Save, Lock, Users, ShieldAlert, Loader2 } from "lucide-react";

function isOwner(user: any) {
  return user?.uid && (user.uid === process.env.NEXT_PUBLIC_OWNER_UID || user.displayName === "Twin" || user.email?.includes("admin"));
}

export default function TrainCoachVideos({ currentUser }: { currentUser: any }) {
  const [user, setUser] = useState<any>(currentUser || null);
  const [videos, setVideos] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Weight Training");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState("public");

  // Edit state
  const [editing, setEditing] = useState<any>(null); // video doc object
  const [replaceFile, setReplaceFile] = useState<File | null>(null);

  useEffect(() => {
    if (!auth || !auth.onAuthStateChanged) return;
    const unsub = auth.onAuthStateChanged(setUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    // Safety check for Firestore mock state
    if (!db || typeof db.collection !== 'function') {
        console.info("Firestore is in mock mode - video archive disabled.");
        return;
    }

    try {
        const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(q, (snap) => {
          setVideos(snap.docs.map((d: any) => ({ id: d.id, ...d.data() })));
        }, (err) => {
          console.warn("Firestore access error - check security rules or config:", err);
        });
        return () => unsub();
    } catch (e) {
        console.warn("Firestore listener could not be established:", e);
    }
  }, []);

  const owner = useMemo(() => isOwner(user) || currentUser?.isTrainer, [user, currentUser]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!owner) return alert("Owner access required.");
    if (!file) return alert("Choose a video file.");
    if (!title.trim()) return alert("Add a title.");
    
    if (!db || typeof db.collection !== 'function') {
        return alert("Firebase is not configured. Cloud upload is disabled in this environment.");
    }

    if (!file.type.startsWith("video/")) return alert("File must be a video.");
    const maxMB = 500;
    if (file.size > maxMB * 1024 * 1024) return alert(`Max file size is ${maxMB}MB.`);

    setUploading(true);
    setProgress(0);

    try {
      const docRef = await addDoc(collection(db, "videos"), {
        title: title.trim(),
        description: description.trim(),
        category,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        visibility,
        ownerUid: user?.uid || "twin-uid-master",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        storagePath: "", 
        downloadURL: "", 
      });

      const videoId = docRef.id;
      const path = `trainerVideos/${user?.uid || 'twin-uid-master'}/${videoId}-${file.name}`;
      const sRef = storageRef(storage, path);

      const task = uploadBytesResumable(sRef, file, { contentType: file.type });

      task.on(
        "state_changed",
        (snap) => {
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          setProgress(pct);
        },
        (err) => {
          console.error(err);
          setUploading(false);
          alert("Upload failed. Ensure Storage is initialized.");
        },
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          await updateDoc(doc(db, "videos", videoId), {
            storagePath: path,
            downloadURL: url,
            updatedAt: serverTimestamp(),
          });

          setFile(null);
          setTitle("");
          setDescription("");
          setTags("");
          setVisibility("public");
          setCategory("Weight Training");
          setUploading(false);
          setProgress(0);
        }
      );
    } catch (err) {
      console.error(err);
      setUploading(false);
      alert("Error initiating upload.");
    }
  }

  async function handleSaveEdit() {
    if (!owner) return alert("Owner access required.");
    if (!editing) return;
    if (!db || typeof db.collection !== 'function') return;

    await updateDoc(doc(db, "videos", editing.id), {
      title: editing.title?.trim() || "",
      description: editing.description?.trim() || "",
      category: editing.category || "Weight Training",
      visibility: editing.visibility || "public",
      tags: Array.isArray(editing.tags) ? editing.tags : [],
      updatedAt: serverTimestamp(),
    });

    if (replaceFile) {
      if (!replaceFile.type.startsWith("video/")) return alert("Replacement must be a video.");
      const newPath = `trainerVideos/${user?.uid || 'twin-uid-master'}/${editing.id}-${replaceFile.name}`;
      const newRef = storageRef(storage, newPath);

      setUploading(true);
      setProgress(0);

      const task = uploadBytesResumable(newRef, replaceFile, { contentType: replaceFile.type });

      task.on(
        "state_changed",
        (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        (err) => {
          console.error(err);
          setUploading(false);
          alert("Replacement upload failed.");
        },
        async () => {
          const newUrl = await getDownloadURL(task.snapshot.ref);

          await updateDoc(doc(db, "videos", editing.id), {
            storagePath: newPath,
            downloadURL: newUrl,
            updatedAt: serverTimestamp(),
          });

          try {
            if (editing.storagePath) {
              await deleteObject(storageRef(storage, editing.storagePath));
            }
          } catch (e) {
            console.warn("Old video delete failed (non-blocking):", e);
          }

          setReplaceFile(null);
          setUploading(false);
          setProgress(0);
          setEditing(null);
        }
      );
    } else {
      setEditing(null);
    }
  }

  async function handleDelete(video: any) {
    if (!owner) return alert("Owner access required.");
    if (!confirm("Twin Fit Authority: Delete this video blueprint forever?")) return;
    if (!db || typeof db.collection !== 'function') return;

    try {
      if (video.storagePath) {
        await deleteObject(storageRef(storage, video.storagePath));
      }
    } catch (e) {
      console.warn("Storage delete failed (continuing):", e);
    }

    await deleteDoc(doc(db, "videos", video.id));
  }

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-[2.5rem] p-8 mt-12 animate-fade-in shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-brand-red rounded-xl">
               <Video className="w-6 h-6 text-white" />
          </div>
          <div>
              <h2 className="text-3xl font-display font-bold uppercase tracking-tight leading-none">Coach Video Manager</h2>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] italic">Archive and deploy elite video blueprints</p>
          </div>
      </div>

      {!user && !currentUser && (
        <div className="bg-neutral-950 border border-neutral-800 p-6 rounded-2xl flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-neutral-600" />
            <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Login required to access trainer archives.</p>
        </div>
      )}

      {(user || currentUser) && owner && (
        <form onSubmit={handleUpload} className="bg-neutral-950 border border-neutral-800 p-8 rounded-3xl mb-12 space-y-6 shadow-inner">
          <h3 className="text-xl font-display font-bold uppercase text-brand-red tracking-tight">Deploy New Blueprint</h3>

          <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Video File (9:16)</label>
                    <div className="relative group">
                        <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            disabled={uploading}
                            className="hidden"
                            id="video-upload-input"
                        />
                        <label 
                            htmlFor="video-upload-input"
                            className="w-full h-32 bg-neutral-900 border-2 border-dashed border-neutral-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer group-hover:border-brand-red transition-all"
                        >
                            {file ? (
                                <div className="flex items-center gap-2 text-brand-red font-bold">
                                    <Video className="w-6 h-6" />
                                    <span className="text-xs truncate max-w-[150px]">{file.name}</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-neutral-600 group-hover:text-white transition-colors">
                                    <Upload className="w-8 h-8 mb-2" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Select Asset</span>
                                </div>
                            )}
                        </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Session Title</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={uploading}
                        placeholder="e.g. Advanced Bench Setup"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-white focus:border-brand-red outline-none font-bold placeholder-neutral-700"
                    />
                  </div>
              </div>

              <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Coaching Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={uploading}
                        placeholder="Key coaching cues..."
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-white focus:border-brand-red outline-none font-medium h-[132px] resize-none placeholder-neutral-700"
                    />
                  </div>
              </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Category</label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={uploading}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-white font-bold outline-none"
                >
                    <option>Weight Training</option>
                    <option>Upper Body</option>
                    <option>Lower Body</option>
                    <option>Full Body</option>
                    <option>Core</option>
                    <option>Conditioning</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Visibility Tier</label>
                <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    disabled={uploading}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-white font-bold outline-none"
                >
                    <option value="public">Public (Everyone)</option>
                    <option value="clients">Clients Only</option>
                    <option value="private">Private (Twin Only)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Tags</label>
                <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    disabled={uploading}
                    placeholder="squat, form, power"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-white focus:border-brand-red outline-none font-bold"
                />
              </div>
          </div>

          {uploading && (
            <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-brand-red">Transmitting Blueprint...</span>
                    <span>{progress}%</span>
                </div>
                <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-brand-red h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || !file || !title}
            className="w-full bg-brand-red text-white py-4 rounded-2xl font-display font-bold text-xl hover:bg-red-700 disabled:opacity-50 transition-all shadow-xl flex items-center justify-center gap-2"
          >
            {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
            UPLOAD ARCHIVE
          </button>
        </form>
      )}

      {/* Video list */}
      <div className="grid gap-6">
        {videos.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-neutral-800 rounded-3xl">
                <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-[0.2em]">No blueprints archived in cloud storage.</p>
            </div>
        ) : (
            videos.map((v) => (
              <div key={v.id} className="bg-neutral-950 border border-neutral-800 p-6 rounded-3xl group hover:border-brand-red transition-all shadow-xl">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-display font-bold text-2xl uppercase text-white leading-none">{v.title || "Untitled Blueprint"}</h3>
                        {v.visibility === 'private' && <Lock className="w-4 h-4 text-neutral-600" />}
                    </div>
                    <p className="text-sm text-neutral-400 font-medium mb-4 line-clamp-2">{v.description || "No description provided."}</p>
                    <div className="flex flex-wrap gap-2">
                        <span className="text-[9px] font-bold text-brand-red uppercase border border-brand-red/30 px-2 py-0.5 rounded-md">{v.category}</span>
                        <span className="text-[9px] font-bold text-neutral-500 uppercase bg-neutral-900 px-2 py-0.5 rounded-md">{v.visibility}</span>
                        {v.tags?.map((tag: string) => (
                            <span key={tag} className="text-[9px] font-bold text-neutral-600 uppercase bg-neutral-900/50 px-2 py-0.5 rounded-md">#{tag}</span>
                        ))}
                    </div>
                  </div>

                  <div className="w-full md:w-64 aspect-video bg-neutral-900 rounded-2xl overflow-hidden relative shadow-inner">
                    {v.downloadURL ? (
                      <video controls className="w-full h-full object-cover">
                        <source src={v.downloadURL} />
                      </video>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-neutral-600">
                          <Loader2 className="w-6 h-6 animate-spin mb-2" />
                          <span className="text-[8px] font-bold uppercase tracking-widest">Processing...</span>
                      </div>
                    )}
                  </div>
                </div>

                {owner && (
                    <div className="mt-6 pt-6 border-t border-neutral-900 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditing({ ...v })}
                        className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors border border-neutral-800"
                      >
                        <Edit2 className="w-4 h-4" /> EDIT
                      </button>
                      <button
                        onClick={() => handleDelete(v)}
                        className="flex items-center gap-2 bg-neutral-900 text-red-500 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-950/20 transition-colors border border-red-900/30"
                      >
                        <Trash2 className="w-4 h-4" /> DELETE
                      </button>
                    </div>
                )}
              </div>
            ))
        )}
      </div>

      {/* Edit Modal */}
      {editing && owner && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/98 backdrop-blur-2xl animate-fade-in">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-2xl rounded-[3rem] p-10 relative max-h-[90vh] overflow-y-auto no-scrollbar shadow-[0_0_150px_rgba(220,38,38,0.2)]">
            <button onClick={() => { setEditing(null); setReplaceFile(null); }} className="absolute top-8 right-8 text-neutral-500 hover:text-white p-2">
                <X className="w-8 h-8" />
            </button>
            
            <h3 className="text-4xl font-display font-bold uppercase tracking-tight text-brand-red mb-8">Refine Blueprint</h3>

            <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Title</label>
                        <input
                        value={editing.title || ""}
                        onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-white font-bold outline-none focus:border-brand-red"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Description</label>
                        <textarea
                        value={editing.description || ""}
                        onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-white font-medium h-48 resize-none outline-none focus:border-brand-red"
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Category</label>
                        <select
                        value={editing.category || "Weight Training"}
                        onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-white font-bold outline-none"
                        >
                            <option>Weight Training</option>
                            <option>Upper Body</option>
                            <option>Lower Body</option>
                            <option>Full Body</option>
                            <option>Core</option>
                            <option>Conditioning</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Visibility</label>
                        <select
                        value={editing.visibility || "public"}
                        onChange={(e) => setEditing({ ...editing, visibility: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-white font-bold outline-none"
                        >
                        <option value="public">Public</option>
                        <option value="clients">Clients Only</option>
                        <option value="private">Private</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Replace Video (Optional)</label>
                        <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setReplaceFile(e.target.files?.[0] || null)}
                        className="block w-full text-xs text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-neutral-800 file:text-white hover:file:bg-brand-red"
                        />
                    </div>
                </div>
            </div>

            {uploading && (
                <div className="mt-8 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-brand-red">
                        <span>Updating Asset...</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-neutral-950 h-1 rounded-full overflow-hidden">
                        <div className="bg-brand-red h-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}

            <div className="flex gap-4 mt-12 pt-6 border-t border-neutral-800">
              <button
                onClick={() => { setEditing(null); setReplaceFile(null); }}
                className="flex-1 py-4 bg-neutral-800 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-neutral-700 transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={uploading}
                className="flex-1 py-4 bg-brand-red text-white rounded-2xl font-display font-bold text-xl tracking-wide hover:bg-red-700 shadow-xl transition-all flex items-center justify-center gap-2"
              >
                {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-5 h-5" />}
                COMMIT CHANGES
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}