"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { LogIn, LogOut, User } from "lucide-react";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Check current session
  useState(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  });

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) alert(error.message);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="fixed top-6 left-6 z-50">
      {user ? (
        <button 
          onClick={handleLogout}
          className="glass rounded-full px-4 py-2 flex items-center gap-2 hover:bg-white/20 transition-all text-sm"
        >
          <User size={16} />
          <span>{user.email?.split('@')[0]}</span>
          <LogOut size={16} className="ml-2 opacity-50" />
        </button>
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
  );
}
