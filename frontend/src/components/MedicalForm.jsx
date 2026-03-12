import React, { useState } from 'react';
import { Stethoscope } from 'lucide-react';
import apiClient from '../api/client';

const initialForm = {
  symptoms: '',
  age: '',
  gender: '',
  notes: '',
};

const MedicalForm = () => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.symptoms.trim()) {
      setError('Please enter your symptoms.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResult(null);

      const { data } = await apiClient.post('/api/medical/analyze', {
        symptoms: form.symptoms.trim(),
        age: form.age,
        gender: form.gender,
        notes: form.notes.trim(),
      });

      setResult(data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Unable to analyze symptoms at the moment.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-sky-500 rounded-xl">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              Medical Symptom Form
            </h2>
            <p className="text-xs text-purple-200">
              Provide your symptoms to receive an AI-generated overview.
            </p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-purple-200 mb-1">
            Symptoms *
          </label>
          <textarea
            name="symptoms"
            rows="3"
            value={form.symptoms}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Describe your main symptoms, duration, and any changes..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-purple-200 mb-1">Age</label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. 32"
              min="0"
            />
          </div>

          <div>
            <label className="block text-xs text-purple-200 mb-1">
              Gender
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-purple-200 mb-1">
              Additional notes
            </label>
            <input
              type="text"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Medications, conditions, etc."
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Analyzing...' : 'Analyze Symptoms'}
        </button>
      </form>

      {result && (
        <section className="mt-3 space-y-2 rounded-xl bg-black/30 border border-white/10 p-4">
          <p className="text-xs text-purple-300 uppercase tracking-wide">
            AI Analysis (Demo)
          </p>
          {result.summary && (
            <p className="text-sm text-white whitespace-pre-line">
              {result.summary}
            </p>
          )}
          {result.riskLevel && (
            <p className="text-xs text-purple-200">
              Estimated risk level:{' '}
              <span className="font-semibold">{result.riskLevel}</span>
            </p>
          )}
          {Array.isArray(result.recommendations) &&
            result.recommendations.length > 0 && (
              <ul className="list-disc list-inside text-xs text-purple-100 space-y-1">
                {result.recommendations.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            )}
          <p className="text-[11px] text-purple-300/80 mt-2">
            This tool is for educational support only and does not replace
            professional medical advice. Always consult a licensed clinician for
            diagnosis or treatment.
          </p>
        </section>
      )}
    </div>
  );
};

export default MedicalForm;

