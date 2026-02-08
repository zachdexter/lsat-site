'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { FadeIn } from '../../components/FadeIn';

type User = {
  id: string;
  full_name: string | null;
  role: string | null;
  membership_status: string | null;
  created_at: string;
};

type Video = {
  id: string;
  title: string;
  section: string;
  status: string;
  mux_playback_id: string | null;
  created_at: string;
};

export default function AdminDashboardPage() {
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isUsersCollapsed, setIsUsersCollapsed] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  
  // Video upload form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSection, setUploadSection] = useState('introduction');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // PDF upload form state
  const [pdfUploadTitle, setPdfUploadTitle] = useState('');
  const [pdfUploadSection, setPdfUploadSection] = useState('introduction');
  const [pdfUploadFile, setPdfUploadFile] = useState<File | null>(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfUploadError, setPdfUploadError] = useState<string | null>(null);
  const [pdfUploadSuccess, setPdfUploadSuccess] = useState(false);
  const [pdfs, setPdfs] = useState<Array<{
    id: string;
    title: string;
    section: string;
    file_path: string;
    file_name: string;
    file_size: number | null;
    created_at: string;
  }>>([]);
  const [isLoadingPdfs, setIsLoadingPdfs] = useState(false);
  const [showVideosList, setShowVideosList] = useState(false);
  const [showPdfsList, setShowPdfsList] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsChecking(false);
        setIsAdmin(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error loading profile in admin check:', profileError);
      }

      setIsAdmin(profile?.role === 'admin');
      setIsChecking(false);

      // If admin, load users, videos, and PDFs
      if (profile?.role === 'admin') {
        loadUsers();
        loadVideos();
        loadPdfs();
      }
    }

    checkAdmin();
  }, []);

  async function loadVideos() {
    setIsLoadingVideos(true);
    const { data, error } = await supabase
      .from('videos')
      .select('id, title, section, status, mux_playback_id, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading videos:', error);
    } else {
      setVideos(data || []);
    }
    setIsLoadingVideos(false);
  }

  async function loadPdfs() {
    setIsLoadingPdfs(true);
    const { data, error } = await supabase
      .from('pdfs')
      .select('id, title, section, file_path, file_name, file_size, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading PDFs:', error);
    } else {
      setPdfs(data || []);
    }
    setIsLoadingPdfs(false);
  }

  async function handleDeleteVideo(videoId: string) {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    const { error } = await supabase.from('videos').delete().eq('id', videoId);

    if (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video. Please try again.');
    } else {
      loadVideos();
    }
  }

  async function handleDeletePdf(pdfId: string, filePath: string) {
    if (!confirm('Are you sure you want to delete this PDF? This action cannot be undone.')) {
      return;
    }

    // Delete from database
    const { error: dbError } = await supabase.from('pdfs').delete().eq('id', pdfId);

    if (dbError) {
      console.error('Error deleting PDF from database:', dbError);
      alert('Failed to delete PDF. Please try again.');
      return;
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage.from('materials').remove([filePath]);

    if (storageError) {
      console.error('Error deleting PDF from storage:', storageError);
      // Still reload since DB delete succeeded
    }

    loadPdfs();
  }

  async function refreshVideoStatus(videoId: string) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.error('No session found');
        return;
      }

      const response = await fetch('/api/mux/check-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ videoId }),
      });

      if (!response.ok) {
        let errorData;
        try {
          const text = await response.text();
          errorData = text ? JSON.parse(text) : {};
        } catch {
          errorData = { error: `HTTP ${response.status}` };
        }
        console.error('Refresh status error:', {
          status: response.status,
          error: errorData,
          details: errorData.details || errorData.error,
        });
        alert(`Failed to refresh: ${errorData.details || errorData.error || 'Unknown error'}`);
        return;
      }

      const result = await response.json();
      
      // Reload videos to show updated status
      loadVideos();
    } catch (error) {
      console.error('Error refreshing video status:', error);
    }
  }

  async function handleVideoUpload(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    setUploadError(null);
    setUploadSuccess(false);

    if (!uploadFile || !uploadTitle) {
      setUploadError('Please fill in all fields');
      return;
    }

    setIsUploading(true);

    try {
      // Get auth token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setUploadError('You must be logged in to upload videos');
        setIsUploading(false);
        return;
      }

      // Create Mux direct upload
      const uploadResponse = await fetch('/api/mux/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: uploadTitle,
          section: uploadSection,
        }),
      });

      if (!uploadResponse.ok) {
        let errorData;
        let responseText = '';
        try {
          responseText = await uploadResponse.text();
          errorData = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
          errorData = { error: `HTTP ${uploadResponse.status}: ${uploadResponse.statusText}` };
        }
        console.error('Upload API error:', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          responseText,
          errorData,
        });
        const errorMessage = errorData.details || errorData.error || `Failed to create upload (HTTP ${uploadResponse.status}: ${uploadResponse.statusText})`;
        setUploadError(errorMessage);
        setIsUploading(false);
        return;
      }

      const { uploadUrl, uploadId } = await uploadResponse.json();

      // Upload file directly to Mux
      const fileUploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: uploadFile,
        headers: {
          'Content-Type': uploadFile.type,
        },
      });

      if (!fileUploadResponse.ok) {
        throw new Error('Failed to upload file to Mux');
      }

      // Success! Reset uploading state immediately so button is enabled
      setIsUploading(false);
      setUploadSuccess(true);
      
      // Reload videos and clear success message after showing it
      setTimeout(() => {
        setUploadSuccess(false);
        loadVideos();
      }, 3000);
      
      // Note: We keep the form fields filled so user can upload another video immediately
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.';
      setUploadError(errorMessage);
      setIsUploading(false);
    }
  }

  async function handlePdfUpload(e: React.FormEvent) {
    e.preventDefault();
    setPdfUploadError(null);
    setPdfUploadSuccess(false);

    if (!pdfUploadTitle || !pdfUploadSection || !pdfUploadFile) {
      setPdfUploadError('Please fill in all fields and select a file.');
      return;
    }

    setIsUploadingPdf(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setPdfUploadError('You must be logged in to upload PDFs.');
        setIsUploadingPdf(false);
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', pdfUploadFile);
      formData.append('title', pdfUploadTitle);
      formData.append('section', pdfUploadSection);

      const uploadResponse = await fetch('/api/pdf/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        let errorData;
        let responseText = '';
        try {
          responseText = await uploadResponse.text();
          errorData = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
          errorData = { error: `HTTP ${uploadResponse.status}: ${uploadResponse.statusText}` };
        }
        console.error('PDF Upload API error:', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          responseText,
          errorData,
        });
        const errorMessage = errorData.details || errorData.error || `Failed to upload PDF (HTTP ${uploadResponse.status}: ${uploadResponse.statusText})`;
        setPdfUploadError(errorMessage);
        setIsUploadingPdf(false);
        return;
      }

      // Success! Reset form and reload PDFs
      setPdfUploadTitle('');
      setPdfUploadSection('introduction');
      setPdfUploadFile(null);
      setIsUploadingPdf(false);
      setPdfUploadSuccess(true);

      // Reload PDFs after a short delay
      setTimeout(() => {
        loadPdfs();
        setPdfUploadSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('PDF upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.';
      setPdfUploadError(errorMessage);
      setIsUploadingPdf(false);
    }
  }

  async function loadUsers() {
    setIsLoadingUsers(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, membership_status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading users:', error);
    } else {
      setUsers(data || []);
    }
    setIsLoadingUsers(false);
  }

  if (isChecking) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">Checking admin access…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Not authorized</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          You need an admin account to view this dashboard. Please log in with an admin user.
        </p>
        <Link
          href="/"
            className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-all hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-400 hover:scale-[1.02] active:scale-95"
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#818cf8';
            e.currentTarget.style.color = '#4338ca';
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '';
            e.currentTarget.style.color = '';
            e.currentTarget.style.transform = '';
          }}
        >
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <FadeIn>
        <section className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 md:text-4xl">Admin Dashboard</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Internal tools for managing videos and tracking Basket LSAT users.
            </p>
          </div>
          <Link
            href="/"
            className="hidden rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-all hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-400 hover:scale-[1.02] active:scale-95 md:inline-block"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#818cf8';
              e.currentTarget.style.color = '#4338ca';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '';
              e.currentTarget.style.color = '';
              e.currentTarget.style.transform = '';
            }}
          >
            ← Back to site
          </Link>
        </section>
      </FadeIn>

      <div className="space-y-8">
        {/* Users table - collapsible, above video section */}
        <FadeIn delayMs={0}>
          <section className="rounded-2xl border-2 border-indigo-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 md:p-8 shadow-sm">
            <button
              type="button"
              onClick={() => setIsUsersCollapsed(!isUsersCollapsed)}
              className="flex w-full items-center justify-between gap-4 rounded-lg px-2 py-1 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
              onMouseEnter={(e) => {
                const isDark = document.documentElement.classList.contains('dark');
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(67, 56, 202, 0.3)' : '#eef2ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '';
              }}
            >
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 md:text-2xl">Current users</h2>
              <span className="text-lg text-slate-400 transition-transform">
                {isUsersCollapsed ? '▼' : '▲'}
              </span>
            </button>

            {!isUsersCollapsed && (
              <div className="mt-4">
                {isLoadingUsers ? (
                  <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">Loading users…</div>
                ) : users.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">No users found.</div>
                ) : (
                  <div className="-mx-4 overflow-x-auto md:mx-0">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-700">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                            Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                            Role
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                            Access
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                            Joined
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td className="whitespace-nowrap px-4 py-2 font-medium text-slate-900 dark:text-slate-100">
                              {user.full_name || 'No name'}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2 text-slate-600 dark:text-slate-300 capitalize">
                              {user.role || 'none'}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2">
                              <StatusBadge status={user.membership_status} />
                            </td>
                            <td className="whitespace-nowrap px-4 py-2 text-xs text-slate-500 dark:text-slate-400">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </section>
        </FadeIn>

        {/* Video upload / management */}
        <FadeIn delayMs={120}>
          <section className="space-y-4 rounded-2xl border-2 border-indigo-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 md:p-8 shadow-sm">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 md:text-2xl">Video library</h2>
            </div>

            {/* Videos list */}
            {videos.length > 0 && (
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowVideosList(!showVideosList)}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <span>Uploaded Videos ({videos.length})</span>
                    <svg
                      className={`h-4 w-4 transition-transform ${showVideosList ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Refresh all videos
                      for (const video of videos) {
                        await refreshVideoStatus(video.id);
                      }
                      loadVideos();
                    }}
                    className="cursor-pointer rounded px-2 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 hover:scale-105 active:scale-95"
                    onMouseEnter={(e) => {
                      const isDark = document.documentElement.classList.contains('dark');
                      e.currentTarget.style.backgroundColor = isDark ? 'rgba(67, 56, 202, 0.3)' : '#eef2ff';
                      e.currentTarget.style.color = isDark ? '#818cf8' : '#4338ca';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '';
                      e.currentTarget.style.color = '';
                      e.currentTarget.style.transform = '';
                    }}
                  >
                    Refresh All
                  </button>
                </div>
                {showVideosList && (
                  <div className="space-y-2">
                    {videos.map((video) => (
                    <div
                      key={video.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{video.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {video.section} • {video.status}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <VideoStatusBadge status={video.status} />
                        {video.status === 'processing' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              refreshVideoStatus(video.id);
                            }}
                            className="cursor-pointer rounded px-2 py-1 text-xs font-medium text-indigo-600 transition-all hover:bg-indigo-50 hover:text-indigo-700 hover:scale-105 active:scale-95"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#eef2ff';
                              e.currentTarget.style.color = '#4338ca';
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '';
                              e.currentTarget.style.color = '';
                              e.currentTarget.style.transform = '';
                            }}
                          >
                            Refresh
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteVideo(video.id);
                          }}
                          className="cursor-pointer rounded px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 transition-all hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300 hover:scale-105 active:scale-95"
                          onMouseEnter={(e) => {
                            const isDark = document.documentElement.classList.contains('dark');
                            e.currentTarget.style.backgroundColor = isDark ? 'rgba(220, 38, 38, 0.3)' : '#fef2f2';
                            e.currentTarget.style.color = isDark ? '#f87171' : '#dc2626';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '';
                            e.currentTarget.style.color = '';
                            e.currentTarget.style.transform = '';
                          }}
                          aria-label="Delete video"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 space-y-5">
              {/* Upload form */}
              <form
                className="space-y-4 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-900/20 p-4 md:p-5"
                onSubmit={handleVideoUpload}
              >
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-800 dark:text-slate-200" htmlFor="video-title">
                    Video title
                  </label>
                  <input
                    id="video-title"
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm outline-none ring-indigo-100 dark:ring-indigo-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-2"
                    placeholder="e.g. Introduction to LSAT Strategy"
                    required
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

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-800 dark:text-slate-200" htmlFor="video-section">
                    Section
                  </label>
                  <select
                    id="video-section"
                    value={uploadSection}
                    onChange={(e) => setUploadSection(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm outline-none ring-indigo-100 dark:ring-indigo-900 transition-all focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-2"
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
                    <option value="introduction">Introduction</option>
                    <option value="lr">Logical Reasoning</option>
                    <option value="rc">Reading Comprehension</option>
                    <option value="final-tips">Final Tips</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-800 dark:text-slate-200" htmlFor="video-file">
                    Video file
                  </label>
                  <input
                    id="video-file"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-slate-700 dark:text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white file:transition-all file:hover:bg-indigo-700 file:hover:scale-105 file:cursor-pointer"
                    required
                  />
                </div>

                {uploadError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                    {uploadError}
                  </div>
                )}

                {uploadSuccess && (
                  <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 p-3 text-xs text-emerald-800 dark:text-emerald-200">
                    Video upload started! Processing may take a few minutes.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isUploading || !uploadFile || !uploadTitle}
                  className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = '#4f46e5';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = '';
                      e.currentTarget.style.transform = '';
                    }
                  }}
                >
                  {isUploading ? 'Uploading...' : 'Upload video'}
                </button>
              </form>
            </div>
          </section>
        </FadeIn>

        {/* PDF library */}
        <FadeIn delayMs={240}>
          <section className="space-y-4 rounded-2xl border-2 border-indigo-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 md:p-8 shadow-sm">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 md:text-2xl">PDF Library</h2>
            </div>

            {/* PDFs list */}
            {pdfs.length > 0 && (
              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={() => setShowPdfsList(!showPdfsList)}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <span>Uploaded PDFs ({pdfs.length})</span>
                  <svg
                    className={`h-4 w-4 transition-transform ${showPdfsList ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showPdfsList && (
                  <div className="space-y-2">
                    {pdfs.map((pdf) => (
                    <div
                      key={pdf.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{pdf.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {pdf.section} • {pdf.file_name} • {pdf.file_size ? `${(pdf.file_size / 1024).toFixed(1)} KB` : 'Unknown size'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeletePdf(pdf.id, pdf.file_path);
                        }}
                        className="cursor-pointer rounded px-2 py-1 text-xs font-medium text-red-600 transition-all hover:bg-red-50 hover:text-red-700 hover:scale-105 active:scale-95"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                          e.currentTarget.style.color = '#dc2626';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '';
                          e.currentTarget.style.color = '';
                          e.currentTarget.style.transform = '';
                        }}
                        aria-label="Delete PDF"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 space-y-5">
              {/* PDF Upload form */}
              <form
                className="space-y-4 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-900/20 p-4 md:p-5"
                onSubmit={handlePdfUpload}
              >
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-800 dark:text-slate-200" htmlFor="pdf-title">
                    PDF title
                  </label>
                  <input
                    id="pdf-title"
                    type="text"
                    value={pdfUploadTitle}
                    onChange={(e) => setPdfUploadTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm outline-none ring-indigo-100 dark:ring-indigo-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-2"
                    placeholder="e.g. Logical Reasoning Study Guide"
                    required
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

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-800 dark:text-slate-200" htmlFor="pdf-section">
                    Section
                  </label>
                  <select
                    id="pdf-section"
                    value={pdfUploadSection}
                    onChange={(e) => setPdfUploadSection(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm outline-none ring-indigo-100 dark:ring-indigo-900 transition-all focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-2"
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
                    <option value="introduction">Introduction</option>
                    <option value="lr">Logical Reasoning</option>
                    <option value="rc">Reading Comprehension</option>
                    <option value="final-tips">Final Tips</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-800 dark:text-slate-200" htmlFor="pdf-file">
                    PDF file
                  </label>
                  <input
                    id="pdf-file"
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setPdfUploadFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-slate-700 dark:text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white file:transition-all file:hover:bg-indigo-700 file:hover:scale-105 file:cursor-pointer"
                    required
                  />
                </div>

                {pdfUploadError && (
                  <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 p-3 text-xs text-red-800 dark:text-red-200">
                    {pdfUploadError}
                  </div>
                )}

                {pdfUploadSuccess && (
                  <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 p-3 text-xs text-emerald-800 dark:text-emerald-200">
                    PDF uploaded successfully!
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isUploadingPdf || !pdfUploadFile || !pdfUploadTitle}
                  className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = '#4f46e5';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = '';
                      e.currentTarget.style.transform = '';
                    }
                  }}
                >
                  {isUploadingPdf ? 'Uploading...' : 'Upload PDF'}
                </button>
              </form>
            </div>
          </section>
        </FadeIn>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
        ● Active
      </span>
    );
  }

  if (status === 'trial') {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
        ● Trial
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
      ● No Access
    </span>
  );
}

function VideoStatusBadge({ status }: { status: string }) {
  if (status === 'ready') {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
        ● Ready
      </span>
    );
  }

  if (status === 'processing') {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
        ● Processing
      </span>
    );
  }

  if (status === 'errored') {
    return (
      <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-900/30 px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-300">
        ● Error
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
      ● {status}
    </span>
  );
}
