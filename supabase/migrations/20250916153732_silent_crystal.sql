@@ .. @@
 create policy "Users can update own profile"
   on profiles for update
   using (auth.uid() = id);
 
+create policy "Users can insert own profile"
+  on profiles for insert
+  with check (auth.uid() = id);
+
 create policy "Users can read own trips"