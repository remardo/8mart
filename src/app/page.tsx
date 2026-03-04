'use client';

import { useState, useEffect } from 'react';
import photosData from '../data/photos.json';

interface PhotoInfo {
  folder: string;
  photos: string[];
}

interface Votes {
  [key: string]: number;
}

export default function Home() {
  const [photos, setPhotos] = useState<PhotoInfo[]>(photosData);
  const [votes, setVotes] = useState<Votes>({});
  const [userVotes, setUserVotes] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{ folder: string; photo: string } | null>(null);

  useEffect(() => {
    fetchVotes();
  }, []);

  const fetchVotes = async () => {
    try {
      const res = await fetch('/api/votes');
      const data = await res.json();
      if (!res.ok) {
        console.error('Failed to fetch votes:', data.error);
        return;
      }
      setVotes(data.votes || {});
      setUserVotes(data.userVotes || {});
    } catch (error) {
      console.error('Failed to fetch votes:', error);
    }
  };

  const handleVote = async (photoId: string, vote: boolean) => {
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, vote }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Vote failed:', data.error);
        return;
      }
      fetchVotes();
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const sortedPhotos = [...photos].sort((a, b) => a.folder.localeCompare(b.folder));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <p className="text-lg text-zinc-600">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Голосование 8 марта
          </h1>
          <button
            onClick={() => setShowResults(!showResults)}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            {showResults ? 'К голосованию' : 'Результаты'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {showResults ? (
          <div>
            <h2 className="text-xl font-semibold text-zinc-700 mb-6 text-center">Результаты голосования</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedPhotos.map((person) => (
                <div key={person.folder} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-4 border-b border-zinc-100">
                    <h3 className="font-semibold text-lg text-zinc-800">{person.folder}</h3>
                  </div>
                  {person.photos.map((photo) => {
                    const photoId = `${person.folder}:${photo}`;
                    const voteCount = votes[photoId] || 0;
                    return (
                      <div key={photoId} className="p-4 border-b border-zinc-100 last:border-b-0">
                        <img
                          src={`/photos${photo}`}
                          alt={person.folder}
                          className="w-full h-40 object-cover rounded-lg mb-3 cursor-zoom-in"
                          onClick={() => setSelectedPhoto({ folder: person.folder, photo })}
                        />
                        <div className="flex items-center justify-between">
                          <span className={`text-lg font-bold ${voteCount > 0 ? 'text-green-600' : 'text-zinc-400'}`}>
                            {voteCount} голосов
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {sortedPhotos.map((person) => (
              <section key={person.folder} className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-3">
                  <h2 className="text-xl font-bold text-white">{person.folder}</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {person.photos.map((photo) => {
                      const photoId = `${person.folder}:${photo}`;
                      const voteCount = votes[photoId] || 0;
                      return (
                        <div key={photoId} className="flex flex-col">
                          <img
                            src={`/photos${photo}`}
                            alt={person.folder}
                            className="w-full aspect-[3/4] object-cover rounded-lg mb-3 cursor-zoom-in hover:opacity-90 transition-opacity"
                            onClick={() => setSelectedPhoto({ folder: person.folder, photo })}
                          />
                          <div className="flex items-center justify-between gap-2 mt-auto">
                            <button
                              onClick={() => handleVote(photoId, false)}
                              className={`flex-1 px-3 py-2 font-medium rounded-lg transition-colors text-sm ${userVotes[photoId] === false ? 'bg-red-500 text-white shadow-inner' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                            >
                              ✗ Нет
                            </button>
                            <span className={`px-3 py-2 font-bold rounded-lg text-sm min-w-[60px] text-center ${voteCount > 0 ? 'bg-green-100 text-green-600' : 'bg-zinc-100 text-zinc-400'}`}>
                              {voteCount}
                            </span>
                            <button
                              onClick={() => handleVote(photoId, true)}
                              className={`flex-1 px-3 py-2 font-medium rounded-lg transition-colors text-sm ${userVotes[photoId] === true ? 'bg-green-500 text-white shadow-inner' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                            >
                              ✓ Да
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <footer className="text-center py-8 text-zinc-500 text-sm">
        Выберите фото для печати
      </footer>

      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setSelectedPhoto(null)}
        >
          <img
            src={`/photos${selectedPhoto.photo}`}
            alt={selectedPhoto.folder}
            className="max-w-full max-h-full object-contain"
          />
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white text-2xl"
            onClick={() => setSelectedPhoto(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
