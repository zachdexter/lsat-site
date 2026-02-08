'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import Link from 'next/link';
import { FadeIn } from '../../../components/FadeIn';
import { LoadingSkeleton, CardSkeleton } from '../../../components/LoadingSkeleton';
import { EmptyState } from '../../../components/EmptyState';

type Pdf = {
  id: string;
  title: string;
  section: string;
  file_path: string;
  file_name: string;
  file_size: number | null;
  created_at: string;
};

const sectionNames: Record<string, string> = {
  introduction: 'Introduction',
  lr: 'Logical Reasoning',
  rc: 'Reading Comprehension',
  'final-tips': 'Final Tips',
};

const sectionColors: Record<string, string> = {
  introduction: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
  lr: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
  rc: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
  'final-tips': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
};

export default function StudyGuidesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [pdfs, setPdfs] = useState<Pdf[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [downloadUrls, setDownloadUrls] = useState<Record<string, string>>({});
  const [isLoadingUrls, setIsLoadingUrls] = useState(false);
  const [isLoadingPdfs, setIsLoadingPdfs] = useState(false);

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
        loadPdfs();
      }
    }

    checkAccess();
  }, []);

  async function loadPdfs() {
    setIsLoadingPdfs(true);
    const { data, error } = await supabase
      .from('pdfs')
      .select('id, title, section, file_path, file_name, file_size, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading PDFs:', error);
      setIsLoadingPdfs(false);
    } else {
      setPdfs(data || []);
      // Load download URLs
      await loadDownloadUrls(data || []);
      setIsLoadingPdfs(false);
    }
  }

  async function loadDownloadUrls(pdfList: Pdf[]) {
    setIsLoadingUrls(true);
    const urls: Record<string, string> = {};
    const errors: string[] = [];
    
    for (const pdf of pdfList) {
      try {
        const { data: urlData, error: urlError } = await supabase.storage
          .from('materials')
          .createSignedUrl(pdf.file_path, 3600); // 1 hour expiry

        if (urlError) {
          console.error(`Error creating signed URL for PDF ${pdf.id}:`, urlError);
          errors.push(pdf.title);
        } else if (urlData) {
          urls[pdf.id] = urlData.signedUrl;
        }
      } catch (error) {
        console.error(`Error creating signed URL for PDF ${pdf.id}:`, error);
        errors.push(pdf.title);
      }
    }
    
    setDownloadUrls(urls);
    setIsLoadingUrls(false);
    
    if (errors.length > 0) {
      // Some PDFs failed to generate download URLs, but continue with available ones
    }
  }

  const filteredAndSortedPdfs = useMemo(() => {
    let filtered = pdfs.filter((pdf) => {
      const matchesSearch = pdf.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSection = selectedSection === 'all' || pdf.section === selectedSection;
      return matchesSearch && matchesSection;
    });

    // Sort PDFs
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

    return filtered;
  }, [pdfs, searchQuery, selectedSection, sortBy]);

  const pdfsBySection = useMemo(() => {
    return filteredAndSortedPdfs.reduce((acc, pdf) => {
      if (!acc[pdf.section]) {
        acc[pdf.section] = [];
      }
      acc[pdf.section].push(pdf);
      return acc;
    }, {} as Record<string, Pdf[]>);
  }, [filteredAndSortedPdfs]);

  if (isLoading) {
    return (
      <FadeIn>
        <div className="space-y-6">
          <LoadingSkeleton className="h-10" />
          <CardSkeleton />
        </div>
      </FadeIn>
    );
  }

  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <FadeIn>
          <section className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Study Guides and Notes</h1>
            <p className="text-sm text-slate-600">
              Access downloadable PDFs with strategies, answer keys, and practice problems.
            </p>
          </section>
        </FadeIn>

        <FadeIn delayMs={60}>
          <section className="rounded-2xl border-2 border-indigo-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center shadow-sm md:p-10">
            <h2 className="mb-3 text-xl font-semibold text-slate-900 dark:text-slate-100">Materials Access Required</h2>
            <p className="mb-6 text-slate-600 dark:text-slate-300">
              You need materials access to view study guides and notes. Purchase access to get full access.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/pricing"
                className="inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4f46e5';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                View Pricing
              </Link>
              <Link
                href="/materials"
                className="inline-block rounded-lg border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-indigo-300 hover:text-indigo-700"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#818cf8';
                  e.currentTarget.style.color = '#4338ca';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '';
                  e.currentTarget.style.color = '';
                }}
              >
                Back
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 md:text-4xl">Study Guides and Notes</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Downloadable PDFs with strategies, answer keys, practice problems, and study notes.
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
                placeholder="Search study guides by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 hover:border-indigo-300 dark:hover:border-indigo-600"
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

            {/* Filters and Sort */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Filter by section:</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 hover:border-indigo-300 dark:hover:border-indigo-600"
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
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 hover:border-indigo-300 dark:hover:border-indigo-600"
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
              {filteredAndSortedPdfs.length} study guide{filteredAndSortedPdfs.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </section>
      </FadeIn>

      {/* PDF List */}
      {isLoadingPdfs || isLoadingUrls ? (
        <FadeIn delayMs={120}>
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </FadeIn>
      ) : filteredAndSortedPdfs.length === 0 ? (
        <FadeIn delayMs={120}>
          <EmptyState
            title={searchQuery || selectedSection !== 'all' ? 'No study guides found' : 'No study guides yet'}
            message={
              searchQuery || selectedSection !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Study guides will appear here once they are uploaded.'
            }
          />
        </FadeIn>
      ) : (
        <div className="space-y-8">
          {Object.entries(pdfsBySection).map(([section, sectionPdfs], sectionIndex) => (
            <FadeIn key={section} delayMs={120 + sectionIndex * 30}>
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{sectionNames[section] || section}</h2>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                    {sectionPdfs.length}
                  </span>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {sectionPdfs.map((pdf, pdfIndex) => (
                    <FadeIn key={pdf.id} delayMs={150 + sectionIndex * 30 + pdfIndex * 10}>
                      <a
                        href={downloadUrls[pdf.id] || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm transition-all hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md"
                        onMouseEnter={(e) => {
                          const isDark = document.documentElement.classList.contains('dark');
                          e.currentTarget.style.borderColor = isDark ? '#6366f1' : '#818cf8';
                          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '';
                          e.currentTarget.style.boxShadow = '';
                        }}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-medium text-slate-900 dark:text-slate-100 line-clamp-2 mb-1">{pdf.title}</h3>
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                sectionColors[pdf.section] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {sectionNames[pdf.section] || pdf.section}
                            </span>
                          </div>
                        </div>
                        <div className="mt-auto flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span>{pdf.file_size ? `${(pdf.file_size / 1024).toFixed(1)} KB` : 'Unknown size'}</span>
                          <span>{new Date(pdf.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                          <span>Download</span>
                          <svg
                            className="h-4 w-4 transition-transform group-hover:translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </a>
                    </FadeIn>
                  ))}
                </div>
              </section>
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}
