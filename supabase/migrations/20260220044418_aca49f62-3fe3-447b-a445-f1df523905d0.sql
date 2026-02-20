
-- Block all direct client writes to products table
-- All writes go through admin-products edge function using service role
CREATE POLICY "Block direct inserts" ON public.products FOR INSERT WITH CHECK (false);
CREATE POLICY "Block direct updates" ON public.products FOR UPDATE USING (false);
CREATE POLICY "Block direct deletes" ON public.products FOR DELETE USING (false);
