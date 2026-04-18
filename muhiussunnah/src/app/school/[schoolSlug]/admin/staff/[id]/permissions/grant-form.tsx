"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { grantPermissionAction } from "@/server/actions/staff";
import type { ActionResult } from "@/server/actions/_helpers";

type ClassOption = { id: string; name_bn: string };
type SectionOption = { id: string; name: string; class_id: string; classes: { name_bn: string } };

type Props = {
  schoolSlug: string;
  schoolUserId: string;
  classes: ClassOption[];
  sections: SectionOption[];
};

export function GrantPermissionForm({ schoolSlug, schoolUserId, classes, sections }: Props) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(grantPermissionAction, null);
  const [scopeType, setScopeType] = useState<string>("school");

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? "অনুমতি দেওয়া হয়েছে");
    else toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="school_user_id" value={schoolUserId} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="action">কাজ</Label>
        <Select name="action" defaultValue="view">
          <SelectTrigger id="action"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="view">দেখা (view)</SelectItem>
            <SelectItem value="create">তৈরি (create)</SelectItem>
            <SelectItem value="update">সম্পাদনা (update)</SelectItem>
            <SelectItem value="delete">মুছে ফেলা (delete)</SelectItem>
            <SelectItem value="approve">অনুমোদন (approve)</SelectItem>
            <SelectItem value="export">এক্সপোর্ট</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="resource">রিসোর্স</Label>
        <Select name="resource" defaultValue="student">
          <SelectTrigger id="resource"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="student">ছাত্র</SelectItem>
            <SelectItem value="attendance">উপস্থিতি</SelectItem>
            <SelectItem value="marks">মার্ক্স</SelectItem>
            <SelectItem value="fee">ফি</SelectItem>
            <SelectItem value="exam">পরীক্ষা</SelectItem>
            <SelectItem value="salary">বেতন</SelectItem>
            <SelectItem value="class">শ্রেণি</SelectItem>
            <SelectItem value="subject">বিষয়</SelectItem>
            <SelectItem value="notice">নোটিশ</SelectItem>
            <SelectItem value="report_card">রিপোর্ট কার্ড</SelectItem>
            <SelectItem value="finance_report">ফিনান্স রিপোর্ট</SelectItem>
            <SelectItem value="donation">চাঁদা</SelectItem>
            <SelectItem value="hifz">হিফজ</SelectItem>
            <SelectItem value="sabaq">সবক</SelectItem>
            <SelectItem value="certificate">সার্টিফিকেট</SelectItem>
            <SelectItem value="library">লাইব্রেরি</SelectItem>
            <SelectItem value="transport">পরিবহন</SelectItem>
            <SelectItem value="hostel">হোস্টেল</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="scope_type">স্কোপ</Label>
        <Select name="scope_type" value={scopeType} onValueChange={(v: string | null) => v && setScopeType(v)}>
          <SelectTrigger id="scope_type"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="school">পুর ো স্কুল</SelectItem>
            <SelectItem value="class">নির্দিষ্ট শ্রেণি</SelectItem>
            <SelectItem value="section">নির্দিষ্ট সেকশন</SelectItem>
            <SelectItem value="self">নিজের ডেটা (self)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {scopeType === "class" ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="scope_id_class">শ্রেণি</Label>
          <Select name="scope_id">
            <SelectTrigger id="scope_id_class"><SelectValue placeholder="শ্রেণি নির্বাচন" /></SelectTrigger>
            <SelectContent>
              {classes.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name_bn}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {scopeType === "section" ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="scope_id_section">সেকশন</Label>
          <Select name="scope_id">
            <SelectTrigger id="scope_id_section"><SelectValue placeholder="সেকশন নির্বাচন" /></SelectTrigger>
            <SelectContent>
              {sections.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.classes.name_bn} — {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? "দেওয়া হচ্ছে..." : "অনুমতি দিন"}
      </Button>
    </form>
  );
}
