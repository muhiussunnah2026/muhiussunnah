import { getTranslations } from "next-intl/server";
import { BookOpen } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { AddBookForm } from "./add-book-form";
import { IssueBookForm, ReturnBookButton } from "./issue-form";

export default async function LibraryPage() {
  const membership = await requireActiveRole([...ADMIN_ROLES]);
  const t = await getTranslations("library");

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();

  const [booksRes, studentsRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("library_books")
      .select("id, title, author, category, copies_total, copies_available, shelf")
      .eq("school_id", membership.school_id)
      .order("title"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("students")
      .select("id, name_bn, name_en")
      .eq("school_id", membership.school_id)
      .eq("is_active", true)
      .order("name_bn"),
  ]);
  const { data: books } = booksRes;
  const { data: students } = studentsRes;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: issues } = await (supabase as any)
    .from("library_issues")
    .select("id, book_id, due_on, returned_on, fine, students ( name_bn, name_en ), library_books ( title )")
    .in("book_id", (books ?? []).map((b: { id: string }) => b.id))
    .is("returned_on", null)
    .order("due_on");

  const bookList = (books ?? []) as Array<{ id: string; title: string; author: string | null; category: string | null; copies_total: number; copies_available: number; shelf: string | null }>;
  const issueList = (issues ?? []) as Array<{ id: string; book_id: string; due_on: string; returned_on: string | null; fine: number; students: { name_bn: string | null; name_en: string | null } | null; library_books: { title: string } | null }>;

  const totalBooks = bookList.reduce((s, b) => s + b.copies_total, 0);
  const issued = issueList.length;
  const overdue = issueList.filter((i) => new Date(i.due_on) < new Date()).length;

  return (
    <>
      <PageHeader
        title={t("page_title")}
        subtitle={t("page_subtitle")}
        impact={[
          { label: t("tally_books", { titles: bookList.length, copies: totalBooks }), tone: "default" },
          { label: t("tally_issued", { count: issued }), tone: "accent" },
          ...(overdue > 0 ? [{ label: t("tally_overdue", { count: overdue }), tone: "warning" as const }] : []),
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="space-y-6">
          {bookList.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="size-8" />}
              title={t("empty_title")}
              body={t("empty_body")}
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("col_title_author")}</TableHead>
                      <TableHead>{t("col_category")}</TableHead>
                      <TableHead>{t("col_shelf")}</TableHead>
                      <TableHead className="text-right">{t("col_total")}</TableHead>
                      <TableHead className="text-right">{t("col_available")}</TableHead>
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

          {issueList.length > 0 && (
            <>
              <h2 className="text-base font-semibold">{t("issues_heading")}</h2>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("col_book")}</TableHead>
                        <TableHead>{t("col_student")}</TableHead>
                        <TableHead>{t("col_due")}</TableHead>
                        <TableHead>{t("col_status")}</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {issueList.map((i) => {
                        const isOverdue = new Date(i.due_on) < new Date();
                        return (
                          <TableRow key={i.id}>
                            <TableCell className="text-sm">{i.library_books?.title ?? "—"}</TableCell>
                            <TableCell className="text-sm">{i.students?.name_bn ?? i.students?.name_en ?? "—"}</TableCell>
                            <TableCell className="text-xs">{i.due_on}</TableCell>
                            <TableCell>
                              {isOverdue
                                ? <Badge variant="destructive">{t("status_overdue_badge")}</Badge>
                                : <Badge variant="secondary">{t("status_issued_badge")}</Badge>}
                            </TableCell>
                            <TableCell>
                              <ReturnBookButton issue={i} schoolSlug={schoolSlug} />
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
              <h2 className="mb-4 text-base font-semibold">{t("new_book_heading")}</h2>
              <AddBookForm  schoolSlug={schoolSlug}/>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-base font-semibold">{t("issue_heading")}</h2>
              <IssueBookForm
                books={bookList}
                students={(students ?? []) as Array<{ id: string; name_bn: string | null; name_en: string | null }>}
              schoolSlug={schoolSlug} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
