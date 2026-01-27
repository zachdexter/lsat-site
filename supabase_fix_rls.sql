-- Fix RLS policies for profiles table
-- This creates a helper function that can check admin status without RLS blocking it

-- Step 1: Drop all existing policies
drop policy if exists "read own profile" on public.profiles;
drop policy if exists "Users can read own profile or admins read all" on public.profiles;
drop policy if exists "Admins can read all profiles" on public.profiles;
drop policy if exists "profiles_select_policy" on public.profiles;

-- Step 2: Create a helper function that checks if a user is an admin
-- This function uses security definer to bypass RLS
create or replace function public.is_admin(user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from public.profiles
    where id = user_id and role = 'admin'
  );
end;
$$;

-- Step 3: Create the select policy using the helper function
create policy "profiles_select_policy"
on public.profiles
for select
to authenticated
using (
  -- Users can always read their own profile
  auth.uid() = id
  OR
  -- Admins can read all profiles (using the helper function to avoid recursion)
  public.is_admin(auth.uid())
);
