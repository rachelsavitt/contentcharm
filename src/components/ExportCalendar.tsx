import { useState } from 'react';
import { CalendarPost } from '../lib/supabase';
import { Download, FileText, Table } from 'lucide-react';

interface ExportCalendarProps {
  posts: CalendarPost[];
  calendarTitle: string;
}

export function ExportCalendar({ posts, calendarTitle }: ExportCalendarProps) {
  const [showMenu, setShowMenu] = useState(false);

  const approvedPosts = posts.filter((p) => p.approval_status === 'approved');

  const exportToCSV = () => {
    const headers = ['Date', 'Platform', 'Title', 'Caption', 'Image URL', 'Status'];
    const rows = approvedPosts.map((post) => [
      post.scheduled_date || '',
      post.platform,
      post.title,
      (post.caption || '').replace(/"/g, '""'),
      post.image_url || '',
      post.approval_status || 'pending'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${calendarTitle.replace(/\s+/g, '_')}_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowMenu(false);
  };

  const exportToJSON = () => {
    const exportData = {
      calendar: calendarTitle,
      exportDate: new Date().toISOString(),
      posts: approvedPosts.map((post) => ({
        date: post.scheduled_date,
        platform: post.platform,
        title: post.title,
        caption: post.caption,
        imageUrl: post.image_url,
        status: post.approval_status
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${calendarTitle.replace(/\s+/g, '_')}_export.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowMenu(false);
  };

  const exportForBuffer = () => {
    const bufferFormat = approvedPosts.map((post) => ({
      'Scheduled At': post.scheduled_date ? new Date(post.scheduled_date + 'T12:00:00').toISOString() : '',
      'Profile': post.platform,
      'Text': post.caption || '',
      'Image URL': post.image_url || '',
      'Link': ''
    }));

    const headers = ['Scheduled At', 'Profile', 'Text', 'Image URL', 'Link'];
    const rows = bufferFormat.map((item) => [
      item['Scheduled At'],
      item.Profile,
      (item.Text || '').replace(/"/g, '""'),
      item['Image URL'],
      item.Link
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${calendarTitle.replace(/\s+/g, '_')}_buffer.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => approvedPosts.length > 0 && setShowMenu(!showMenu)}
        disabled={approvedPosts.length === 0}
        className="btn-secondary flex items-center gap-2 text-xs px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        title={approvedPosts.length === 0 ? 'No approved posts to export' : `Export ${approvedPosts.length} approved post${approvedPosts.length === 1 ? '' : 's'}`}
      >
        <Download className="w-4 h-4" />
        Export ({approvedPosts.length})
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
            <div className="p-2">
              <button
                onClick={exportToCSV}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <Table className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Export as CSV</p>
                  <p className="text-xs text-gray-500">Universal format</p>
                </div>
              </button>

              <button
                onClick={exportToJSON}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <FileText className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Export as JSON</p>
                  <p className="text-xs text-gray-500">Developer-friendly</p>
                </div>
              </button>

              <div className="border-t border-gray-200 my-2" />

              <button
                onClick={exportForBuffer}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <span className="text-lg">📅</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Buffer Format</p>
                  <p className="text-xs text-gray-500">Import to Buffer</p>
                </div>
              </button>
            </div>

            <div className="bg-blue-50 border-t border-blue-200 p-3">
              <p className="text-xs text-blue-900">
                <strong>Tip:</strong> Import these files into Buffer, Hootsuite, Later, or any scheduling tool that supports CSV import.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
