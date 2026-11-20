ALTER POLICY "Deny direct insert to product-images" ON storage.objects WITH CHECK (false);
ALTER POLICY "Deny direct update to product-images" ON storage.objects USING (false) WITH CHECK (false);
ALTER POLICY "Deny direct delete to product-images" ON storage.objects USING (false);