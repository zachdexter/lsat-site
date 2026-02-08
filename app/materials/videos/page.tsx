'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import Link from 'next/link';
import { FadeIn } from '../../../components/FadeIn';
import { LoadingSkeleton, CardSkeleton } from '../../../components/LoadingSkeleton';
import { EmptyState } from '../../../components/EmptyState';
import { VideoPlayer } from '../../../components/VideoPlayer';

type Video = {
  id: string;
  title: string;
  section: string;
  mux_playback_id: string | null;
  status: string;
  created_at: string;
};

const sectionNames: Record<string, string> = {
  introduction: 'Introduction',
  lr: 'Logical Reasoning',
  rc: 'Reading Comprehension',
  'final-tips': 'Final Tips',
};

const sectionColors: Record<string, string> = {
  introduction: 'bg-blue-100 text-blue-800 border-blue-200',
  lr: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  rc: 'bg-purple-100 text-purple-800 border-purple-200',
  'final-tips': 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

export default function VideosPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    async function checkAccess() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        setHasAccess(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, membership_status')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
        setIsLoading(false);
        setHasAccess(false);
        return;
      }

      const userIsAdmin = profile?.role === 'admin';
      const userHasMembership = profile?.membership_status === 'active' || profile?.membership_status === 'trial';

      setHasAccess(userIsAdmin || userHasMembership);
      setIsLoading(false);

      if (userIsAdmin || userHasMembership) {
        loadVideos();
      }
    }

    checkAccess();
  }, []);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedVideo) {
        setSelectedVideo(null);
      }
    };

    if (selectedVideo) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [selectedVideo]);

  async function loadVideos() {
    const { data, error } = await supabase
      .from('videos')
      .select('id, title, section, mux_playback_id, status, created_at')
      .eq('status', 'ready')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading videos:', error);
    } else {
      setVideos(data || []);
    }
  }

  const filteredAndSortedVideos = useMemo(() => {
    let filtered = videos.filter((video) => {
      // Search filter
      const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Section filter
      if (selectedSection !== 'all' && video.section !== selectedSection) {
        return false;
      }

      return true;
    });

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return sorted;
  }, [videos, searchQuery, selectedSection, sortBy]);

  const videosBySection = useMemo(() => {
    return filteredAndSortedVideos.reduce((acc, video) => {
      if (!acc[video.section]) {
        acc[video.section] = [];
      }
      acc[video.section].push(video);
      return acc;
    }, {} as Record<string, Video[]>);
  }, [filteredAndSortedVideos]);

  if (isLoading) {
    return (
      <FadeIn>
        <div className="space-y-6">
          <LoadingSkeleton className="h-10" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </FadeIn>
    );
  }

  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <FadeIn>
          <section className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 md:text-4xl">Video Library</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Access comprehensive video explanations and tutorials.</p>
          </section>
        </FadeIn>

        <FadeIn delayMs={60}>
          <section className="rounded-2xl border-2 border-indigo-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center shadow-sm md:p-10">
            <h2 className="mb-3 text-xl font-semibold text-slate-900 dark:text-slate-100">Materials Access Required</h2>
            <p className="mb-6 text-slate-600 dark:text-slate-300">
              You need materials access to view the video library. Purchase access to get all videos.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/pricing"
                className="inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md"
              >
                View Pricing
              </Link>
              <Link
                href="/materials"
                className="inline-block rounded-lg border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-indigo-300 hover:text-indigo-700"
              >
                Back to Materials
              </Link>
            </div>
          </section>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 md:text-4xl">Video Library</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Comprehensive video explanations for Logical Reasoning and Reading Comprehension.
            </p>
          </div>
          <Link
            href="/materials"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm transition-all hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-400"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#818cf8';
              e.currentTarget.style.color = '#4338ca';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '';
              e.currentTarget.style.color = '';
            }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
        </div>
      </FadeIn>

      {/* Search and Filters */}
      <FadeIn delayMs={60}>
        <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm md:p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search videos by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all focus:border-indigo-500 dark:focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
                onMouseEnter={(e) => {
                  if (document.activeElement !== e.currentTarget) {
                    const isDark = document.documentElement.classList.contains('dark');
                    e.currentTarget.style.borderColor = '#818cf8';
                    e.currentTarget.style.backgroundColor = isDark ? '#1e293b' : '#f8fafc';
                  }
                }}
                onMouseLeave={(e) => {
                  if (document.activeElement !== e.currentTarget) {
                    e.currentTarget.style.borderColor = '';
                    e.currentTarget.style.backgroundColor = '';
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '';
                  e.currentTarget.style.backgroundColor = '';
                }}
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Filter by section:</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 transition-all focus:border-indigo-500 dark:focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
                  onMouseEnter={(e) => {
                    const isDark = document.documentElement.classList.contains('dark');
                    e.currentTarget.style.borderColor = '#818cf8';
                    e.currentTarget.style.backgroundColor = isDark ? '#1e293b' : '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (document.activeElement !== e.currentTarget) {
                      e.currentTarget.style.borderColor = '';
                      e.currentTarget.style.backgroundColor = '';
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '';
                    e.currentTarget.style.backgroundColor = '';
                  }}
                >
                  <option value="all" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">All Sections</option>
                  {Object.entries(sectionNames).map(([key, name]) => (
                    <option key={key} value={key} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 transition-all focus:border-indigo-500 dark:focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
                  onMouseEnter={(e) => {
                    const isDark = document.documentElement.classList.contains('dark');
                    e.currentTarget.style.borderColor = '#818cf8';
                    e.currentTarget.style.backgroundColor = isDark ? '#1e293b' : '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (document.activeElement !== e.currentTarget) {
                      e.currentTarget.style.borderColor = '';
                      e.currentTarget.style.backgroundColor = '';
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '';
                    e.currentTarget.style.backgroundColor = '';
                  }}
                >
                  <option value="newest" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Newest First</option>
                  <option value="oldest" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Oldest First</option>
                  <option value="title" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Title (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Showing {filteredAndSortedVideos.length} of {videos.length} video{filteredAndSortedVideos.length !== 1 ? 's' : ''}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Video Grid */}
      {filteredAndSortedVideos.length === 0 ? (
        <FadeIn delayMs={120}>
          <EmptyState
            title={searchQuery || selectedSection !== 'all' ? 'No videos found' : 'No videos yet'}
            message={
              searchQuery || selectedSection !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Videos will appear here once they are uploaded and processed.'
            }
          />
        </FadeIn>
      ) : (
        <div className="space-y-8">
          {Object.entries(videosBySection).map(([section, sectionVideos], sectionIndex) => (
            <FadeIn key={section} delayMs={120 + sectionIndex * 30}>
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{sectionNames[section] || section}</h2>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                    {sectionVideos.length}
                  </span>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {sectionVideos.map((video, videoIndex) => (
                    <FadeIn key={video.id} delayMs={150 + sectionIndex * 30 + videoIndex * 10}>
                      <div
                        className="group cursor-pointer rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm transition-all hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md"
                        onClick={() => setSelectedVideo(video)}
                      >
                        <div className="space-y-3">
                          {/* Video Thumbnail/Preview */}
                          {video.mux_playback_id ? (
                            <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700">
                              <img
                                src={`https://image.mux.com/${video.mux_playback_id}/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop`}
                                alt={video.title}
                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                onError={(e) => {
                                  // Fallback if thumbnail fails
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = document.createElement('div');
                                  fallback.className = 'flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-100';
                                  fallback.innerHTML = `
                                    <svg class="h-12 w-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  `;
                                  target.parentElement?.appendChild(fallback);
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/10">
                                <div className="rounded-full bg-white/90 p-3 shadow-lg transition-transform group-hover:scale-110">
                                  <svg className="h-6 w-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200">
                              <svg className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          )}

                          {/* Video Info */}
                          <div className="space-y-2">
                            <h3 className="line-clamp-2 text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                              {video.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${sectionColors[video.section] || 'bg-slate-100 text-slate-800 border-slate-200'}`}
                              >
                                {sectionNames[video.section] || video.section}
                              </span>
                              <span className="text-xs text-slate-500">
                                {new Date(video.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </section>
            </FadeIn>
          ))}
        </div>
      )}

      {/* Video Modal/Player */}
      {selectedVideo && selectedVideo.mux_playback_id && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedVideo(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="video-modal-title"
        >
          <div
            className="relative w-full max-w-4xl rounded-xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-600 transition-all hover:bg-slate-200 hover:scale-110 active:scale-95"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e2e8f0';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '';
                e.currentTarget.style.transform = '';
              }}
              aria-label="Close video player"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="space-y-4">
              <h2 id="video-modal-title" className="pr-12 text-2xl font-bold text-slate-900 dark:text-slate-100">{selectedVideo.title}</h2>
              <div className="aspect-video w-full">
                <VideoPlayer playbackId={selectedVideo.mux_playback_id} title={selectedVideo.title} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
