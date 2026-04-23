import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Settings, Megaphone, MessageCircle, Globe, Truck, Image, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { settingsAPI, uploadAPI } from '../utils/api.js';
import BackButton from '../components/ui/BackButton.jsx';

const TABS = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'hero', label: 'Hero Section', icon: Image },
  { id: 'announcement', label: 'Announcement Bar', icon: Megaphone },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'social', label: 'Social Links', icon: Globe },
  { id: 'delivery', label: 'Delivery', icon: Truck },
];

export default function SiteSettings() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [form, setForm] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => settingsAPI.get().then(r => r.data.settings),
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: settingsAPI.update,
    onSuccess: () => { qc.invalidateQueries(['site-settings']); toast.success('Settings saved!'); },
    onError: () => toast.error('Failed to save settings'),
  });

  const set = (path, value) => {
    setForm(prev => {
      const parts = path.split('.');
      if (parts.length === 1) return { ...prev, [path]: value };
      return { ...prev, [parts[0]]: { ...prev[parts[0]], [parts[1]]: value } };
    });
  };

  const addSlide = () => {
    setForm(prev => ({
      ...prev,
      heroSlides: [...(prev.heroSlides || []), { imageUrl: '', title: '', subtitle: '' }],
    }));
  };

  const removeSlide = (idx) => {
    setForm(prev => ({
      ...prev,
      heroSlides: prev.heroSlides.filter((_, i) => i !== idx),
    }));
  };

  const setSlide = (idx, field, value) => {
    setForm(prev => ({
      ...prev,
      heroSlides: prev.heroSlides.map((s, i) => i === idx ? { ...s, [field]: value } : s),
    }));
  };

  const [uploadingIdx, setUploadingIdx] = useState(null);
  const handleSlideUpload = async (idx, file) => {
    if (!file) return;
    setUploadingIdx(idx);
    try {
      const res = await uploadAPI.image(file);
      setSlide(idx, 'imageUrl', res.data.url);
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploadingIdx(null);
    }
  };

  const handleSave = () => saveMutation.mutate(form);

  if (isLoading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Site Settings</h1>
            <p className="text-slate-400 text-sm">Configure your store settings</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saveMutation.isPending} className="btn-primary gap-2">
          <Save className="w-4 h-4" />
          {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Tabs */}
        <div className="space-y-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${activeTab === tab.id ? 'bg-gradient-brand text-white shadow-brand' : 'text-slate-600 hover:bg-gray-100'}`}
            >
              <tab.icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="card p-6 space-y-5">
            {activeTab === 'general' && (
              <>
                <h3 className="font-semibold text-gray-800">General Information</h3>
                {[
                  { key: 'siteName', label: 'Site Name', placeholder: 'OmniDeal' },
                  { key: 'tagline', label: 'Tagline', placeholder: 'Shop The Future of Retail' },
                  { key: 'contactEmail', label: 'Contact Email', placeholder: 'support@omnideal.com' },
                  { key: 'contactPhone', label: 'Contact Phone', placeholder: '01700-000000' },
                  { key: 'address', label: 'Business Address', placeholder: 'Dhaka, Bangladesh' },
                  { key: 'returnPolicy', label: 'Return Policy Text', placeholder: '7 days easy return' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-slate-500 text-sm mb-1.5 block">{f.label}</label>
                    <input value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)} className="input-field" placeholder={f.placeholder} />
                  </div>
                ))}
                <div>
                  <label className="text-slate-500 text-sm mb-1.5 block">Meta Title (SEO)</label>
                  <input value={form.metaTitle || ''} onChange={e => set('metaTitle', e.target.value)} className="input-field" placeholder="OmniDeal - Best Online Shop in Bangladesh" />
                </div>
                <div>
                  <label className="text-slate-500 text-sm mb-1.5 block">Meta Description (SEO)</label>
                  <textarea rows={2} value={form.metaDescription || ''} onChange={e => set('metaDescription', e.target.value)} className="input-field resize-none" placeholder="Shop thousands of products at best prices..." />
                </div>
              </>
            )}

            {activeTab === 'hero' && (
              <>
                <h3 className="font-semibold text-gray-800">Hero Headline</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { key: 'heroHeadline.badge', label: 'Badge Text', placeholder: 'New arrivals every week' },
                    { key: 'heroHeadline.line1', label: 'Headline Line 1', placeholder: 'Shop The' },
                    { key: 'heroHeadline.highlight', label: 'Highlighted Word', placeholder: 'Future' },
                    { key: 'heroHeadline.line2', label: 'Headline Line 2', placeholder: 'of Retail' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-slate-500 text-sm mb-1.5 block">{f.label}</label>
                      <input
                        value={form.heroHeadline?.[f.key.split('.')[1]] || ''}
                        onChange={e => set(f.key, e.target.value)}
                        className="input-field"
                        placeholder={f.placeholder}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-slate-500 text-sm mb-1.5 block">Description</label>
                  <textarea
                    rows={3}
                    value={form.heroHeadline?.description || ''}
                    onChange={e => set('heroHeadline.description', e.target.value)}
                    className="input-field resize-none"
                    placeholder="Discover thousands of premium products..."
                  />
                </div>

                <div className="border-t border-gray-100 pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">Hero Slides</h3>
                    <button onClick={addSlide} className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium">
                      <Plus className="w-4 h-4" /> Add Slide
                    </button>
                  </div>
                  <div className="space-y-4">
                    {(form.heroSlides || []).map((slide, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Slide {idx + 1}</span>
                          <button onClick={() => removeSlide(idx)} className="text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Image */}
                        <div className="flex gap-3 items-start">
                          {slide.imageUrl && (
                            <img src={slide.imageUrl} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-200 shrink-0" />
                          )}
                          <div className="flex-1 space-y-2">
                            <input
                              value={slide.imageUrl || ''}
                              onChange={e => setSlide(idx, 'imageUrl', e.target.value)}
                              className="input-field text-sm"
                              placeholder="Image URL or upload below"
                            />
                            <label className={`flex items-center gap-2 text-xs text-amber-600 font-medium cursor-pointer hover:text-amber-700 ${uploadingIdx === idx ? 'opacity-50 pointer-events-none' : ''}`}>
                              <Image className="w-3.5 h-3.5" />
                              {uploadingIdx === idx ? 'Uploading...' : 'Upload image'}
                              <input type="file" accept="image/*" className="hidden" onChange={e => handleSlideUpload(idx, e.target.files[0])} />
                            </label>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-slate-500 text-xs mb-1 block">Title</label>
                            <input value={slide.title || ''} onChange={e => setSlide(idx, 'title', e.target.value)} className="input-field text-sm" placeholder="Slide title" />
                          </div>
                          <div>
                            <label className="text-slate-500 text-xs mb-1 block">Subtitle</label>
                            <input value={slide.subtitle || ''} onChange={e => setSlide(idx, 'subtitle', e.target.value)} className="input-field text-sm" placeholder="Slide subtitle" />
                          </div>
                        </div>
                      </div>
                    ))}
                    {!(form.heroSlides?.length) && (
                      <p className="text-slate-400 text-sm text-center py-6 border border-dashed border-gray-200 rounded-xl">No slides yet. Click "Add Slide" to add one.</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'announcement' && (
              <>
                <h3 className="font-semibold text-gray-800">Announcement Bar</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.announcement?.active ?? true} onChange={e => set('announcement.active', e.target.checked)} className="w-4 h-4 accent-amber-500" />
                  <span className="text-sm text-gray-700 font-medium">Show announcement bar</span>
                </label>
                <div>
                  <label className="text-slate-500 text-sm mb-1.5 block">Announcement Text</label>
                  <input value={form.announcement?.text || ''} onChange={e => set('announcement.text', e.target.value)} className="input-field" placeholder="🔥 Free delivery on orders over ৳999! Use code: FREEDEL" />
                </div>
                <div>
                  <label className="text-slate-500 text-sm mb-1.5 block">Background Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={form.announcement?.bgColor || '#d97706'} onChange={e => set('announcement.bgColor', e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                    <input value={form.announcement?.bgColor || '#d97706'} onChange={e => set('announcement.bgColor', e.target.value)} className="input-field flex-1" placeholder="#d97706" />
                  </div>
                </div>
                {/* Preview */}
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <div className="py-2 px-4 text-center text-white text-sm font-medium" style={{ backgroundColor: form.announcement?.bgColor || '#d97706' }}>
                    {form.announcement?.text || 'Your announcement here'}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'whatsapp' && (
              <>
                <h3 className="font-semibold text-gray-800">WhatsApp Chat Button</h3>
                <div>
                  <label className="text-slate-500 text-sm mb-1.5 block">WhatsApp Number (with country code)</label>
                  <input value={form.whatsappNumber || ''} onChange={e => set('whatsappNumber', e.target.value)} className="input-field" placeholder="8801700000000" />
                  <p className="text-slate-400 text-xs mt-1">Example: 8801700000000 (880 = Bangladesh code)</p>
                </div>
                <div>
                  <label className="text-slate-500 text-sm mb-1.5 block">Default Message</label>
                  <textarea rows={3} value={form.whatsappMessage || ''} onChange={e => set('whatsappMessage', e.target.value)} className="input-field resize-none" placeholder="Hi! I need help with my order." />
                </div>
              </>
            )}

            {activeTab === 'social' && (
              <>
                <h3 className="font-semibold text-gray-800">Social Media Links</h3>
                {[
                  { key: 'social.facebook', label: 'Facebook Page URL', placeholder: 'https://facebook.com/omnideal' },
                  { key: 'social.instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/omnideal' },
                  { key: 'social.youtube', label: 'YouTube Channel URL', placeholder: 'https://youtube.com/@omnideal' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-slate-500 text-sm mb-1.5 block">{f.label}</label>
                    <input
                      value={f.key.includes('.') ? (form[f.key.split('.')[0]]?.[f.key.split('.')[1]] || '') : (form[f.key] || '')}
                      onChange={e => set(f.key, e.target.value)}
                      className="input-field"
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}
              </>
            )}

            {activeTab === 'delivery' && (
              <>
                <h3 className="font-semibold text-gray-800">Delivery Settings</h3>
                <div>
                  <label className="text-slate-500 text-sm mb-1.5 block">Free Delivery Threshold (৳)</label>
                  <input type="number" value={form.freeDeliveryThreshold || 999} onChange={e => set('freeDeliveryThreshold', Number(e.target.value))} className="input-field" />
                  <p className="text-slate-400 text-xs mt-1">Orders above this amount get free delivery</p>
                </div>
              </>
            )}

            <div className="pt-2 border-t border-gray-100">
              <button onClick={handleSave} disabled={saveMutation.isPending} className="btn-primary gap-2">
                <Save className="w-4 h-4" />
                {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
