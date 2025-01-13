import React, { useState, useEffect } from 'react';
import { Save, Undo, Redo, Play, Pause, FastForward, Rewind } from 'lucide-react';

interface Word {
  word: string;
  start: number;
  end: number;
  confidence: number;
  speaker?: number;
}

interface TranscriptEditorProps {
  words: Word[];
  speakers: Array<{ id: number; name?: string }>;
  audioUrl: string;
  onSave: (words: Word[]) => void;
}

export function TranscriptEditor({
  words: initialWords,
  speakers,
  audioUrl,
  onSave,
}: TranscriptEditorProps) {
  const [words, setWords] = useState<Word[]>(initialWords);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  const [audioElement] = useState<HTMLAudioElement>(new Audio(audioUrl));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const updateTime = () => setCurrentTime(audioElement.currentTime);
    audioElement.addEventListener('timeupdate', updateTime);
    return () => audioElement.removeEventListener('timeupdate', updateTime);
  }, [audioElement]);

  const handleWordClick = (index: number) => {
    setSelectedWordIndex(index);
    audioElement.currentTime = words[index].start;
  };

  const handleWordEdit = (index: number, newWord: string) => {
    const newWords = [...words];
    newWords[index] = { ...newWords[index], word: newWord };
    setWords(newWords);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (seconds: number) => {
    audioElement.currentTime = Math.max(0, audioElement.currentTime + seconds);
  };

  const handleSave = () => {
    onSave(words);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Audio Controls */}
      <div className="flex items-center justify-center space-x-4 mb-6 bg-gray-100 p-4 rounded-lg">
        <button
          onClick={() => handleSeek(-5)}
          className="p-2 hover:bg-gray-200 rounded-full"
        >
          <Rewind className="h-5 w-5" />
        </button>
        <button
          onClick={handlePlayPause}
          className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700"
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </button>
        <button
          onClick={() => handleSeek(5)}
          className="p-2 hover:bg-gray-200 rounded-full"
        >
          <FastForward className="h-5 w-5" />
        </button>
        <div className="text-sm text-gray-600">
          {new Date(currentTime * 1000).toISOString().substr(11, 8)}
        </div>
      </div>

      {/* Transcript Editor */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {words.map((word, index) => {
          const speaker = speakers.find(s => s.id === word.speaker);
          const isSelected = index === selectedWordIndex;
          const isCurrentWord = currentTime >= word.start && currentTime <= word.end;

          return (
            <div
              key={`${index}-${word.start}`}
              className={`p-2 rounded ${
                isSelected ? 'bg-blue-50' : isCurrentWord ? 'bg-yellow-50' : ''
              }`}
              onClick={() => handleWordClick(index)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-500">
                  {new Date(word.start * 1000).toISOString().substr(11, 8)}
                </span>
                {speaker && (
                  <span className="text-sm font-medium text-blue-600">
                    {speaker.name || `Speaker ${speaker.id}`}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={word.word}
                onChange={(e) => handleWordEdit(index, e.target.value)}
                className={`w-full p-1 rounded border ${
                  word.confidence < 0.8 ? 'border-yellow-300' : 'border-transparent'
                } focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
              />
              {word.confidence < 0.8 && (
                <div className="text-xs text-yellow-600 mt-1">
                  Low confidence: {Math.round(word.confidence * 100)}%
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );
}