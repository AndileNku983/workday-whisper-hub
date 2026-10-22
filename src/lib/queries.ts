import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Task } from "./tasks";

export const tasksQuery = queryOptions({
  queryKey: ["tasks"],
  queryFn: async (): Promise<Task[]> => {
    const { data, error } = await supabase.from("tasks").select("*").order("due_date", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
});

export const profileQuery = queryOptions({
  queryKey: ["profile"],
  queryFn: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return null;
    const { data, error } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
    if (error) throw error;
    return data ? { ...data, email: u.user.email ?? "" } : null;
  },
});
