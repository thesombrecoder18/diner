import React, { useState, useEffect } from 'react';
import { User, ImagePlus, Crown } from 'lucide-react';
import { API_URL, DEFAULT_KING_PHOTO, DEFAULT_QUEEN_PHOTO } from '../config/constants';
import { Candidate } from '../contexts/VotingContext';

interface CandidateFormProps {
  candidate?: Candidate;
  onSubmit: (candidateData: FormData) => Promise<void>;
  onCancel: () => void;
}

const CandidateForm: React.FC<CandidateFormProps> = ({
  candidate,
  onSubmit,
  onCancel
}) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'king' | 'queen'>('king');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form if editing existing candidate
  useEffect(() => {
    if (candidate) {
      setName(candidate.name);
      setGender(candidate.gender);
      setImagePreview(candidate.image_url);
    } else {
      // Default image for new candidate based on gender
      setImagePreview(gender === 'king' ? DEFAULT_KING_PHOTO : DEFAULT_QUEEN_PHOTO);
    }
  }, [candidate]);

  // Update preview when gender changes for new candidate
  useEffect(() => {
    if (!candidate && !imageFile) {
      setImagePreview(gender === 'king' ? DEFAULT_KING_PHOTO : DEFAULT_QUEEN_PHOTO);
    }
  }, [gender, candidate, imageFile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('gender', gender);

      if (candidate) {
        formData.append('id', candidate.id.toString());
      }

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (!candidate) {
        // Use default URL if no file uploaded
        formData.append(
          'imageUrl',
          gender === 'king' ? DEFAULT_KING_PHOTO : DEFAULT_QUEEN_PHOTO
        );
      }

      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to save candidate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-white p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Image upload & preview */}
        <div className="md:w-1/3">
          <div className="relative group">
            <div className="aspect-square overflow-hidden rounded-lg bg-elegant-800">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-elegant-950/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <label className="cursor-pointer bg-gold-500 text-elegant-950 p-2 rounded-full">
                  <ImagePlus size={24} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>
            <p className="text-sm text-elegant-400 mt-2 text-center">
              Cliquez sur l'image pour changer la photo
            </p>
          </div>
        </div>

        {/* Name & gender fields */}
        <div className="md:w-2/3 space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-elegant-300 mb-1"
            >
              Nom du candidat
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-elegant-500" />
              </div>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input pl-10 w-full"
                placeholder="Nom complet"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-elegant-300 mb-1">
              Catégorie
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`p-3 rounded-md flex items-center justify-center ${
                  gender === 'king'
                    ? 'bg-burgundy-950 text-white border border-burgundy-800'
                    : 'bg-elegant-800 text-elegant-300 border border-elegant-700'
                }`}
                onClick={() => setGender('king')}
              >
                <Crown size={18} className="mr-2" />
                Roi
              </button>
              <button
                type="button"
                className={`p-3 rounded-md flex items-center justify-center ${
                  gender === 'queen'
                    ? 'bg-gold-500 text-elegant-950 border border-gold-400'
                    : 'bg-elegant-800 text-elegant-300 border border-elegant-700'
                }`}
                onClick={() => setGender('queen')}
              >
                <Crown size={18} className="mr-2" />
                Reine
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-end space-x-3 pt-3 border-t border-elegant-800">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline"
          disabled={loading}
        >
          Annuler
        </button>
        <button type="submit" className="btn btn-gold" disabled={loading}>
          {loading ? 'Sauvegarde...' : candidate ? 'Mettre à jour' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
};

export default CandidateForm;
