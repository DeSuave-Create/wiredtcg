import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentSection from '@/components/ContentSection';
import ElectricProgressBar from '@/components/ElectricProgressBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Upload, Lock, Eye, EyeOff, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  card_color: string;
  active: boolean;
  sort_order: number;
}

const AdminProducts = () => {
  const { toast } = useToast();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    card_color: 'primary',
    active: true,
    sort_order: 0,
  });

  const adminFetch = async (method: string, body?: any, action?: string) => {
    const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-products`);
    if (action) url.searchParams.set('action', action);

    const res = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request failed');
    }
    return res.json();
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      await adminFetch('GET');
      setAuthenticated(true);
      toast({ title: 'Authenticated', description: 'Welcome, admin!' });
      loadProducts();
    } catch {
      toast({ title: 'Access Denied', description: 'Incorrect password.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await adminFetch('GET');
      setProducts(data);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-products`);
      url.searchParams.set('action', 'upload-image');

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'x-admin-password': password },
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setForm(prev => ({ ...prev, image_url: data.url }));
      toast({ title: 'Image uploaded!' });
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e.message, variant: 'destructive' });
    } finally {
      setUploadingImage(false);
    }
  };

  const resetForm = () => {
    setForm({ name: '', description: '', price: 0, image_url: '', card_color: 'primary', active: true, sort_order: 0 });
    setEditingProduct(null);
    setIsCreating(false);
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setIsCreating(false);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      image_url: product.image_url || '',
      card_color: product.card_color,
      active: product.active,
      sort_order: product.sort_order,
    });
  };

  const startCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);
      if (editingProduct) {
        await adminFetch('PUT', { id: editingProduct.id, ...form });
        toast({ title: 'Product updated!' });
      } else {
        await adminFetch('POST', form);
        toast({ title: 'Product created!' });
      }
      resetForm();
      loadProducts();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await adminFetch('DELETE', { id });
      toast({ title: 'Product deleted' });
      loadProducts();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 flex justify-center flex-grow">
          <div className="w-full max-w-md">
            <ContentSection title="Admin Login" glowEffect>
              <div className="space-y-4">
                <Lock className="h-12 w-12 text-green-600 mx-auto" />
                <p className="text-center text-muted-foreground">Enter admin password to manage products</p>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Admin password"
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button onClick={handleLogin} className="w-full" disabled={loading}>
                  {loading ? 'Verifying...' : 'Access Admin Panel'}
                </Button>
              </div>
            </ContentSection>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-8 flex justify-center flex-grow">
        <div className="w-full max-w-6xl space-y-6">
          <ContentSection title="Product Management" glowEffect>
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">{products.length} product{products.length !== 1 ? 's' : ''}</p>
              <Button onClick={startCreate} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" /> Add Product
              </Button>
            </div>
          </ContentSection>

          <ElectricProgressBar />

          {/* Product Form */}
          {(isCreating || editingProduct) && (
            <ContentSection title={editingProduct ? 'Edit Product' : 'New Product'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label>Name *</Label>
                    <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Product name" />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Product description" rows={3} />
                  </div>
                  <div>
                    <Label>Price ($)</Label>
                    <Input type="number" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} />
                  </div>
                  <div>
                    <Label>Card Color</Label>
                    <Select value={form.card_color} onValueChange={v => setForm(p => ({ ...p, card_color: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Green</SelectItem>
                        <SelectItem value="secondary">Blue</SelectItem>
                        <SelectItem value="destructive">Red</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Sort Order</Label>
                    <Input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={form.active} onCheckedChange={v => setForm(p => ({ ...p, active: v }))} />
                    <Label>Active (visible in shop)</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Product Image</Label>
                    <div className="border-2 border-dashed border-muted rounded-xl p-4 text-center space-y-3">
                      {form.image_url ? (
                        <img src={form.image_url} alt="Preview" className="w-full max-h-48 object-contain rounded-lg" />
                      ) : (
                        <div className="h-32 flex items-center justify-center text-muted-foreground">No image</div>
                      )}
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}>
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      </Button>
                      <div>
                        <Label className="text-xs text-muted-foreground">Or paste URL:</Label>
                        <Input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." className="mt-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" /> {editingProduct ? 'Update' : 'Create'} Product
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4 mr-2" /> Cancel
                </Button>
              </div>
            </ContentSection>
          )}

          {/* Product List */}
          <ContentSection title="All Products">
            {loading && products.length === 0 ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : products.length === 0 ? (
              <p className="text-center text-muted-foreground">No products yet. Click "Add Product" to get started.</p>
            ) : (
              <div className="space-y-3">
                {products.map(product => (
                  <div key={product.id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${product.active ? 'border-green-600/50' : 'border-muted opacity-60'} bg-gray-50 dark:bg-gray-800/90`}>
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground">No img</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-green-600 truncate">{product.name}</h3>
                        {!product.active && <span className="text-xs bg-muted px-2 py-0.5 rounded">Inactive</span>}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{product.description}</p>
                      <p className="text-sm font-semibold">${product.price.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(product.id)} className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ContentSection>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminProducts;
