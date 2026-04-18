export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      academic_years: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_active: boolean
          name: string
          school_id: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_active?: boolean
          name: string
          school_id: string
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_active?: boolean
          name?: string
          school_id?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_years_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      admission_inquiries: {
        Row: {
          assigned_to: string | null
          branch_id: string | null
          class_interested: string | null
          created_at: string
          followup_date: string | null
          guardian_email: string | null
          guardian_name: string | null
          guardian_phone: string
          id: string
          notes: string | null
          school_id: string
          source: string
          status: string
          student_name: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          branch_id?: string | null
          class_interested?: string | null
          created_at?: string
          followup_date?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone: string
          id?: string
          notes?: string | null
          school_id: string
          source?: string
          status?: string
          student_name: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          branch_id?: string | null
          class_interested?: string | null
          created_at?: string
          followup_date?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string
          id?: string
          notes?: string | null
          school_id?: string
          source?: string
          status?: string
          student_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admission_inquiries_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admission_inquiries_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "school_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admission_inquiries_class_interested_fkey"
            columns: ["class_interested"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admission_inquiries_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_submissions: {
        Row: {
          assignment_id: string
          body: string | null
          feedback: string | null
          file_url: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          marks: number | null
          student_id: string
          submitted_at: string | null
        }
        Insert: {
          assignment_id: string
          body?: string | null
          feedback?: string | null
          file_url?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          marks?: number | null
          student_id: string
          submitted_at?: string | null
        }
        Update: {
          assignment_id?: string
          body?: string | null
          feedback?: string | null
          file_url?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          marks?: number | null
          student_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          attachments: Json
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          max_marks: number | null
          school_id: string
          section_id: string
          subject_id: string
          title: string
          updated_at: string
        }
        Insert: {
          attachments?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          max_marks?: number | null
          school_id: string
          section_id: string
          subject_id: string
          title: string
          updated_at?: string
        }
        Update: {
          attachments?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          max_marks?: number | null
          school_id?: string
          section_id?: string
          subject_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          check_in_time: string | null
          check_out_time: string | null
          date: string
          device_id: string | null
          id: string
          marked_at: string
          marked_by: string | null
          metadata: Json
          remarks: string | null
          school_id: string
          section_id: string | null
          source: string
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
        }
        Insert: {
          check_in_time?: string | null
          check_out_time?: string | null
          date: string
          device_id?: string | null
          id?: string
          marked_at?: string
          marked_by?: string | null
          metadata?: Json
          remarks?: string | null
          school_id: string
          section_id?: string | null
          source?: string
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
        }
        Update: {
          check_in_time?: string | null
          check_out_time?: string | null
          date?: string
          device_id?: string | null
          id?: string
          marked_at?: string
          marked_by?: string | null
          metadata?: Json
          remarks?: string | null
          school_id?: string
          section_id?: string | null
          source?: string
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_devices: {
        Row: {
          branch_id: string | null
          created_at: string
          device_id: string
          id: string
          is_active: boolean
          last_seen: string | null
          location: string | null
          name: string
          school_id: string
          settings: Json
          type: string
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          device_id: string
          id?: string
          is_active?: boolean
          last_seen?: string | null
          location?: string | null
          name: string
          school_id: string
          settings?: Json
          type: string
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          device_id?: string
          id?: string
          is_active?: boolean
          last_seen?: string | null
          location?: string | null
          name?: string
          school_id?: string
          settings?: Json
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_devices_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "school_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_devices_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip: unknown
          meta: Json
          resource_id: string | null
          resource_type: string
          school_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip?: unknown
          meta?: Json
          resource_id?: string | null
          resource_type: string
          school_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip?: unknown
          meta?: Json
          resource_id?: string | null
          resource_type?: string
          school_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      canteen_transactions: {
        Row: {
          amount: number
          at: string
          id: string
          item_name: string | null
          merchant_id: string | null
          school_id: string
          student_id: string
          type: string
        }
        Insert: {
          amount: number
          at?: string
          id?: string
          item_name?: string | null
          merchant_id?: string | null
          school_id: string
          student_id: string
          type: string
        }
        Update: {
          amount?: number
          at?: string
          id?: string
          item_name?: string | null
          merchant_id?: string | null
          school_id?: string
          student_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "canteen_transactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "canteen_transactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      canteen_wallet: {
        Row: {
          balance: number
          id: string
          school_id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          balance?: number
          id?: string
          school_id: string
          student_id: string
          updated_at?: string
        }
        Update: {
          balance?: number
          id?: string
          school_id?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "canteen_wallet_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "canteen_wallet_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_receive_heads: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          name_bn: string
          name_en: string | null
          school_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name_bn: string
          name_en?: string | null
          school_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name_bn?: string
          name_en?: string | null
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_receive_heads_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_receives: {
        Row: {
          amount: number
          branch_id: string | null
          created_at: string
          date: string
          head_id: string
          id: string
          method: string
          notes: string | null
          received_by: string | null
          received_from: string | null
          reference_no: string | null
          school_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          branch_id?: string | null
          created_at?: string
          date?: string
          head_id: string
          id?: string
          method?: string
          notes?: string | null
          received_by?: string | null
          received_from?: string | null
          reference_no?: string | null
          school_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          branch_id?: string | null
          created_at?: string
          date?: string
          head_id?: string
          id?: string
          method?: string
          notes?: string | null
          received_by?: string | null
          received_from?: string | null
          reference_no?: string | null
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_receives_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "school_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_receives_head_id_fkey"
            columns: ["head_id"]
            isOneToOne: false
            referencedRelation: "cash_receive_heads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_receives_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_receives_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      certificate_templates: {
        Row: {
          created_at: string
          html_template: string
          id: string
          is_active: boolean
          name: string
          orientation: string
          paper_size: string
          school_id: string
          type: string
          updated_at: string
          variables: Json
        }
        Insert: {
          created_at?: string
          html_template: string
          id?: string
          is_active?: boolean
          name: string
          orientation?: string
          paper_size?: string
          school_id: string
          type: string
          updated_at?: string
          variables?: Json
        }
        Update: {
          created_at?: string
          html_template?: string
          id?: string
          is_active?: boolean
          name?: string
          orientation?: string
          paper_size?: string
          school_id?: string
          type?: string
          updated_at?: string
          variables?: Json
        }
        Relationships: [
          {
            foreignKeyName: "certificate_templates_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates_issued: {
        Row: {
          data: Json
          id: string
          issued_by: string | null
          issued_on: string
          pdf_url: string | null
          school_id: string
          serial_no: string
          signed_qr: string | null
          student_id: string
          template_id: string
        }
        Insert: {
          data?: Json
          id?: string
          issued_by?: string | null
          issued_on?: string
          pdf_url?: string | null
          school_id: string
          serial_no: string
          signed_qr?: string | null
          student_id: string
          template_id: string
        }
        Update: {
          data?: Json
          id?: string
          issued_by?: string | null
          issued_on?: string
          pdf_url?: string | null
          school_id?: string
          serial_no?: string
          signed_qr?: string | null
          student_id?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_issued_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_issued_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_issued_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_issued_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "certificate_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      class_subject_assignments: {
        Row: {
          academic_year_id: string
          class_id: string
          created_at: string
          id: string
          subject_id: string
        }
        Insert: {
          academic_year_id: string
          class_id: string
          created_at?: string
          id?: string
          subject_id: string
        }
        Update: {
          academic_year_id?: string
          class_id?: string
          created_at?: string
          id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_subject_assignments_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_subject_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_subject_assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          branch_id: string | null
          created_at: string
          display_order: number
          id: string
          metadata: Json
          name_bn: string
          name_en: string | null
          school_id: string
          stream: Database["public"]["Enums"]["class_stream"]
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          display_order?: number
          id?: string
          metadata?: Json
          name_bn: string
          name_en?: string | null
          school_id: string
          stream?: Database["public"]["Enums"]["class_stream"]
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          display_order?: number
          id?: string
          metadata?: Json
          name_bn?: string
          name_en?: string | null
          school_id?: string
          stream?: Database["public"]["Enums"]["class_stream"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "school_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          last_read_at: string | null
          school_user_id: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          school_user_id?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          school_user_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_school_user_id_fkey"
            columns: ["school_user_id"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          allow_parent_teacher: boolean
          created_at: string
          created_by: string | null
          id: string
          kind: string
          school_id: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          allow_parent_teacher?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          school_id: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          allow_parent_teacher?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          school_id?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      counseling_logs: {
        Row: {
          action_taken: string | null
          confidential: boolean
          created_at: string
          created_by: string | null
          date: string
          id: string
          school_id: string
          student_id: string
          summary: string
          type: string | null
        }
        Insert: {
          action_taken?: string | null
          confidential?: boolean
          created_at?: string
          created_by?: string | null
          date?: string
          id?: string
          school_id: string
          student_id: string
          summary: string
          type?: string | null
        }
        Update: {
          action_taken?: string | null
          confidential?: boolean
          created_at?: string
          created_by?: string | null
          date?: string
          id?: string
          school_id?: string
          student_id?: string
          summary?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "counseling_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "counseling_logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "counseling_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_sabaq: {
        Row: {
          created_at: string
          date: string
          id: string
          manzil_paras: Json
          manzil_quality: Database["public"]["Enums"]["sabaq_quality"] | null
          sabaq_from: string | null
          sabaq_para: number | null
          sabaq_quality: Database["public"]["Enums"]["sabaq_quality"] | null
          sabaq_to: string | null
          sabqi_para: number | null
          sabqi_quality: Database["public"]["Enums"]["sabaq_quality"] | null
          school_id: string
          student_id: string
          tajweed_notes: string | null
          teacher_id: string | null
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          manzil_paras?: Json
          manzil_quality?: Database["public"]["Enums"]["sabaq_quality"] | null
          sabaq_from?: string | null
          sabaq_para?: number | null
          sabaq_quality?: Database["public"]["Enums"]["sabaq_quality"] | null
          sabaq_to?: string | null
          sabqi_para?: number | null
          sabqi_quality?: Database["public"]["Enums"]["sabaq_quality"] | null
          school_id: string
          student_id: string
          tajweed_notes?: string | null
          teacher_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          manzil_paras?: Json
          manzil_quality?: Database["public"]["Enums"]["sabaq_quality"] | null
          sabaq_from?: string | null
          sabaq_para?: number | null
          sabaq_quality?: Database["public"]["Enums"]["sabaq_quality"] | null
          sabaq_to?: string | null
          sabqi_para?: number | null
          sabqi_quality?: Database["public"]["Enums"]["sabaq_quality"] | null
          school_id?: string
          student_id?: string
          tajweed_notes?: string | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_sabaq_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_sabaq_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_sabaq_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
        ]
      }
      donation_campaigns: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          school_id: string
          start_date: string | null
          status: string
          target_amount: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          school_id: string
          start_date?: string | null
          status?: string
          target_amount?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          school_id?: string
          start_date?: string | null
          status?: string
          target_amount?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donation_campaigns_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number
          campaign_id: string | null
          donor_address: string | null
          donor_email: string | null
          donor_name: string | null
          donor_phone: string | null
          id: string
          is_anonymous: boolean
          method: string
          notes: string | null
          receipt_no: string | null
          received_at: string
          received_by: string | null
          school_id: string
        }
        Insert: {
          amount: number
          campaign_id?: string | null
          donor_address?: string | null
          donor_email?: string | null
          donor_name?: string | null
          donor_phone?: string | null
          id?: string
          is_anonymous?: boolean
          method?: string
          notes?: string | null
          receipt_no?: string | null
          received_at?: string
          received_by?: string | null
          school_id: string
        }
        Update: {
          amount?: number
          campaign_id?: string | null
          donor_address?: string | null
          donor_email?: string | null
          donor_name?: string | null
          donor_phone?: string | null
          id?: string
          is_anonymous?: boolean
          method?: string
          notes?: string | null
          receipt_no?: string | null
          received_at?: string
          received_by?: string | null
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "donation_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_rooms: {
        Row: {
          branch_id: string | null
          capacity: number
          cols: number
          created_at: string
          id: string
          name: string
          rows: number
          school_id: string
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          capacity: number
          cols?: number
          created_at?: string
          id?: string
          name: string
          rows?: number
          school_id: string
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          capacity?: number
          cols?: number
          created_at?: string
          id?: string
          name?: string
          rows?: number
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_rooms_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "school_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_rooms_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_seating: {
        Row: {
          exam_subject_id: string
          id: string
          room_id: string
          seat_col: number | null
          seat_row: number | null
          student_id: string
        }
        Insert: {
          exam_subject_id: string
          id?: string
          room_id: string
          seat_col?: number | null
          seat_row?: number | null
          student_id: string
        }
        Update: {
          exam_subject_id?: string
          id?: string
          room_id?: string
          seat_col?: number | null
          seat_row?: number | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_seating_exam_subject_id_fkey"
            columns: ["exam_subject_id"]
            isOneToOne: false
            referencedRelation: "exam_subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_seating_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "exam_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_seating_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_subjects: {
        Row: {
          created_at: string
          date: string | null
          duration_mins: number | null
          exam_id: string
          full_marks: number
          id: string
          pass_marks: number
          section_id: string
          start_time: string | null
          subject_id: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          duration_mins?: number | null
          exam_id: string
          full_marks?: number
          id?: string
          pass_marks?: number
          section_id: string
          start_time?: string | null
          subject_id: string
        }
        Update: {
          created_at?: string
          date?: string | null
          duration_mins?: number | null
          exam_id?: string
          full_marks?: number
          id?: string
          pass_marks?: number
          section_id?: string
          start_time?: string | null
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_subjects_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_subjects_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          academic_year_id: string
          created_at: string
          end_date: string | null
          id: string
          is_published: boolean
          name: string
          published_at: string | null
          school_id: string
          settings: Json
          start_date: string | null
          type: string
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_published?: boolean
          name: string
          published_at?: string | null
          school_id: string
          settings?: Json
          start_date?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_published?: boolean
          name?: string
          published_at?: string | null
          school_id?: string
          settings?: Json
          start_date?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_heads: {
        Row: {
          category: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          name_bn: string
          name_en: string | null
          school_id: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name_bn: string
          name_en?: string | null
          school_id: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name_bn?: string
          name_en?: string | null
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_heads_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          attachment_url: string | null
          branch_id: string | null
          created_at: string
          created_by: string | null
          date: string
          description: string | null
          head_id: string
          id: string
          paid_to: string | null
          payment_method: string
          reference_no: string | null
          school_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          attachment_url?: string | null
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string | null
          head_id: string
          id?: string
          paid_to?: string | null
          payment_method?: string
          reference_no?: string | null
          school_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          attachment_url?: string | null
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string | null
          head_id?: string
          id?: string
          paid_to?: string | null
          payment_method?: string
          reference_no?: string | null
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "school_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_head_id_fkey"
            columns: ["head_id"]
            isOneToOne: false
            referencedRelation: "expense_heads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_heads: {
        Row: {
          applies_to: string
          created_at: string
          default_amount: number
          display_order: number
          frequency: string | null
          id: string
          is_active: boolean
          is_recurring: boolean
          name_bn: string
          name_en: string | null
          school_id: string
          type: string
          updated_at: string
        }
        Insert: {
          applies_to?: string
          created_at?: string
          default_amount?: number
          display_order?: number
          frequency?: string | null
          id?: string
          is_active?: boolean
          is_recurring?: boolean
          name_bn: string
          name_en?: string | null
          school_id: string
          type?: string
          updated_at?: string
        }
        Update: {
          applies_to?: string
          created_at?: string
          default_amount?: number
          display_order?: number
          frequency?: string | null
          id?: string
          is_active?: boolean
          is_recurring?: boolean
          name_bn?: string
          name_en?: string | null
          school_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_heads_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_invoice_items: {
        Row: {
          amount: number
          description: string | null
          fee_head_id: string
          id: string
          invoice_id: string
          waiver: number
          waiver_reason: string | null
        }
        Insert: {
          amount: number
          description?: string | null
          fee_head_id: string
          id?: string
          invoice_id: string
          waiver?: number
          waiver_reason?: string | null
        }
        Update: {
          amount?: number
          description?: string | null
          fee_head_id?: string
          id?: string
          invoice_id?: string
          waiver?: number
          waiver_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_invoice_items_fee_head_id_fkey"
            columns: ["fee_head_id"]
            isOneToOne: false
            referencedRelation: "fee_heads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "fee_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_invoices: {
        Row: {
          created_at: string
          due_amount: number | null
          due_date: string | null
          id: string
          invoice_no: string
          issue_date: string
          late_fee: number
          metadata: Json
          month: number | null
          notes: string | null
          paid_amount: number
          school_id: string
          status: string
          student_id: string
          total_amount: number
          updated_at: string
          year: number | null
        }
        Insert: {
          created_at?: string
          due_amount?: number | null
          due_date?: string | null
          id?: string
          invoice_no: string
          issue_date?: string
          late_fee?: number
          metadata?: Json
          month?: number | null
          notes?: string | null
          paid_amount?: number
          school_id: string
          status?: string
          student_id: string
          total_amount?: number
          updated_at?: string
          year?: number | null
        }
        Update: {
          created_at?: string
          due_amount?: number | null
          due_date?: string | null
          id?: string
          invoice_no?: string
          issue_date?: string
          late_fee?: number
          metadata?: Json
          month?: number | null
          notes?: string | null
          paid_amount?: number
          school_id?: string
          status?: string
          student_id?: string
          total_amount?: number
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_invoices_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_invoices_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structures: {
        Row: {
          amount: number
          class_id: string | null
          created_at: string
          effective_from: string | null
          effective_to: string | null
          fee_head_id: string
          frequency: string
          id: string
          school_id: string
          section_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          class_id?: string | null
          created_at?: string
          effective_from?: string | null
          effective_to?: string | null
          fee_head_id: string
          frequency: string
          id?: string
          school_id: string
          section_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          class_id?: string | null
          created_at?: string
          effective_from?: string | null
          effective_to?: string | null
          fee_head_id?: string
          frequency?: string
          id?: string
          school_id?: string
          section_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_structures_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_structures_fee_head_id_fkey"
            columns: ["fee_head_id"]
            isOneToOne: false
            referencedRelation: "fee_heads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_structures_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_structures_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      grading_scales: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          name: string
          rules: Json
          school_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          rules: Json
          school_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          rules?: Json
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grading_scales_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      hifz_progress: {
        Row: {
          created_at: string
          grade: string | null
          id: string
          mark: number | null
          mistakes_count: number
          note: string | null
          para_no: number
          school_id: string
          sipara_no: number | null
          status: string
          student_id: string
          tested_by: string | null
          tested_on: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          grade?: string | null
          id?: string
          mark?: number | null
          mistakes_count?: number
          note?: string | null
          para_no: number
          school_id: string
          sipara_no?: number | null
          status?: string
          student_id: string
          tested_by?: string | null
          tested_on?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          grade?: string | null
          id?: string
          mark?: number | null
          mistakes_count?: number
          note?: string | null
          para_no?: number
          school_id?: string
          sipara_no?: number | null
          status?: string
          student_id?: string
          tested_by?: string | null
          tested_on?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hifz_progress_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hifz_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hifz_progress_tested_by_fkey"
            columns: ["tested_by"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_allocations: {
        Row: {
          bed_no: string | null
          from_date: string
          id: string
          room_id: string
          student_id: string
          to_date: string | null
        }
        Insert: {
          bed_no?: string | null
          from_date?: string
          id?: string
          room_id: string
          student_id: string
          to_date?: string | null
        }
        Update: {
          bed_no?: string | null
          from_date?: string
          id?: string
          room_id?: string
          student_id?: string
          to_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hostel_allocations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "hostel_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostel_allocations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_rooms: {
        Row: {
          capacity: number
          hostel_id: string
          id: string
          room_no: string
        }
        Insert: {
          capacity?: number
          hostel_id: string
          id?: string
          room_no: string
        }
        Update: {
          capacity?: number
          hostel_id?: string
          id?: string
          room_no?: string
        }
        Relationships: [
          {
            foreignKeyName: "hostel_rooms_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      hostels: {
        Row: {
          address: string | null
          branch_id: string | null
          capacity: number | null
          created_at: string
          gender: string | null
          id: string
          name: string
          school_id: string
          updated_at: string
          warden_id: string | null
        }
        Insert: {
          address?: string | null
          branch_id?: string | null
          capacity?: number | null
          created_at?: string
          gender?: string | null
          id?: string
          name: string
          school_id: string
          updated_at?: string
          warden_id?: string | null
        }
        Update: {
          address?: string | null
          branch_id?: string | null
          capacity?: number | null
          created_at?: string
          gender?: string | null
          id?: string
          name?: string
          school_id?: string
          updated_at?: string
          warden_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hostels_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "school_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostels_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostels_warden_id_fkey"
            columns: ["warden_id"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
          reorder_level: number | null
          school_id: string
          stock: number
          supplier: string | null
          unit: string | null
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
          reorder_level?: number | null
          school_id: string
          stock?: number
          supplier?: string | null
          unit?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          reorder_level?: number | null
          school_id?: string
          stock?: number
          supplier?: string | null
          unit?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          by_user: string | null
          date: string
          id: string
          item_id: string
          notes: string | null
          qty: number
          reference: string | null
          type: string
        }
        Insert: {
          by_user?: string | null
          date?: string
          id?: string
          item_id: string
          notes?: string | null
          qty: number
          reference?: string | null
          type: string
        }
        Update: {
          by_user?: string | null
          date?: string
          id?: string
          item_id?: string
          notes?: string | null
          qty?: number
          reference?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_by_user_fkey"
            columns: ["by_user"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_returns: {
        Row: {
          amount: number
          created_at: string
          date: string
          id: string
          investment_id: string
          note: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          date?: string
          id?: string
          investment_id: string
          note?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          id?: string
          investment_id?: string
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investment_returns_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          created_at: string
          id: string
          maturity_date: string | null
          notes: string | null
          principal: number
          return_expected: number | null
          school_id: string
          start_date: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          maturity_date?: string | null
          notes?: string | null
          principal: number
          return_expected?: number | null
          school_id: string
          start_date: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          maturity_date?: string | null
          notes?: string | null
          principal?: number
          return_expected?: number | null
          school_id?: string
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      kitab_curriculum: {
        Row: {
          author: string | null
          class_id: string | null
          created_at: string
          display_order: number
          id: string
          kitab_name: string
          school_id: string
          stage: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          class_id?: string | null
          created_at?: string
          display_order?: number
          id?: string
          kitab_name: string
          school_id: string
          stage: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          class_id?: string | null
          created_at?: string
          display_order?: number
          id?: string
          kitab_name?: string
          school_id?: string
          stage?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kitab_curriculum_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kitab_curriculum_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      library_books: {
        Row: {
          author: string | null
          category: string | null
          copies_available: number
          copies_total: number
          created_at: string
          id: string
          isbn: string | null
          language: string | null
          price: number | null
          publisher: string | null
          school_id: string
          shelf: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          copies_available?: number
          copies_total?: number
          created_at?: string
          id?: string
          isbn?: string | null
          language?: string | null
          price?: number | null
          publisher?: string | null
          school_id: string
          shelf?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string | null
          copies_available?: number
          copies_total?: number
          created_at?: string
          id?: string
          isbn?: string | null
          language?: string | null
          price?: number | null
          publisher?: string | null
          school_id?: string
          shelf?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_books_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      library_issues: {
        Row: {
          book_id: string
          due_on: string
          fine: number
          id: string
          issued_by: string | null
          issued_on: string
          notes: string | null
          returned_on: string | null
          school_user_id: string | null
          student_id: string | null
        }
        Insert: {
          book_id: string
          due_on: string
          fine?: number
          id?: string
          issued_by?: string | null
          issued_on?: string
          notes?: string | null
          returned_on?: string | null
          school_user_id?: string | null
          student_id?: string | null
        }
        Update: {
          book_id?: string
          due_on?: string
          fine?: number
          id?: string
          issued_by?: string | null
          issued_on?: string
          notes?: string | null
          returned_on?: string | null
          school_user_id?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "library_issues_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "library_books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_issues_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_issues_school_user_id_fkey"
            columns: ["school_user_id"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_issues_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      marks: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          entered_at: string
          entered_by: string | null
          exam_subject_id: string
          grade: string | null
          id: string
          is_absent: boolean
          locked: boolean
          marks_obtained: number | null
          remarks: string | null
          school_id: string
          student_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          entered_at?: string
          entered_by?: string | null
          exam_subject_id: string
          grade?: string | null
          id?: string
          is_absent?: boolean
          locked?: boolean
          marks_obtained?: number | null
          remarks?: string | null
          school_id: string
          student_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          entered_at?: string
          entered_by?: string | null
          exam_subject_id?: string
          grade?: string | null
          id?: string
          is_absent?: boolean
          locked?: boolean
          marks_obtained?: number | null
          remarks?: string | null
          school_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marks_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marks_entered_by_fkey"
            columns: ["entered_by"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marks_exam_subject_id_fkey"
            columns: ["exam_subject_id"]
            isOneToOne: false
            referencedRelation: "exam_subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marks_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      message_queue: {
        Row: {
          body: string
          channel: string
          cost: number | null
          created_at: string
          error: string | null
          id: string
          notice_id: string | null
          provider: string | null
          recipient: string
          recipient_user: string | null
          retry_count: number
          scheduled_for: string | null
          school_id: string
          sent_at: string | null
          status: string
          template_name: string | null
          variables: Json | null
        }
        Insert: {
          body: string
          channel: string
          cost?: number | null
          created_at?: string
          error?: string | null
          id?: string
          notice_id?: string | null
          provider?: string | null
          recipient: string
          recipient_user?: string | null
          retry_count?: number
          scheduled_for?: string | null
          school_id: string
          sent_at?: string | null
          status?: string
          template_name?: string | null
          variables?: Json | null
        }
        Update: {
          body?: string
          channel?: string
          cost?: number | null
          created_at?: string
          error?: string | null
          id?: string
          notice_id?: string | null
          provider?: string | null
          recipient?: string
          recipient_user?: string | null
          retry_count?: number
          scheduled_for?: string | null
          school_id?: string
          sent_at?: string | null
          status?: string
          template_name?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "message_queue_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: false
            referencedRelation: "notices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_queue_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json
          body: string
          conversation_id: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          read_by: Json
          sender_id: string
          sent_at: string
        }
        Insert: {
          attachments?: Json
          body: string
          conversation_id: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          read_by?: Json
          sender_id: string
          sent_at?: string
        }
        Update: {
          attachments?: Json
          body?: string
          conversation_id?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          read_by?: Json
          sender_id?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notice_templates: {
        Row: {
          body: string
          channels: Json
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          school_id: string
          subject: string | null
          updated_at: string
          variables: Json
          whatsapp_template_name: string | null
        }
        Insert: {
          body: string
          channels?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          school_id: string
          subject?: string | null
          updated_at?: string
          variables?: Json
          whatsapp_template_name?: string | null
        }
        Update: {
          body?: string
          channels?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          school_id?: string
          subject?: string | null
          updated_at?: string
          variables?: Json
          whatsapp_template_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notice_templates_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      notices: {
        Row: {
          attachments: Json
          audience: string
          body: string
          branch_id: string | null
          channels: Json
          created_at: string
          created_by: string | null
          id: string
          scheduled_for: string | null
          school_id: string
          sent_at: string | null
          target_ids: Json
          title: string
          updated_at: string
        }
        Insert: {
          attachments?: Json
          audience?: string
          body: string
          branch_id?: string | null
          channels?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          scheduled_for?: string | null
          school_id: string
          sent_at?: string | null
          target_ids?: Json
          title: string
          updated_at?: string
        }
        Update: {
          attachments?: Json
          audience?: string
          body?: string
          branch_id?: string | null
          channels?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          scheduled_for?: string | null
          school_id?: string
          sent_at?: string | null
          target_ids?: Json
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notices_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "school_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notices_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      online_classes: {
        Row: {
          created_at: string
          created_by: string | null
          duration_mins: number | null
          id: string
          meet_url: string | null
          provider: string | null
          recording_url: string | null
          scheduled_at: string
          school_id: string
          section_id: string
          subject_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          duration_mins?: number | null
          id?: string
          meet_url?: string | null
          provider?: string | null
          recording_url?: string | null
          scheduled_at: string
          school_id: string
          section_id: string
          subject_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          duration_mins?: number | null
          id?: string
          meet_url?: string | null
          provider?: string | null
          recording_url?: string | null
          scheduled_at?: string
          school_id?: string
          section_id?: string
          subject_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "online_classes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "online_classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "online_classes_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "online_classes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          gateway_raw: Json | null
          gateway_ref: string | null
          id: string
          invoice_id: string | null
          method: string
          notes: string | null
          paid_at: string
          receipt_no: string | null
          received_by: string | null
          refund_status: string | null
          school_id: string
          status: string
          student_id: string | null
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          gateway_raw?: Json | null
          gateway_ref?: string | null
          id?: string
          invoice_id?: string | null
          method: string
          notes?: string | null
          paid_at?: string
          receipt_no?: string | null
          received_by?: string | null
          refund_status?: string | null
          school_id: string
          status?: string
          student_id?: string | null
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          gateway_raw?: Json | null
          gateway_ref?: string | null
          id?: string
          invoice_id?: string | null
          method?: string
          notes?: string | null
          paid_at?: string
          receipt_no?: string | null
          received_by?: string | null
          refund_status?: string | null
          school_id?: string
          status?: string
          student_id?: string | null
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "fee_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      public_gallery: {
        Row: {
          album: string | null
          caption: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string
          school_id: string
        }
        Insert: {
          album?: string | null
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          school_id: string
        }
        Update: {
          album?: string | null
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_gallery_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      public_news: {
        Row: {
          body: string | null
          created_at: string
          id: string
          image_url: string | null
          published_at: string | null
          school_id: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          published_at?: string | null
          school_id: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          published_at?: string | null
          school_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_news_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      public_pages: {
        Row: {
          body_html: string | null
          created_at: string
          id: string
          published: boolean
          school_id: string
          seo_meta: Json
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          body_html?: string | null
          created_at?: string
          id?: string
          published?: boolean
          school_id: string
          seo_meta?: Json
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          body_html?: string | null
          created_at?: string
          id?: string
          published?: boolean
          school_id?: string
          seo_meta?: Json
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_pages_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      push_logs: {
        Row: {
          body: string | null
          created_at: string
          error: string | null
          id: string
          metadata: Json | null
          school_id: string
          sent_at: string | null
          status: string
          title: string | null
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          error?: string | null
          id?: string
          metadata?: Json | null
          school_id: string
          sent_at?: string | null
          status?: string
          title?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          error?: string | null
          id?: string
          metadata?: Json | null
          school_id?: string
          sent_at?: string | null
          status?: string
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      report_cards: {
        Row: {
          ai_generated_comment: string | null
          attendance_pct: number | null
          created_at: string
          exam_id: string
          id: string
          overall_gpa: number | null
          overall_grade: string | null
          pdf_url: string | null
          position_in_class: number | null
          principal_remark: string | null
          published_at: string | null
          published_by: string | null
          school_id: string
          student_id: string
          teacher_comment: string | null
          total_full_marks: number | null
          total_marks_obtained: number | null
          updated_at: string
        }
        Insert: {
          ai_generated_comment?: string | null
          attendance_pct?: number | null
          created_at?: string
          exam_id: string
          id?: string
          overall_gpa?: number | null
          overall_grade?: string | null
          pdf_url?: string | null
          position_in_class?: number | null
          principal_remark?: string | null
          published_at?: string | null
          published_by?: string | null
          school_id: string
          student_id: string
          teacher_comment?: string | null
          total_full_marks?: number | null
          total_marks_obtained?: number | null
          updated_at?: string
        }
        Update: {
          ai_generated_comment?: string | null
          attendance_pct?: number | null
          created_at?: string
          exam_id?: string
          id?: string
          overall_gpa?: number | null
          overall_grade?: string | null
          pdf_url?: string | null
          position_in_class?: number | null
          principal_remark?: string | null
          published_at?: string | null
          published_by?: string | null
          school_id?: string
          student_id?: string
          teacher_comment?: string | null
          total_full_marks?: number | null
          total_marks_obtained?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_cards_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_cards_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_cards_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_cards_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarships: {
        Row: {
          amount: number
          amount_type: string
          created_at: string
          criteria: Json
          description: string | null
          id: string
          name: string
          school_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          amount_type: string
          created_at?: string
          criteria?: Json
          description?: string | null
          id?: string
          name: string
          school_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          amount_type?: string
          created_at?: string
          criteria?: Json
          description?: string | null
          id?: string
          name?: string
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scholarships_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_branches: {
        Row: {
          address: string | null
          created_at: string
          id: string
          is_primary: boolean
          name: string
          phone: string | null
          school_id: string
          settings: Json
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          name: string
          phone?: string | null
          school_id: string
          settings?: Json
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          name?: string
          phone?: string | null
          school_id?: string
          settings?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_branches_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_users: {
        Row: {
          branch_id: string | null
          created_at: string
          email: string | null
          employee_code: string | null
          full_name_bn: string | null
          full_name_en: string | null
          id: string
          joined_at: string
          metadata: Json
          phone: string | null
          photo_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          school_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          email?: string | null
          employee_code?: string | null
          full_name_bn?: string | null
          full_name_en?: string | null
          id?: string
          joined_at?: string
          metadata?: Json
          phone?: string | null
          photo_url?: string | null
          role: Database["public"]["Enums"]["user_role"]
          school_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          email?: string | null
          employee_code?: string | null
          full_name_bn?: string | null
          full_name_en?: string | null
          id?: string
          joined_at?: string
          metadata?: Json
          phone?: string | null
          photo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          school_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_users_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "school_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_users_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          allow_parent_teacher_dm: boolean
          created_at: string
          created_by: string | null
          eiin: string | null
          email: string | null
          id: string
          logo_url: string | null
          messaging_default_channels: Json
          name_bn: string
          name_en: string | null
          phone: string | null
          settings: Json
          slug: string
          sms_credit_balance_bdt: number
          sms_per_msg_bdt_bn: number
          sms_per_msg_bdt_en: number
          subscription_expires_at: string | null
          subscription_plan_id: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string | null
          type: Database["public"]["Enums"]["school_type"]
          updated_at: string
          website: string | null
          whatsapp_per_msg_bdt: number
        }
        Insert: {
          address?: string | null
          allow_parent_teacher_dm?: boolean
          created_at?: string
          created_by?: string | null
          eiin?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          messaging_default_channels?: Json
          name_bn: string
          name_en?: string | null
          phone?: string | null
          settings?: Json
          slug: string
          sms_credit_balance_bdt?: number
          sms_per_msg_bdt_bn?: number
          sms_per_msg_bdt_en?: number
          subscription_expires_at?: string | null
          subscription_plan_id?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          type?: Database["public"]["Enums"]["school_type"]
          updated_at?: string
          website?: string | null
          whatsapp_per_msg_bdt?: number
        }
        Update: {
          address?: string | null
          allow_parent_teacher_dm?: boolean
          created_at?: string
          created_by?: string | null
          eiin?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          messaging_default_channels?: Json
          name_bn?: string
          name_en?: string | null
          phone?: string | null
          settings?: Json
          slug?: string
          sms_credit_balance_bdt?: number
          sms_per_msg_bdt_bn?: number
          sms_per_msg_bdt_en?: number
          subscription_expires_at?: string | null
          subscription_plan_id?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          type?: Database["public"]["Enums"]["school_type"]
          updated_at?: string
          website?: string | null
          whatsapp_per_msg_bdt?: number
        }
        Relationships: [
          {
            foreignKeyName: "schools_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          capacity: number | null
          class_id: string
          class_teacher_id: string | null
          created_at: string
          id: string
          name: string
          room: string | null
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          class_id: string
          class_teacher_id?: string | null
          created_at?: string
          id?: string
          name: string
          room?: string | null
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          class_id?: string
          class_teacher_id?: string | null
          created_at?: string
          id?: string
          name?: string
          room?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sections_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sections_class_teacher_id_fkey"
            columns: ["class_teacher_id"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_credit_topups: {
        Row: {
          added_by: string | null
          amount_bdt: number
          balance_after: number
          created_at: string
          id: string
          method: string
          note: string | null
          reference: string | null
          school_id: string
        }
        Insert: {
          added_by?: string | null
          amount_bdt: number
          balance_after: number
          created_at?: string
          id?: string
          method?: string
          note?: string | null
          reference?: string | null
          school_id: string
        }
        Update: {
          added_by?: string | null
          amount_bdt?: number
          balance_after?: number
          created_at?: string
          id?: string
          method?: string
          note?: string | null
          reference?: string | null
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_credit_topups_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_logs: {
        Row: {
          cost: number | null
          created_at: string
          error: string | null
          id: string
          message: string
          metadata: Json | null
          provider: string | null
          recipient: string
          school_id: string
          sent_at: string | null
          status: string
        }
        Insert: {
          cost?: number | null
          created_at?: string
          error?: string | null
          id?: string
          message: string
          metadata?: Json | null
          provider?: string | null
          recipient: string
          school_id: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          cost?: number | null
          created_at?: string
          error?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          provider?: string | null
          recipient?: string
          school_id?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_templates: {
        Row: {
          body: string
          category: string | null
          created_at: string
          created_by: string | null
          id: string
          is_ai_generated: boolean
          language: string
          last_used_at: string | null
          name: string
          school_id: string
          updated_at: string
          use_count: number
          variables: Json
        }
        Insert: {
          body: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_ai_generated?: boolean
          language?: string
          last_used_at?: string | null
          name: string
          school_id: string
          updated_at?: string
          use_count?: number
          variables?: Json
        }
        Update: {
          body?: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_ai_generated?: boolean
          language?: string
          last_used_at?: string | null
          name?: string
          school_id?: string
          updated_at?: string
          use_count?: number
          variables?: Json
        }
        Relationships: [
          {
            foreignKeyName: "sms_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_templates_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_salaries: {
        Row: {
          allowances: Json
          basic: number
          created_at: string
          deductions: Json
          gross_amount: number
          id: string
          month: number
          net_amount: number
          notes: string | null
          paid_by: string | null
          paid_on: string | null
          payment_method: string | null
          school_user_id: string
          status: string
          updated_at: string
          year: number
        }
        Insert: {
          allowances?: Json
          basic?: number
          created_at?: string
          deductions?: Json
          gross_amount?: number
          id?: string
          month: number
          net_amount?: number
          notes?: string | null
          paid_by?: string | null
          paid_on?: string | null
          payment_method?: string | null
          school_user_id: string
          status?: string
          updated_at?: string
          year: number
        }
        Update: {
          allowances?: Json
          basic?: number
          created_at?: string
          deductions?: Json
          gross_amount?: number
          id?: string
          month?: number
          net_amount?: number
          notes?: string | null
          paid_by?: string | null
          paid_on?: string | null
          payment_method?: string | null
          school_user_id?: string
          status?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "staff_salaries_paid_by_fkey"
            columns: ["paid_by"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_salaries_school_user_id_fkey"
            columns: ["school_user_id"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
        ]
      }
      student_guardians: {
        Row: {
          can_pay_fees: boolean
          created_at: string
          email: string | null
          id: string
          is_primary: boolean
          monthly_income: number | null
          name_bn: string
          name_en: string | null
          nid: string | null
          occupation: string | null
          phone: string | null
          relation: string
          student_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          can_pay_fees?: boolean
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean
          monthly_income?: number | null
          name_bn: string
          name_en?: string | null
          nid?: string | null
          occupation?: string | null
          phone?: string | null
          relation: string
          student_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          can_pay_fees?: boolean
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean
          monthly_income?: number | null
          name_bn?: string
          name_en?: string | null
          nid?: string | null
          occupation?: string | null
          phone?: string | null
          relation?: string
          student_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_guardians_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_health: {
        Row: {
          allergies: string | null
          blood_group: string | null
          chronic_conditions: string | null
          created_at: string
          doctor_name: string | null
          doctor_phone: string | null
          emergency_contact: string | null
          id: string
          last_checkup_date: string | null
          medications: string | null
          student_id: string
          updated_at: string
          vaccinations: Json
        }
        Insert: {
          allergies?: string | null
          blood_group?: string | null
          chronic_conditions?: string | null
          created_at?: string
          doctor_name?: string | null
          doctor_phone?: string | null
          emergency_contact?: string | null
          id?: string
          last_checkup_date?: string | null
          medications?: string | null
          student_id: string
          updated_at?: string
          vaccinations?: Json
        }
        Update: {
          allergies?: string | null
          blood_group?: string | null
          chronic_conditions?: string | null
          created_at?: string
          doctor_name?: string | null
          doctor_phone?: string | null
          emergency_contact?: string | null
          id?: string
          last_checkup_date?: string | null
          medications?: string | null
          student_id?: string
          updated_at?: string
          vaccinations?: Json
        }
        Relationships: [
          {
            foreignKeyName: "student_health_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_kitab_progress: {
        Row: {
          completed_on: string | null
          current_chapter: string | null
          grade: string | null
          id: string
          kitab_id: string
          notes: string | null
          started_on: string | null
          student_id: string
          teacher_id: string | null
          updated_at: string
        }
        Insert: {
          completed_on?: string | null
          current_chapter?: string | null
          grade?: string | null
          id?: string
          kitab_id: string
          notes?: string | null
          started_on?: string | null
          student_id: string
          teacher_id?: string | null
          updated_at?: string
        }
        Update: {
          completed_on?: string | null
          current_chapter?: string | null
          grade?: string | null
          id?: string
          kitab_id?: string
          notes?: string | null
          started_on?: string | null
          student_id?: string
          teacher_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_kitab_progress_kitab_id_fkey"
            columns: ["kitab_id"]
            isOneToOne: false
            referencedRelation: "kitab_curriculum"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_kitab_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_kitab_progress_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
        ]
      }
      student_ledger_entries: {
        Row: {
          created_at: string
          credit: number
          date: string
          debit: number
          id: string
          note: string | null
          ref_id: string | null
          ref_type: string
          running_balance: number | null
          school_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          credit?: number
          date?: string
          debit?: number
          id?: string
          note?: string | null
          ref_id?: string | null
          ref_type: string
          running_balance?: number | null
          school_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          credit?: number
          date?: string
          debit?: number
          id?: string
          note?: string | null
          ref_id?: string | null
          ref_type?: string
          running_balance?: number | null
          school_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_ledger_entries_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_ledger_entries_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_risk_scores: {
        Row: {
          attendance_pct: number | null
          avg_marks_pct: number | null
          computed_at: string
          factors: Json
          fee_overdue_days: number | null
          id: string
          risk_level: string
          school_id: string
          score: number
          student_id: string
          suggestion: string | null
        }
        Insert: {
          attendance_pct?: number | null
          avg_marks_pct?: number | null
          computed_at?: string
          factors?: Json
          fee_overdue_days?: number | null
          id?: string
          risk_level: string
          school_id: string
          score: number
          student_id: string
          suggestion?: string | null
        }
        Update: {
          attendance_pct?: number | null
          avg_marks_pct?: number | null
          computed_at?: string
          factors?: Json
          fee_overdue_days?: number | null
          id?: string
          risk_level?: string
          school_id?: string
          score?: number
          student_id?: string
          suggestion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_risk_scores_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_risk_scores_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_scholarships: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          notes: string | null
          scholarship_id: string
          student_id: string
          valid_until: string | null
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          notes?: string | null
          scholarship_id: string
          student_id: string
          valid_until?: string | null
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          notes?: string | null
          scholarship_id?: string
          student_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_scholarships_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_scholarships_scholarship_id_fkey"
            columns: ["scholarship_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_scholarships_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_shifts: {
        Row: {
          from_academic_year: string | null
          from_section_id: string | null
          id: string
          reason: string | null
          shifted_at: string
          shifted_by: string | null
          student_id: string
          to_academic_year: string | null
          to_section_id: string | null
        }
        Insert: {
          from_academic_year?: string | null
          from_section_id?: string | null
          id?: string
          reason?: string | null
          shifted_at?: string
          shifted_by?: string | null
          student_id: string
          to_academic_year?: string | null
          to_section_id?: string | null
        }
        Update: {
          from_academic_year?: string | null
          from_section_id?: string | null
          id?: string
          reason?: string | null
          shifted_at?: string
          shifted_by?: string | null
          student_id?: string
          to_academic_year?: string | null
          to_section_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_shifts_from_academic_year_fkey"
            columns: ["from_academic_year"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_shifts_from_section_id_fkey"
            columns: ["from_section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_shifts_shifted_by_fkey"
            columns: ["shifted_by"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_shifts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_shifts_to_academic_year_fkey"
            columns: ["to_academic_year"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_shifts_to_section_id_fkey"
            columns: ["to_section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address_permanent: string | null
          address_present: string | null
          admission_date: string | null
          blood_group: string | null
          branch_id: string | null
          created_at: string
          date_of_birth: string | null
          gender: string | null
          guardian_phone: string | null
          id: string
          metadata: Json
          name_ar: string | null
          name_bn: string
          name_en: string | null
          nationality: string | null
          nid_birth_cert: string | null
          photo_url: string | null
          previous_school: string | null
          religion: string | null
          roll: number | null
          school_id: string
          section_id: string | null
          status: Database["public"]["Enums"]["student_status"]
          student_code: string
          updated_at: string
        }
        Insert: {
          address_permanent?: string | null
          address_present?: string | null
          admission_date?: string | null
          blood_group?: string | null
          branch_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          gender?: string | null
          guardian_phone?: string | null
          id?: string
          metadata?: Json
          name_ar?: string | null
          name_bn: string
          name_en?: string | null
          nationality?: string | null
          nid_birth_cert?: string | null
          photo_url?: string | null
          previous_school?: string | null
          religion?: string | null
          roll?: number | null
          school_id: string
          section_id?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          student_code: string
          updated_at?: string
        }
        Update: {
          address_permanent?: string | null
          address_present?: string | null
          admission_date?: string | null
          blood_group?: string | null
          branch_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          gender?: string | null
          guardian_phone?: string | null
          id?: string
          metadata?: Json
          name_ar?: string | null
          name_bn?: string
          name_en?: string | null
          nationality?: string | null
          nid_birth_cert?: string | null
          photo_url?: string | null
          previous_school?: string | null
          religion?: string | null
          roll?: number | null
          school_id?: string
          section_id?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          student_code?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "school_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          class_id: string | null
          code: string | null
          created_at: string
          display_order: number
          full_marks: number
          id: string
          is_optional: boolean
          name_ar: string | null
          name_bn: string
          name_en: string | null
          pass_marks: number
          school_id: string
          updated_at: string
        }
        Insert: {
          class_id?: string | null
          code?: string | null
          created_at?: string
          display_order?: number
          full_marks?: number
          id?: string
          is_optional?: boolean
          name_ar?: string | null
          name_bn: string
          name_en?: string | null
          pass_marks?: number
          school_id: string
          updated_at?: string
        }
        Update: {
          class_id?: string | null
          code?: string | null
          created_at?: string
          display_order?: number
          full_marks?: number
          id?: string
          is_optional?: boolean
          name_ar?: string | null
          name_bn?: string
          name_en?: string | null
          pass_marks?: number
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subjects_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          code: string
          created_at: string
          display_order: number
          features: Json
          id: string
          is_active: boolean
          max_branches: number | null
          max_sms: number | null
          max_storage_mb: number | null
          max_students: number | null
          name_bn: string
          name_en: string
          price_bdt: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          display_order?: number
          features?: Json
          id?: string
          is_active?: boolean
          max_branches?: number | null
          max_sms?: number | null
          max_storage_mb?: number | null
          max_students?: number | null
          name_bn: string
          name_en: string
          price_bdt?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          display_order?: number
          features?: Json
          id?: string
          is_active?: boolean
          max_branches?: number | null
          max_sms?: number | null
          max_storage_mb?: number | null
          max_students?: number | null
          name_bn?: string
          name_en?: string
          price_bdt?: number
          updated_at?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          attachments: Json
          body: string
          created_at: string
          id: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          attachments?: Json
          body: string
          created_at?: string
          id?: string
          ticket_id: string
          user_id: string
        }
        Update: {
          attachments?: Json
          body?: string
          created_at?: string
          id?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          body: string
          category: string | null
          created_at: string
          created_by: string
          id: string
          priority: string
          resolved_at: string | null
          school_id: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          body: string
          category?: string | null
          created_at?: string
          created_by: string
          id?: string
          priority?: string
          resolved_at?: string | null
          school_id: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          body?: string
          category?: string | null
          created_at?: string
          created_by?: string
          id?: string
          priority?: string
          resolved_at?: string | null
          school_id?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_assignments: {
        Row: {
          academic_year_id: string
          created_at: string
          id: string
          role_type: string
          school_user_id: string
          section_id: string
          subject_id: string | null
        }
        Insert: {
          academic_year_id: string
          created_at?: string
          id?: string
          role_type: string
          school_user_id: string
          section_id: string
          subject_id?: string | null
        }
        Update: {
          academic_year_id?: string
          created_at?: string
          id?: string
          role_type?: string
          school_user_id?: string
          section_id?: string
          subject_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_assignments_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_school_user_id_fkey"
            columns: ["school_user_id"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_gps_pings: {
        Row: {
          heading: number | null
          id: string
          lat: number
          lng: number
          recorded_at: string
          speed: number | null
          vehicle_id: string
        }
        Insert: {
          heading?: number | null
          id?: string
          lat: number
          lng: number
          recorded_at?: string
          speed?: number | null
          vehicle_id: string
        }
        Update: {
          heading?: number | null
          id?: string
          lat?: number
          lng?: number
          recorded_at?: string
          speed?: number | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transport_gps_pings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "transport_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_routes: {
        Row: {
          created_at: string
          end_point: string | null
          fare_per_month: number | null
          id: string
          is_active: boolean
          name: string
          school_id: string
          start_point: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_point?: string | null
          fare_per_month?: number | null
          id?: string
          is_active?: boolean
          name: string
          school_id: string
          start_point?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_point?: string | null
          fare_per_month?: number | null
          id?: string
          is_active?: boolean
          name?: string
          school_id?: string
          start_point?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transport_routes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_students: {
        Row: {
          drop_time: string | null
          from_date: string
          id: string
          pickup_stop: string | null
          pickup_time: string | null
          route_id: string
          student_id: string
          to_date: string | null
          vehicle_id: string | null
        }
        Insert: {
          drop_time?: string | null
          from_date?: string
          id?: string
          pickup_stop?: string | null
          pickup_time?: string | null
          route_id: string
          student_id: string
          to_date?: string | null
          vehicle_id?: string | null
        }
        Update: {
          drop_time?: string | null
          from_date?: string
          id?: string
          pickup_stop?: string | null
          pickup_time?: string | null
          route_id?: string
          student_id?: string
          to_date?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_students_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "transport_routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_students_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "transport_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_vehicles: {
        Row: {
          capacity: number | null
          created_at: string
          driver_name: string | null
          driver_phone: string | null
          gps_device_id: string | null
          id: string
          is_active: boolean
          reg_no: string
          route_id: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          driver_name?: string | null
          driver_phone?: string | null
          gps_device_id?: string | null
          id?: string
          is_active?: boolean
          reg_no: string
          route_id: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          driver_name?: string | null
          driver_phone?: string | null
          gps_device_id?: string | null
          id?: string
          is_active?: boolean
          reg_no?: string
          route_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transport_vehicles_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "transport_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          action: string
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          metadata: Json
          resource: string
          school_user_id: string
          scope_id: string | null
          scope_type: string
        }
        Insert: {
          action: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          metadata?: Json
          resource: string
          school_user_id: string
          scope_id?: string | null
          scope_type: string
        }
        Update: {
          action?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          metadata?: Json
          resource?: string
          school_user_id?: string
          scope_id?: string | null
          scope_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_school_user_id_fkey"
            columns: ["school_user_id"]
            isOneToOne: false
            referencedRelation: "school_users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_totp_secrets: {
        Row: {
          created_at: string
          recovery_codes: Json
          secret: string
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          recovery_codes?: Json
          secret: string
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          recovery_codes?: Json
          secret?: string
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      whatsapp_logs: {
        Row: {
          cost: number | null
          created_at: string
          error: string | null
          id: string
          metadata: Json | null
          provider: string | null
          recipient: string
          school_id: string
          sent_at: string | null
          status: string
          template_name: string | null
          variables: Json | null
        }
        Insert: {
          cost?: number | null
          created_at?: string
          error?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          recipient: string
          school_id: string
          sent_at?: string | null
          status?: string
          template_name?: string | null
          variables?: Json | null
        }
        Update: {
          cost?: number | null
          created_at?: string
          error?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          recipient?: string
          school_id?: string
          sent_at?: string | null
          status?: string
          template_name?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      debit_sms_credit: {
        Args: { amount_bdt: number; note_text?: string; target_school: string }
        Returns: number
      }
      decrement_book_copies: { Args: { p_book_id: string }; Returns: undefined }
      increment_book_copies: { Args: { p_book_id: string }; Returns: undefined }
      is_school_member: { Args: { target_school: string }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      seed_new_school: { Args: { target_school: string }; Returns: undefined }
      user_has_any_role: {
        Args: {
          roles: Database["public"]["Enums"]["user_role"][]
          target_school: string
        }
        Returns: boolean
      }
      user_school_ids: { Args: never; Returns: string[] }
    }
    Enums: {
      attendance_status: "present" | "absent" | "late" | "leave" | "holiday"
      class_stream:
        | "general"
        | "hifz"
        | "kitab"
        | "nazera"
        | "science"
        | "commerce"
        | "arts"
      sabaq_quality: "excellent" | "good" | "average" | "weak"
      school_type: "school" | "madrasa" | "both"
      student_status:
        | "active"
        | "transferred"
        | "passed_out"
        | "dropped"
        | "suspended"
      subscription_status:
        | "trial"
        | "active"
        | "past_due"
        | "canceled"
        | "suspended"
      user_role:
        | "SUPER_ADMIN"
        | "SCHOOL_ADMIN"
        | "VICE_PRINCIPAL"
        | "ACCOUNTANT"
        | "BRANCH_ADMIN"
        | "CLASS_TEACHER"
        | "SUBJECT_TEACHER"
        | "MADRASA_USTADH"
        | "LIBRARIAN"
        | "TRANSPORT_MANAGER"
        | "HOSTEL_WARDEN"
        | "CANTEEN_MANAGER"
        | "COUNSELOR"
        | "STUDENT"
        | "PARENT"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      attendance_status: ["present", "absent", "late", "leave", "holiday"],
      class_stream: [
        "general",
        "hifz",
        "kitab",
        "nazera",
        "science",
        "commerce",
        "arts",
      ],
      sabaq_quality: ["excellent", "good", "average", "weak"],
      school_type: ["school", "madrasa", "both"],
      student_status: [
        "active",
        "transferred",
        "passed_out",
        "dropped",
        "suspended",
      ],
      subscription_status: [
        "trial",
        "active",
        "past_due",
        "canceled",
        "suspended",
      ],
      user_role: [
        "SUPER_ADMIN",
        "SCHOOL_ADMIN",
        "VICE_PRINCIPAL",
        "ACCOUNTANT",
        "BRANCH_ADMIN",
        "CLASS_TEACHER",
        "SUBJECT_TEACHER",
        "MADRASA_USTADH",
        "LIBRARIAN",
        "TRANSPORT_MANAGER",
        "HOSTEL_WARDEN",
        "CANTEEN_MANAGER",
        "COUNSELOR",
        "STUDENT",
        "PARENT",
      ],
    },
  },
} as const
