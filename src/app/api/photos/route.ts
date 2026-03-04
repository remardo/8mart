import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PHOTOS_DIR = path.join(process.cwd(), 'public', 'photos');

interface PhotoInfo {
  folder: string;
  photos: string[];
}

export async function GET() {
  try {
    const entries = fs.readdirSync(PHOTOS_DIR, { withFileTypes: true });
    const folders = entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);
    
    const photos: PhotoInfo[] = [];
    
    for (const folder of folders) {
      const folderPath = path.join(PHOTOS_DIR, folder);
      const files = fs.readdirSync(folderPath);
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
      );
      
      if (imageFiles.length > 0) {
        photos.push({
          folder,
          photos: imageFiles.map(p => `/${folder}/${p}`)
        });
      }
    }
    
    return NextResponse.json(photos);
  } catch (error) {
    console.error('Error reading photos:', error);
    return NextResponse.json({ error: 'Failed to read photos' }, { status: 500 });
  }
}
