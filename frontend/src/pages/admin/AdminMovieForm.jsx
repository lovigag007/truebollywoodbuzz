import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader2, Plus, X, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['biographical', 'historical', 'crime', 'sports', 'political', 'social', 'war', 'disaster', 'other'];
const STREAMING_OPTIONS = ['Netflix', 'Prime Video', 'Hotstar', 'SonyLIV', 'Zee5', 'Jio Cinema', 'MX Player', 'Voot'];
const GENRES_LIST = ['Action', 'Drama', 'Biography', 'Crime', 'Thriller', 'Romance', 'Comedy', 'Historical', 'War', 'Sports'];

const defaultForm = {
  title: '', hindiTitle: '', year: new Date().getFullYear(), releaseDate: '', duration: '',
  language: 'Hindi', director: '', producer: '', category: 'biographical',
  synopsis: '', trueEventDescription: '', realEventDate: '', realPersonNames: '', realEventLocation: '',
  trailerUrl: '', posterUrl: '', bannerUrl: '', defaultRealPercent: 50,
  isTrending: false, isFeatured: false, isPublished: true,
  genre: [], streamingOn: [], tags: [], cast: [],
  metaTitle: '', metaDescription: '',
};

export default function AdminMovieForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [posterFile, setPosterFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [castEntry, setCastEntry] = useState({ name: '', role: 'Lead', character: '' });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (!isAdmin) navigate('/');
  }, [isAdmin]);

  // Load movie for editing by finding it in the admin list
  useEffect(() => {
    if (!isEdit) return;
    setFetching(true);
    api.get('/admin/movies', { params: { limit: 200 } })
      .then((res) => {
        const movie = res.data.data.find((m) => String(m.id) === String(id));
        if (movie) {
          setForm({
            ...defaultForm,
            ...movie,
            year: movie.year || new Date().getFullYear(),
            duration: movie.duration || '',
            releaseDate: movie.releaseDate || '',
            genre: Array.isArray(movie.genre) ? movie.genre : [],
            streamingOn: Array.isArray(movie.streamingOn) ? movie.streamingOn : [],
            tags: Array.isArray(movie.tags) ? movie.tags : [],
            cast: Array.isArray(movie.cast) ? movie.cast : [],
          });
        } else {
          toast.error('Movie not found');
          navigate('/admin/movies');
        }
      })
      .catch(() => {
        toast.error('Failed to load movie');
        navigate('/admin/movies');
      })
      .finally(() => setFetching(false));
  }, [id]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleArrayItem = (key, val) => {
    setForm((f) => ({
      ...f,
      [key]: Array.isArray(f[key]) && f[key].includes(val)
        ? f[key].filter((x) => x !== val)
        : [...(f[key] || []), val],
    }));
  };

  const addCast = () => {
    if (!castEntry.name.trim()) { toast.error('Actor name is required'); return; }
    setForm((f) => ({ ...f, cast: [...(f.cast || []), { ...castEntry }] }));
    setCastEntry({ name: '', role: 'Lead', character: '' });
  };

  const removeCast = (i) => {
    setForm((f) => ({ ...f, cast: f.cast.filter((_, idx) => idx !== i) }));
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (tag && !form.tags.includes(tag)) {
      setForm((f) => ({ ...f, tags: [...f.tags, tag] }));
    }
    setTagInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.year) { toast.error('Year is required'); return; }

    setLoading(true);
    try {
      const fd = new FormData();

      // Append all scalar fields
      const scalarFields = [
        'title', 'hindiTitle', 'year', 'releaseDate', 'duration', 'language',
        'director', 'producer', 'category', 'synopsis', 'trueEventDescription',
        'realEventDate', 'realPersonNames', 'realEventLocation', 'trailerUrl',
        'posterUrl', 'bannerUrl', 'defaultRealPercent', 'isTrending', 'isFeatured',
        'isPublished', 'metaTitle', 'metaDescription',
      ];
      scalarFields.forEach((key) => {
        const val = form[key];
        if (val !== '' && val !== null && val !== undefined) {
          fd.append(key, val);
        }
      });

      // Append JSON array fields
      ['genre', 'streamingOn', 'tags', 'cast'].forEach((key) => {
        fd.append(key, JSON.stringify(form[key] || []));
      });

      // Append files if selected
      if (posterFile) fd.append('poster', posterFile);
      if (bannerFile) fd.append('banner', bannerFile);

      if (isEdit) {
        await api.put(`/admin/movies/${id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Movie updated successfully!');
      } else {
        await api.post('/admin/movies', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Movie created successfully!');
      }
      navigate('/admin/movies');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save movie');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 size={20} className="animate-spin" />
          <span>Loading movie data...</span>
        </div>
      </div>
    );
  }

  const Section = ({ title, children }) => (
    <div className="bg-cinema-card border border-cinema-border rounded-2xl p-6 space-y-4">
      <h3 className="font-display font-bold text-white text-base border-b border-cinema-border pb-3">{title}</h3>
      {children}
    </div>
  );

  const Field = ({ label, required, hint, children }) => (
    <div>
      <label className="block text-gray-400 text-sm font-medium mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
        {hint && <span className="text-gray-600 text-xs ml-2">({hint})</span>}
      </label>
      {children}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/movies')}
          className="p-2 text-gray-400 hover:text-white hover:bg-cinema-muted rounded-xl transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            {isEdit ? 'Edit Movie' : 'Add New Movie'}
          </h1>
          <p className="text-gray-500 text-sm">Fill in the movie details and its true story</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Basic Info ── */}
        <Section title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Movie Title (English)" required>
              <input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                className="input"
                placeholder="e.g. Uri: The Surgical Strike"
                required
              />
            </Field>
            <Field label="Hindi Title" hint="optional">
              <input
                value={form.hindiTitle}
                onChange={(e) => set('hindiTitle', e.target.value)}
                className="input font-hindi"
                placeholder="हिंदी में नाम"
              />
            </Field>
            <Field label="Release Year" required>
              <input
                type="number"
                value={form.year}
                onChange={(e) => set('year', e.target.value)}
                className="input"
                min="1950"
                max="2030"
                required
              />
            </Field>
            <Field label="Release Date" hint="optional">
              <input
                type="date"
                value={form.releaseDate}
                onChange={(e) => set('releaseDate', e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Duration (minutes)" hint="optional">
              <input
                type="number"
                value={form.duration}
                onChange={(e) => set('duration', e.target.value)}
                className="input"
                placeholder="e.g. 138"
              />
            </Field>
            <Field label="Language">
              <select value={form.language} onChange={(e) => set('language', e.target.value)} className="input">
                {['Hindi', 'Bengali', 'Telugu', 'Tamil', 'Marathi', 'Malayalam', 'Punjabi', 'Kannada', 'Gujarati'].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </Field>
            <Field label="Director" hint="optional">
              <input
                value={form.director}
                onChange={(e) => set('director', e.target.value)}
                className="input"
                placeholder="Director name"
              />
            </Field>
            <Field label="Producer / Production House" hint="optional">
              <input
                value={form.producer}
                onChange={(e) => set('producer', e.target.value)}
                className="input"
                placeholder="Producer or production company"
              />
            </Field>
          </div>

          <Field label="Category" required>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => set('category', cat)}
                  className={`px-3 py-1.5 rounded-xl text-sm capitalize transition-all ${
                    form.category === cat
                      ? 'bg-brand-500 text-white'
                      : 'bg-cinema-muted text-gray-400 hover:text-white border border-cinema-border'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Genres" hint="select all that apply">
            <div className="flex flex-wrap gap-2">
              {GENRES_LIST.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleArrayItem('genre', g)}
                  className={`px-3 py-1 rounded-full text-xs transition-all ${
                    form.genre?.includes(g)
                      ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                      : 'bg-cinema-muted text-gray-500 border border-cinema-border hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </Field>
        </Section>

        {/* ── Story ── */}
        <Section title="Story & True Event Details">
          <Field label="Synopsis" hint="brief plot summary">
            <textarea
              value={form.synopsis}
              onChange={(e) => set('synopsis', e.target.value)}
              rows={3}
              className="input resize-none"
              placeholder="Brief plot summary of the movie..."
            />
          </Field>

          <Field label="True Event Description" required>
            <textarea
              value={form.trueEventDescription}
              onChange={(e) => set('trueEventDescription', e.target.value)}
              rows={6}
              className="input resize-none"
              placeholder="Describe what actually happened in real life. This is the main content users read on the detail page..."
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Real Event Date" hint="e.g. September 2016">
              <input
                value={form.realEventDate}
                onChange={(e) => set('realEventDate', e.target.value)}
                className="input"
                placeholder="e.g. September 2016"
              />
            </Field>
            <Field label="Real Event Location">
              <input
                value={form.realEventLocation}
                onChange={(e) => set('realEventLocation', e.target.value)}
                className="input"
                placeholder="e.g. Mumbai, Maharashtra"
              />
            </Field>
          </div>

          <Field label="Real Persons Involved" hint="comma separated">
            <input
              value={form.realPersonNames}
              onChange={(e) => set('realPersonNames', e.target.value)}
              className="input"
              placeholder="e.g. Harshad Mehta, Sucheta Dalal"
            />
          </Field>

          <Field label={`Default Real % — shown before user votes (${form.defaultRealPercent}%)`}>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={form.defaultRealPercent}
                onChange={(e) => set('defaultRealPercent', parseInt(e.target.value))}
                className="flex-1"
                style={{
                  background: `linear-gradient(90deg, #f97316 ${form.defaultRealPercent}%, #2a2a3a ${form.defaultRealPercent}%)`,
                }}
              />
              <span className="text-brand-400 font-bold w-12 text-right text-lg">{form.defaultRealPercent}%</span>
            </div>
          </Field>
        </Section>

        {/* ── Media ── */}
        <Section title="Media & Links">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Upload Poster Image">
              <label className="flex flex-col items-center gap-2 border-2 border-dashed border-cinema-border hover:border-brand-500/50 rounded-xl p-5 cursor-pointer transition-all">
                <Upload size={22} className="text-gray-500" />
                <span className="text-gray-500 text-xs text-center">
                  {posterFile ? posterFile.name : 'Click to upload poster\n(JPG, PNG, WebP · max 5MB)'}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setPosterFile(e.target.files[0])} />
              </label>
              {(form.posterUrl || posterFile) && (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={posterFile ? URL.createObjectURL(posterFile) : form.posterUrl}
                    alt="Poster preview"
                    className="w-16 h-24 object-cover rounded-xl border border-cinema-border"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <p className="text-gray-500 text-xs">Current poster</p>
                </div>
              )}
            </Field>

            <Field label="Upload Banner Image" hint="wide landscape image">
              <label className="flex flex-col items-center gap-2 border-2 border-dashed border-cinema-border hover:border-brand-500/50 rounded-xl p-5 cursor-pointer transition-all">
                <Upload size={22} className="text-gray-500" />
                <span className="text-gray-500 text-xs text-center">
                  {bannerFile ? bannerFile.name : 'Click to upload banner\n(1400×400 recommended)'}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setBannerFile(e.target.files[0])} />
              </label>
              {form.bannerUrl && !bannerFile && (
                <p className="text-gray-600 text-xs mt-1 truncate">Current: {form.bannerUrl}</p>
              )}
            </Field>
          </div>

          <Field label="Poster URL" hint="or paste an external image URL">
            <input
              value={form.posterUrl}
              onChange={(e) => set('posterUrl', e.target.value)}
              className="input"
              placeholder="https://example.com/poster.jpg"
            />
          </Field>

          <Field label="Banner URL" hint="optional wide banner image URL">
            <input
              value={form.bannerUrl}
              onChange={(e) => set('bannerUrl', e.target.value)}
              className="input"
              placeholder="https://example.com/banner.jpg"
            />
          </Field>

          <Field label="Trailer URL" hint="YouTube link">
            <input
              value={form.trailerUrl}
              onChange={(e) => set('trailerUrl', e.target.value)}
              className="input"
              placeholder="https://youtube.com/watch?v=..."
            />
          </Field>

          <Field label="Streaming Platforms">
            <div className="flex flex-wrap gap-2">
              {STREAMING_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleArrayItem('streamingOn', s)}
                  className={`px-3 py-1 rounded-full text-xs transition-all ${
                    form.streamingOn?.includes(s)
                      ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                      : 'bg-cinema-muted text-gray-500 border border-cinema-border hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>
        </Section>

        {/* ── Cast ── */}
        <Section title="Cast & Crew">
          {form.cast.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {form.cast.map((c, i) => (
                <div key={i} className="flex items-center gap-2 bg-cinema-muted border border-cinema-border rounded-xl px-3 py-2">
                  <div>
                    <p className="text-white text-xs font-medium">{c.name}</p>
                    <p className="text-gray-500 text-[10px]">
                      {c.role}{c.character ? ` • ${c.character}` : ''}
                    </p>
                  </div>
                  <button type="button" onClick={() => removeCast(i)} className="text-gray-600 hover:text-red-400 transition-colors ml-1">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-32">
              <p className="text-gray-600 text-xs mb-1">Actor Name *</p>
              <input
                value={castEntry.name}
                onChange={(e) => setCastEntry((p) => ({ ...p, name: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCast())}
                className="input py-2 text-sm"
                placeholder="Actor name"
              />
            </div>
            <div className="flex-1 min-w-32">
              <p className="text-gray-600 text-xs mb-1">Character Name</p>
              <input
                value={castEntry.character}
                onChange={(e) => setCastEntry((p) => ({ ...p, character: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCast())}
                className="input py-2 text-sm"
                placeholder="Character name"
              />
            </div>
            <div>
              <p className="text-gray-600 text-xs mb-1">Role</p>
              <select
                value={castEntry.role}
                onChange={(e) => setCastEntry((p) => ({ ...p, role: e.target.value }))}
                className="input py-2 text-sm w-28"
              >
                {['Lead', 'Supporting', 'Cameo'].map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <button type="button" onClick={addCast} className="btn-ghost py-2 px-3 flex items-center gap-1 text-sm">
              <Plus size={14} /> Add
            </button>
          </div>
        </Section>

        {/* ── Tags & SEO ── */}
        <Section title="Tags & SEO">
          <Field label="Tags" hint="press Enter or click Add">
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {form.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 bg-cinema-muted border border-cinema-border text-gray-300 px-2.5 py-1 rounded-full text-xs">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))}
                      className="text-gray-500 hover:text-red-400 ml-0.5"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addTag(); }
                }}
                className="input flex-1 text-sm py-2"
                placeholder="Type tag and press Enter"
              />
              <button type="button" onClick={addTag} className="btn-ghost py-2 px-3 text-sm">Add</button>
            </div>
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Meta Title" hint="SEO, auto-generated if blank">
              <input
                value={form.metaTitle}
                onChange={(e) => set('metaTitle', e.target.value)}
                className="input text-sm"
                placeholder="Leave blank to auto-generate"
              />
            </Field>
            <Field label="Meta Description" hint="SEO">
              <input
                value={form.metaDescription}
                onChange={(e) => set('metaDescription', e.target.value)}
                className="input text-sm"
                placeholder="Short description for search engines"
              />
            </Field>
          </div>
        </Section>

        {/* ── Visibility ── */}
        <Section title="Visibility Settings">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { key: 'isPublished', label: 'Published', desc: 'Visible to all users' },
              { key: 'isTrending', label: 'Trending', desc: 'Show in trending slider' },
              { key: 'isFeatured', label: 'Featured', desc: 'Featured on homepage' },
            ].map(({ key, label, desc }) => (
              <label
                key={key}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  form[key]
                    ? 'border-brand-500/40 bg-brand-500/5'
                    : 'border-cinema-border bg-cinema-muted'
                }`}
              >
                <div>
                  <p className="text-white text-sm font-medium">{label}</p>
                  <p className="text-gray-500 text-xs">{desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={!!form[key]}
                  onChange={(e) => set(key, e.target.checked)}
                  className="accent-brand-500 w-4 h-4"
                />
              </label>
            ))}
          </div>
        </Section>

        {/* Submit */}
        <div className="flex items-center gap-3 justify-end pb-8">
          <button type="button" onClick={() => navigate('/admin/movies')} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Movie'}
          </button>
        </div>
      </form>
    </div>
  );
}
