
-- Block all direct INSERT on storage.objects for product-images bucket
CREATE POLICY "Deny direct insert to product-images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id != 'product-images');

-- Block all direct UPDATE on storage.objects for product-images bucket
CREATE POLICY "Deny direct update to product-images"
  ON storage.objects FOR UPDATE
  USING (bucket_id != 'product-images');

-- Block all direct DELETE on storage.objects for product-images bucket
CREATE POLICY "Deny direct delete to product-images"
  ON storage.objects FOR DELETE
  USING (bucket_id != 'product-images');
