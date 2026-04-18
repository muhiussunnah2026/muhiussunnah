import Link from "next/link";
import { BookOpen } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { AddBookForm } from "./add-book-form";
import { IssueBookForm, ReturnBookButton } from "./issue-form";

type PageProps = { params: Promise<{ schoolSlug: string }> };

export default async function LibraryPage({ params }: PageProps) {
  const { schoolSlug } = await params;
  const membership = await requireRole(schoolSlug, [...ADMIN_ROLES]);

  const supabase = await supabaseServer();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: books } = await (supabase as any)
    .from("library_books")
    .select("id, title, author, category, copies_total, copies_available, shelf")
    .eq("school_id", membership.school_id)
    .order("title");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: issues } = await (supabase as any)
    .from("library_issues")
    .select("id, book_id, due_on, returned_on, fine, students ( name_bn, name_en ), library_books ( title )")
    .in("book_id", (books ?? []).map((b: { id: string }) => b.id))
    .is("returned_on", null)
    .order("due_on");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: students } = await (supabase as any)
    .from("students")
    .select("id, name_bn, name_en")
    .eq("school_id", membership.school_id)
    .eq("is_active", true)
    .order("name_bn");

  const bookList = (books ?? []) as Array<{ id: string; title: string; author: string | null; category: string | null; copies_total: number; copies_available: number; shelf: string | null }>;
  const issueList = (issues ?? []) as Array<{ id: string; book_id: string; due_on: string; returned_on: string | null; fine: number; students: { name_bn: string | null; name_en: string | null } | null; library_books: { title: string } | null }>;

  const totalBooks = bookList.reduce((s, b) => s + b.copies_total, 0);
  const issued = issueList.length;
  const overdue = issueList.filter((i) => new Date(i.due_on) < new Date()).length;

  return (
    <>
      <PageHeader
        title="লাইব্রেরি"
        subtitle="বইয়ের ক্যাটালগ, ইস্যু/রিটার্ন ব্যবস্থাপনা।"
        impact={[
          { label: <><BanglaDigit value={bookList.length} /> শিরোনাম · <BanglaDigit value={totalBooks} /> কপি</>, tone: "default" },
          { label: <><BanglaDigit value={issued} /> ইস্যু করা</>, tone: "accent" },
          ...(overdue > 0 ? [{ label: <><BanglaDigit value={overdue} /> মেয়াদোত্তীর্ণ</>, tone: "warning" as const }] : []),
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="space-y-6">
          {/* Books catalog */}
          {bookList.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="size-8" />}
              title="কোন বই নেই"
              body="ডান পাশের ফর্ম থেকে প্রথম বই যোগ করুন।"
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>শিরোনাম / লেখক</TableHead>
                      <TableHead>বিভাগ</TableHead>
                      <TableHead>শেলফ</TableHead>
                      <TableHead className="text-right">মোট</TableHead>
                      <TableHead className="text-right">Available</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookList.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell>
                          <div className="font-medium">{b.title}</div>
                          {b.author && <div className="text-xs text-muted-foreground">{b.author}</div>}
                        </TableCell>
                        <TableCell>{b.category ? <Badge variant="outline">{b.category}</Badge> : "—"}</TableCell>
                        <TableCell className="text-xs">{b.shelf ?? "—"}</TableCell>
                        <TableCell className="text-right"><BanglaDigit value={b.copies_total} /></TableCell>
                        <TableCell className="text-right">
                          <span className={b.copies_available === 0 ? "text-destructive" : "text-success"}>
                            <BanglaDigit value={b.copies_available} />
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Active issues */}
          {issueList.length > 0 && (
            <>
              <h2 className="text-base font-semibold">ইস্যু করা বই (ফেরত আসেনি)</h2>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>বই</TableHead>
                        <TableHead>ছাত্র</TableHead>
                        <TableHead>ফেরতের তারিখ</TableHead>
                        <TableHead>স্ট্যাটাস</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {issueList.map((i) => {
                        const overdue = new Date(i.due_on) < new Date();
                        return (
                          <TableRow key={i.id}>
                            <TableCell className="text-sm">{i.library_books?.title ?? "—"}</TableCell>
                            <TableCell className="text-sm">{i.students?.name_bn ?? i.students?.name_en ?? "—"}</TableCell>
                            <TableCell className="text-xs">{i.due_on}</TableCell>
                            <TableCell>
                              {overdue
                                ? <Badge variant="destructive">Overdue</Badge>
                                : <Badge variant="secondary">ইস্যু করা</Badge>}
                            </TableCell>
                            <TableCell>
                              <ReturnBookButton schoolSlug={schoolSlug} issue={i} />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </section>

        <aside className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-base font-semibold">নতুন বই যোগ</h2>
              <AddBookForm schoolSlug={schoolSlug} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-base font-semibold">বই ইস্যু করুন</h2>
              <IssueBookForm
                schoolSlug={schoolSlug}
                books={bookList}
                students={(students ?? []) as Array<{ id: string; name_bn: string | null; name_en: string | null }>}
              />
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
