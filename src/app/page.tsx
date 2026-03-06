'use client';

import { useState } from 'react';
import photosData from '../data/photos.json';

interface PhotoInfo {
  folder: string;
  photos: string[];
}

export default function Home() {
  const [photos] = useState<PhotoInfo[]>(photosData);
  const [selectedPhoto, setSelectedPhoto] = useState<{ folder: string; photo: string } | null>(null);

  const sortedPhotos = [...photos].sort((a, b) => a.folder.localeCompare(b.folder));

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-center items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Фото 8 марта
          </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
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
                    return (
                      <div key={photoId} className="flex flex-col">
                        <img
                          src={`/photos${photo}`}
                          alt={person.folder}
                          className="w-full aspect-[3/4] object-cover rounded-lg cursor-zoom-in hover:opacity-90 transition-opacity"
                          onClick={() => setSelectedPhoto({ folder: person.folder, photo })}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          ))}
        </div>
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
