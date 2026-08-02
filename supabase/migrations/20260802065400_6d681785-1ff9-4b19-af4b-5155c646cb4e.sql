
CREATE POLICY "Authenticated can view listing images" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'listings');
CREATE POLICY "Users upload own listing images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'listings' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users update own listing images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'listings' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete own listing images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'listings' AND (storage.foldername(name))[1] = auth.uid()::text);
