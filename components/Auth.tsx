"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { LogIn, LogOut, User, Trash2, ChevronDown, AlertTriangle } from "lucide-react";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) alert(error.message);
    setLoading(false);
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await supabase.auth.signOut();
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/delete-account", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      await supabase.auth.signOut();
      setShowDeleteModal(false);
    } catch (err: any) {
      alert("Failed to delete account: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="relative z-50" ref={menuRef}>
        {user ? (
          <>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="glass rounded-full px-4 py-2 flex items-center gap-2 hover:bg-white/20 transition-all text-sm"
            >
              <User size={16} />
              <span className="max-w-[120px] truncate">{user.email?.split("@")[0]}</span>
              <ChevronDown size={14} className={`opacity-50 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
            </button>

            {menuOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 glass rounded-2xl overflow-hidden shadow-xl">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/10 transition-all"
                >
                  <LogOut size={15} className="opacity-70" />
                  Sign Out
                </button>
                <div className="border-t border-white/10" />
                <button
                  onClick={() => { setMenuOpen(false); setShowDeleteModal(true); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 size={15} />
                  Delete Account
                </button>
              </div>
            )}
          </>
        ) : (
          <button
            onClick={handleLogin}
            disabled={loading}
            className="glass rounded-full px-4 py-2 flex items-center gap-2 hover:bg-white/20 transition-all text-sm"
          >
            <LogIn size={16} />
            <span>{loading ? "Connecting..." : "Sign in with Google"}</span>
          </button>
        )}
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-red-500/20">
            <div className="flex justify-center mb-4">
              <div className="bg-red-500/20 rounded-full p-4">
                <AlertTriangle size={32} className="text-red-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Delete Account?</h2>
            <p className="text-white/60 text-sm mb-6 leading-relaxed">
              This will permanently delete your account and all saved locations. This action{" "}
              <span className="text-red-400 font-semibold">cannot be undone</span>.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 glass rounded-2xl py-3 text-sm font-semibold hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 bg-red-500/80 hover:bg-red-500 rounded-2xl py-3 text-sm font-semibold transition-all disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
