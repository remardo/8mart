'use client';

import { useState, useEffect } from 'react';

interface PhotoInfo {
  folder: string;
  photos: string[];
}

interface Votes {
  [key: string]: number;
}

export default function Home() {
  const [photos, setPhotos] = useState<PhotoInfo[]>([]);
  const [votes, setVotes] = useState<Votes>({});
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetchPhotos();
    fetchVotes();
  }, []);

  const fetchPhotos = async () => {
    try {
      const res = await fetch('/api/photos');
      const data = await res.json();
      setPhotos(data);
    } catch (error) {
      console.error('Failed to fetch photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVotes = async () => {
    try {
      const res = await fetch('/api/votes');
      const data = await res.json();
      setVotes(data);
    } catch (error) {
      console.error('Failed to fetch votes:', error);
    }
  };

  const handleVote = async (photoId: string, vote: boolean) => {
    try {
      await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, vote }),
      });
      fetchVotes();
      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const getAllPhotos = () => {
    const all: { folder: string; photo: string; id: string }[] = [];
    photos.forEach(p => {
      p.photos.forEach(photo => {
        all.push({
          folder: p.folder,
          photo,
          id: `${p.folder}:${photo}`
        });
      });
    });
    return all;
  };

  const allPhotos = getAllPhotos();
  const currentPhoto = allPhotos[currentIndex];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <p className="text-lg text-zinc-600">Загрузка...</p>
      </div>
    );
  }

  if (showResults) {
    const sortedPhotos = allPhotos
      .map(p => ({ ...p, voteCount: votes[p.id] || 0 }))
      .sort((a, b) => b.voteCount - a.voteCount);

    return (
      <div className="min-h-screen bg-zinc-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-zinc-800льтаты голосования">Резу</h1>
            <button
              onClick={() => setShowResults(false)}
              className="px-4 py-2 bg-zinc-200 text-zinc-800 rounded-lg hover:bg-zinc-300"
            >
              Назад к голосованию
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPhotos.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-lg shadow">
                <p className="font-semibold text-zinc-800 mb-2">{item.folder}</p>
                <img
                  src={`..${item.photo}`}
                  alt={item.folder}
                  className="w-full h-48 object-cover rounded"
                />
                <p className="mt-2 text-lg font-bold text-green-600">
                  {item.voteCount} голосов
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentPhoto) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50">
        <h1 className="text-2xl font-bold text-zinc-800 mb-4">Голосование завершено!</h1>
        <button
          onClick={() => setShowResults(true)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Посмотреть результаты
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-zinc-800">Голосование 8 марта</h1>
          <button
            onClick={() => setShowResults(true)}
            className="text-zinc-600 hover:text-zinc-800"
          >
            Результаты
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="mb-4 text-center">
            <span className="text-zinc-600">
              {currentIndex + 1} / {allPhotos.length}
            </span>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4">
            <h2 className="text-xl font-semibold text-zinc-800 mb-4 text-center">
              {currentPhoto.folder}
            </h2>
            <div className="relative aspect-[3/4] max-h-[60vh] mx-auto">
              <img
                src={`..${currentPhoto.photo}`}
                alt={currentPhoto.folder}
                className="absolute inset-0 w-full h-full object-contain rounded"
              />
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => handleVote(currentPhoto.id, false)}
              className="px-8 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
            >
              ✗ Не печатать
            </button>
            <button
              onClick={() => handleVote(currentPhoto.id, true)}
              className="px-8 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
            >
              ✓ Печатать
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
