'use client';
import Link from "next/link";

export default function Pagination({
  page,
  total,
  baseUrl
}: {
  page: number;
  total: number;
  baseUrl: string;
}) {
  const pages = Math.max(1, Math.ceil(total / 10));

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`${baseUrl}?page=${page - 1}`}
        className={`px-3 py-1 border rounded ${page <= 1 ? "opacity-50 pointer-events-none" : ""}`}
      >
        Prev
      </Link>

      <div>Page {page} / {pages}</div>

      <Link
        href={`${baseUrl}?page=${page + 1}`}
        className={`px-3 py-1 border rounded ${page >= pages ? "opacity-50 pointer-events-none" : ""}`}
      >
        Next
      </Link>
    </div>
  );
}
